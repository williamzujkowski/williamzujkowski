class AwesomeTerminalGenerator {
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
          title: 'william@dad-joke-hq: ~',
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
        fontFamily: 'Fira Code, Consolas, Monaco, monospace',
        fontSize: 13,
        lineHeight: 1.4,
        textColor: '#d4d4d4',
        cursorColor: '#00ff00',
        backgroundColor: '#0c0c0c',
        prompt: 'william@dad-joke-hq:~$ ',
        promptColor: '#00ff00',
        maxVisibleLines: 30,
        scrollSpeed: 50 // ms per line scroll
      }
    };
  }

  generateAwesomeTerminal(sequences) {
    const { window, terminal } = this.config;
    const contentHeight = window.height - window.titleBar.height - (terminal.padding * 2);
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const maxLines = Math.floor(contentHeight / lineHeight);
    
    // Calculate total animation duration
    let totalDuration = 0;
    sequences.forEach(seq => {
      totalDuration += seq.delay || 0;
      totalDuration += seq.typingDuration || 2000;
      totalDuration += seq.pause || 1000;
    });

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
    <!-- Blinking cursor -->
    <g id="cursor">
      <rect width="8" height="${terminal.fontSize}" fill="${terminal.cursorColor}">
        <animate attributeName="opacity" values="1;1;0;0" dur="1s" repeatCount="indefinite"/>
      </rect>
    </g>
    
    <!-- Loading dots -->
    <g id="loadingDots">
      <circle cx="0" cy="0" r="2" fill="${terminal.textColor}">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="10" cy="0" r="2" fill="${terminal.textColor}">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="0" r="2" fill="${terminal.textColor}">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="1s" repeatCount="indefinite"/>
      </circle>
    </g>
    
    <!-- Progress bar background -->
    <rect id="progressBg" width="100" height="8" fill="#333333" rx="4"/>
    
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
    
    <!-- CRT glow effect -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Text shadow for better readability -->
    <filter id="textShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.5"/>
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
          fill="${window.backgroundColor}"/>
    
    <!-- Terminal screen effect -->
    <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
          height="${window.height - window.titleBar.height}" 
          fill="url(#scanlines)" opacity="0.5"/>`;
  }

  generateTitleBar(window) {
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
    
    <!-- Terminal content with clipping -->
    <g clip-path="url(#${clipId})">
      <!-- Terminal background -->
      <rect x="0" y="${window.titleBar.height}" width="${window.width}" 
            height="${window.height - window.titleBar.height}" fill="${terminal.backgroundColor}"/>
      
      <!-- Scrollable content -->
      <g id="scrollContent" transform="translate(${terminal.padding}, ${contentY})">
        ${this.generateSequences(sequences, terminal, viewportHeight)}
      </g>
    </g>`;
  }

  generateSequences(sequences, terminal, viewportHeight) {
    let currentY = 0;
    let currentTime = 0;
    const elements = [];
    const lineHeight = terminal.fontSize * terminal.lineHeight;

    sequences.forEach((seq, seqIndex) => {
      const startTime = currentTime;
      currentTime += seq.delay || 0;

      switch (seq.type) {
        case 'command':
          elements.push(this.generateCommand(seq, currentY, currentTime, terminal));
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

        case 'progress':
          elements.push(this.generateProgressBar(seq, currentY, currentTime, terminal));
          currentY += lineHeight * 1.5;
          currentTime += seq.duration || 3000;
          break;

        case 'loading':
          elements.push(this.generateLoadingAnimation(seq, currentY, currentTime, terminal));
          currentY += lineHeight;
          currentTime += seq.duration || 2000;
          break;

        case 'clear':
          elements.push(this.generateClearScreen(currentTime, currentY, viewportHeight));
          currentY = 0;
          currentTime += 500;
          break;

        case 'scroll':
          const scrollAmount = seq.lines * lineHeight;
          elements.push(this.generateScroll(currentTime, scrollAmount, currentY));
          break;
      }

      // Add pause after sequence
      currentTime += seq.pause || 1000;

      // Auto-scroll if content exceeds viewport
      if (currentY > viewportHeight - lineHeight * 2) {
        const scrollAmount = lineHeight * 5;
        elements.push(this.generateScroll(currentTime, scrollAmount, currentY));
        currentY -= scrollAmount;
      }
    });

    return elements.join('\n');
  }

  generateCommand(seq, y, startTime, terminal) {
    const prompt = seq.prompt || terminal.prompt;
    const command = seq.content;
    const totalChars = prompt.length + command.length;
    const charDuration = (seq.typingDuration || 2000) / command.length;

    return `
    <g transform="translate(0, ${y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin="${startTime}ms" dur="0.1s" fill="freeze"/>
      
      <!-- Prompt -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${seq.promptColor || terminal.promptColor}" filter="url(#textShadow)">
        ${this.escapeXml(prompt)}
      </text>
      
      <!-- Command typing -->
      <text x="${this.getTextWidth(prompt, terminal.fontSize)}" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize}" fill="${terminal.textColor}" filter="url(#textShadow)">
        ${command.split('').map((char, i) => 
          `<tspan opacity="0">${this.escapeXml(char)}<animate attributeName="opacity" 
                  from="0" to="1" begin="${startTime + (i * charDuration)}ms" 
                  dur="0.05s" fill="freeze"/></tspan>`
        ).join('')}
      </text>
      
      <!-- Cursor -->
      <use href="#cursor" x="${this.getTextWidth(prompt + command, terminal.fontSize)}" y="0" opacity="0">
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime + seq.typingDuration}ms" dur="0.1s" fill="freeze"/>
      </use>
    </g>`;
  }

  generateOutput(seq, startY, startTime, terminal) {
    const lines = seq.content.split('\n');
    const elements = [];
    let currentY = startY;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const color = seq.color || terminal.textColor;

    lines.forEach((line, i) => {
      const lineStartTime = startTime + (i * 50); // Stagger line appearance
      
      elements.push(`
      <g transform="translate(0, ${currentY})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${lineStartTime}ms" dur="0.1s" fill="freeze"/>
        <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
              fill="${color}" filter="url(#textShadow)">
          ${this.escapeXml(line)}
        </text>
      </g>`);
      
      currentY += lineHeight;
    });

    return {
      elements,
      newY: currentY,
      endTime: startTime + (lines.length * 50) + 100
    };
  }

  generateAsciiArt(seq, startY, startTime, terminal) {
    const lines = seq.content.split('\n');
    const elements = [];
    let currentY = startY;
    const lineHeight = terminal.fontSize * terminal.lineHeight;
    const color = seq.color || '#00ff00';

    // ASCII art appears all at once with fade-in
    elements.push(`
    <g transform="translate(0, ${currentY})" opacity="0" filter="url(#glow)">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="0.5s" fill="freeze"/>
      ${lines.map((line, i) => `
        <text y="${i * lineHeight}" font-family="${terminal.fontFamily}" 
              font-size="${terminal.fontSize}" fill="${color}">
          ${this.escapeXml(line)}
        </text>
      `).join('')}
    </g>`);

    return {
      elements,
      newY: currentY + (lines.length * lineHeight),
      endTime: startTime + 500
    };
  }

  generateProgressBar(seq, y, startTime, terminal) {
    const width = 300;
    const height = 8;
    const progress = seq.progress || 0;
    const label = seq.label || '';
    const color = seq.color || '#00ff00';

    return `
    <g transform="translate(0, ${y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="0.1s" fill="freeze"/>
      
      <!-- Label -->
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${terminal.textColor}" y="-5">
        ${this.escapeXml(label)}
      </text>
      
      <!-- Progress bar background -->
      <use href="#progressBg" x="0" y="0" width="${width}" height="${height}"/>
      
      <!-- Progress bar fill -->
      <rect x="0" y="0" width="0" height="${height}" fill="${color}" rx="4">
        <animate attributeName="width" from="0" to="${width * progress}" 
                 begin="${startTime + 100}ms" dur="${seq.duration || 2000}ms" fill="freeze"/>
      </rect>
      
      <!-- Percentage text -->
      <text x="${width + 10}" y="6" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize * 0.9}" fill="${terminal.textColor}">
        <tspan>0%</tspan>
        <animate attributeName="opacity" from="1" to="0" 
                 begin="${startTime + seq.duration}ms" dur="0.1s" fill="freeze"/>
      </text>
      <text x="${width + 10}" y="6" font-family="${terminal.fontFamily}" 
            font-size="${terminal.fontSize * 0.9}" fill="${terminal.textColor}" opacity="0">
        <tspan>${Math.round(progress * 100)}%</tspan>
        <animate attributeName="opacity" from="0" to="1" 
                 begin="${startTime + seq.duration}ms" dur="0.1s" fill="freeze"/>
      </text>
    </g>`;
  }

  generateLoadingAnimation(seq, y, startTime, terminal) {
    const text = seq.content || 'Loading';
    
    return `
    <g transform="translate(0, ${y})" opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="0.1s" fill="freeze"/>
      
      <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
            fill="${terminal.textColor}">
        ${this.escapeXml(text)}
      </text>
      
      <use href="#loadingDots" x="${this.getTextWidth(text + ' ', terminal.fontSize)}" 
           y="${-terminal.fontSize * 0.3}"/>
    </g>`;
  }

  generateClearScreen(startTime, currentY, viewportHeight) {
    return `
    <!-- Clear screen effect -->
    <rect x="-20" y="-${currentY}" width="1000" height="${viewportHeight + currentY}" 
          fill="${this.config.terminal.backgroundColor}" opacity="0">
      <animate attributeName="opacity" from="0" to="1" 
               begin="${startTime}ms" dur="0.3s" fill="freeze"/>
    </rect>`;
  }

  generateScroll(startTime, scrollAmount, maxY) {
    return `
    <!-- Scroll animation -->
    <animateTransform attributeName="transform" type="translate" 
                      from="0 0" to="0 -${scrollAmount}" 
                      begin="${startTime}ms" dur="0.3s" fill="freeze" additive="sum"/>`;
  }

  getTextWidth(text, fontSize) {
    return text.length * fontSize * 0.6;
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

module.exports = AwesomeTerminalGenerator;