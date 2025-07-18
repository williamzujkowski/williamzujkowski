const SchemaValidator = require('../scripts/schema-validator');
const fs = require('fs');
const path = require('path');

describe('SchemaValidator', () => {
  let validator;
  
  beforeEach(async () => {
    validator = new SchemaValidator();
    await validator.initialize();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const newValidator = new SchemaValidator();
      await expect(newValidator.initialize()).resolves.not.toThrow();
      expect(newValidator.schema).toBeDefined();
      expect(newValidator.validator).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should validate a correct configuration', () => {
      const validConfig = [
        {
          heading: "$ test",
          content: "Hello World"
        }
      ];
      
      const result = validator.validate(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject configuration missing required fields', () => {
      const invalidConfig = [
        {
          content: "Missing heading"
        }
      ];
      
      const result = validator.validate(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Missing required property: heading');
    });

    it('should reject empty array', () => {
      const result = validator.validate([]);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Array must have at least 1 items');
    });

    it('should reject invalid color format', () => {
      const invalidConfig = [
        {
          heading: "$ test",
          content: "Test",
          color: "not-a-color"
        }
      ];
      
      const result = validator.validate(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Value does not match expected pattern');
    });

    it('should accept valid hex colors', () => {
      const configs = [
        { heading: "$ test", content: "Test", color: "#fff" },
        { heading: "$ test", content: "Test", color: "#ffffff" },
        { heading: "$ test", content: "Test", color: "#00ff00" }
      ];
      
      configs.forEach(config => {
        const result = validator.validate([config]);
        expect(result.valid).toBe(true);
      });
    });

    it('should enforce minimum and maximum values', () => {
      const invalidConfig = [
        {
          heading: "$ test",
          content: "Test",
          size: 5  // Below minimum of 10
        }
      ];
      
      const result = validator.validate(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Value must be at least 10');
    });

    it('should reject additional properties', () => {
      const invalidConfig = [
        {
          heading: "$ test",
          content: "Test",
          unknownProperty: "value"
        }
      ];
      
      const result = validator.validate(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown property: unknownProperty');
    });

    it('should throw error if validator not initialized', () => {
      const newValidator = new SchemaValidator();
      expect(() => newValidator.validate([])).toThrow('Schema validator not initialized');
    });
  });
  
  describe('formatErrors', () => {
    it('should format multiple errors correctly', () => {
      const invalidConfig = [
        {
          // Missing both required fields
        }
      ];
      
      const result = validator.validate(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      result.errors.forEach(error => {
        expect(error).toHaveProperty('path');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('keyword');
        expect(error).toHaveProperty('params');
      });
    });
  });
});