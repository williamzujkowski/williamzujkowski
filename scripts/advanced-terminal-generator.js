/**
 * Advanced Terminal Generator - Creates animated SVG terminal simulations
 * with realistic typing effects, scrolling behavior, and CRT visual effects.
 * @class
 */
class AdvancedTerminalGenerator {
  /**
   * Creates a new AdvancedTerminalGenerator instance with default configuration.
   * @constructor
   */
  constructor() {
    /** @type {Object} Terminal configuration */
    this.config = {
      window: {
        width: 800,
        height: 600,
        backgroundColor: '#0a0e27',  // Darker, richer background
        borderRadius: 12,  // Smoother corners
        shadow: true,
        titleBar: {
          height: 36,  // Slightly taller for better proportions
          backgroundColor: '#151b2e',  // Matching dark theme
          title: 'william@dad-joke-hq:~',
          titleColor: '#e0e6ed',  // Brighter title
          buttons: {
            close: '#ff5f57',
            minimize: '#ffbd2e',
            maximize: '#28ca42'
          }
        }
      },
      terminal: {
        padding: 20,  // More breathing room
        fontFamily: 'JetBrains Mono, Fira Code, Ubuntu Mono, Consolas, Monaco, monospace',
        fontSize: 14,
        lineHeight: 1.5,  // Better readability
        textColor: '#e4e4e4',  // Slightly softer white
        cursorColor: '#00ff41',  // Matrix green cursor
        backgroundColor: '#0a0e27',  // Match window background
        prompt: 'william@dad-joke-hq:~$ ',
        promptColor: '#00ff9f',  // Cyan/green neon
        scrollDuration: 100
      }
    };
  }

  /**
   * Generates an animated SVG terminal from a sequence of commands and outputs.
   * @param {Array<Object>} sequences - Array of sequence objects defining terminal content
   * @param {string} sequences[].type - Sequence type: 'command', 'output', or 'ascii'
   * @param {string} [sequences[].prompt] - Command prompt text (for command type)
   * @param {string} sequences[].content - The text content to display
   * @param {number} [sequences[].typingDuration] - Duration for typing animation (ms)
   * @param {string} [sequences[].color] - Text color (for output type)
   * @param {number} [sequences[].pause] - Pause after sequence (ms)
   * @param {number} [sequences[].delay] - Initial delay before sequence (ms)
   * @returns {string} Complete SVG markup string
   * @throws {Error} If sequences is not an array
   */
  generateTerminal(sequences) {
    // Input validation
    if (!Array.isArray(sequences)) {
      throw new Error('sequences must be an array');
    }

    const { window, terminal } = this.config;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const viewportHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const maxVisibleLines = Math.floor(viewportHeight / lineHeight);

    // Process all sequences and create a complete animation timeline
    const { frames, totalDuration } = this.createAnimationFrames(sequences, terminal, maxVisibleLines);
    
    const svg = `<svg width="${window.width}" height="${window.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.generateDefs()}
    ${this.generateFilters()}
  </defs>
  
  <g filter="url(#shadow)">
    ${this.generateWindow(window)}
    ${this.generateTitleBar(window)}
    ${this.generateTerminalContent(window, terminal, frames, maxVisibleLines, lineHeight)}
  </g>
</svg>`;

    return svg;
  }

  /**
   * Creates animation frames from terminal sequences for SVG animation.
   * Handles scrolling, typing, and output display timing.
   * @param {Array<Object>} sequences - Terminal content sequences
   * @param {Object} terminal - Terminal configuration
   * @param {number} maxVisibleLines - Maximum lines visible in viewport
   * @returns {{frames: Array<Object>, totalDuration: number, finalBuffer: Array}} Animation data
   */
  createAnimationFrames(sequences, terminal, maxVisibleLines) {
    let currentTime = 0;
    const frames = [];
    const buffer = []; // Terminal buffer - all lines
    let bufferStart = 0; // Index of first visible line
    
    sequences.forEach((seq, seqIndex) => {
      currentTime += seq.delay || 0;
      
      switch (seq.type) {
        case 'command':
          buffer.push({
            type: 'command',
            prompt: seq.prompt || terminal.prompt,
            command: seq.content,
            complete: false
          });
          
          // Check if we need to scroll BEFORE showing the command
          if (buffer.length - bufferStart > maxVisibleLines) {
            // Scroll first
            frames.push({
              time: currentTime,
              type: 'scroll',
              scrollLines: 1,
              bufferStart: ++bufferStart
            });
            
            // Then show command after scroll completes
            frames.push({
              time: currentTime + terminal.scrollDuration + 10,
              type: 'add-command',
              lineIndex: buffer.length - 1,
              prompt: seq.prompt || terminal.prompt,
              command: seq.content,
              typingDuration: seq.typingDuration || 2000
            });
            
            currentTime += terminal.scrollDuration + 10;
          } else {
            // No scroll needed, show command immediately
            frames.push({
              time: currentTime,
              type: 'add-command',
              lineIndex: buffer.length - 1,
              prompt: seq.prompt || terminal.prompt,
              command: seq.content,
              typingDuration: seq.typingDuration || 2000
            });
          }
          
          // Mark command as complete after typing
          currentTime += seq.typingDuration || 2000;
          buffer[buffer.length - 1].complete = true;
          break;
          
        case 'output':
        case 'ascii':
          const lines = seq.content.split('\n');
          
          lines.forEach((line, lineIndex) => {
            const baseTime = currentTime + (lineIndex * 50); // Increased spacing
            
            buffer.push({
              type: 'output',
              content: line,
              color: seq.color || terminal.textColor
            });
            
            // Check if we need to scroll for this line
            if (buffer.length - bufferStart > maxVisibleLines) {
              // Add scroll BEFORE the line appears
              frames.push({
                time: baseTime,
                type: 'scroll',
                scrollLines: 1,
                bufferStart: ++bufferStart
              });
              
              // Add output AFTER scroll completes
              frames.push({
                time: baseTime + terminal.scrollDuration + 10, // Wait for scroll + small buffer
                type: 'add-output',
                lineIndex: buffer.length - 1,
                content: line,
                color: seq.color || terminal.textColor
              });
            } else {
              // No scroll needed, add line immediately
              frames.push({
                time: baseTime,
                type: 'add-output',
                lineIndex: buffer.length - 1,
                content: line,
                color: seq.color || terminal.textColor
              });
            }
          });
          
          currentTime += lines.length * 50 + 200; // Adjusted timing
          break;
      }
      
      currentTime += seq.pause || 1000;
    });
    
    // Add final buffer state
    frames.push({
      time: currentTime,
      type: 'final',
      buffer: buffer.slice(bufferStart, bufferStart + maxVisibleLines),
      bufferStart
    });
    
    return { frames, totalDuration: currentTime, finalBuffer: buffer };
  }

  /**
   * Generates the terminal content area including viewport and scroll container.
   * @param {Object} window - Window configuration
   * @param {Object} terminal - Terminal configuration
   * @param {Array<Object>} frames - Animation frames
   * @param {number} maxVisibleLines - Maximum visible lines
   * @param {number} lineHeight - Height of each line in pixels
   * @returns {string} SVG markup for terminal content
   */
  generateTerminalContent(window, terminal, frames, maxVisibleLines, lineHeight) {
    const contentY = window.titleBar.height + terminal.padding;
    const viewportHeight = window.height - window.titleBar.height;
    
    return `
    <!-- Terminal viewport -->
    <defs>
      <clipPath id="terminalViewport">
        <rect x="0" y="${window.titleBar.height}" width="${window.width}" height="${viewportHeight}"/>
      </clipPath>
    </defs>
    
    <!-- Terminal background -->
    <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
          height="${viewportHeight}" fill="${terminal.backgroundColor}"/>
    
    <!-- Terminal content -->
    <g clip-path="url(#terminalViewport)">
      <!-- Single scroll container for all content -->
      <g id="scrollContainer" transform="translate(${terminal.padding}, ${contentY})">
        ${this.generateScrollAnimations(frames, terminal)}
        ${this.generateAllLines(frames, terminal, maxVisibleLines, lineHeight)}
      </g>
    </g>`;
  }

  /**
   * Generates SVG animateTransform elements for scroll animations.
   * @param {Array<Object>} frames - Animation frames (filters for scroll type)
   * @param {Object} terminal - Terminal configuration
   * @returns {string} SVG animation markup for scrolling
   */
  generateScrollAnimations(frames, terminal) {
    const scrollFrames = frames.filter(f => f.type === 'scroll');
    const lineHeight = Math.round(terminal.fontSize * terminal.lineHeight * 10) / 10; // Round to 1 decimal
    let totalScroll = 0;
    
    return scrollFrames.map(frame => {
      const scrollAmount = frame.scrollLines * lineHeight;
      const fromY = Math.round((terminal.padding + 32 - totalScroll) * 10) / 10;
      totalScroll += scrollAmount;
      const toY = Math.round((terminal.padding + 32 - totalScroll) * 10) / 10;
      
      return `
        <animateTransform
          attributeName="transform"
          type="translate"
          from="${terminal.padding} ${fromY}"
          to="${terminal.padding} ${toY}"
          begin="${frame.time}ms"
          dur="${terminal.scrollDuration}ms"
          fill="freeze"/>`;
    }).join('');
  }

  /**
   * Generates all terminal line elements from animation frames.
   * @param {Array<Object>} frames - Animation frames
   * @param {Object} terminal - Terminal configuration
   * @param {number} maxVisibleLines - Maximum visible lines
   * @param {number} lineHeight - Height of each line in pixels
   * @returns {string} SVG markup for all terminal lines
   */
  generateAllLines(frames, terminal, maxVisibleLines, lineHeight) {
    const lines = [];
    const processedLines = new Map();
    
    // Process each frame to build line elements
    frames.forEach((frame) => {
      if (frame.type === 'add-command') {
        const y = frame.lineIndex * lineHeight;
        const lineContent = this.generateCommandLine(
          frame.lineIndex,
          y,
          frame.prompt,
          frame.command,
          frame.time,
          frame.typingDuration,
          terminal
        );
        processedLines.set(frame.lineIndex, lineContent);
      } else if (frame.type === 'add-output') {
        const y = frame.lineIndex * lineHeight;
        const lineContent = this.generateOutputLine(
          frame.lineIndex,
          y,
          frame.content,
          frame.color,
          frame.time,
          terminal
        );
        processedLines.set(frame.lineIndex, lineContent);
      }
    });
    
    // Convert map to array and sort by line index
    return Array.from(processedLines.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([_, content]) => content)
      .join('\n');
  }

  /**
   * Generates a command line with typing animation.
   * @param {number} lineIndex - Line index in terminal buffer
   * @param {number} y - Y position in pixels
   * @param {string} prompt - Command prompt text
   * @param {string} command - Command text to type
   * @param {number} startTime - Animation start time in ms
   * @param {number} typingDuration - Total typing duration in ms
   * @param {Object} terminal - Terminal configuration
   * @returns {string} SVG markup for command line
   */
  generateCommandLine(lineIndex, y, prompt, command, startTime, typingDuration, terminal) {
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const charDuration = command.length > 0 ? typingDuration / command.length : 0;
    
    return `
    <!-- Command line ${lineIndex} -->
    <g id="line-${lineIndex}" transform="translate(0, ${y})">
      <!-- Prompt appears immediately -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}"
            fill="${terminal.promptColor}" filter="url(#textGlow)" xml:space="preserve" opacity="0">
        ${this.escapeXml(prompt)}
        <animate attributeName="opacity" from="0" to="1"
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
      </text>

      <!-- Command with character-by-character typing -->
      <text x="${promptWidth}" font-family="${terminal.fontFamily}"
            font-size="${terminal.fontSize}" fill="${terminal.textColor}" filter="url(#textGlow)" xml:space="preserve">
        ${command.split('').map((char, i) => {
          const charStart = startTime + (i * charDuration);
          return `<tspan opacity="0">${this.escapeXml(char)}<animate attributeName="opacity"
                  from="0" to="1" begin="${charStart}ms" dur="10ms" fill="freeze"/></tspan>`;
        }).join('')}
      </text>

      <!-- Typing cursor -->
      ${this.generateCursor(prompt, command, startTime, typingDuration, terminal)}
    </g>`;
  }

  /**
   * Generates an output line with fade-in animation.
   * @param {number} lineIndex - Line index in terminal buffer
   * @param {number} y - Y position in pixels
   * @param {string} content - Output text content
   * @param {string} color - Text color
   * @param {number} startTime - Animation start time in ms
   * @param {Object} terminal - Terminal configuration
   * @returns {string} SVG markup for output line
   */
  generateOutputLine(lineIndex, y, content, color, startTime, terminal) {
    return `
    <!-- Output line ${lineIndex} -->
    <g id="line-${lineIndex}" transform="translate(0, ${y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1"
               begin="${startTime}ms" dur="10ms" fill="freeze"/>

      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}"
            fill="${color}" filter="url(#textGlow)" xml:space="preserve">
        ${this.escapeXml(content)}
      </text>
    </g>`;
  }

  /**
   * Generates an animated blinking cursor that follows typing.
   * @param {string} prompt - Command prompt text
   * @param {string} command - Command being typed
   * @param {number} startTime - Animation start time in ms
   * @param {number} typingDuration - Total typing duration in ms
   * @param {Object} terminal - Terminal configuration
   * @returns {string} SVG markup for cursor animation
   */
  generateCursor(prompt, command, startTime, typingDuration, terminal) {
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const charWidth = terminal.fontSize * 0.6;
    const cursorY = -terminal.fontSize * 0.85;
    const charDuration = typingDuration / command.length;
    const typingEndTime = startTime + typingDuration;

    return `
    <!-- Cursor -->
    <rect x="${promptWidth}" y="${cursorY}" width="${charWidth}" height="${terminal.fontSize}"
          fill="${terminal.cursorColor}" opacity="0">
      <!-- Show cursor when line appears -->
      <animate attributeName="opacity" from="0" to="1"
               begin="${startTime}ms" dur="10ms" fill="freeze"/>

      <!-- Blinking animation -->
      <animate attributeName="opacity" values="1;1;0;0" dur="1s"
               begin="${startTime}ms" end="${typingEndTime}ms" repeatCount="indefinite"/>

      <!-- Hide cursor after typing -->
      <animate attributeName="opacity" to="0"
               begin="${typingEndTime}ms" dur="10ms" fill="freeze"/>

      <!-- Cursor moves to next position AFTER character appears -->
      ${command.split('').map((char, idx) => {
        const charAppearTime = startTime + (idx * charDuration);
        const moveTime = charAppearTime + 10; // Move AFTER character appears (10ms = char appear duration)
        const fromX = promptWidth + (idx * charWidth);
        const toX = promptWidth + ((idx + 1) * charWidth);
        return `<animate attributeName="x"
                 from="${fromX}" to="${toX}"
                 begin="${moveTime}ms" dur="1ms"
                 fill="freeze"/>`;
      }).join('')}
    </rect>`;
  }

  /**
   * Generates SVG defs section with patterns.
   * @returns {string} SVG pattern definitions
   */
  generateDefs() {
    return `
    <!-- Terminal scanline effect -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="2">
      <rect width="1" height="1" fill="transparent"/>
      <rect y="1" width="1" height="1" fill="rgba(255,255,255,0.02)"/>
    </pattern>`;
  }

  /**
   * Generates SVG filter definitions for visual effects.
   * Includes text glow, window shadow, and CRT scanline effects.
   * @returns {string} SVG filter definitions
   */
  generateFilters() {
    return `
    <!-- 3-Layer Phosphor Glow Filter -->
    <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Layer 1: Core glow (tight) -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="coreBlur"/>

      <!-- Layer 2: Medium glow with green phosphor tint -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="mediumBlur"/>
      <feColorMatrix in="mediumBlur" type="matrix" result="greenGlow"
        values="0 0 0 0 0
                0 1 0 0 0.3
                0 0 0 0 0
                0 0 0 1 0"/>

      <!-- Layer 3: Outer halo (subtle) -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="outerBlur"/>

      <!-- Composite all layers with screen blend mode -->
      <feBlend in="coreBlur" in2="greenGlow" mode="screen" result="layer12"/>
      <feBlend in="layer12" in2="outerBlur" mode="screen" result="allLayers"/>

      <!-- Merge with original text on top -->
      <feMerge>
        <feMergeNode in="allLayers"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Window shadow with depth -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="15"/>
      <feOffset dx="0" dy="15" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.8"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- CRT scanline effect -->
    <filter id="crt">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.8" numOctaves="1" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
      <feComponentTransfer in="desaturatedNoise" result="theNoise">
        <feFuncA type="table" tableValues="0 0 0.05 0"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="theNoise" mode="screen"/>
    </filter>`;
  }

  /**
   * Generates the window background rectangle.
   * @param {Object} window - Window configuration
   * @returns {string} SVG markup for window background
   */
  generateWindow(window) {
    return `
    <!-- Window background -->
    <rect x="0" y="0" width="${window.width}" height="${window.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.backgroundColor}"/>`;
  }

  /**
   * Generates the window title bar with controls and title text.
   * @param {Object} window - Window configuration
   * @returns {string} SVG markup for title bar
   */
  generateTitleBar(window) {
    return `
    <!-- Title bar -->
    <rect x="0" y="0" width="${window.width}" height="${window.titleBar.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Fix bottom corners -->
    <rect x="0" y="16" width="${window.width}" height="16" 
          fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Window controls -->
    <g id="window-controls">
      <circle cx="20" cy="16" r="6" fill="${window.titleBar.buttons.close}"/>
      <circle cx="40" cy="16" r="6" fill="${window.titleBar.buttons.minimize}"/>
      <circle cx="60" cy="16" r="6" fill="${window.titleBar.buttons.maximize}"/>
    </g>
    
    <!-- Window title -->
    <text x="${window.width / 2}" y="21" 
          font-family="${this.config.terminal.fontFamily}" font-size="13" 
          fill="${window.titleBar.titleColor}" text-anchor="middle">
      ${window.titleBar.title}
    </text>`;
  }

  /**
   * Escapes special XML characters to prevent SVG parsing errors.
   * @param {string} text - Text to escape
   * @returns {string} XML-safe escaped text
   */
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Calculates approximate text width for monospace font.
   * @param {string} text - Text to measure
   * @param {number} fontSize - Font size in pixels
   * @returns {number} Approximate width in pixels
   */
  getTextWidth(text, fontSize) {
    return text.length * (fontSize * 0.6);
  }
}

module.exports = AdvancedTerminalGenerator;