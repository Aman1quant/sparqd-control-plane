import cors from 'cors';
import config from '@config/config';
import logger from '@config/logger';
import type { Application } from 'express';

/**
 * Configures CORS middleware for the Express application.
 *
 * @param {Application} app - The Express application instance.
 */
export default function configure(app: Application): void {
  if (config.cors.enabled === false) {
    logger.warn('CORS is disabled in the configuration');
    return;
  }

  // Log the CORS configuration
  console.info('Configuring CORS with options:', config.cors);

  // Use the CORS middleware with the configured options
  const corsInstance = cors(config.cors);
  app.use(corsInstance);
}
