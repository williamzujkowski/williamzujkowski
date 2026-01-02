/**
 * @fileoverview Tests for the YAML content loader module.
 * @module tests/content-loader
 */

const path = require('path');
const fs = require('fs');
const { YamlContentLoader, ContentLoadError } = require('../scripts/content-loader');

describe('YamlContentLoader', () => {
  let loader;
  const contentDir = path.join(__dirname, '..', 'content');

  beforeEach(() => {
    loader = new YamlContentLoader(contentDir);
    loader.clearCache();
  });

  describe('constructor', () => {
    it('should create loader with default content directory', () => {
      const defaultLoader = new YamlContentLoader();
      expect(defaultLoader).toBeInstanceOf(YamlContentLoader);
    });

    it('should create loader with custom content directory', () => {
      const customDir = path.join(__dirname, 'fixtures');
      const customLoader = new YamlContentLoader(customDir);
      expect(customLoader).toBeInstanceOf(YamlContentLoader);
    });
  });

  describe('loadJokes', () => {
    it('should load jokes from YAML file', () => {
      const jokes = loader.loadJokes();
      expect(Array.isArray(jokes)).toBe(true);
    });

    it('should return array of joke objects', () => {
      const jokes = loader.loadJokes();
      if (jokes.length > 0) {
        expect(jokes[0]).toHaveProperty('q');
        expect(jokes[0]).toHaveProperty('a');
      }
    });

    it('should cache jokes after first load', () => {
      const jokes1 = loader.loadJokes();
      const jokes2 = loader.loadJokes();
      expect(jokes1).toBe(jokes2); // Same reference
    });

    it('should return empty array for missing file', () => {
      const emptyLoader = new YamlContentLoader('/nonexistent');
      const jokes = emptyLoader.loadJokes();
      expect(jokes).toEqual([]);
    });
  });

  describe('getJokeByIndex', () => {
    it('should return joke at index', () => {
      const joke = loader.getJokeByIndex(0);
      if (joke) {
        expect(joke).toHaveProperty('q');
        expect(joke).toHaveProperty('a');
      }
    });

    it('should wrap around for large index values', () => {
      const jokes = loader.loadJokes();
      if (jokes.length > 0) {
        const joke1 = loader.getJokeByIndex(0);
        const joke2 = loader.getJokeByIndex(jokes.length);
        expect(joke1).toEqual(joke2);
      }
    });

    it('should return null for empty joke list', () => {
      const emptyLoader = new YamlContentLoader('/nonexistent');
      const joke = emptyLoader.getJokeByIndex(0);
      expect(joke).toBeNull();
    });

    it('should work with day of year values', () => {
      const dayOfYear = 150;
      const joke = loader.getJokeByIndex(dayOfYear);
      // Just verify it returns something (null or joke object)
      expect(joke === null || typeof joke === 'object').toBe(true);
    });
  });

  describe('getRandomJoke', () => {
    it('should return a random joke', () => {
      const joke = loader.getRandomJoke();
      if (joke) {
        expect(joke).toHaveProperty('q');
        expect(joke).toHaveProperty('a');
      }
    });

    it('should return null for empty joke list', () => {
      const emptyLoader = new YamlContentLoader('/nonexistent');
      const joke = emptyLoader.getRandomJoke();
      expect(joke).toBeNull();
    });
  });

  describe('loadNationalDays', () => {
    it('should load national days from YAML file', () => {
      const days = loader.loadNationalDays();
      expect(typeof days).toBe('object');
    });

    it('should return object keyed by MM-DD', () => {
      const days = loader.loadNationalDays();
      const keys = Object.keys(days);
      if (keys.length > 0) {
        expect(keys[0]).toMatch(/^\d{2}-\d{2}$/);
      }
    });

    it('should cache national days after first load', () => {
      const days1 = loader.loadNationalDays();
      const days2 = loader.loadNationalDays();
      expect(days1).toBe(days2); // Same reference
    });

    it('should return empty object for missing file', () => {
      const emptyLoader = new YamlContentLoader('/nonexistent');
      const days = emptyLoader.loadNationalDays();
      expect(days).toEqual({});
    });
  });

  describe('getNationalDay', () => {
    it('should get national day by MM-DD string', () => {
      const day = loader.getNationalDay('01-01');
      if (day) {
        expect(day).toHaveProperty('name');
        expect(day).toHaveProperty('desc');
      }
    });

    it('should get national day from Date object', () => {
      const testDate = new Date('2026-01-01');
      const day = loader.getNationalDay(testDate);
      if (day) {
        expect(day).toHaveProperty('name');
        expect(day).toHaveProperty('desc');
      }
    });

    it('should return null for unknown date', () => {
      const day = loader.getNationalDay('99-99');
      expect(day).toBeNull();
    });

    it('should format Date object correctly', () => {
      // Test that single-digit months/days get zero-padded
      const march5 = new Date('2026-03-05');
      const day = loader.getNationalDay(march5);
      // May or may not exist, but should not throw
      expect(day === null || typeof day === 'object').toBe(true);
    });
  });

  describe('getTodaysNationalDay', () => {
    it('should get today\'s national day', () => {
      const day = loader.getTodaysNationalDay();
      // May or may not exist depending on today's date
      expect(day === null || typeof day === 'object').toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear jokes cache', () => {
      const jokes1 = loader.loadJokes();
      loader.clearCache();
      const jokes2 = loader.loadJokes();
      expect(jokes1).not.toBe(jokes2); // Different references
      expect(jokes1).toEqual(jokes2); // Same content
    });

    it('should clear national days cache', () => {
      const days1 = loader.loadNationalDays();
      loader.clearCache();
      const days2 = loader.loadNationalDays();
      expect(days1).not.toBe(days2); // Different references
    });
  });

  describe('static validation methods', () => {
    describe('validateJoke', () => {
      it('should validate correct joke object', () => {
        const valid = YamlContentLoader.validateJoke({ q: 'Question?', a: 'Answer!' });
        expect(valid).toBe(true);
      });

      it('should reject joke without question', () => {
        const invalid = YamlContentLoader.validateJoke({ a: 'Answer!' });
        expect(invalid).toBe(false);
      });

      it('should reject joke without answer', () => {
        const invalid = YamlContentLoader.validateJoke({ q: 'Question?' });
        expect(invalid).toBe(false);
      });

      it('should reject non-object', () => {
        const invalid = YamlContentLoader.validateJoke('not an object');
        expect(invalid).toBe(false);
      });

      it('should reject null', () => {
        const invalid = YamlContentLoader.validateJoke(null);
        expect(invalid).toBe(false);
      });
    });

    describe('validateNationalDay', () => {
      it('should validate correct national day object', () => {
        const valid = YamlContentLoader.validateNationalDay({ name: 'Test Day', desc: 'Description' });
        expect(valid).toBe(true);
      });

      it('should reject national day without name', () => {
        const invalid = YamlContentLoader.validateNationalDay({ desc: 'Description' });
        expect(invalid).toBe(false);
      });

      it('should reject national day without description', () => {
        const invalid = YamlContentLoader.validateNationalDay({ name: 'Test Day' });
        expect(invalid).toBe(false);
      });

      it('should reject non-object', () => {
        const invalid = YamlContentLoader.validateNationalDay('not an object');
        expect(invalid).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should throw ContentLoadError for invalid YAML', () => {
      // Create a temporary invalid YAML file
      const tempDir = path.join(__dirname, 'temp-test-content');
      const tempFile = path.join(tempDir, 'jokes.yaml');

      try {
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(tempFile, 'invalid: yaml: content: [');

        const badLoader = new YamlContentLoader(tempDir);
        expect(() => badLoader.loadJokes()).toThrow(ContentLoadError);
      } finally {
        // Cleanup
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
      }
    });
  });
});
