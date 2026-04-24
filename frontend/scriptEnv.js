const fs = require('fs');
const path = require('path');

function parseEnvFile(contents) {
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadFrontendEnv() {
  const envFiles = ['.env.local', '.env'];

  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    parseEnvFile(fs.readFileSync(envPath, 'utf8'));
  }
}

function requireEnv(name, fallbackNames = []) {
  const candidates = [name, ...fallbackNames];

  for (const candidate of candidates) {
    const value = process.env[candidate];
    if (value) {
      return value;
    }
  }

  throw new Error(
    `Missing required environment variable: ${name}. Checked ${candidates.join(', ')}.`,
  );
}

module.exports = {
  loadFrontendEnv,
  requireEnv,
};
