#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');

async function main() {
  try {
    console.log('🐛 Debug: Testing scrolling behavior...\n');
    
    // Initialize generator with debug settings
    const generator = new AdvancedTerminalGenerator();
    generator.config.window.height = 300; // Small window
    
    const { window, terminal } = generator.config;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const viewportHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const maxVisibleLines = Math.floor(viewportHeight / lineHeight);
    
    console.log('📊 Debug Info:');
    console.log(`   Window height: ${window.height}px`);
    console.log(`   Title bar height: ${window.titleBar.height}px`);
    console.log(`   Terminal padding: ${terminal.padding}px`);
    console.log(`   Viewport height: ${viewportHeight}px`);
    console.log(`   Line height: ${lineHeight}px`);
    console.log(`   Max visible lines: ${maxVisibleLines}`);
    console.log('');
    
    // Read test configuration
    const configPath = path.join(process.cwd(), 'src', 'test-scroll-config.json');
    const configContent = await fs.promises.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Count total lines
    let totalLines = 0;
    config.sequences.forEach(seq => {
      if (seq.type === 'command') {
        totalLines++;
      } else if (seq.type === 'output') {
        totalLines += seq.content.split('\n').length;
      }
    });
    
    console.log(`📝 Sequence Info:`);
    console.log(`   Total lines to display: ${totalLines}`);
    console.log(`   Should scroll: ${totalLines > maxVisibleLines ? 'YES' : 'NO'}`);
    console.log(`   Lines over limit: ${Math.max(0, totalLines - maxVisibleLines)}`);
    console.log('');
    
    // Create frames to inspect
    const { frames } = generator.createAnimationFrames(config.sequences, terminal, maxVisibleLines);
    
    console.log(`🎬 Animation Frames:`);
    const scrollFrames = frames.filter(f => f.type === 'scroll');
    console.log(`   Total frames: ${frames.length}`);
    console.log(`   Scroll frames: ${scrollFrames.length}`);
    
    if (scrollFrames.length > 0) {
      console.log('\n📜 Scroll Events:');
      scrollFrames.forEach((frame, i) => {
        console.log(`   ${i + 1}. Time: ${frame.time}ms, Lines: ${frame.scrollLines}, Buffer start: ${frame.bufferStart}`);
      });
    } else {
      console.log('\n⚠️  No scroll events generated!');
    }
    
    // Generate SVG
    const svgContent = generator.generateTerminal(config.sequences);
    const outputPath = path.join(process.cwd(), 'src', 'debug-terminal.svg');
    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
    
    console.log(`\n✅ Debug SVG generated: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();