// src/config/schema.js
/**
 * Aplica validadores $jsonSchema e índices para:
 *  - users
 *  - media
 *  - reviews
 *  - reviewreactions
 *
 * Ejecutar:
 *   MONGODB_URI="mongodb://localhost:27017" DB_NAME="karenflix" node src/config/schema.js
 */

const { MongoClient } = require("mongodb");

const usersValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["username", "email", "password", "role", "createdAt", "updatedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      username: {
        bsonType: "string",
        description: "Nombre de usuario",
        minLength: 3,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9._-]{3,50}$",
      },
      email: {
        bsonType: "string",
        description: "Correo del usuario",
        pattern:
          "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
      },
      password: {
        bsonType: "string",
        description: "Hash bcrypt u otro",
        minLength: 10,
      },
      role: {
        bsonType: "string",
        enum: ["admin", "user"],
      },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"], description: "Versión (opcional)" },
    },
  },
};

const mediaValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "title",
      "type",
      "description",
      "category",
      "year",
      "imageUrl",
      "status",
      "metrics",
      "slug",
      "title_lc",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      _id: { bsonType: "objectId" },
      title: { bsonType: "string", minLength: 1, maxLength: 300 },
      type: { bsonType: "string", enum: ["movie", "series", "anime"] },
      description: { bsonType: "string", minLength: 1, maxLength: 5000 },
      category: {
        bsonType: "object",
        required: ["name"],
        properties: {
          name: { bsonType: "string", minLength: 1, maxLength: 100 },
        },
        additionalProperties: false,
      },
      year: { bsonType: "int", minimum: 1888, maximum: 3000 }, // cine desde ~1888
      imageUrl: {
        bsonType: "string",
        pattern: "^(https?://).+",
      },
      status: { bsonType: "string", enum: ["approved", "pending", "rejected"] },
      createdBy: { bsonType: "objectId" },
      metrics: {
        bsonType: "object",
        required: ["ratingCount", "ratingAvg", "likes", "dislikes", "weightedScore"],
        properties: {
          ratingCount: { bsonType: "int", minimum: 0 },
          ratingAvg: { bsonType: ["double", "int"], minimum: 0, maximum: 10 },
          likes: { bsonType: "int", minimum: 0 },
          dislikes: { bsonType: "int", minimum: 0 },
          weightedScore: { bsonType: ["double", "int"], minimum: 0 },
        },
        additionalProperties: false,
      },
      title_lc: { bsonType: "string", minLength: 1, maxLength: 400 },
      slug: {
        bsonType: "string",
        minLength: 1,
        maxLength: 400,
        pattern: "^[a-z0-9-]+(?:-[a-z0-9-]+)*$",
      },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"] },
    },
  },
};

const reviewsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "mediaId",
      "userId",
      "title",
      "comment",
      "rating",
      "likesCount",
      "dislikesCount",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      _id: { bsonType: "objectId" },
      mediaId: { bsonType: "objectId" },
      userId: { bsonType: "objectId" },
      title: { bsonType: "string", minLength: 1, maxLength: 200 },
      comment: { bsonType: "string", minLength: 1, maxLength: 5000 },
      rating: { bsonType: "int", minimum: 1, maximum: 10 },
      likesCount: { bsonType: "int", minimum: 0 },
      dislikesCount: { bsonType: "int", minimum: 0 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"] },
    },
  },
};

const reviewReactionsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["reviewId", "userId", "value", "createdAt", "updatedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      reviewId: { bsonType: "objectId" },
      userId: { bsonType: "objectId" },
      value: { bsonType: "int", minimum: -1, maximum: 1 }, // -1 dislike, 0 neutral, 1 like
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"] },
    },
  },
};

/** Índices a crear por colección */
async function ensureIndexes(db) {
  // users: email y username únicos
  await db.collection("users").createIndexes([
    { key: { email: 1 }, name: "uniq_email", unique: true },
    { key: { username: 1 }, name: "uniq_username", unique: true },
  ]);

  // media: slug único, title_lc para búsquedas, aprobados por ranking/popularidad
  await db.collection("media").createIndexes([
    { key: { slug: 1 }, name: "uniq_slug", unique: true },
    { key: { title_lc: 1 }, name: "idx_title_lc" },
    { key: { status: 1, "metrics.weightedScore": -1 }, name: "idx_status_weighted" },
    { key: { status: 1, "metrics.likes": -1 }, name: "idx_status_likes" },
    { key: { status: 1, year: -1 }, name: "idx_status_year" },
    { key: { type: 1, status: 1 }, name: "idx_type_status" },
  ]);

  // reviews: por media y usuario; opcionalmente una review por usuario+media
  await db.collection("reviews").createIndexes([
    { key: { mediaId: 1, createdAt: -1 }, name: "idx_media_createdAt" },
    { key: { userId: 1, createdAt: -1 }, name: "idx_user_createdAt" },
    // descomenta si quieres forzar UNA review por (user, media)
    // { key: { mediaId: 1, userId: 1 }, name: "uniq_media_user", unique: true },
  ]);

  // reviewreactions: única por (reviewId, userId)
  await db.collection("reviewreactions").createIndexes([
    { key: { reviewId: 1, userId: 1 }, name: "uniq_review_user", unique: true },
    { key: { reviewId: 1 }, name: "idx_review" },
    { key: { userId: 1 }, name: "idx_user" },
  ]);
}

/** Crea o actualiza (collMod) una colección con validator */
async function upsertCollection(db, name, validator) {
  const exists = await db.listCollections({ name }).toArray();
  if (exists.length === 0) {
    await db.createCollection(name, { validator, validationLevel: "strict", validationAction: "error" });
    console.log(`✔️  Creada colección '${name}' con validator.`);
  } else {
    // collMod para actualizar validator en colección existente
    await db.command({
      collMod: name,
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`🔧 Actualizado validator de '${name}' con collMod.`);
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const dbName = process.env.DB_NAME || "karenflix";

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);

    await upsertCollection(db, "users", usersValidator);
    await upsertCollection(db, "media", mediaValidator);
    await upsertCollection(db, "reviews", reviewsValidator);
    await upsertCollection(db, "reviewreactions", reviewReactionsValidator);

    await ensureIndexes(db);

    console.log("✅ Validadores e índices aplicados correctamente.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error aplicando esquemas:", err?.message || err);
    process.exit(1);
  } finally {
    await client.close().catch(() => {});
  }
}

// Exporta por si quieres importarlo desde otro script
module.exports = {
  usersValidator,
  mediaValidator,
  reviewsValidator,
  reviewReactionsValidator,
};

// Si se ejecuta directamente con `node src/config/schema.js`
if (require.main === module) {
  main();
}
