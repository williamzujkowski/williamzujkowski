#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');

async function main() {
  try {
    console.log('🚀 Starting advanced terminal generation...');
    console.log('   This version implements proper terminal scrolling');
    
    // Initialize generator
    const generator = new AdvancedTerminalGenerator();
    
    // Read configuration
    console.log('📖 Reading terminal sequences...');
    const configPath = path.join(process.cwd(), 'src', 'terminal-config-fixed.json');
    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Update generator config if custom settings provided
    if (config.window || config.terminal) {
      generator.config = {
        ...generator.config,
        window: { ...generator.config.window, ...config.window },
        terminal: { ...generator.config.terminal, ...config.terminal }
      };
    }
    
    // Generate SVG
    console.log('🎨 Generating advanced terminal SVG with proper scrolling...');
    const svgContent = generator.generateTerminal(config.sequences);
    
    // Write SVG to file
    const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
    const outputDir = path.dirname(outputPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`✅ Advanced terminal SVG generated successfully!`);
    console.log(`📍 Output: ${outputPath}`);
    console.log(`🔧 Features:`);
    console.log(`   - Single scroll container (no nested transforms)`);
    console.log(`   - Proper line buffer management`);
    console.log(`   - Smooth scrolling animations`);
    console.log(`   - Fixed cursor alignment`);
    
    // Calculate animation info
    let totalDuration = 0;
    config.sequences.forEach(seq => {
      totalDuration += (seq.delay || 0) + (seq.typingDuration || seq.duration || 2000) + (seq.pause || 1000);
    });
    
    console.log(`⏱️  Total animation duration: ${(totalDuration / 1000).toFixed(1)}s`);
    
  } catch (error) {
    console.error('❌ Error generating terminal SVG:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();