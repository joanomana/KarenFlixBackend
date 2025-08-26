import Media from '../models/Media.js';

export const suggestMedia = async (req, res, next) => {
  try {
    const { title, type, description, category, year, imageUrl } = req.body;
    console.log(req.user._id)
    // Check duplicates (case-insensitive by title + year + type)
    const exists = await Media.findOne({
      title_lc: (title || '').toLowerCase(),
      year,
      type
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Título ya existente para ese año y tipo'
      });
    }

    const doc = await Media.create({
      title,
      type,
      description,
      category: category?._id ? category : { name: category?.name || category || 'Sin categoría' },
      year,
      imageUrl,
      createdBy: req.user._id,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Sugerencia enviada',
      media: doc
    });
  } catch (error) {
    next(error);
  }
};
