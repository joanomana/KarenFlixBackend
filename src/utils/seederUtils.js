import mongoose from 'mongoose';

/**
 * Función genérica para verificar e insertar datos en una colección.
 * @param {mongoose.Model} Model - El modelo de Mongoose.
 * @param {Array} data - Los datos a insertar.
 * @param {Object} [uniqueFields={}] - Campos únicos para verificar duplicados.
 */
export const seedData = async (Model, data, uniqueFields = {}) => {
    try {
        for (const item of data) {
            const query = {};

            // Construir la consulta para verificar duplicados
            for (const field of Object.keys(uniqueFields)) {
                query[field] = item[field];
            }

            const exists = await Model.findOne(query);

            if (!exists) {
                const newItem = new Model(item);
                await newItem.save();
                console.log(`✅ ${Model.modelName} creado:`, item);
            } else {
                console.log(`ℹ️ ${Model.modelName} ya existe:`, item);
            }
        }

        console.log(`🎉 Seeding completado para ${Model.modelName}`);
    } catch (error) {
        console.error(`❌ Error durante el seeding de ${Model.modelName}:`, error);
        throw error;
    }
};
