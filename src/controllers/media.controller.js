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


// ====== Public preview handlers (RF15 & RF16) ======

// Helper: pagination from query
function getPagination(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '12', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// GET /api/v1/media/public
export const listMediaPublic = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { q, type, sort } = req.query;
    const filter = { status: 'approved' };
    if (type) filter.type = type;
    if (q) filter.title_lc = new RegExp(String(q).trim().toLowerCase(), 'i');

    // Default sort: newest
    const sortObj = {};
    if (sort) {
      // allow limited fields for safety
      const allowed = new Set(['-createdAt','createdAt','-metrics.ratingAvg','metrics.ratingAvg','-metrics.weightedScore','metrics.weightedScore','-year','year']);
      if (allowed.has(sort)) {
        const dir = sort.startsWith('-') ? -1 : 1;
        const key = sort.replace(/^-/, '');
        sortObj[key] = dir;
      }
    }
    if (Object.keys(sortObj).length === 0) sortObj.createdAt = -1;

    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('_id title type imageUrl year category metrics.ratingAvg metrics.ratingCount metrics.weightedScore slug'),
      Media.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      items, page, limit, total,
      hasNext: page * limit < total
    });
  } catch (err) { next(err); }
};

// GET /api/v1/media/ranking
export const listMediaRanking = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { status: 'approved' };
    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort({ 'metrics.weightedScore': -1, 'metrics.ratingCount': -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title type imageUrl year category metrics.ratingAvg metrics.ratingCount metrics.weightedScore slug'),
      Media.countDocuments(filter)
    ]);
    return res.status(200).json({ success: true, items, page, limit, total, hasNext: page*limit < total });
  } catch (err) { next(err); }
};

// GET /api/v1/media/popular
export const listMediaPopular = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { status: 'approved' };
    // Popularidad sencilla: ratingCount desc + desempate por weightedScore
    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort({ 'metrics.ratingCount': -1, 'metrics.weightedScore': -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title type imageUrl year category metrics.ratingAvg metrics.ratingCount metrics.weightedScore slug'),
      Media.countDocuments(filter)
    ]);
    return res.status(200).json({ success: true, items, page, limit, total, hasNext: page*limit < total });
  } catch (err) { next(err); }
};

// GET /api/v1/media/category/:slug
export const listMediaByCategory = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { slug } = req.params;
    const { type, sort } = req.query;

    // Build filter: try match by category.slug if exists OR fallback to name (de-slugified)
    const filter = { status: 'approved' };
    if (type) filter.type = type;

    const deSlug = String(slug || '').replace(/-/g, ' ').trim();
    filter.$or = [
      { 'category.slug': slug },
      { 'category.name': new RegExp(`^${deSlug}$`, 'i') }
    ];

    const sortObj = {};
    if (sort) {
      const allowed = new Set(['-createdAt','createdAt','-metrics.ratingAvg','metrics.ratingAvg','-metrics.weightedScore','metrics.weightedScore','-year','year']);
      if (allowed.has(sort)) {
        const dir = sort.startsWith('-') ? -1 : 1;
        const key = sort.replace(/^-/, '');
        sortObj[key] = dir;
      }
    }
    if (Object.keys(sortObj).length === 0) sortObj['metrics.weightedScore'] = -1;

    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('_id title type imageUrl year category metrics.ratingAvg metrics.ratingCount metrics.weightedScore slug'),
      Media.countDocuments({ status: 'approved' }) // or count with same filter? Usually same filter.
    ]);
    // Using same filter for total:
    const total2 = await Media.countDocuments(filter);

    return res.status(200).json({ success: true, items, page, limit, total: total2, hasNext: page*limit < total2 });
  } catch (err) { next(err); }
};
