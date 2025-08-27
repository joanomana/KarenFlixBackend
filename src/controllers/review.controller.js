import mongoose from 'mongoose';
import Media from '../models/Media.js';
import Review from '../models/Review.js';
import { validationResult } from 'express-validator';

export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { mediaId, title, comment, rating } = req.body;
    const userId  = req.user?._id;

    // Verificar media
    const media = await Media.findById(mediaId).lean();
    if (!media) return res.status(404).json({ message: 'Media no encontrada' });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [review] = await Review.create([{
        mediaId, userId, title, comment, rating
      }], { session });

      // Actualización incremental de métricas (count/avg)
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
