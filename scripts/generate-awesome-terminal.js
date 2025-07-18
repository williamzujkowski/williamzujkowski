#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AwesomeTerminalGenerator = require('./awesome-terminal-generator');

async function main() {
  try {
    console.log('🚀 Starting awesome terminal generation...');
    
    // Initialize generator
    const generator = new AwesomeTerminalGenerator();
    
    // Read configuration
    console.log('📖 Reading terminal sequences...');
    const configPath = path.join(process.cwd(), 'src', 'awesome-terminal-config.json');
    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Update generator config if custom settings provided
    if (config.window || config.terminal) {
      generator.updateConfig({
        window: config.window,
        terminal: config.terminal
      });
    }
    
    // Generate SVG
    console.log('🎨 Generating awesome terminal SVG...');
    const svgContent = generator.generateAwesomeTerminal(config.sequences);
    
    // Write SVG to file
    const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`✅ Awesome terminal SVG generated successfully!`);
    console.log(`📍 Output: ${outputPath}`);
    
    // Calculate animation info
    let totalDuration = 0;
    config.sequences.forEach(seq => {
      totalDuration += (seq.delay || 0) + (seq.typingDuration || seq.duration || 2000) + (seq.pause || 1000);
    });
    console.log(`⏱️  Total animation duration: ${(totalDuration / 1000).toFixed(1)}s`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Add config update method
AwesomeTerminalGenerator.prototype.updateConfig = function(customConfig) {
  this.config = this.deepMerge(this.config, customConfig);
};

AwesomeTerminalGenerator.prototype.deepMerge = function(target, source) {
  const output = Object.assign({}, target);
  if (this.isObject(target) && this.isObject(source)) {
    Object.keys(source).forEach(key => {
      if (this.isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = this.deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

AwesomeTerminalGenerator.prototype.isObject = function(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = main;