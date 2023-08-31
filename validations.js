import { body } from 'express-validator';

export const loginValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
];

export const registerValidation = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
  body('fullName', 'Укажите имя').isLength({ min: 3 }),
  body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];

export const postCreateValidation = [
  body('title', 'Введите заголовок статьи (мин. 3 символа)').isLength({ min: 3 }).isString(),
  body('text', 'Введите текст статьи (мин. 100 символов)').isLength({ min: 100 }).isString(),
  body('tags', 'Неверный формат тэгов. Введите как минимум 1 тэг.').isString().notEmpty(),
  body('imageUrl', 'Неверная ссылка на изображение').optional().isString(),
];