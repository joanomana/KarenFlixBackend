import { body } from 'express-validator';

export const validateCreateReview = [
  body('mediaId')
    .isMongoId().withMessage('mediaId debe ser un ObjectId válido'),
  body('title')
    .isString().withMessage('title debe ser string')
    .isLength({ min: 3, max: 120 }).withMessage('title 3–120 chars'),
  body('comment')
    .isString().withMessage('comment debe ser string')
    .isLength({ min: 10, max: 2000 }).withMessage('comment 10–2000 chars'),
  body('rating')
    .isInt({ min: 1, max: 10 }).withMessage('rating debe ser entero 1–10'),
];
