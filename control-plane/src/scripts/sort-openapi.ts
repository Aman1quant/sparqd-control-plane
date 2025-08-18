import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

import logger from '../config/logger';

const specPath = path.join(__dirname, '../../dist/swagger.yaml');
const spec = YAML.parse(fs.readFileSync(specPath, 'utf8'));

if (spec.components && spec.components.schemas) {
  const sortedSchemas = Object.keys(spec.components.schemas)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = spec.components.schemas[key];
      return acc;
    }, {});

  spec.components.schemas = sortedSchemas;

  fs.writeFileSync(specPath, YAML.stringify(spec));
  logger.info('✅ Schemas sorted alphabetically.');
} else {
  logger.warn('⚠ No components.schemas found in spec.');
}
