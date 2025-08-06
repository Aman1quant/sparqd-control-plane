import { ClusterStatus } from '@prisma/client';
import { body, param, query } from 'express-validator';

const clusterValidator = {
  createCluster: [
    body('name')
      .notEmpty()
      .withMessage('Cluster name is required')
      .isString()
      .withMessage('Cluster name must be a string')
      .trim()
      .isLength({ min: 4, max: 255 })
      .withMessage('Cluster name must be between 4 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('clusterTshirtSizeUid').isUUID().withMessage('Must be UUID of clusterTshirtSize'),
    body('serviceSelections').isArray({ min: 1 }),
    body('serviceSelections.*.serviceUid').isString().notEmpty(),
    body('serviceSelections.*.serviceVersionUid').isString().notEmpty(),
  ],

  updateCluster: [
    param('uid').isUUID().withMessage('Valid cluster UID is required'),
    body('name')
      .optional()
      .isString()
      .withMessage('Cluster name must be a string')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Cluster name must be between 4 and 255 characters'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    body('tshirtSize').optional().isString().withMessage('T-shirt size must be a string'),
    body('status').optional().isString().withMessage('Status must be a string').isIn(Object.values(ClusterStatus)).withMessage('Invalid cluster status'),
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

  listClusters: [
    query('name').optional().isString().withMessage('Name must be a string if provided').trim(),
    query('description').optional().isString().withMessage('Description must be a string if provided').trim(),
    query('status')
      .optional()
      .isString()
      .withMessage('Status must be a string if provided')
      .isIn(Object.values(ClusterStatus))
      .withMessage('Invalid cluster status'),
    query('tshirtSize').optional().isString().withMessage('T-shirt size must be a string if provided'),
    query('createdById').optional().isNumeric().withMessage('Created by ID must be a number if provided'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],

  updateClusterStatus: [
    param('uid').isUUID().withMessage('Valid cluster UID is required'),
    body('status').optional().isString().withMessage('Status must be a string').isIn(Object.values(ClusterStatus)).withMessage('Invalid cluster status'),
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
