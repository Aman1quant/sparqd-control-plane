import { body, param, query } from 'express-validator';

const clusterAutomationJobValidator = {
  createClusterAutomationJob: [
    body('clusterId').notEmpty().withMessage('Cluster ID is required').isNumeric().withMessage('Cluster ID must be a number'),
    body('type')
      .notEmpty()
      .withMessage('Job type is required')
      .isString()
      .withMessage('Job type must be a string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Job type must be between 1 and 100 characters'),
    body('status')
      .optional()
      .isString()
      .withMessage('Status must be a string')
      .isIn(['PENDING', 'RUNNING', 'RETRYING', 'FAILED', 'COMPLETED', 'CANCELLED', 'TIMEOUT'])
      .withMessage('Status must be a valid automation job status'),
    body('logsUrl').optional().isURL().withMessage('Logs URL must be a valid URL'),
    body('output').optional().isObject().withMessage('Output must be a valid JSON object'),
    body('attempts').optional().isInt({ min: 0 }).withMessage('Attempts must be a non-negative integer'),
    body('lastTriedAt').optional().isISO8601().withMessage('Last tried at must be a valid ISO8601 date'),
    body('nextRetryAt').optional().isISO8601().withMessage('Next retry at must be a valid ISO8601 date'),
    body('failReason')
      .optional()
      .isString()
      .withMessage('Fail reason must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Fail reason must not exceed 1000 characters'),
    body('createdById').optional().isNumeric().withMessage('Created by ID must be a number'),
  ],

  updateClusterAutomationJob: [
    param('uid').isUUID().withMessage('Valid cluster automation job UID is required'),
    body('type')
      .optional()
      .isString()
      .withMessage('Job type must be a string')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Job type must be between 1 and 100 characters'),
    body('status')
      .optional()
      .isString()
      .withMessage('Status must be a string')
      .isIn(['PENDING', 'RUNNING', 'RETRYING', 'FAILED', 'COMPLETED', 'CANCELLED', 'TIMEOUT'])
      .withMessage('Status must be a valid automation job status'),
    body('logsUrl').optional().isURL().withMessage('Logs URL must be a valid URL'),
    body('output').optional().isObject().withMessage('Output must be a valid JSON object'),
    body('attempts').optional().isInt({ min: 0 }).withMessage('Attempts must be a non-negative integer'),
    body('lastTriedAt').optional().isISO8601().withMessage('Last tried at must be a valid ISO8601 date'),
    body('nextRetryAt').optional().isISO8601().withMessage('Next retry at must be a valid ISO8601 date'),
    body('failReason')
      .optional()
      .isString()
      .withMessage('Fail reason must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Fail reason must not exceed 1000 characters'),
  ],

  getClusterAutomationJobDetail: [param('uid').isUUID().withMessage('Valid cluster automation job UID is required')],

  deleteClusterAutomationJob: [param('uid').isUUID().withMessage('Valid cluster automation job UID is required')],

  updateJobStatus: [
    param('uid').isUUID().withMessage('Valid cluster automation job UID is required'),
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isString()
      .withMessage('Status must be a string')
      .isIn(['PENDING', 'RUNNING', 'RETRYING', 'FAILED', 'COMPLETED', 'CANCELLED', 'TIMEOUT'])
      .withMessage('Status must be a valid automation job status'),
    body('failReason')
      .optional()
      .isString()
      .withMessage('Fail reason must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Fail reason must not exceed 1000 characters'),
  ],

  getJobsByCluster: [param('clusterUid').isUUID().withMessage('Valid cluster UID is required')],

  retryJob: [param('uid').isUUID().withMessage('Valid cluster automation job UID is required')],

  cancelJob: [param('uid').isUUID().withMessage('Valid cluster automation job UID is required')],

  listClusterAutomationJobs: [
    query('clusterId').optional().isNumeric().withMessage('Cluster ID must be a number if provided'),
    query('type').optional().isString().withMessage('Type must be a string if provided').trim(),
    query('status')
      .optional()
      .isString()
      .withMessage('Status must be a string if provided')
      .isIn(['PENDING', 'RUNNING', 'RETRYING', 'FAILED', 'COMPLETED', 'CANCELLED', 'TIMEOUT'])
      .withMessage('Status must be a valid automation job status if provided'),
    query('createdById').optional().isNumeric().withMessage('Created by ID must be a number if provided'),
    query('attempts').optional().isInt({ min: 0 }).withMessage('Attempts must be a non-negative integer if provided'),
    query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid ISO8601 date if provided'),
    query('dateTo').optional().isISO8601().withMessage('Date to must be a valid ISO8601 date if provided'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],

  validateJobOutput: [
    body('output').custom((value) => {
      if (value !== undefined && (typeof value !== 'object' || value === null)) {
        throw new Error('Output must be a valid object if provided');
      }
      return true;
    }),
  ],

  validateDateRange: [
    query('dateFrom').optional().isISO8601().withMessage('Date from must be a valid ISO8601 date'),
    query('dateTo')
      .optional()
      .isISO8601()
      .withMessage('Date to must be a valid ISO8601 date')
      .custom((value, { req }) => {
        if (value && req?.query?.dateFrom) {
          const dateFrom = new Date(req.query.dateFrom as string);
          const dateTo = new Date(value);
          if (dateTo <= dateFrom) {
            throw new Error('Date to must be after date from');
          }
        }
        return true;
      }),
  ],
};

export default clusterAutomationJobValidator;
