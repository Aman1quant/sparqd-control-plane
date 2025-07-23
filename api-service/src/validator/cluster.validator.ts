import { body, param, query } from 'express-validator';

const clusterValidator = {
  createCluster: [
    body('workspaceId').notEmpty().withMessage('Workspace ID is required').isNumeric().withMessage('Workspace ID must be a number'),
    body('name')
      .notEmpty()
      .withMessage('Cluster name is required')
      .isString()
      .withMessage('Cluster name must be a string')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Cluster name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('tshirtSize').notEmpty().withMessage('T-shirt size is required').isString().withMessage('T-shirt size must be a string'),
    body('status')
      .optional()
      .isString()
      .withMessage('Status must be a string')
      .isIn(['CREATING', 'STARTING', 'RUNNING', 'UPDATING', 'RESTARTING', 'STOPPING', 'STOPPED', 'FAILED', 'DELETING', 'DELETED'])
      .withMessage('Status must be a valid cluster status'),
    body('statusReason')
      .optional()
      .isString()
      .withMessage('Status reason must be a string')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Status reason must not exceed 500 characters'),
    body('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
    body('createdById').optional().isNumeric().withMessage('Created by ID must be a number'),
  ],

  updateCluster: [
    param('uid').isUUID().withMessage('Valid cluster UID is required'),
    body('name')
      .optional()
      .isString()
      .withMessage('Cluster name must be a string')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Cluster name must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('tshirtSize').optional().isString().withMessage('T-shirt size must be a string'),
    body('status')
      .optional()
      .isString()
      .withMessage('Status must be a string')
      .isIn(['CREATING', 'STARTING', 'RUNNING', 'UPDATING', 'RESTARTING', 'STOPPING', 'STOPPED', 'FAILED', 'DELETING', 'DELETED'])
      .withMessage('Status must be a valid cluster status'),
    body('statusReason')
      .optional()
      .isString()
      .withMessage('Status reason must be a string')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Status reason must not exceed 500 characters'),
    body('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
  ],

  getClusterDetail: [param('uid').isUUID().withMessage('Valid cluster UID is required')],

  deleteCluster: [param('uid').isUUID().withMessage('Valid cluster UID is required')],

  getClustersByWorkspace: [param('workspaceId').isNumeric().withMessage('Valid workspace ID is required')],

  listClusters: [
    query('workspaceId').optional().isNumeric().withMessage('Workspace ID must be a number if provided'),
    query('name').optional().isString().withMessage('Name must be a string if provided').trim(),
    query('description').optional().isString().withMessage('Description must be a string if provided').trim(),
    query('status')
      .optional()
      .isString()
      .withMessage('Status must be a string if provided')
      .isIn(['CREATING', 'STARTING', 'RUNNING', 'UPDATING', 'RESTARTING', 'STOPPING', 'STOPPED', 'FAILED', 'DELETING', 'DELETED'])
      .withMessage('Status must be a valid cluster status if provided'),
    query('tshirtSize').optional().isString().withMessage('T-shirt size must be a string if provided'),
    query('createdById').optional().isNumeric().withMessage('Created by ID must be a number if provided'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],

  updateClusterStatus: [
    param('uid').isUUID().withMessage('Valid cluster UID is required'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isString()
      .withMessage('Status must be a string')
      .isIn(['CREATING', 'STARTING', 'RUNNING', 'UPDATING', 'RESTARTING', 'STOPPING', 'STOPPED', 'FAILED', 'DELETING', 'DELETED'])
      .withMessage('Status must be a valid cluster status'),
    body('statusReason')
      .optional()
      .isString()
      .withMessage('Status reason must be a string')
      .trim()
      .isLength({ max: 500 })
      .withMessage('Status reason must not exceed 500 characters'),
  ],

  getClustersByCreator: [param('createdById').isNumeric().withMessage('Valid creator ID is required')],
};

export default clusterValidator;
