import fs from 'fs';
import path from 'path';
import type { Router } from 'express';
import logger from '../../config/logger';

const registerRoutes = (router: Router): void => {
  const routesDir = path.join(__dirname, '../..', 'routes');
  const files = fs.readdirSync(routesDir);

  files.forEach((file) => {
    if (!file.match(/\.route\.(ts|js)$/i)) return;

    logger.info(`Registering route from file: ${file}`);

    const modulePath = path.join(routesDir, file);
    const routeModule = require(modulePath);
    const register = routeModule.default || routeModule;

    if (typeof register === 'function') {
      register(router);
    }
  });
};

export default registerRoutes;
