#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const OptimizedTerminalGenerator = require('./optimized-terminal-generator');

async function main() {
  try {
    console.log('🚀 Starting optimized terminal generation...');
    
    // Initialize generator
    const generator = new OptimizedTerminalGenerator();
    
    // Read configuration
    console.log('📖 Reading terminal sequences...');
    const configPath = path.join(process.cwd(), 'src', 'terminal-config-fixed.json');
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
    console.log('🎨 Generating optimized terminal SVG...');
    const svgContent = generator.generateOptimizedTerminal(config.sequences);
    
    // Write SVG to file
    const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`✅ Optimized terminal SVG generated successfully!`);
    console.log(`📍 Output: ${outputPath}`);
    
    // Calculate animation info
    let totalDuration = 0;
    config.sequences.forEach(seq => {
      totalDuration += (seq.delay || 0) + (seq.typingDuration || seq.duration || 2000) + (seq.pause || 1000);
    });
    
    console.log(`⏱️  Total animation duration: ${(totalDuration / 1000).toFixed(1)}s`);
    
  } catch (error) {
    console.error('❌ Error generating terminal SVG:', error);
    process.exit(1);
  }
}

main();