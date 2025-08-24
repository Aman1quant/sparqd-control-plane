const fs = require('fs');
const path = require('path');

exports.updateEnv = function updateEnv(key, value, envFilePath = '.env') {
  let content = '';
  if (fs.existsSync(envFilePath)) {
    content = fs.readFileSync(envFilePath, 'utf8');
  }

  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (content.match(regex)) {
    // Update existing key
    content = content.replace(regex, `${key}=${value}`);
  } else {
    // Append new key-value
    if (content && !content.endsWith('\n')) content += '\n';
    content += `${key}=${value}\n`;
  }

  fs.writeFileSync(envFilePath, content, 'utf8');
  console.log(`Updated ${key} in ${envFilePath}`);
}