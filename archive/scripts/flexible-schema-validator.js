const Ajv = require('ajv');
const fs = require('fs');

class FlexibleSchemaValidator {
  constructor(schemaPath) {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    this.schemaPath = schemaPath;
    this.schema = null;
    this.validator = null;
  }

  async initialize() {
    try {
      const schemaContent = await fs.promises.readFile(this.schemaPath, 'utf-8');
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
      case 'enum':
        return `Value must be one of: ${error.params.allowedValues.join(', ')}`;
      case 'minLength':
        return `String must have at least ${error.params.limit} characters`;
      case 'minItems':
        return `Array must have at least ${error.params.limit} items`;
      case 'pattern':
        return `String does not match required pattern: ${error.params.pattern}`;
      case 'additionalProperties':
        return `Unexpected property: ${error.params.additionalProperty}`;
      default:
        return error.message || 'Validation failed';
    }
  }
}

module.exports = FlexibleSchemaValidator;