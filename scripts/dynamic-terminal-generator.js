#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const AdvancedTerminalGenerator = require('./advanced-terminal-generator');
const DynamicContentGenerator = require('./dynamic-content');
const { COLORS, WINDOW, ANIMATION } = require('./constants');
const {
  buildDevOpsSequences,
  buildNetworkSequences,
  buildEasterEggSequences
} = require('./terminal-sequences');
const { buildTemplateSequences } = require('./template-sequence-builder');

/**
 * Generate dynamic terminal sequences based on current date/time and jokes
 */
async function generateDynamicTerminal() {
  console.log('🚀 Starting dynamic terminal generation...');

  // Get dynamic content
  const contentGen = new DynamicContentGenerator();
  const content = await contentGen.generateContent();

  console.log(`📅 Current time: ${content.timestamp}`);
  console.log(`🎉 Today is: ${content.nationalDay.emoji} ${content.nationalDay.name} - ${content.nationalDay.desc}`);
  console.log(`😄 Today's joke: ${content.joke.q}`);
  console.log(`🔄 Rotation: Day ${content.rotation} (${['Core+Easter', 'DevOps', 'Network'][content.rotation]})`);

  // Build core sequences using template engine
  const coreSequences = buildTemplateSequences(content);

  // Add rotation-specific sequences based on day
  let rotationSequences = [];
  switch(content.rotation) {
    case 0:
      // Day 0: Core + Easter Egg (telnet Star Wars)
      rotationSequences = buildEasterEggSequences(content);
      break;
    case 1:
      // Day 1: DevOps rotation (git log, docker, sudo)
      rotationSequences = buildDevOpsSequences(content);
      break;
    case 2:
      // Day 2: Network rotation (ping, curl, top)
      rotationSequences = buildNetworkSequences(content);
      break;
  }

  // Combine sequences: core start + rotation + core end
  // Split core into start (all except goodbye) and end (goodbye command + output)
  const coreStart = coreSequences.slice(0, -2); // All except goodbye (2 items)
  const coreEnd = coreSequences.slice(-2); // Goodbye command + output

  const sequences = [...coreStart, ...rotationSequences, ...coreEnd];

  // Validate total animation duration (target: comfortable reading)
  const calculateAnimationDuration = (sequences) => {
    let totalDuration = 0;
    sequences.forEach(seq => {
      if (seq.type === 'command') {
        totalDuration += (seq.typingDuration || 0) + (seq.pause || 0) + (seq.delay || 0);
      } else if (seq.type === 'output') {
        totalDuration += (seq.pause || 0);
      }
    });
    return totalDuration / 1000; // Convert to seconds
  };

  const animationDuration = calculateAnimationDuration(sequences);
  console.log(`⏱️  Total animation duration: ${animationDuration.toFixed(1)}s (target: <${ANIMATION.MAX_DURATION_SECONDS}s)`);
  console.log(`📦 Total sequences: ${sequences.length} (${coreStart.length} core + ${rotationSequences.length} rotation + ${coreEnd.length} ending)`);

  if (animationDuration > ANIMATION.MAX_DURATION_SECONDS) {
    console.warn(`⚠️  WARNING: Animation duration (${animationDuration.toFixed(1)}s) exceeds ${ANIMATION.MAX_DURATION_SECONDS}s target!`);
  }

  // Generate SVG
  console.log('🎨 Generating terminal SVG with dynamic content...');
  const generator = new AdvancedTerminalGenerator();

  // Customize terminal config for better aesthetics
  generator.config.window.width = WINDOW.WIDTH;
  generator.config.window.height = WINDOW.HEIGHT;
  generator.config.window.backgroundColor = COLORS.BACKGROUND;
  generator.config.window.borderRadius = WINDOW.BORDER_RADIUS;
  generator.config.window.titleBar.title = WINDOW.TITLE;
  generator.config.window.titleBar.height = 40;
  generator.config.window.titleBar.backgroundColor = COLORS.TITLE_BAR_BG;
  generator.config.terminal.fontSize = 14;
  generator.config.terminal.lineHeight = 1.8;
  generator.config.terminal.backgroundColor = COLORS.BACKGROUND;
  generator.config.terminal.promptColor = COLORS.NEON_GREEN;
  generator.config.terminal.cursorColor = COLORS.MATRIX_GREEN;

  const svgContent = generator.generateTerminal(sequences);

  // Write to file with error handling
  const outputPath = path.join(process.cwd(), 'src', 'terminal.svg');
  const outputDir = path.dirname(outputPath);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await fs.promises.writeFile(outputPath, svgContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write SVG to ${outputPath}: ${error.message}`);
  }

  console.log('✅ Dynamic terminal SVG generated successfully!');
  console.log(`📍 Output: ${outputPath}`);
  console.log(`📊 Sequences: ${sequences.length}`);
  console.log(`⏱️  Animation features:`);
  console.log('   - Real-time accurate timestamps');
  console.log('   - Daily national/fun day display');
  console.log('   - Daily rotating tech jokes');
  console.log('   - Dynamic statistics');
  console.log('   - Smooth animations and scrolling');

  return { success: true, joke: content.joke, timestamp: content.timestamp };
}

// Run if called directly
if (require.main === module) {
  generateDynamicTerminal()
    .then(result => {
      console.log('\n🎉 Generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = generateDynamicTerminal;
