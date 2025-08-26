import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        validate: {
            validator: function(password) {
                // Solo validar si la contraseña no está hasheada (nuevo o modificado)
                if (this.isModified('password') && !password.startsWith('$2b$')) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
                }
                return true; // Si ya está hasheada, es válida
            },
            message: 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
        }
    },
    role: {
        type: String,
        enum: ROLES,
        default: 'user',
        required: true
    },
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        // Hashear la contraseña con salt rounds de 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware para hashear contraseña en actualizaciones
userSchema.pre(['findOneAndUpdate', 'updateOne'], async function(next) {
    const update = this.getUpdate();

    if (update.password && !update.password.startsWith('$2b$')) {
        try {
            // Hashear la contraseña
            const salt = await bcrypt.genSalt(12);
            update.password = await bcrypt.hash(update.password, salt);
        } catch (error) {
            return next(error);
        }
    }

    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


// Método para verificar si el usuario es admin
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

const User = mongoose.model('User', userSchema);

export default User;