class RealTerminalGenerator {
  constructor() {
    this.config = {
      window: {
        width: 800,
        height: 600,
        backgroundColor: '#0c0c0c',
        borderRadius: 8,
        shadow: true,
        titleBar: {
          height: 32,
          backgroundColor: '#1a1a1a',
          title: 'william@ubuntu:~',
          titleColor: '#d4d4d4',
          buttons: {
            close: '#ff5f56',
            minimize: '#ffbd2e',
            maximize: '#27c93f'
          }
        }
      },
      terminal: {
        padding: 15,
        fontFamily: 'Ubuntu Mono, Consolas, Monaco, monospace',
        fontSize: 14,
        lineHeight: 1.4,
        textColor: '#ffffff',
        cursorColor: '#ffffff',
        backgroundColor: '#300a24',
        prompt: 'william@ubuntu:~$ ',
        promptColor: '#87d75f',
        scrollDuration: 150, // ms for smooth scroll
        bufferSize: 30 // Maximum visible lines
      }
    };
  }

  generateTerminal(sequences) {
    const { window, terminal } = this.config;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const viewportHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const maxVisibleLines = Math.floor(viewportHeight / lineHeight);
    
    // Process sequences into a timeline of terminal states
    const timeline = this.processSequencesToTimeline(sequences, terminal);
    
    const svg = `<svg width="${window.width}" height="${window.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.generateDefs()}
    ${this.generateFilters()}
  </defs>
  
  ${this.generateWindow(window)}
  ${this.generateTitleBar(window)}
  ${this.generateTerminalViewport(window, terminal, timeline, maxVisibleLines)}
</svg>`;

    return svg;
  }

  processSequencesToTimeline(sequences, terminal) {
    const timeline = [];
    let currentTime = 0;
    let allLines = []; // All lines ever displayed
    let lineIdCounter = 0;
    
    sequences.forEach((seq) => {
      currentTime += seq.delay || 0;
      
      switch (seq.type) {
        case 'command':
          const commandLine = {
            id: lineIdCounter++,
            type: 'command',
            prompt: seq.prompt || terminal.prompt,
            command: seq.content,
            startTime: currentTime,
            typingDuration: seq.typingDuration || 2000,
            complete: false
          };
          
          allLines.push(commandLine);
          
          // Add typing animation states
          const charDuration = commandLine.typingDuration / commandLine.command.length;
          for (let i = 0; i <= commandLine.command.length; i++) {
            timeline.push({
              time: currentTime + (i * charDuration),
              lines: this.getVisibleLines(allLines, terminal.bufferSize),
              activeLineId: commandLine.id,
              cursorPosition: i,
              scrollTrigger: this.shouldScroll(allLines, terminal.bufferSize)
            });
          }
          
          currentTime += commandLine.typingDuration;
          commandLine.complete = true;
          break;
          
        case 'output':
        case 'ascii':
          const outputLines = seq.content.split('\n');
          outputLines.forEach((line, index) => {
            const outputLine = {
              id: lineIdCounter++,
              type: 'output',
              content: line,
              color: seq.color || terminal.textColor,
              startTime: currentTime + (index * 30)
            };
            
            allLines.push(outputLine);
            
            timeline.push({
              time: outputLine.startTime,
              lines: this.getVisibleLines(allLines, terminal.bufferSize),
              scrollTrigger: this.shouldScroll(allLines, terminal.bufferSize)
            });
          });
          
          currentTime += outputLines.length * 30 + 100;
          break;
      }
      
      currentTime += seq.pause || 1000;
    });
    
    return timeline;
  }

  getVisibleLines(allLines, bufferSize) {
    // Get the last N lines that should be visible
    const startIndex = Math.max(0, allLines.length - bufferSize);
    return allLines.slice(startIndex).map((line, index) => ({
      ...line,
      position: index // Position in the visible buffer
    }));
  }

  shouldScroll(allLines, bufferSize) {
    return allLines.length > bufferSize;
  }

  generateTerminalViewport(window, terminal, timeline, maxVisibleLines) {
    const contentY = window.titleBar.height;
    const viewportHeight = window.height - window.titleBar.height;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    
    // Generate line slots (fixed positions for each visible line)
    const lineSlots = [];
    for (let i = 0; i < terminal.bufferSize; i++) {
      lineSlots.push({
        id: `line-slot-${i}`,
        y: contentY + terminal.padding + (i * lineHeight)
      });
    }
    
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
      <g id="terminal-lines">
        ${this.generateLineAnimations(timeline, lineSlots, terminal)}
      </g>
    </g>`;
  }

  generateLineAnimations(timeline, lineSlots, terminal) {
    const animations = [];
    const processedLines = new Set();
    
    // Group timeline by significant state changes
    const stateChanges = this.groupTimelineStates(timeline);
    
    stateChanges.forEach((state, stateIndex) => {
      state.lines.forEach((line) => {
        const slot = lineSlots[line.position];
        if (!slot) return;
        
        const lineKey = `${line.id}-${line.position}`;
        if (processedLines.has(lineKey)) return;
        processedLines.add(lineKey);
        
        if (line.type === 'command') {
          animations.push(this.generateCommandLine(line, slot, state, terminal));
        } else {
          animations.push(this.generateOutputLine(line, slot, state, terminal));
        }
      });
      
      // Add scroll animations if needed
      if (state.scrollTrigger && stateIndex > 0) {
        const prevState = stateChanges[stateIndex - 1];
        animations.push(this.generateScrollAnimation(state, prevState, lineSlots, terminal));
      }
    });
    
    return animations.join('\n');
  }

  groupTimelineStates(timeline) {
    // Group timeline entries into significant state changes
    const states = [];
    let lastState = null;
    
    timeline.forEach((entry) => {
      const stateKey = JSON.stringify(entry.lines.map(l => l.id));
      if (!lastState || lastState.key !== stateKey) {
        states.push({
          ...entry,
          key: stateKey
        });
        lastState = states[states.length - 1];
      }
    });
    
    return states;
  }

  generateCommandLine(line, slot, state, terminal) {
    const promptWidth = this.getTextWidth(line.prompt, terminal.fontSize);
    
    return `
    <!-- Command line ${line.id} at slot ${line.position} -->
    <g id="line-${line.id}" transform="translate(${terminal.padding}, ${slot.y})">
      <!-- Prompt -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${terminal.promptColor}" opacity="0">
        ${this.escapeXml(line.prompt)}
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${line.startTime}ms" dur="10ms" fill="freeze"/>
      </text>
      
      <!-- Command text with typing animation -->
      <text x="${promptWidth}" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize}" fill="${terminal.textColor}">
        ${this.generateTypingAnimation(line.command, line.startTime, line.typingDuration)}
      </text>
      
      <!-- Cursor -->
      ${this.generateCursor(line, promptWidth, terminal)}
    </g>`;
  }

  generateOutputLine(line, slot, state, terminal) {
    return `
    <!-- Output line ${line.id} at slot ${line.position} -->
    <g id="line-${line.id}" transform="translate(${terminal.padding}, ${slot.y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${line.startTime}ms" dur="10ms" fill="freeze"/>
      
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${line.color}">
        ${this.escapeXml(line.content)}
      </text>
    </g>`;
  }

  generateScrollAnimation(state, prevState, lineSlots, terminal) {
    // Calculate which lines need to move
    const animations = [];
    const scrollTime = state.time;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    
    // Create smooth scroll animation for the entire terminal content
    animations.push(`
    <!-- Scroll animation at ${scrollTime}ms -->
    <animateTransform
      xlink:href="#terminal-lines"
      attributeName="transform"
      type="translate"
      from="0 0"
      to="0 -${lineHeight}"
      begin="${scrollTime}ms"
      dur="${terminal.scrollDuration}ms"
      fill="freeze"
      additive="sum"/>
    `);
    
    return animations.join('\n');
  }

  generateTypingAnimation(text, startTime, duration) {
    const charDuration = duration / text.length;
    const chars = text.split('').map((char, i) => {
      const charStart = startTime + (i * charDuration);
      return `<tspan opacity="0">${this.escapeXml(char)}<animate attributeName="opacity" 
              from="0" to="1" begin="${charStart}ms" dur="10ms" fill="freeze"/></tspan>`;
    });
    return chars.join('');
  }

  generateCursor(line, promptWidth, terminal) {
    const cursorY = -terminal.fontSize * 0.85;
    const charWidth = terminal.fontSize * 0.6;
    const typingEndTime = line.startTime + line.typingDuration;
    
    return `
    <rect x="${promptWidth}" y="${cursorY}" width="${charWidth}" height="${terminal.fontSize}"
          fill="${terminal.cursorColor}" opacity="0">
      <!-- Show cursor -->
      <animate attributeName="opacity" from="0" to="1" 
               begin="${line.startTime}ms" dur="10ms" fill="freeze"/>
      
      <!-- Blinking -->
      <animate attributeName="opacity" values="1;1;0;0" dur="1s" 
               begin="${line.startTime}ms" end="${typingEndTime}ms" repeatCount="indefinite"/>
      
      <!-- Hide after typing -->
      <animate attributeName="opacity" to="0" 
               begin="${typingEndTime}ms" dur="10ms" fill="freeze"/>
      
      <!-- Move with typing -->
      <animate attributeName="x" 
               from="${promptWidth}" 
               to="${promptWidth + (line.command.length * charWidth)}"
               begin="${line.startTime}ms" 
               dur="${line.typingDuration}ms"
               fill="freeze"/>
    </rect>`;
  }

  generateDefs() {
    return `
    <!-- Scanline effect -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="2">
      <rect width="1" height="1" fill="transparent"/>
      <rect y="1" width="1" height="1" fill="rgba(255,255,255,0.02)"/>
    </pattern>`;
  }

  generateFilters() {
    return `
    <!-- Text glow -->
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Window shadow -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
      <feOffset dx="0" dy="10" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.6"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
  }

  generateWindow(window) {
    return `
    <!-- Window background -->
    <rect x="0" y="0" width="${window.width}" height="${window.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.backgroundColor}" filter="url(#shadow)"/>`;
  }

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
    <circle cx="20" cy="16" r="6" fill="${window.titleBar.buttons.close}"/>
    <circle cx="40" cy="16" r="6" fill="${window.titleBar.buttons.minimize}"/>
    <circle cx="60" cy="16" r="6" fill="${window.titleBar.buttons.maximize}"/>
    
    <!-- Window title -->
    <text x="${window.width / 2}" y="21" 
          font-family="${this.config.terminal.fontFamily}" font-size="13" 
          fill="${window.titleBar.titleColor}" text-anchor="middle">
      ${window.titleBar.title}
    </text>`;
  }

  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  getTextWidth(text, fontSize) {
    return text.length * (fontSize * 0.6);
  }
}

module.exports = RealTerminalGenerator;