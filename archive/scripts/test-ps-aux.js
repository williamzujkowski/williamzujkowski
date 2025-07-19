#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');

async function main() {
  try {
    console.log('🧪 Testing ps aux scrolling behavior...');
    
    // Initialize generator with smaller window for testing
    const generator = new AdvancedTerminalGenerator();
    generator.config.window.height = 300; // Smaller window to force scrolling
    
    // Read test configuration
    const configPath = path.join(process.cwd(), 'src', 'test-ps-aux-config.json');
    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Generate SVG
    console.log('🎨 Generating test SVG...');
    const svgContent = generator.generateTerminal(config.sequences);
    
    // Write SVG to file
    const outputPath = path.join(process.cwd(), 'src', 'test-ps-aux.svg');
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`✅ Test SVG generated successfully!`);
    console.log(`📍 Output: ${outputPath}`);
    console.log(`📏 Window height: 300px (forces scrolling)`);
    
    // Also generate with the optimized generator for comparison
    const OptimizedTerminalGenerator = require('./optimized-terminal-generator');
    const optimizedGen = new OptimizedTerminalGenerator();
    optimizedGen.config.window.height = 300;
    
    const optimizedSvg = optimizedGen.generateOptimizedTerminal(config.sequences);
    const optimizedPath = path.join(process.cwd(), 'src', 'test-ps-aux-optimized.svg');
    await fs.promises.writeFile(optimizedPath, optimizedSvg, 'utf-8');
    
    console.log(`\n📊 Comparison SVG also generated:`);
    console.log(`   Advanced: ${outputPath}`);
    console.log(`   Optimized: ${optimizedPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();