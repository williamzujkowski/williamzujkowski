#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ConfigReader = require('./config-reader');
const SchemaValidator = require('./schema-validator');
const SVGGenerator = require('./svg-generator');

async function main() {
  try {
    console.log('🚀 Starting SVG generation...');
    
    // Initialize components
    const configReader = new ConfigReader();
    const validator = new SchemaValidator();
    const generator = new SVGGenerator();
    
    // Initialize schema validator
    console.log('📋 Loading schema...');
    await validator.initialize();
    
    // Read configuration
    console.log('📖 Reading configuration...');
    const config = await configReader.read();
    
    // Validate configuration
    console.log('✅ Validating configuration...');
    const validationResult = validator.validate(config);
    
    if (!validationResult.valid) {
      console.error('❌ Configuration validation failed:');
      validationResult.errors.forEach(error => {
        console.error(`   - ${error.path}: ${error.message}`);
      });
      process.exit(1);
    }
    
    console.log('✨ Configuration is valid!');
    
    // Generate SVG
    console.log('🎨 Generating SVG...');
    const svgContent = await generator.generateSVG(config);
    
    // Write SVG to file
    const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`✅ SVG generated successfully at: ${outputPath}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Determine exit code based on error type
    let exitCode = 1;
    if (error.message.includes('validation')) {
      exitCode = 1;
    } else if (error.message.includes('Failed to generate SVG')) {
      exitCode = 2;
    } else if (error.message.includes('file') || error.message.includes('Permission')) {
      exitCode = 3;
    }
    
    process.exit(exitCode);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = main;