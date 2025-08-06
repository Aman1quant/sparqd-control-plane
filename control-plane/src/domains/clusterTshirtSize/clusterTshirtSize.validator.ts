import { Provider } from '@prisma/client';
import { query } from 'express-validator';

const clusterTshirtSizeValidator = {
  listclusterTshirtSizes: [
    query('name').optional().isString().withMessage('Name must be a string'),
    query('provider').optional().isString().withMessage('Provider must be a string').isIn(Object.values(Provider)).withMessage('Invalid cluster status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  ],
};

export default clusterTshirtSizeValidator;
