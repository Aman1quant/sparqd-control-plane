import { body, param, query } from 'express-validator';

const userValidator = {
  createUser: [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('kcSub').notEmpty().withMessage('Keycloak subject ID is required').isString().withMessage('Keycloak subject ID must be a string'),
    body('fullName').optional().isString().withMessage('Full name must be a string').trim(),
    body('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
    body('hasAccountSignedUp').optional().isBoolean().withMessage('hasAccountSignedUp must be a boolean'),
  ],

  updateUser: [
    param('uid').isUUID().withMessage('Valid user UID is required'),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('fullName').optional().isString().withMessage('Full name must be a string').trim(),
    body('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
    body('hasAccountSignedUp').optional().isBoolean().withMessage('hasAccountSignedUp must be a boolean'),
  ],

  getUserDetail: [param('uid').isUUID().withMessage('Valid user UID is required')],

  deleteUser: [param('uid').isUUID().withMessage('Valid user UID is required')],

  getUserByEmail: [param('email').isEmail().withMessage('Valid email is required').normalizeEmail()],

  updateSignupStatus: [
    param('uid').isUUID().withMessage('Valid user UID is required'),
    body('hasAccountSignedUp').isBoolean().withMessage('hasAccountSignedUp must be a boolean'),
  ],

  listUsers: [
    query('email').optional().isEmail().withMessage('Email must be valid if provided').normalizeEmail(),
    query('fullName').optional().isString().withMessage('Full name must be a string if provided').trim(),
    query('hasAccountSignedUp').optional().isIn(['true', 'false']).withMessage('hasAccountSignedUp must be "true" or "false" if provided'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],
};

export default userValidator;
