import { body, param, query } from 'express-validator';

const roleValidator = {
  createRole: [
    body('name').notEmpty().withMessage('Role name is required').isString().withMessage('Role name must be a string').trim(),
    body('description').optional().isString().withMessage('Description must be a string').trim(),
  ],

  updateRole: [
    param('uid').isUUID().withMessage('Valid role UID is required'),
    body('name').optional().isString().withMessage('Role name must be a string').trim(),
    body('description').optional().isString().withMessage('Description must be a string').trim(),
  ],

  getRoleDetail: [param('uid').isUUID().withMessage('Valid role UID is required')],

  deleteRole: [param('uid').isUUID().withMessage('Valid role UID is required')],

  getRoleByName: [param('name').notEmpty().withMessage('Role name is required').isString().withMessage('Role name must be a string').trim()],

  assignPermissions: [
    param('uid').isUUID().withMessage('Valid role UID is required'),
    body('permissionUids').isArray().withMessage('Permission UIDs must be an array'),
    body('permissionUids.*').isUUID().withMessage('Each permission UID must be a valid UUID'),
  ],

  removePermissions: [
    param('uid').isUUID().withMessage('Valid role UID is required'),
    body('permissionUids').isArray().withMessage('Permission UIDs must be an array'),
    body('permissionUids.*').isUUID().withMessage('Each permission UID must be a valid UUID'),
  ],

  listRoles: [
    query('name').optional().isString().withMessage('Name must be a string if provided').trim(),
    query('description').optional().isString().withMessage('Description must be a string if provided').trim(),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],
};

export default roleValidator;
