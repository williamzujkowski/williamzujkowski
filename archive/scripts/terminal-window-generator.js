class TerminalWindowGenerator {
  constructor() {
    this.config = {
      window: {
        width: 600,
        height: 400,
        backgroundColor: '#1e1e1e',
        borderRadius: 8,
        shadow: true,
        titleBar: {
          height: 30,
          backgroundColor: '#2d2d2d',
          title: 'william@dad-joke-hq:~',
          titleColor: '#cccccc',
          buttons: {
            close: '#ff5f56',
            minimize: '#ffbd2e',
            maximize: '#27c93f'
          }
        }
      },
      terminal: {
        padding: 20,
        fontFamily: 'Fira Code, monospace',
        fontSize: 14,
        lineHeight: 1.5,
        textColor: '#00ff00',
        cursorColor: '#00ff00',
        backgroundColor: '#1e1e1e',
        prompt: '$ ',
        promptColor: '#36BCF7'
      }
    };
  }

  generateTerminalWindow(sections) {
    const { window, terminal } = this.config;
    
    // Calculate content area dimensions
    const contentY = window.titleBar.height;
    const contentHeight = window.height - window.titleBar.height;
    
    // Generate animated text content
    const animatedContent = this.generateAnimatedContent(sections, terminal);
    
    const svg = `<svg width="${window.width}" height="${window.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Shadow filter -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
      <feOffset dx="0" dy="5" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.3"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Terminal gradient background -->
    <linearGradient id="terminalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2d2d2d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e1e1e;stop-opacity:1" />
    </linearGradient>
    
    <!-- Blinking cursor -->
    <g id="cursor">
      <rect width="8" height="16" fill="${terminal.cursorColor}">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
      </rect>
    </g>
  </defs>
  
  <!-- Main window with shadow -->
  <g ${window.shadow ? 'filter="url(#shadow)"' : ''}>
    <!-- Window background -->
    <rect x="0" y="0" width="${window.width}" height="${window.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.backgroundColor}"/>
    
    <!-- Title bar -->
    <rect x="0" y="0" width="${window.width}" height="${window.titleBar.height}" 
          rx="${window.borderRadius}" ry="${window.borderRadius}" 
          fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Fix bottom corners of title bar -->
    <rect x="0" y="${window.titleBar.height / 2}" width="${window.width}" 
          height="${window.titleBar.height / 2}" fill="${window.titleBar.backgroundColor}"/>
    
    <!-- Window control buttons -->
    <g id="window-controls">
      <circle cx="20" cy="15" r="6" fill="${window.titleBar.buttons.close}"/>
      <circle cx="40" cy="15" r="6" fill="${window.titleBar.buttons.minimize}"/>
      <circle cx="60" cy="15" r="6" fill="${window.titleBar.buttons.maximize}"/>
    </g>
    
    <!-- Window title -->
    <text x="${window.width / 2}" y="20" font-family="${terminal.fontFamily}" 
          font-size="13" fill="${window.titleBar.titleColor}" text-anchor="middle">
      ${window.titleBar.title}
    </text>
    
    <!-- Terminal content area -->
    <g id="terminal-content" transform="translate(${terminal.padding}, ${contentY + terminal.padding})">
      <rect x="-${terminal.padding}" y="-${terminal.padding}" 
            width="${window.width}" height="${contentHeight}" 
            fill="${terminal.backgroundColor}"/>
      
      <!-- Animated content -->
      ${animatedContent}
    </g>
  </g>
</svg>`;

    return svg;
  }

  generateAnimatedContent(sections, terminal) {
    let yOffset = 0;
    let totalDelay = 0;
    const lineSpacing = terminal.fontSize * terminal.lineHeight;
    const lines = [];

    sections.forEach((section, sectionIndex) => {
      // Add prompt and command
      if (section.heading) {
        lines.push({
          text: section.heading,
          y: yOffset,
          delay: totalDelay,
          duration: section.duration || 2000,
          isPrompt: true,
          color: section.promptColor || terminal.promptColor
        });
        yOffset += lineSpacing;
        totalDelay += (section.duration || 2000) + 500;
      }

      // Add output content
      if (section.content) {
        const contentLines = section.content.split('\\n');
        contentLines.forEach((line, lineIndex) => {
          lines.push({
            text: line,
            y: yOffset,
            delay: totalDelay + (lineIndex * 100),
            duration: 50,
            isOutput: true,
            color: section.color || terminal.textColor
          });
          yOffset += lineSpacing;
        });
        totalDelay += (contentLines.length * 100) + (section.pause || 1000);
      }

      // Add spacing between sections
      if (sectionIndex < sections.length - 1) {
        yOffset += lineSpacing * 0.5;
      }
    });

    // Generate SVG text elements with animations
    const textElements = lines.map((line, index) => {
      const text = this.escapeXml(line.text);
      const chars = text.split('');
      
      return `
      <g transform="translate(0, ${line.y})">
        <text font-family="${terminal.fontFamily}" font-size="${terminal.fontSize}" 
              fill="${line.color}" opacity="0">
          ${line.isPrompt ? 
            chars.map((char, i) => 
              `<tspan>${char}<animate attributeName="opacity" from="0" to="1" 
                      begin="${line.delay + (i * line.duration / chars.length)}ms" 
                      dur="0.1s" fill="freeze"/></tspan>`
            ).join('') :
            `${text}<animate attributeName="opacity" from="0" to="1" 
                    begin="${line.delay}ms" dur="0.1s" fill="freeze"/>`
          }
        </text>
        ${index === lines.length - 1 ? 
          `<use href="#cursor" x="${this.getTextWidth(text, terminal.fontSize)}" y="-2" 
                opacity="0">
            <animate attributeName="opacity" from="0" to="1" 
                     begin="${line.delay + line.duration}ms" dur="0.1s" fill="freeze"/>
          </use>` : ''
        }
      </g>`;
    }).join('\n');

    return textElements;
  }

  getTextWidth(text, fontSize) {
    // Rough estimation: monospace fonts are typically 0.6 * fontSize per character
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

  updateConfig(customConfig) {
    this.config = this.deepMerge(this.config, customConfig);
  }

  deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

module.exports = TerminalWindowGenerator;