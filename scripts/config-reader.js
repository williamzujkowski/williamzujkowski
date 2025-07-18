const fs = require('fs');
const path = require('path');

class ConfigReader {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), 'src', 'terminal-config.json');
  }

  async read() {
    try {
      const configContent = await fs.promises.readFile(this.configPath, 'utf-8');
      return this.parse(configContent);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  parse(content) {
    try {
      const config = JSON.parse(content);
      return config;
    } catch (error) {
      throw new Error(`Invalid JSON in configuration file: ${error.message}`);
    }
  }

  handleError(error) {
    switch (error.code) {
      case 'ENOENT':
        return new Error(`Configuration file not found at: ${this.configPath}`);
      case 'EACCES':
        return new Error(`Permission denied reading configuration file: ${this.configPath}`);
      case 'EISDIR':
        return new Error(`Expected a file but found a directory: ${this.configPath}`);
      default:
        if (error.message.includes('Invalid JSON')) {
          return error;
        }
        return new Error(`Failed to read configuration file: ${error.message}`);
    }
  }

  exists() {
    try {
      fs.accessSync(this.configPath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  getPath() {
    return this.configPath;
  }
}

module.exports = ConfigReader;