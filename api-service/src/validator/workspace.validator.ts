import { body, param, query } from 'express-validator';

const workspaceValidator = {
  createWorkspace: [
    body('name')
      .notEmpty()
      .withMessage('Workspace name is required')
      .isString()
      .withMessage('Workspace name must be a string')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Workspace name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
    body('createdById').optional().isNumeric().withMessage('Created by ID must be a number'),
  ],

  updateWorkspace: [
    param('uid').isUUID().withMessage('Valid workspace UID is required'),
    body('name')
      .optional()
      .isString()
      .withMessage('Workspace name must be a string')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Workspace name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
  ],

  getWorkspaceDetail: [param('uid').isUUID().withMessage('Valid workspace UID is required')],

  deleteWorkspace: [param('uid').isUUID().withMessage('Valid workspace UID is required')],

  getWorkspacesByAccount: [param('accountId').isNumeric().withMessage('Valid account ID is required')],

  getWorkspaceByName: [
    param('accountId').isNumeric().withMessage('Valid account ID is required'),
    param('name').notEmpty().withMessage('Workspace name is required').isString().withMessage('Workspace name must be a string').trim(),
  ],

  listWorkspaces: [
    query('accountId').optional().isNumeric().withMessage('Account ID must be a number if provided'),
    query('name').optional().isString().withMessage('Name must be a string if provided').trim(),
    query('description').optional().isString().withMessage('Description must be a string if provided').trim(),
    query('createdById').optional().isNumeric().withMessage('Created by ID must be a number if provided'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],

  updateWorkspaceMetadata: [
    param('uid').isUUID().withMessage('Valid workspace UID is required'),
    body('metadata').notEmpty().withMessage('Metadata is required').isObject().withMessage('Metadata must be a valid JSON object'),
  ],

  getWorkspacesByCreator: [param('createdById').isNumeric().withMessage('Valid creator ID is required')],
};

export default workspaceValidator;
