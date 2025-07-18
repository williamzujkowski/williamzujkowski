#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ConfigReader = require('./config-reader');
const SchemaValidator = require('./schema-validator');
const TerminalWindowGenerator = require('./terminal-window-generator');

async function main() {
  try {
    console.log('🚀 Starting terminal window SVG generation...');
    
    // Initialize components
    const configPath = path.join(process.cwd(), 'src', 'terminal-config-v2.json');
    const configReader = new ConfigReader(configPath);
    const validator = new SchemaValidator();
    const generator = new TerminalWindowGenerator();
    
    // Initialize schema validator with v2 schema
    console.log('📋 Loading schema...');
    validator.schema = JSON.parse(
      await fs.promises.readFile(
        path.join(__dirname, '..', '.github', 'schema', 'terminal-config-v2.schema.json'),
        'utf-8'
      )
    );
    validator.validator = validator.ajv.compile(validator.schema);
    
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
    
    // Update generator config if window/terminal settings provided
    if (config.window || config.terminal) {
      generator.updateConfig({
        window: config.window,
        terminal: config.terminal
      });
    }
    
    // Generate SVG
    console.log('🎨 Generating terminal window SVG...');
    const svgContent = generator.generateTerminalWindow(config.sections);
    
    // Write SVG to file
    const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`✅ Terminal window SVG generated successfully at: ${outputPath}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Determine exit code based on error type
    let exitCode = 1;
    if (error.message.includes('validation')) {
      exitCode = 1;
    } else if (error.message.includes('Failed to generate')) {
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