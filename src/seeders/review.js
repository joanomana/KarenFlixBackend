import mongoose from 'mongoose';
import Media from '../models/Media.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const sampleText = [
  { title: 'Excelente', comment: 'Muy bien lograda, gran guion y actuaciones memorables.' },
  { title: 'Sólida', comment: 'Buena dirección y ritmo; entretenida de principio a fin.' },
  { title: 'Imperdible', comment: 'Visualmente impactante y con una historia atrapante.' }
];

export const seedReviews = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let user = await User.findOne().session(session);
    if (!user) {
      const [created] = await User.create([{
        username: 'seed_user',
        email: 'seed_user@example.com',
        password: 'SeedUser123',
        role: 'user'
      }], { session });
      user = created;
    }

    const medias = await Media.find().session(session);
    for (const m of medias) {
      const exists = await Review.findOne({ mediaId: m._id }).session(session);
      if (exists) continue;

      const idx = Math.abs((m.title_lc || m.title || '').length) % sampleText.length;
      const rating = 7 + (idx % 4); // 7..10
      const { title, comment } = sampleText[idx];

      await Review.create([{
        mediaId: m._id,
        userId: user._id,
        title,
        comment,
        rating
      }], { session });

      await Media.updateOne(
        { _id: m._id },
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
    }

    await session.commitTransaction();
    session.endSession();
    console.log('✅ seedReviews completado (1 review por media + métricas actualizadas)');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ seedReviews error', err);
    throw err;
  }
};
