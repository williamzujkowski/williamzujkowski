class UnixTerminalGenerator {
  constructor() {
    this.config = {
      window: {
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        borderRadius: 8,
        shadow: true,
        titleBar: {
          height: 32,
          backgroundColor: '#2b2b2b',
          title: 'william@dad-joke-hq: ~',
          titleColor: '#cccccc',
          buttons: {
            close: '#ff5f56',
            minimize: '#ffbd2e',
            maximize: '#27c93f'
          }
        }
      },
      terminal: {
        padding: 15,
        fontFamily: 'Consolas, Monaco, \'Courier New\', monospace',
        fontSize: 14,
        charWidth: 8.4, // Precise monospace width
        lineHeight: 1.2,
        textColor: '#00ff00',
        backgroundColor: '#000000',
        cursorColor: '#00ff00',
        cursorWidth: 8.4, // Full character width
        prompt: 'william@dad-joke-hq:~$ ',
        promptColor: '#00ff00',
        // Timing
        typingSpeed: {
          min: 30,  // Fastest typing (ms per char)
          max: 120, // Slowest typing
          avg: 60   // Average speed
        },
        cursorBlinkRate: 530, // Standard Unix cursor blink rate
      }
    };
  }

  escapeXmlAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  generateTerminal(sequences) {
    const { window, terminal } = this.config;
    const contentHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    
    // Calculate total animation duration with realistic typing
    let totalDuration = this.calculateTotalDuration(sequences);

    const svg = `<svg width="${window.width}" height="${window.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${this.generateDefs()}
    ${this.generateFilters()}
  </defs>
  
  <g filter="url(#terminalShadow)">
    ${this.generateWindow()}
    ${this.generateTitleBar()}
    ${this.generateTerminalContent(sequences)}
  </g>
  
  <!-- Phosphor glow overlay -->
  <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
        height="${window.height - window.titleBar.height}" 
        fill="url(#phosphorGlow)" opacity="0.4" pointer-events="none"/>
</svg>`;

    return svg;
  }

  generateDefs() {
    const { terminal } = this.config;
    
    return `
    <!-- Block cursor (Unix-style) -->
    <rect id="blockCursor" width="${terminal.cursorWidth}" height="${terminal.fontSize}" 
          fill="${terminal.cursorColor}">
      <animate attributeName="opacity" 
               values="1;1;0;0" 
               dur="${terminal.cursorBlinkRate * 2}ms" 
               repeatCount="indefinite"/>
    </rect>
    
    <!-- Scanline effect -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="2">
      <rect width="1" height="1" fill="transparent"/>
      <rect y="1" width="1" height="1" fill="rgba(0,255,0,0.02)"/>
    </pattern>
    
    <!-- CRT phosphor glow -->
    <radialGradient id="phosphorGlow">
      <stop offset="0%" stop-color="rgba(0,255,0,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,255,0,0)"/>
    </radialGradient>
    
    <!-- Text glow for that authentic CRT feel -->
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
  }

  generateFilters() {
    return `
    <!-- Terminal shadow -->
    <filter id="terminalShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
      <feOffset dx="0" dy="10" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.6"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- CRT screen curve effect -->
    <filter id="crtCurve">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="1" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
  }

  generateWindow() {
    const { window } = this.config;
    
    return `
    <!-- Window background -->
    <rect x="0" y="0" width="${window.width}" height="${window.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.backgroundColor}"/>
    
    <!-- CRT screen effect -->
    <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
          height="${window.height - window.titleBar.height}" 
          fill="url(#scanlines)" opacity="0.8"/>`;
  }

  generateTitleBar() {
    const { window } = this.config;
    
    return `
    <!-- Title bar -->
    <rect x="0" y="0" width="${window.width}" height="${window.titleBar.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Fix bottom corners -->
    <rect x="0" y="${window.titleBar.height / 2}" width="${window.width}" 
          height="${window.titleBar.height / 2}" fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Window controls -->
    <g id="window-controls">
      <circle cx="20" cy="${window.titleBar.height / 2}" r="6" fill="${window.titleBar.buttons.close}"/>
      <circle cx="40" cy="${window.titleBar.height / 2}" r="6" fill="${window.titleBar.buttons.minimize}"/>
      <circle cx="60" cy="${window.titleBar.height / 2}" r="6" fill="${window.titleBar.buttons.maximize}"/>
    </g>
    
    <!-- Window title -->
    <text x="${window.width / 2}" y="${window.titleBar.height / 2 + 5}" 
          font-family="${this.escapeXmlAttr(this.config.terminal.fontFamily)}" font-size="13" 
          fill="${window.titleBar.titleColor}" text-anchor="middle">
      ${window.titleBar.title}
    </text>`;
  }

  generateTerminalContent(sequences) {
    const { window, terminal } = this.config;
    const contentY = window.titleBar.height + terminal.padding;
    const viewportHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    
    return `
    <!-- Terminal viewport -->
    <defs>
      <clipPath id="terminalViewport">
        <rect x="0" y="${window.titleBar.height}" 
              width="${window.width}" 
              height="${viewportHeight + terminal.padding * 2}"/>
      </clipPath>
    </defs>
    
    <g clip-path="url(#terminalViewport)">
      <!-- Terminal background -->
      <rect x="0" y="${window.titleBar.height}" 
            width="${window.width}" 
            height="${window.height - window.titleBar.height}" 
            fill="${terminal.backgroundColor}"/>
      
      <!-- Terminal content -->
      <g id="terminalContent" transform="translate(${terminal.padding}, ${contentY})">
        ${this.generateSequences(sequences)}
      </g>
    </g>`;
  }

  generateSequences(sequences) {
    const { terminal } = this.config;
    let currentY = 0;
    let currentTime = 0;
    let cursorX = 0;
    let cursorY = 0;
    const elements = [];
    const lineHeight = terminal.fontSize * terminal.lineHeight;

    sequences.forEach((seq, index) => {
      currentTime += seq.delay || 0;

      switch (seq.type) {
        case 'command': {
          const result = this.generateCommand(seq, currentY, currentTime, cursorX);
          elements.push(result.element);
          cursorX = result.newCursorX;
          cursorY = currentY;
          currentTime = result.endTime;
          currentY += lineHeight;
          
          // Add output immediately after command
          if (seq.output) {
            currentTime += 200; // Small pause before output
            const outputResult = this.generateOutput(seq.output, currentY, currentTime);
            elements.push(outputResult.element);
            currentY = outputResult.newY;
            currentTime = outputResult.endTime;
            cursorX = 0;
            cursorY = currentY - lineHeight;
          }
          break;
        }

        case 'ascii': {
          const result = this.generateAsciiArt(seq, currentY, currentTime);
          elements.push(result.element);
          currentY = result.newY;
          currentTime = result.endTime;
          cursorX = 0;
          cursorY = currentY - lineHeight;
          break;
        }

        case 'output': {
          const result = this.generateOutput(seq, currentY, currentTime);
          elements.push(result.element);
          currentY = result.newY;
          currentTime = result.endTime;
          cursorX = 0;
          cursorY = currentY - lineHeight;
          break;
        }

        case 'clear': {
          elements.push(this.generateClear(currentTime, currentY));
          currentY = 0;
          cursorX = 0;
          cursorY = 0;
          currentTime += 100;
          break;
        }

        case 'progress': {
          const result = this.generateProgress(seq, currentY, currentTime);
          elements.push(result.element);
          currentY += lineHeight * 2;
          currentTime = result.endTime;
          break;
        }
      }

      // Add pause after sequence
      currentTime += seq.pause || 500;

      // Auto-scroll if needed
      const viewportHeight = this.config.window.height - this.config.window.titleBar.height - (terminal.padding * 2);
      if (currentY > viewportHeight - lineHeight * 3) {
        const scrollAmount = lineHeight * 5;
        elements.push(this.generateScroll(currentTime, scrollAmount));
        currentY -= scrollAmount;
        cursorY -= scrollAmount;
      }
    });

    // Add final cursor at end
    elements.push(this.generateFinalCursor(cursorX, cursorY, currentTime));

    return elements.join('\n');
  }

  generateCommand(seq, y, startTime, initialCursorX) {
    const { terminal } = this.config;
    const prompt = seq.prompt || terminal.prompt;
    const command = seq.content;
    
    // Calculate typing duration with realistic variance
    const chars = command.split('');
    let typingTime = 0;
    const charTimings = chars.map(() => {
      const speed = this.getTypingSpeed();
      typingTime += speed;
      return speed;
    });

    let elements = [];
    let currentTime = startTime;
    
    // Show prompt immediately
    elements.push(`
    <text x="0" y="${y + terminal.fontSize}" 
          font-family="${this.escapeXmlAttr(terminal.fontFamily)}" 
          font-size="${terminal.fontSize}" 
          fill="${terminal.promptColor}" 
          filter="url(#textGlow)"
          opacity="0">
      ${this.escapeXml(prompt)}
      <animate attributeName="opacity" from="0" to="1" 
               begin="${currentTime}ms" dur="50ms" fill="freeze"/>
    </text>`);

    // Type command character by character
    let xOffset = prompt.length * terminal.charWidth;
    chars.forEach((char, i) => {
      const charTime = currentTime + charTimings.slice(0, i).reduce((a, b) => a + b, 0);
      
      elements.push(`
      <text x="${xOffset}" y="${y + terminal.fontSize}" 
            font-family="${this.escapeXmlAttr(terminal.fontFamily)}" 
            font-size="${terminal.fontSize}" 
            fill="${terminal.textColor}" 
            filter="url(#textGlow)"
            opacity="0">
        ${this.escapeXml(char)}
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${charTime}ms" dur="10ms" fill="freeze"/>
      </text>`);
      
      // Move cursor with each character
      elements.push(`
      <use href="#blockCursor" x="${xOffset}" y="${y + 2}" opacity="0">
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${charTime}ms" dur="10ms" fill="freeze"/>
        <animate attributeName="opacity" from="1" to="0" 
                 begin="${charTime + charTimings[i]}ms" dur="10ms" fill="freeze"/>
      </use>`);
      
      xOffset += terminal.charWidth;
    });

    const endTime = currentTime + typingTime;
    
    return {
      element: `<g id="cmd_${startTime}">${elements.join('')}</g>`,
      newCursorX: xOffset,
      endTime: endTime
    };
  }

  generateOutput(seq, startY, startTime) {
    const { terminal } = this.config;
    const lines = seq.content ? seq.content.split('\n') : seq.split('\n');
    const color = seq.color || terminal.textColor;
    let elements = [];
    let currentY = startY;
    
    lines.forEach((line, i) => {
      if (line.trim()) {
        // Instant display for output (like real terminal)
        elements.push(`
        <text x="0" y="${currentY + terminal.fontSize}" 
              font-family="${this.escapeXmlAttr(terminal.fontFamily)}" 
              font-size="${terminal.fontSize}" 
              fill="${color}" 
              filter="url(#textGlow)"
              opacity="0">
          ${this.escapeXml(line)}
          <animate attributeName="opacity" from="0" to="1" 
                   begin="${startTime + (i * 20)}ms" dur="20ms" fill="freeze"/>
        </text>`);
      }
      currentY += terminal.fontSize * terminal.lineHeight;
    });

    return {
      element: `<g id="output_${startTime}">${elements.join('')}</g>`,
      newY: currentY,
      endTime: startTime + (lines.length * 20) + 100
    };
  }

  generateAsciiArt(seq, startY, startTime) {
    const { terminal } = this.config;
    const lines = seq.content.split('\n');
    const color = seq.color || '#00ff00';
    let elements = [];
    
    // ASCII art fades in with glow effect
    lines.forEach((line, i) => {
      elements.push(`
      <text x="0" y="${startY + (i + 1) * terminal.fontSize * terminal.lineHeight}" 
            font-family="${this.escapeXmlAttr(terminal.fontFamily)}" 
            font-size="${terminal.fontSize}" 
            fill="${color}" 
            filter="url(#textGlow)"
            opacity="0">
        ${this.escapeXml(line)}
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="500ms" fill="freeze"/>
      </text>`);
    });

    return {
      element: `<g id="ascii_${startTime}">${elements.join('')}</g>`,
      newY: startY + (lines.length * terminal.fontSize * terminal.lineHeight),
      endTime: startTime + 500
    };
  }

  generateProgress(seq, y, startTime) {
    const { terminal } = this.config;
    const width = 300;
    const height = 10;
    const progress = seq.progress || 0;
    const label = seq.label || '';
    const color = seq.color || terminal.textColor;

    return {
      element: `
      <g transform="translate(0, ${y})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime}ms" dur="50ms" fill="freeze"/>
        
        <!-- Label -->
        <text font-family="${this.escapeXmlAttr(terminal.fontFamily)}" 
              font-size="${terminal.fontSize}" 
              fill="${terminal.textColor}">
          ${this.escapeXml(label)}
        </text>
        
        <!-- Progress bar -->
        <rect x="0" y="${terminal.fontSize + 5}" 
              width="${width}" height="${height}" 
              fill="none" stroke="${color}" stroke-width="1"/>
        
        <!-- Progress fill -->
        <rect x="1" y="${terminal.fontSize + 6}" 
              width="0" height="${height - 2}" 
              fill="${color}">
          <animate attributeName="width" 
                   from="0" to="${(width - 2) * progress}" 
                   begin="${startTime + 100}ms" 
                   dur="${seq.duration || 2000}ms" 
                   fill="freeze"/>
        </rect>
        
        <!-- Percentage -->
        <text x="${width + 10}" y="${terminal.fontSize + 12}" 
              font-family="${this.escapeXmlAttr(terminal.fontFamily)}" 
              font-size="${terminal.fontSize * 0.9}" 
              fill="${terminal.textColor}">
          ${Math.round(progress * 100)}%
        </text>
      </g>`,
      endTime: startTime + (seq.duration || 2000) + 100
    };
  }

  generateClear(startTime, currentY) {
    return `
    <rect x="-20" y="-20" width="1000" height="${currentY + 100}" 
          fill="${this.config.terminal.backgroundColor}" 
          opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="50ms" fill="freeze"/>
    </rect>`;
  }

  generateScroll(startTime, scrollAmount) {
    return `
    <animateTransform 
      attributeName="transform" 
      type="translate" 
      from="0 0" 
      to="0 -${scrollAmount}" 
      begin="${startTime}ms" 
      dur="200ms" 
      fill="freeze" 
      additive="sum"/>`;
  }

  generateFinalCursor(x, y, startTime) {
    return `
    <use href="#blockCursor" x="${x}" y="${y + 2}" opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="10ms" fill="freeze"/>
    </use>`;
  }

  getTypingSpeed() {
    // Realistic typing speed variation
    const { min, max, avg } = this.config.terminal.typingSpeed;
    const random = Math.random();
    
    if (random < 0.1) {
      // 10% chance of pause (thinking)
      return Math.random() * 300 + 200;
    } else if (random < 0.3) {
      // 20% chance of slow typing
      return Math.random() * (max - avg) + avg;
    } else {
      // 70% normal speed
      return Math.random() * (avg - min) + min;
    }
  }

  calculateTotalDuration(sequences) {
    let total = 0;
    sequences.forEach(seq => {
      total += seq.delay || 0;
      
      if (seq.type === 'command') {
        const avgSpeed = this.config.terminal.typingSpeed.avg;
        total += seq.content.length * avgSpeed;
      } else {
        total += seq.duration || 1000;
      }
      
      total += seq.pause || 500;
    });
    return total;
  }

  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

module.exports = UnixTerminalGenerator;