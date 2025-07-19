#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const UnixTerminalGenerator = require('./unix-terminal-generator');
const ConfigReader = require('./config-reader');
const FlexibleSchemaValidator = require('./flexible-schema-validator');

async function main() {
  try {
    console.log('🖥️  Generating Unix-style terminal SVG...');
    
    // Read configuration
    const configPath = path.join(__dirname, '..', 'src', 'unix-terminal-config.json');
    const configReader = new ConfigReader(configPath);
    const config = await configReader.read();
    
    // Validate configuration
    const schemaPath = path.join(__dirname, '..', '.github', 'schema', 'unix-terminal-config.schema.json');
    const validator = new FlexibleSchemaValidator(schemaPath);
    await validator.initialize();
    const validationResult = validator.validate(config);
    
    if (!validationResult.valid) {
      console.error('❌ Configuration validation failed:', validationResult.errors);
      process.exit(1);
    }
    
    // Generate SVG
    const generator = new UnixTerminalGenerator();
    const svg = generator.generateTerminal(config.sequences);
    
    // Write output
    const outputPath = path.join(__dirname, '..', 'src', 'terminal.svg');
    fs.writeFileSync(outputPath, svg);
    
    console.log('✅ Unix terminal SVG generated successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`📏 Size: ${(Buffer.byteLength(svg) / 1024).toFixed(2)} KB`);
    
    // Validate SVG structure
    if (!svg.includes('<svg') || !svg.includes('</svg>')) {
      console.error('❌ Generated SVG appears to be invalid');
      process.exit(1);
    }
    
    console.log('✨ All checks passed!');
    
  } catch (error) {
    console.error('❌ Error generating Unix terminal:', error);
    process.exit(1);
  }
}

main();