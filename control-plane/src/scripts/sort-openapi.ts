import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

import logger from '../config/logger';

const specPath = path.join(__dirname, '../openapi/swagger.yaml');
const spec = YAML.parse(fs.readFileSync(specPath, 'utf8'));

if (spec.components && spec.components.schemas) {
  const schemaKeys = Object.keys(spec.components.schemas);
  logger.debug(schemaKeys, '🔎 Schema keys before sort:');

  const sortedSchemas = schemaKeys.sort().reduce((acc: Record<string, any>, key) => {
    acc[key] = spec.components.schemas[key];
    return acc;
  }, {});

  const sortedSchemaKeys = Object.keys(sortedSchemas);
  logger.debug(sortedSchemaKeys, '✅ Schema keys after sort:');

  spec.components.schemas = sortedSchemas;
} else {
  logger.warn('⚠ No components.schemas found in spec.');
}

if (spec.paths) {
  const pathKeys = Object.keys(spec.paths);
  logger.debug(pathKeys, '🔎 Path keys before sort:');

  const sortedPaths = pathKeys.sort().reduce((acc: Record<string, any>, key) => {
    acc[key] = spec.paths[key];
    return acc;
  }, {});

  const sortedPathKeys = Object.keys(sortedPaths);
  logger.debug(sortedPathKeys, '✅ Path keys after sort:');

  spec.paths = sortedPaths;
} else {
  logger.warn('⚠ No paths found in spec.');
}

fs.writeFileSync(specPath, YAML.stringify(spec));
logger.info('✅ Schemas and paths sorted alphabetically.');
