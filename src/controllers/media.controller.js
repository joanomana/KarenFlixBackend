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

export const createMediaAdmin = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const { title, type, description, category, year, imageUrl } = req.body;

    const exists = await Media.findOne({
      title_lc: (title || '').toLowerCase(),
      year,
      type
    });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Título duplicado (title+year+type)' });
    }

    const now = new Date();
    const doc = await Media.create({
      title,
      type,
      description,
      category: typeof category === 'string' ? { name: category } : category,
      year,
      imageUrl,
      status: 'approved',
      createdBy: req.user._id,
      approvedBy: req.user._id,
      approvedAt: now
    });

    return res.status(201).json({ success: true, media: doc });
  } catch (err) { next(err); }
};

export const approveMedia = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const { id } = req.params;
    const doc = await Media.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'No encontrado' });

    if (doc.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Ya está aprobado' });
    }

    doc.status = 'approved';
    doc.approvedBy = req.user._id;
    doc.approvedAt = new Date();
    await doc.save();

    return res.status(200).json({ success: true, message: 'Aprobado', media: doc });
  } catch (err) { next(err); }
};

export const rejectMedia = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const { id } = req.params;
    const doc = await Media.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'No encontrado' });

    doc.status = 'rejected';
    await doc.save();
    return res.status(200).json({ success: true, message: 'Rechazado', media: doc });
  } catch (err) { next(err); }
};

export const updateMedia = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const { id } = req.params;
    const updates = { ...req.body };
    if (typeof updates.category === 'string') updates.category = { name: updates.category };

    if (updates.title) updates.title_lc = updates.title.toLowerCase();
    if (updates.title || updates.year || updates.type) {
      const docOld = await Media.findById(id).lean();
      const t = updates.title || docOld?.title;
      const y = updates.year || docOld?.year;
      const ty = updates.type || docOld?.type;
      const dup = await Media.findOne({ _id: { $ne: id }, title_lc: (t || '').toLowerCase(), year: y, type: ty });
      if (dup) return res.status(409).json({ success: false, message: 'Título duplicado (title+year+type)' });
    }

    const doc = await Media.findByIdAndUpdate(id, updates, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'No encontrado' });

    return res.status(200).json({ success: true, message: 'Actualizado', media: doc });
  } catch (err) { next(err); }
};

export const deleteMedia = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const { id } = req.params;
    const doc = await Media.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: 'No encontrado' });
    return res.status(204).send();
  } catch (err) { next(err); }
};

export const listMedia = async (req, res, next) => {
  try {
    const { status, type, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (q) filter.title_lc = new RegExp(String(q).toLowerCase(), 'i');

    const items = await Media.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, items });
  } catch (err) { next(err); }
};
