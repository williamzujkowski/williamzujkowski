class OptimizedTerminalGenerator {
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
        maxVisibleLines: 25, // Limit visible lines
        scrollSpeed: 150,
        cursorOffset: -2 // Offset to align cursor with text baseline
      }
    };
  }

  generateOptimizedTerminal(sequences) {
    const { window, terminal } = this.config;
    const contentHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const maxVisibleLines = Math.min(
      Math.floor(contentHeight / lineHeight),
      terminal.maxVisibleLines
    );
    
    // Pre-process sequences to calculate positions and timing
    const processedData = this.preprocessSequences(sequences, terminal, maxVisibleLines);
    
    const svg = `<svg width="${window.width}" height="${window.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.generateDefs(terminal)}
    ${this.generateFilters()}
  </defs>
  
  ${this.generateWindow(window)}
  ${this.generateTitleBar(window)}
  ${this.generateTerminalContent(processedData, terminal, window, maxVisibleLines)}
</svg>`;

    return svg;
  }

  preprocessSequences(sequences, terminal, maxVisibleLines) {
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const lines = [];
    let currentTime = 0;
    let lineIndex = 0;
    
    sequences.forEach((seq, seqIndex) => {
      currentTime += seq.delay || 0;
      
      switch (seq.type) {
        case 'command':
          const prompt = seq.prompt || terminal.prompt;
          const command = seq.content;
          
          lines.push({
            type: 'command',
            prompt,
            command,
            startTime: currentTime,
            typingDuration: seq.typingDuration || 2000,
            lineIndex: lineIndex++,
            seqIndex
          });
          
          currentTime += seq.typingDuration || 2000;
          break;
          
        case 'output':
          const outputLines = seq.content.split('\n');
          outputLines.forEach((line, i) => {
            lines.push({
              type: 'output',
              content: line,
              color: seq.color || terminal.textColor,
              startTime: currentTime + (i * 30),
              lineIndex: lineIndex++,
              seqIndex
            });
          });
          
          currentTime += outputLines.length * 30 + 100;
          break;
      }
      
      currentTime += seq.pause || 1000;
    });
    
    return { lines, totalDuration: currentTime };
  }

  generateDefs(terminal) {
    return `
    <!-- Terminal scanline effect -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="2">
      <rect width="1" height="1" fill="transparent"/>
      <rect y="1" width="1" height="1" fill="rgba(255,255,255,0.02)"/>
    </pattern>`;
  }

  generateFilters() {
    return `
    <!-- Text glow filter -->
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
  }

  generateWindow(window) {
    return `
    <!-- Window background -->
    <rect x="0" y="0" width="${window.width}" height="${window.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.backgroundColor}"/>`;
  }

  generateTitleBar(window) {
    return `
    <!-- Title bar -->
    <rect x="0" y="0" width="${window.width}" height="${window.titleBar.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Fix bottom corners -->
    <rect x="0" y="16" width="${window.width}" 
          height="16" fill="${window.titleBar.backgroundColor}"/>
    
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

  generateTerminalContent(processedData, terminal, window, maxVisibleLines) {
    const contentY = window.titleBar.height + terminal.padding;
    const viewportHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    
    // Generate lines with visibility windows
    const { lines, totalDuration } = processedData;
    const scrollData = this.calculateScrollPositions(lines, maxVisibleLines, viewportHeight, lineHeight);
    
    return `
    <!-- Terminal viewport -->
    <defs>
      <clipPath id="terminalViewport">
        <rect x="0" y="${window.titleBar.height}" width="${window.width}" height="${viewportHeight + terminal.padding * 2}"/>
      </clipPath>
    </defs>
    
    <!-- Terminal background -->
    <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
          height="${window.height - window.titleBar.height}" fill="${terminal.backgroundColor}"/>
    
    <!-- Terminal content with clipping -->
    <g clip-path="url(#terminalViewport)">
      <g id="terminalContent">
        ${this.generateAllLines(lines, scrollData, terminal, lineHeight, contentY)}
      </g>
    </g>`;
  }

  calculateScrollPositions(lines, maxVisibleLines, viewportHeight, lineHeight) {
    const scrollPoints = [];
    let currentScroll = 0;
    
    lines.forEach((line, index) => {
      const lineY = index * lineHeight;
      const maxY = viewportHeight - lineHeight;
      
      // Check if this line would go below viewport
      if (lineY > maxY && index > 0) {
        const scrollNeeded = lineY - maxY;
        currentScroll = scrollNeeded;
        
        scrollPoints.push({
          lineIndex: index,
          scrollY: currentScroll,
          time: line.startTime
        });
      }
    });
    
    return { scrollPoints, totalScroll: currentScroll };
  }

  generateAllLines(lines, scrollData, terminal, lineHeight, contentY) {
    const elements = [];
    const { scrollPoints } = scrollData;
    let currentScrollIndex = 0;
    let currentTransform = `translate(${terminal.padding}, ${contentY})`;
    
    // Create a group for lines that will be scrolled together
    const lineGroups = [];
    let currentGroup = { lines: [], transform: currentTransform, startTime: 0 };
    
    lines.forEach((line, index) => {
      const y = index * lineHeight;
      
      // Check if we need to start a new scroll group
      if (currentScrollIndex < scrollPoints.length && 
          index === scrollPoints[currentScrollIndex].lineIndex) {
        // Save current group
        if (currentGroup.lines.length > 0) {
          lineGroups.push(currentGroup);
        }
        
        // Start new group with scroll animation
        const scrollPoint = scrollPoints[currentScrollIndex];
        currentTransform = `translate(${terminal.padding}, ${contentY - scrollPoint.scrollY})`;
        currentGroup = {
          lines: [],
          transform: currentTransform,
          startTime: scrollPoint.time,
          scrollFrom: contentY - (currentScrollIndex > 0 ? scrollPoints[currentScrollIndex - 1].scrollY : 0),
          scrollTo: contentY - scrollPoint.scrollY
        };
        currentScrollIndex++;
      }
      
      // Add line to current group
      if (line.type === 'command') {
        currentGroup.lines.push(this.generateSimpleCommand(line, y, terminal));
      } else {
        currentGroup.lines.push(this.generateSimpleOutput(line, y, terminal));
      }
    });
    
    // Add final group
    if (currentGroup.lines.length > 0) {
      lineGroups.push(currentGroup);
    }
    
    // Generate SVG for each group
    lineGroups.forEach((group, groupIndex) => {
      if (groupIndex === 0) {
        // First group - no animation needed
        elements.push(`<g transform="${group.transform}">${group.lines.join('\n')}</g>`);
      } else {
        // Animated group
        elements.push(`
          <g transform="${group.scrollFrom ? `translate(${terminal.padding}, ${group.scrollFrom})` : group.transform}">
            <animateTransform
              attributeName="transform"
              type="translate"
              to="${terminal.padding} ${group.scrollTo}"
              begin="${group.startTime}ms"
              dur="${terminal.scrollSpeed}ms"
              fill="freeze"/>
            ${group.lines.join('\n')}
          </g>`);
      }
    });
    
    return elements.join('\n');
  }

  generateOptimizedCommand(line, y, terminal, scrollY, visStart, visEnd) {
    const { prompt, command, startTime, typingDuration } = line;
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const charDuration = typingDuration / command.length;
    
    return `
    <g transform="translate(0, ${y})" opacity="0">
      <!-- Show/hide based on visibility window -->
      <animate attributeName="opacity" from="0" to="1" 
               begin="${visStart}ms" dur="10ms" fill="freeze"/>
      ${visEnd < Infinity ? `<animate attributeName="opacity" from="1" to="0" 
               begin="${visEnd}ms" dur="10ms" fill="freeze"/>` : ''}
      
      <!-- Prompt -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${terminal.promptColor}" filter="url(#textGlow)">
        ${this.escapeXml(prompt)}
      </text>
      
      <!-- Command with optimized typing -->
      <text x="${promptWidth}" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize}" fill="${terminal.textColor}" filter="url(#textGlow)">
        ${this.generateOptimizedTyping(command, startTime, charDuration)}
      </text>
      
      <!-- Cursor with proper Y alignment -->
      ${this.generateOptimizedCursor(prompt, command, startTime, charDuration, terminal, y)}
    </g>`;
  }

  generateOptimizedTyping(text, startTime, charDuration) {
    // Group characters to reduce animation count
    const chunkSize = 3;
    const chunks = [];
    
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      const chunkStart = startTime + (i * charDuration);
      
      chunks.push(`<tspan opacity="0">${this.escapeXml(chunk)}<animate attributeName="opacity" 
              from="0" to="1" begin="${chunkStart}ms" 
              dur="${charDuration}ms" fill="freeze"/></tspan>`);
    }
    
    return chunks.join('');
  }

  generateOptimizedCursor(prompt, command, startTime, charDuration, terminal, lineY) {
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const typingEndTime = startTime + (command.length * charDuration);
    
    // Calculate cursor Y position to align with text baseline
    // For monospace fonts, the cursor should be positioned slightly above the baseline
    const cursorY = -terminal.fontSize * 0.85; // Position cursor to align with text
    
    return `
      <rect x="${promptWidth}" y="${cursorY}" width="${terminal.fontSize * 0.6}" height="${terminal.fontSize}"
            fill="${terminal.cursorColor}" opacity="0">
        <!-- Show cursor -->
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
        
        <!-- Blinking -->
        <animate attributeName="opacity" values="1;1;0;0" dur="1s" 
                 begin="${startTime}ms" end="${typingEndTime}ms" repeatCount="indefinite"/>
        
        <!-- Hide after typing -->
        <animate attributeName="opacity" to="0" 
                 begin="${typingEndTime}ms" dur="10ms" fill="freeze"/>
        
        <!-- Smooth cursor movement -->
        <animate attributeName="x" 
                 from="${promptWidth}" 
                 to="${promptWidth + this.getTextWidth(command, terminal.fontSize)}"
                 begin="${startTime}ms" 
                 dur="${typingEndTime - startTime}ms"
                 fill="freeze"/>
      </rect>`;
  }

  generateOptimizedOutput(line, y, terminal, scrollY, visStart, visEnd) {
    const { content, color, startTime } = line;
    
    return `
      <g transform="translate(0, ${y})" opacity="0">
        <!-- Visibility control -->
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${Math.max(startTime, visStart)}ms" dur="10ms" fill="freeze"/>
        ${visEnd < Infinity ? `<animate attributeName="opacity" from="1" to="0" 
                 begin="${visEnd}ms" dur="10ms" fill="freeze"/>` : ''}
        
        <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
              fill="${color}" filter="url(#textGlow)">
          ${this.escapeXml(content)}
        </text>
      </g>`;
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
    // Approximate character width for monospace fonts
    return text.length * (fontSize * 0.6);
  }

  generateSimpleCommand(line, y, terminal) {
    const { prompt, command, startTime, typingDuration } = line;
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const charDuration = typingDuration / command.length;
    
    return `
    <g transform="translate(0, ${y})">
      <!-- Prompt -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${terminal.promptColor}" filter="url(#textGlow)" opacity="0">
        ${this.escapeXml(prompt)}
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
      </text>
      
      <!-- Command with typing animation -->
      <text x="${promptWidth}" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize}" fill="${terminal.textColor}" filter="url(#textGlow)">
        ${this.generateOptimizedTyping(command, startTime, charDuration)}
      </text>
      
      <!-- Cursor -->
      ${this.generateSimpleCursor(prompt, command, startTime, charDuration, terminal)}
    </g>`;
  }

  generateSimpleOutput(line, y, terminal) {
    const { content, color, startTime } = line;
    
    return `
      <g transform="translate(0, ${y})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
        
        <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
              fill="${color}" filter="url(#textGlow)">
          ${this.escapeXml(content)}
        </text>
      </g>`;
  }

  generateSimpleCursor(prompt, command, startTime, charDuration, terminal) {
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const typingEndTime = startTime + (command.length * charDuration);
    
    // Cursor positioned at text baseline
    const cursorY = -terminal.fontSize * 0.85;
    
    return `
      <rect x="${promptWidth}" y="${cursorY}" width="${terminal.fontSize * 0.6}" height="${terminal.fontSize}"
            fill="${terminal.cursorColor}" opacity="0">
        <!-- Show cursor -->
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
        
        <!-- Blinking -->
        <animate attributeName="opacity" values="1;1;0;0" dur="1s" 
                 begin="${startTime}ms" end="${typingEndTime}ms" repeatCount="indefinite"/>
        
        <!-- Hide after typing -->
        <animate attributeName="opacity" to="0" 
                 begin="${typingEndTime}ms" dur="10ms" fill="freeze"/>
        
        <!-- Cursor movement -->
        <animate attributeName="x" 
                 from="${promptWidth}" 
                 to="${promptWidth + this.getTextWidth(command, terminal.fontSize)}"
                 begin="${startTime}ms" 
                 dur="${typingEndTime - startTime}ms"
                 fill="freeze"/>
      </rect>`;
  }

  updateConfig(newConfig) {
    if (newConfig.window) {
      this.config.window = { ...this.config.window, ...newConfig.window };
    }
    if (newConfig.terminal) {
      this.config.terminal = { ...this.config.terminal, ...newConfig.terminal };
    }
  }
}

module.exports = OptimizedTerminalGenerator;