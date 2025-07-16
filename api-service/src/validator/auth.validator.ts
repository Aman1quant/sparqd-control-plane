import { body } from 'express-validator';

const email = body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail().trim();

const forgotPassword = [email];
const authValidator = {
  forgotPassword,
};

export default authValidator;
