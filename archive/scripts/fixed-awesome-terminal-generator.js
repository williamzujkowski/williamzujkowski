class FixedAwesomeTerminalGenerator {
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
        maxVisibleLines: 30,
        scrollSpeed: 100 // ms per line scroll
      }
    };
  }

  generateAwesomeTerminal(sequences) {
    const { window, terminal } = this.config;
    const contentHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const maxLines = Math.floor(contentHeight / lineHeight);
    
    const svg = `<svg width="${window.width}" height="${window.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.generateDefs(terminal)}
    ${this.generateFilters()}
  </defs>
  
  <g filter="url(#shadow)">
    ${this.generateWindow(window)}
    ${this.generateTitleBar(window)}
    ${this.generateTerminalContent(sequences, terminal, window, maxLines)}
  </g>
</svg>`;

    return svg;
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
    <!-- Shadow filter -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
      <feOffset dx="0" dy="10" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.6"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
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

  generateTerminalContent(sequences, terminal, window, maxLines) {
    const contentY = window.titleBar.height + terminal.padding;
    const viewportHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    
    // Create clipping mask for terminal viewport
    const clipId = 'terminalViewport';
    
    return `
    <!-- Define viewport clipping -->
    <defs>
      <clipPath id="${clipId}">
        <rect x="0" y="${window.titleBar.height}" width="${window.width}" height="${viewportHeight + terminal.padding * 2}"/>
      </clipPath>
    </defs>
    
    <!-- Terminal viewport with Ubuntu color -->
    <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
          height="${window.height - window.titleBar.height}" fill="${terminal.backgroundColor}"/>
    
    <!-- Terminal content with clipping -->
    <g clip-path="url(#${clipId})">
      <!-- Scrollable content -->
      <g id="scrollContent" transform="translate(${terminal.padding}, ${contentY})">
        ${this.generateSequences(sequences, terminal, viewportHeight, window)}
      </g>
    </g>`;
  }

  generateSequences(sequences, terminal, viewportHeight, window) {
    let currentY = 0;
    let currentTime = 0;
    const elements = [];
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const scrollAnimations = [];
    let totalScroll = 0;

    // Pre-calculate all Y positions and scroll points
    const positions = [];
    let calcY = 0;
    
    sequences.forEach((seq, index) => {
      const startY = calcY;
      
      switch (seq.type) {
        case 'command':
          calcY += lineHeight; // Command takes one line
          break;
        case 'output':
        case 'ascii':
          const lines = seq.content.split('\n');
          calcY += lines.length * lineHeight;
          break;
      }
      
      positions.push({ startY, endY: calcY, type: seq.type });
    });

    sequences.forEach((seq, seqIndex) => {
      const startTime = currentTime;
      currentTime += seq.delay || 0;
      const position = positions[seqIndex];

      switch (seq.type) {
        case 'command':
          // Show prompt immediately with cursor
          const prompt = seq.prompt || terminal.prompt;
          const command = seq.content;
          
          elements.push(this.generateCommandWithCursor(
            seq, currentY, currentTime, terminal, seqIndex
          ));
          
          currentY += lineHeight;
          currentTime += seq.typingDuration || 2000;
          break;

        case 'output':
          const outputElements = this.generateOutput(seq, currentY, currentTime, terminal);
          elements.push(...outputElements.elements);
          currentY = outputElements.newY;
          currentTime = outputElements.endTime;
          break;

        case 'ascii':
          const asciiElements = this.generateAsciiArt(seq, currentY, currentTime, terminal);
          elements.push(...asciiElements.elements);
          currentY = asciiElements.newY;
          currentTime = asciiElements.endTime;
          break;
      }

      // Add pause after sequence
      currentTime += seq.pause || 1000;

      // Check if we need to scroll - only when cursor would go below viewport
      const nextLineY = currentY + lineHeight;
      if (nextLineY > viewportHeight) {
        const scrollLines = Math.ceil((nextLineY - viewportHeight) / lineHeight);
        const scrollAmount = scrollLines * lineHeight;
        totalScroll += scrollAmount;
        
        scrollAnimations.push({
          time: currentTime,
          amount: totalScroll
        });
        
        currentTime += terminal.scrollSpeed * scrollLines;
      }
    });

    // Add scroll animations to the scrollContent group
    if (scrollAnimations.length > 0) {
      const scrollElement = scrollAnimations.map(scroll => 
        `<animateTransform
          attributeName="transform"
          type="translate"
          from="${terminal.padding} ${window.titleBar.height + terminal.padding - (scroll.amount - scroll.amount)}"
          to="${terminal.padding} ${window.titleBar.height + terminal.padding - scroll.amount}"
          begin="${scroll.time}ms"
          dur="${terminal.scrollSpeed}ms"
          fill="freeze"/>`
      ).join('\n');
      
      elements.push(`
        <!-- Scroll animations -->
        ${scrollElement}
      `);
    }

    return elements.join('\n');
  }

  generateCommandWithCursor(seq, y, startTime, terminal, index) {
    const prompt = seq.prompt || terminal.prompt;
    const command = seq.content;
    const charDuration = (seq.typingDuration || 2000) / command.length;
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    
    // Calculate when typing ends
    const typingEndTime = startTime + (seq.typingDuration || 2000);

    return `
    <g transform="translate(0, ${y})">
      <!-- Prompt appears immediately -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${terminal.promptColor}" filter="url(#textGlow)" opacity="0">
        ${this.escapeXml(prompt)}
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
      </text>
      
      <!-- Command typing -->
      <text x="${promptWidth}" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize}" fill="${terminal.textColor}" filter="url(#textGlow)">
        ${command.split('').map((char, i) => {
          const charStartTime = startTime + (i * charDuration);
          return `<tspan opacity="0">${this.escapeXml(char)}<animate attributeName="opacity" 
                  from="0" to="1" begin="${charStartTime}ms" 
                  dur="10ms" fill="freeze"/></tspan>`;
        }).join('')}
      </text>
      
      <!-- Blinking cursor that moves with typing and disappears after -->
      ${this.generateTypingCursor(prompt, command, startTime, charDuration, terminal, typingEndTime)}
    </g>`;
  }

  generateTypingCursor(prompt, command, startTime, charDuration, terminal, endTime) {
    const promptWidth = this.getTextWidth(prompt, terminal.fontSize);
    const cursorPositions = [];
    
    // Initial position (after prompt)
    cursorPositions.push({
      x: promptWidth,
      time: startTime
    });
    
    // Position after each character
    for (let i = 0; i < command.length; i++) {
      const x = promptWidth + this.getTextWidth(command.substring(0, i + 1), terminal.fontSize);
      const time = startTime + ((i + 1) * charDuration);
      cursorPositions.push({ x, time });
    }

    // Generate cursor movement animations
    const cursorAnims = [];
    for (let i = 0; i < cursorPositions.length - 1; i++) {
      const from = cursorPositions[i];
      const to = cursorPositions[i + 1];
      cursorAnims.push(`
        <animate attributeName="x" 
                 from="${from.x}" to="${to.x}"
                 begin="${from.time}ms" dur="${to.time - from.time}ms"
                 fill="freeze"/>`);
    }

    return `
      <rect x="${promptWidth}" y="0" width="${terminal.fontSize * 0.6}" height="${terminal.fontSize}"
            fill="${terminal.cursorColor}" opacity="0">
        <!-- Show cursor when prompt appears -->
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="10ms" fill="freeze"/>
        
        <!-- Blinking animation while visible -->
        <animate attributeName="opacity" values="1;1;0;0" dur="1s" 
                 begin="${startTime}ms" end="${endTime}ms" repeatCount="indefinite"/>
        
        <!-- Hide cursor after typing completes -->
        <animate attributeName="opacity" from="1" to="0" 
                 begin="${endTime}ms" dur="10ms" fill="freeze"/>
        
        <!-- Cursor position animations -->
        ${cursorAnims.join('')}
      </rect>`;
  }

  generateOutput(seq, startY, startTime, terminal) {
    const lines = seq.content.split('\n');
    const elements = [];
    let currentY = startY;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const color = seq.color || terminal.textColor;

    lines.forEach((line, i) => {
      const lineStartTime = startTime + (i * 30); // Faster line appearance
      
      elements.push(`
      <g transform="translate(0, ${currentY})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${lineStartTime}ms" dur="10ms" fill="freeze"/>
        <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
              fill="${color}" filter="url(#textGlow)">
          ${this.escapeXml(line)}
        </text>
      </g>`);
      
      currentY += lineHeight;
    });

    return {
      elements,
      newY: currentY,
      endTime: startTime + (lines.length * 30) + 100
    };
  }

  generateAsciiArt(seq, startY, startTime, terminal) {
    const lines = seq.content.split('\n');
    const elements = [];
    let currentY = startY;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const color = seq.color || '#87d75f';

    // ASCII art appears all at once with fade-in
    elements.push(`
    <g transform="translate(0, ${currentY})" opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="300ms" fill="freeze"/>
      ${lines.map((line, i) => `
        <text y="${i * lineHeight}" font-family="${terminal.fontFamily}" 
              font-size="${terminal.fontSize}" fill="${color}" filter="url(#textGlow)">
          ${this.escapeXml(line)}
        </text>
      `).join('')}
    </g>`);

    return {
      elements,
      newY: currentY + (lines.length * lineHeight),
      endTime: startTime + 300
    };
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

  updateConfig(newConfig) {
    if (newConfig.window) {
      this.config.window = { ...this.config.window, ...newConfig.window };
    }
    if (newConfig.terminal) {
      this.config.terminal = { ...this.config.terminal, ...newConfig.terminal };
    }
  }
}

module.exports = FixedAwesomeTerminalGenerator;