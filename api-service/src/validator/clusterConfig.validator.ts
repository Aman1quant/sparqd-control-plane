import { body, param, query } from 'express-validator';

const clusterConfigValidator = {
  createClusterConfig: [
    body('clusterId').notEmpty().withMessage('Cluster ID is required').isNumeric().withMessage('Cluster ID must be a number'),
    body('version').notEmpty().withMessage('Version is required').isInt({ min: 1 }).withMessage('Version must be a positive integer'),
    body('tshirtSize').notEmpty().withMessage('T-shirt size is required').isString().withMessage('T-shirt size must be a string'),
    body('services').notEmpty().withMessage('Services configuration is required').isObject().withMessage('Services must be a valid JSON object'),
    body('rawSpec').notEmpty().withMessage('Raw specification is required').isObject().withMessage('Raw specification must be a valid JSON object'),
    body('createdById').optional().isNumeric().withMessage('Created by ID must be a number'),
  ],

  updateClusterConfig: [
    param('uid').isUUID().withMessage('Valid cluster config UID is required'),
    body('version').optional().isInt({ min: 1 }).withMessage('Version must be a positive integer'),
    body('tshirtSize').optional().isString().withMessage('T-shirt size must be a string'),
    body('services').optional().isObject().withMessage('Services must be a valid JSON object'),
    body('rawSpec').optional().isObject().withMessage('Raw specification must be a valid JSON object'),
  ],

  getClusterConfigDetail: [param('uid').isUUID().withMessage('Valid cluster config UID is required')],

  deleteClusterConfig: [param('uid').isUUID().withMessage('Valid cluster config UID is required')],

  setAsCurrentConfig: [param('uid').isUUID().withMessage('Valid cluster config UID is required')],

  getClusterConfigsByCluster: [param('clusterUid').isUUID().withMessage('Valid cluster UID is required')],

  listClusterConfigs: [
    query('clusterId').optional().isNumeric().withMessage('Cluster ID must be a number if provided'),
    query('version').optional().isInt({ min: 1 }).withMessage('Version must be a positive integer if provided'),
    query('tshirtSize').optional().isString().withMessage('T-shirt size must be a string if provided'),
    query('createdById').optional().isNumeric().withMessage('Created by ID must be a number if provided'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],

  getConfigsByClusterUid: [
    param('clusterUid').isUUID().withMessage('Valid cluster UID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],

  validateConfigData: [
    body('services').custom((value) => {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Services must be a valid object');
      }
      return true;
    }),
    body('rawSpec').custom((value) => {
      if (typeof value !== 'object' || value === null) {
        throw new Error('Raw specification must be a valid object');
      }
      return true;
    }),
  ],
};

export default clusterConfigValidator;
