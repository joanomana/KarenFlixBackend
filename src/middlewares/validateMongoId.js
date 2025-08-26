import mongoose from 'mongoose';

// Middleware para validar IDs de MongoDB
const validateMongoId = (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'ID es requerido'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido'
        });
    }

    next();
};

export default validateMongoId;
