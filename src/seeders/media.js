import mongoose from 'mongoose';
import Media from '../models/Media.js';

export const seedMedia = async () => {
  const samples = [
    { title: 'Fullmetal Alchemist: Brotherhood', type: 'anime', description: 'Dos hermanos...', category: { name: 'Anime' }, year: 2009, imageUrl: '' },
    { title: 'The Dark Knight', type: 'movie', description: 'Batman vs Joker', category: { name: 'Superhéroes' }, year: 2008, imageUrl: '' },
    { title: 'The Boys', type: 'series', description: 'Héroes corruptos...', category: { name: 'Superhéroes' }, year: 2019, imageUrl: '' }
  ];

  for (const s of samples) {
    try {
      const exists = await Media.findOne({ title_lc: s.title.toLowerCase(), year: s.year, type: s.type });
      if (!exists) {
        await Media.create({ ...s, createdBy: new mongoose.Types.ObjectId(), status: 'pending' });
        console.log('📀 Media sembrada:', s.title);
      }
    } catch(err) { console.error('Seed media error', err); }
};
}