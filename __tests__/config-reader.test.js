const ConfigReader = require('../scripts/config-reader');
const fs = require('fs');
const path = require('path');

describe('ConfigReader', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const validConfigPath = path.join(fixturesDir, 'valid-config.json');
  const invalidConfigPath = path.join(fixturesDir, 'invalid-json.json');
  const nonExistentPath = path.join(fixturesDir, 'non-existent.json');
  
  beforeAll(() => {
    // Create invalid JSON file for testing
    fs.writeFileSync(invalidConfigPath, '{ invalid json');
  });
  
  afterAll(() => {
    // Clean up
    if (fs.existsSync(invalidConfigPath)) {
      fs.unlinkSync(invalidConfigPath);
    }
  });

  describe('constructor', () => {
    it('should use default path when no path provided', () => {
      const reader = new ConfigReader();
      expect(reader.getPath()).toContain('src/terminal-config.json');
    });

    it('should use custom path when provided', () => {
      const customPath = '/custom/path.json';
      const reader = new ConfigReader(customPath);
      expect(reader.getPath()).toBe(customPath);
    });
  });

  describe('read', () => {
    it('should read valid JSON file successfully', async () => {
      const reader = new ConfigReader(validConfigPath);
      const config = await reader.read();
      expect(Array.isArray(config)).toBe(true);
      expect(config[0]).toHaveProperty('heading');
      expect(config[0]).toHaveProperty('content');
    });

    it('should throw error for non-existent file', async () => {
      const reader = new ConfigReader(nonExistentPath);
      await expect(reader.read()).rejects.toThrow('Configuration file not found');
    });

    it('should throw error for invalid JSON', async () => {
      const reader = new ConfigReader(invalidConfigPath);
      await expect(reader.read()).rejects.toThrow('Invalid JSON in configuration file');
    });
  });

  describe('parse', () => {
    it('should parse valid JSON string', () => {
      const reader = new ConfigReader();
      const jsonString = '[{"heading": "test", "content": "content"}]';
      const result = reader.parse(jsonString);
      expect(result).toEqual([{heading: "test", content: "content"}]);
    });

    it('should throw error for invalid JSON string', () => {
      const reader = new ConfigReader();
      expect(() => reader.parse('invalid json')).toThrow('Invalid JSON');
    });
  });

  describe('exists', () => {
    it('should return true for existing file', () => {
      const reader = new ConfigReader(validConfigPath);
      expect(reader.exists()).toBe(true);
    });

    it('should return false for non-existent file', () => {
      const reader = new ConfigReader(nonExistentPath);
      expect(reader.exists()).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should handle EACCES error', () => {
      const reader = new ConfigReader();
      const error = new Error();
      error.code = 'EACCES';
      
      const result = reader.handleError(error);
      expect(result.message).toContain('Permission denied');
    });

    it('should handle EISDIR error', () => {
      const reader = new ConfigReader();
      const error = new Error();
      error.code = 'EISDIR';
      
      const result = reader.handleError(error);
      expect(result.message).toContain('Expected a file but found a directory');
    });

    it('should handle generic errors', () => {
      const reader = new ConfigReader();
      const error = new Error('Generic error');
      
      const result = reader.handleError(error);
      expect(result.message).toContain('Failed to read configuration file: Generic error');
    });
  });
});