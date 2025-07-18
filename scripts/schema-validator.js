const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    this.schema = null;
    this.validator = null;
  }

  async initialize() {
    try {
      const schemaPath = path.join(__dirname, '..', '.github', 'schema', 'terminal-config.schema.json');
      const schemaContent = await fs.promises.readFile(schemaPath, 'utf-8');
      this.schema = JSON.parse(schemaContent);
      this.validator = this.ajv.compile(this.schema);
    } catch (error) {
      throw new Error(`Failed to initialize schema validator: ${error.message}`);
    }
  }

  validate(config) {
    if (!this.validator) {
      throw new Error('Schema validator not initialized. Call initialize() first.');
    }

    const valid = this.validator(config);
    
    if (!valid) {
      return {
        valid: false,
        errors: this.formatErrors(this.validator.errors)
      };
    }

    return {
      valid: true,
      errors: []
    };
  }

  formatErrors(errors) {
    return errors.map(error => {
      const path = error.instancePath || '/';
      const message = this.getErrorMessage(error);
      
      return {
        path,
        message,
        keyword: error.keyword,
        params: error.params
      };
    });
  }

  getErrorMessage(error) {
    switch (error.keyword) {
      case 'required':
        return `Missing required property: ${error.params.missingProperty}`;
      case 'type':
        return `Expected ${error.params.type} but got ${typeof error.data}`;
      case 'minLength':
        return `String must be at least ${error.params.limit} characters long`;
      case 'minimum':
        return `Value must be at least ${error.params.limit}`;
      case 'maximum':
        return `Value must be at most ${error.params.limit}`;
      case 'pattern':
        return `Value does not match expected pattern: ${error.params.pattern}`;
      case 'additionalProperties':
        return `Unknown property: ${error.params.additionalProperty}`;
      case 'minItems':
        return `Array must have at least ${error.params.limit} items`;
      default:
        return error.message || 'Validation error';
    }
  }
}

module.exports = SchemaValidator;