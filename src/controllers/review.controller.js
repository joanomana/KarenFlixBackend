import mongoose from 'mongoose';
import Media from '../models/Media.js';
import Review from '../models/Review.js';
import ReviewReaction from '../models/ReviewReaction.js';
import { validationResult } from 'express-validator';

/**
 * Crea una reseña y actualiza métricas del media.
 * POST /api/v1/reviews
 */
export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { mediaId, title, comment, rating } = req.body;
    const userId  = req.user?._id;

    const media = await Media.findById(mediaId).lean();
    if (!media) return res.status(404).json({ message: 'Media no encontrada' });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [review] = await Review.create([{
        mediaId, userId, title, comment, rating
      }], { session });

      // Incremental: newAvg = (oldAvg*oldCount + rating) / (oldCount+1)
      await Media.updateOne(
        { _id: mediaId },
        [
          { $set: { _oldCount: "$metrics.ratingCount", _oldAvg: "$metrics.ratingAvg" } },
          {
            $set: {
              "metrics.ratingCount": { $add: ["$_oldCount", 1] },
              "metrics.ratingAvg": {
                $divide: [
                  { $add: [ { $multiply: ["$_oldAvg", "$_oldCount"] }, rating ] },
                  { $add: ["$_oldCount", 1] }
                ]
              }
            }
          },
          { $unset: ["_oldCount", "_oldAvg"] }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(review);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      if (err?.code === 11000) {
        return res.status(409).json({ message: 'Ya registraste una reseña para este título' });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza una reseña propia y ajusta métricas si cambia el rating.
 * PUT /api/v1/reviews/:id
 */
export const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const reviewId = req.params.id;
    const userId   = req.user?._id;
    const { title, comment, rating } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    if (String(review.userId) !== String(userId)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const oldRating = review.rating;
    const ratingChanged = typeof rating === 'number' && Number.isFinite(rating) && rating !== oldRating;

    // Transacción para mantener consistencia
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (title !== undefined) review.title = title;
      if (comment !== undefined) review.comment = comment;
      if (rating !== undefined) review.rating = rating;
      await review.save({ session });

      if (ratingChanged) {
        // newAvg = (oldAvg*count - oldRating + newRating) / count
        const newRating = rating;
        await Media.updateOne(
          { _id: review.mediaId },
          [
            { $set: { _count: "$metrics.ratingCount", _avg: "$metrics.ratingAvg" } },
            {
              $set: {
                "metrics.ratingAvg": {
                  $cond: [
                    { $gt: ["$_count", 0] },
                    {
                      $divide: [
                        { $add: [ { $multiply: ["$_avg", "$_count"] }, newRating, { $multiply: [-1, oldRating] } ] },
                        "$_count"
                      ]
                    },
                    0
                  ]
                }
              }
            },
            { $unset: ["_count", "_avg"] }
          ],
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json(review);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una reseña propia y ajusta métricas.
 * DELETE /api/v1/reviews/:id
 */
export const deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const userId   = req.user?._id;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    if (String(review.userId) !== String(userId)) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const oldRating = review.rating;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Eliminar reseña
      await Review.deleteOne({ _id: reviewId }, { session });

      // Ajustar métricas:
      // newCount = oldCount - 1
      // newAvg = (oldAvg*oldCount - oldRating) / newCount   (si newCount > 0; si 0 -> 0)
      await Media.updateOne(
        { _id: review.mediaId },
        [
          { $set: { _count: "$metrics.ratingCount", _avg: "$metrics.ratingAvg" } },
          {
            $set: {
              "metrics.ratingCount": { $add: ["$_count", -1] },
              "metrics.ratingAvg": {
                $cond: [
                  { $gt: [ { $add: ["$_count", -1] }, 0 ] },
                  {
                    $divide: [
                      { $add: [ { $multiply: ["$_avg", "$_count"] }, { $multiply: [-1, oldRating] } ] },
                      { $add: ["$_count", -1] }
                    ]
                  },
                  0
                ]
              }
            }
          },
          { $unset: ["_count", "_avg"] }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(204).send();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    next(error);
  }
};


export const reactionReview = async (req, res, next) => {
  try {
    const reviewId = String(req.params.id).trim();
    const userId   = req.user?._id;
    const { value } = req.body; // 1 = like, -1 = dislike

    // Verificar reseña
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    if (String(review.userId) === String(userId)) {
      return res.status(403).json({ message: 'No puedes reaccionar a tu propia reseña' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const existing = await ReviewReaction.findOne({ reviewId, userId }).session(session);

      if (!existing) {
        // Crear reacción nueva
        await ReviewReaction.create([{ reviewId, userId, value }], { session });
        const inc = value === 1 ? { likesCount: 1 } : { dislikesCount: 1 };
        await Review.updateOne({ _id: reviewId }, { $inc: inc }, { session });

      } else if (existing.value !== value) {
        // Cambiar de like <-> dislike
        await ReviewReaction.updateOne({ _id: existing._id }, { value }, { session });
        const ops = value === 1
          ? { $inc: { likesCount: 1, dislikesCount: -1 } }
          : { $inc: { likesCount: -1, dislikesCount: 1 } };
        await Review.updateOne({ _id: reviewId }, ops, { session });
      }
      // Si ya existe y es el mismo valor, no hacer nada (idempotente)

      await session.commitTransaction();
      session.endSession();

      const fresh = await Review.findById(reviewId).lean();
      return res.status(200).json({
        reviewId,
        value,
        likesCount: fresh?.likesCount ?? 0,
        dislikesCount: fresh?.dislikesCount ?? 0
      });

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

  } catch (error) {
    next(error);
  }
};