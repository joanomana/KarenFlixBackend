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

import { MongoClient } from "mongodb";

const usersValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["username", "email", "password", "role", "createdAt", "updatedAt"],
    properties: {
      _id: { bsonType: "objectId" },
      username: {
        bsonType: "string",
        minLength: 3,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9._-]{3,50}$",
      },
      email: {
        bsonType: "string",
        pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
      },
      password: { bsonType: "string", minLength: 10 },
      role: { bsonType: "string", enum: ["admin", "user"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"] },
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
      },
      year: { bsonType: "int", minimum: 1888, maximum: 3000 },
      imageUrl: { bsonType: "string", pattern: "^(https?://).+" },
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
      },
      title_lc: { bsonType: "string", minLength: 1, maxLength: 400 },
      slug: { bsonType: "string", minLength: 1, maxLength: 400, pattern: "^[a-z0-9-]+(?:-[a-z0-9-]+)*$" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"] },
    },
  },
};

const reviewsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["mediaId", "userId", "title", "comment", "rating", "likesCount", "dislikesCount", "createdAt", "updatedAt"],
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
      value: { bsonType: "int", minimum: -1, maximum: 1 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      __v: { bsonType: ["int", "long", "double"] },
    },
  },
};

async function ensureIndexes(db) {
  await db.collection("users").createIndexes([
    { key: { email: 1 }, name: "uniq_email", unique: true },
    { key: { username: 1 }, name: "uniq_username", unique: true },
  ]);

  await db.collection("media").createIndexes([
    { key: { slug: 1 }, name: "uniq_slug", unique: true },
    { key: { title_lc: 1 }, name: "idx_title_lc" },
    { key: { status: 1, "metrics.weightedScore": -1 }, name: "idx_status_weighted" },
  ]);

  await db.collection("reviews").createIndexes([
    { key: { mediaId: 1, createdAt: -1 }, name: "idx_media_createdAt" },
    { key: { userId: 1, createdAt: -1 }, name: "idx_user_createdAt" },
  ]);

  await db.collection("reviewreactions").createIndexes([
    { key: { reviewId: 1, userId: 1 }, name: "uniq_review_user", unique: true },
  ]);
}

async function upsertCollection(db, name, validator) {
  const exists = await db.listCollections({ name }).toArray();
  if (exists.length === 0) {
    await db.createCollection(name, { validator, validationLevel: "strict", validationAction: "error" });
    console.log(`✔️  Creada colección '${name}'.`);
  } else {
    await db.command({
      collMod: name,
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`🔧 Validator actualizado en '${name}'.`);
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const dbName = process.env.DB_NAME || "karenflix";
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

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
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.close().catch(() => {});
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
