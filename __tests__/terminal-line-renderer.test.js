/**
 * @fileoverview Tests for the terminal line renderer module.
 * @module tests/terminal-line-renderer
 */

const {
  escapeXml,
  getTextWidth,
  generateAllLines,
  generateCommandLine,
  generateOutputLine,
  generateStyledText,
  generateCursor
} = require('../scripts/terminal-line-renderer');

describe('TerminalLineRenderer', () => {
  const mockTerminal = {
    fontFamily: 'monospace',
    fontSize: 14,
    promptColor: '#50fa7b',
    textColor: '#f8f8f2',
    cursorColor: '#f8f8f2'
  };

  describe('escapeXml', () => {
    it('escapes ampersand', () => {
      expect(escapeXml('a & b')).toBe('a &amp; b');
    });

    it('escapes less than', () => {
      expect(escapeXml('a < b')).toBe('a &lt; b');
    });

    it('escapes greater than', () => {
      expect(escapeXml('a > b')).toBe('a &gt; b');
    });

    it('escapes double quotes', () => {
      expect(escapeXml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('escapes single quotes', () => {
      expect(escapeXml("it's")).toBe('it&apos;s');
    });

    it('escapes multiple special characters', () => {
      expect(escapeXml('<script>alert("XSS & more")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS &amp; more&quot;)&lt;/script&gt;');
    });

    it('returns empty string for empty input', () => {
      expect(escapeXml('')).toBe('');
    });

    it('returns original string when no special characters', () => {
      expect(escapeXml('hello world')).toBe('hello world');
    });
  });

  describe('getTextWidth', () => {
    it('calculates width based on text length and font size', () => {
      const width = getTextWidth('hello', 14);
      expect(width).toBe(5 * 14 * 0.6);
    });

    it('returns 0 for empty string', () => {
      expect(getTextWidth('', 14)).toBe(0);
    });

    it('scales with font size', () => {
      const width10 = getTextWidth('test', 10);
      const width20 = getTextWidth('test', 20);
      expect(width20).toBe(width10 * 2);
    });
  });

  describe('generateStyledText', () => {
    it('generates tspan with default color', () => {
      const spans = [{ text: 'hello', fg: null, bold: false, dim: false }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('<tspan');
      expect(result).toContain('fill="#ffffff"');
      expect(result).toContain('hello');
      expect(result).toContain('</tspan>');
    });

    it('uses span foreground color when provided', () => {
      const spans = [{ text: 'colored', fg: '#ff0000', bold: false, dim: false }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('fill="#ff0000"');
    });

    it('applies bold font-weight', () => {
      const spans = [{ text: 'bold text', fg: null, bold: true, dim: false }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('font-weight="bold"');
    });

    it('applies dim opacity', () => {
      const spans = [{ text: 'dim text', fg: null, bold: false, dim: true }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('opacity="0.6"');
    });

    it('combines bold and dim styles', () => {
      const spans = [{ text: 'styled', fg: '#00ff00', bold: true, dim: true }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('fill="#00ff00"');
      expect(result).toContain('font-weight="bold"');
      expect(result).toContain('opacity="0.6"');
    });

    it('handles multiple spans', () => {
      const spans = [
        { text: 'normal ', fg: null, bold: false, dim: false },
        { text: 'bold', fg: '#ff0000', bold: true, dim: false }
      ];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('normal ');
      expect(result).toContain('bold');
      expect(result.match(/<tspan/g).length).toBe(2);
    });

    it('escapes special XML characters in text', () => {
      const spans = [{ text: '<test & "value">', fg: null, bold: false, dim: false }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).toContain('&lt;test &amp; &quot;value&quot;&gt;');
    });

    it('returns empty string for empty spans array', () => {
      const result = generateStyledText([], mockTerminal, '#ffffff');
      expect(result).toBe('');
    });

    it('does not add font-weight when bold is false', () => {
      const spans = [{ text: 'normal', fg: null, bold: false, dim: false }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).not.toContain('font-weight');
    });

    it('does not add opacity when dim is false', () => {
      const spans = [{ text: 'normal', fg: null, bold: false, dim: false }];
      const result = generateStyledText(spans, mockTerminal, '#ffffff');

      expect(result).not.toContain('opacity');
    });
  });

  describe('generateCommandLine', () => {
    it('generates SVG markup with correct line index', () => {
      const result = generateCommandLine(0, 0, '$ ', 'echo test', 100, 500, mockTerminal);

      expect(result).toContain('id="line-0"');
      expect(result).toContain('Command line 0');
    });

    it('includes prompt text', () => {
      const result = generateCommandLine(0, 0, '$ ', 'ls', 100, 500, mockTerminal);

      expect(result).toContain('$ ');
    });

    it('applies correct y transform', () => {
      const result = generateCommandLine(5, 100, '$ ', 'pwd', 0, 500, mockTerminal);

      expect(result).toContain('translate(0, 100)');
    });

    it('generates character-by-character animation for command', () => {
      const result = generateCommandLine(0, 0, '$ ', 'abc', 0, 300, mockTerminal);

      // Should have 3 tspan elements for 'a', 'b', 'c'
      expect(result.match(/<tspan/g).length).toBe(3);
    });

    it('uses terminal font settings', () => {
      const result = generateCommandLine(0, 0, '$ ', 'test', 0, 500, mockTerminal);

      expect(result).toContain(`font-family="${mockTerminal.fontFamily}"`);
      expect(result).toContain(`font-size="${mockTerminal.fontSize}"`);
    });

    it('sets correct animation start times', () => {
      const result = generateCommandLine(0, 0, '$ ', 'ab', 1000, 200, mockTerminal);

      // First char at 1000ms, second at 1100ms
      expect(result).toContain('begin="1000ms"');
      expect(result).toContain('begin="1100ms"');
    });

    it('handles empty command gracefully', () => {
      const result = generateCommandLine(0, 0, '$ ', '', 0, 0, mockTerminal);

      expect(result).toContain('id="line-0"');
      expect(result).not.toContain('<tspan opacity="0">');
    });

    it('escapes special characters in prompt', () => {
      const result = generateCommandLine(0, 0, '<user>$ ', 'test', 0, 500, mockTerminal);

      expect(result).toContain('&lt;user&gt;$ ');
    });

    it('escapes special characters in command', () => {
      const result = generateCommandLine(0, 0, '$ ', 'echo "hello"', 0, 500, mockTerminal);

      expect(result).toContain('&quot;');
    });

    it('includes cursor element', () => {
      const result = generateCommandLine(0, 0, '$ ', 'test', 0, 500, mockTerminal);

      expect(result).toContain('Cursor');
      expect(result).toContain('<rect');
    });
  });

  describe('generateOutputLine', () => {
    it('generates SVG markup with correct line index', () => {
      const result = generateOutputLine(3, 60, 'output text', '#00ff00', 1000, mockTerminal);

      expect(result).toContain('id="line-3"');
      expect(result).toContain('Output line 3');
    });

    it('applies correct y transform', () => {
      const result = generateOutputLine(5, 100, 'test', '#ffffff', 0, mockTerminal);

      expect(result).toContain('translate(0, 100)');
    });

    it('uses provided color for plain text', () => {
      const result = generateOutputLine(0, 0, 'plain text', '#ff5555', 0, mockTerminal);

      expect(result).toContain('fill="#ff5555"');
    });

    it('sets correct animation start time', () => {
      const result = generateOutputLine(0, 0, 'test', '#ffffff', 2500, mockTerminal);

      expect(result).toContain('begin="2500ms"');
    });

    it('escapes XML characters in plain text', () => {
      const result = generateOutputLine(0, 0, '<script> & "test"', '#ffffff', 0, mockTerminal);

      expect(result).toContain('&lt;script&gt; &amp; &quot;test&quot;');
    });

    it('handles [[style]] markup', () => {
      // Use correct markup syntax: [[fg:colorname]] with colon
      const result = generateOutputLine(0, 0, '[[fg:red]]red text[[/fg]]', '#ffffff', 0, mockTerminal);

      // Should use styled text (tspan elements with specific colors)
      expect(result).toContain('<tspan');
      expect(result).toContain('fill="#ff5555"'); // red color from markup
    });

    it('applies font settings from terminal', () => {
      const result = generateOutputLine(0, 0, 'test', '#ffffff', 0, mockTerminal);

      expect(result).toContain(`font-family="${mockTerminal.fontFamily}"`);
      expect(result).toContain(`font-size="${mockTerminal.fontSize}"`);
    });

    it('includes text glow filter', () => {
      const result = generateOutputLine(0, 0, 'test', '#ffffff', 0, mockTerminal);

      expect(result).toContain('filter="url(#textGlow)"');
    });

    it('starts with opacity 0 for fade-in', () => {
      const result = generateOutputLine(0, 0, 'test', '#ffffff', 0, mockTerminal);

      expect(result).toContain('opacity="0"');
      expect(result).toContain('from="0" to="1"');
    });
  });

  describe('generateCursor', () => {
    it('generates cursor rect element', () => {
      const result = generateCursor('$ ', 'test', 0, 400, mockTerminal);

      expect(result).toContain('<rect');
      expect(result).toContain('Cursor');
    });

    it('positions cursor after prompt', () => {
      const promptWidth = 2 * mockTerminal.fontSize * 0.6; // '$ ' = 2 chars
      const result = generateCursor('$ ', 'test', 0, 400, mockTerminal);

      expect(result).toContain(`x="${promptWidth}"`);
    });

    it('uses cursor color from terminal', () => {
      const result = generateCursor('$ ', 'test', 0, 400, mockTerminal);

      expect(result).toContain(`fill="${mockTerminal.cursorColor}"`);
    });

    it('includes show animation at start time', () => {
      const result = generateCursor('$ ', 'test', 1000, 400, mockTerminal);

      expect(result).toContain('begin="1000ms"');
    });

    it('includes hide animation at end of typing', () => {
      const result = generateCursor('$ ', 'test', 0, 400, mockTerminal);

      // End time = start + duration = 0 + 400 = 400
      expect(result).toContain('begin="400ms"');
    });

    it('includes blinking animation', () => {
      const result = generateCursor('$ ', 'test', 0, 400, mockTerminal);

      expect(result).toContain('values="1;1;0;0"');
      expect(result).toContain('repeatCount="indefinite"');
    });

    it('generates position animations for each character', () => {
      const result = generateCursor('$ ', 'ab', 0, 200, mockTerminal);

      // 2 characters = 2 position animations
      expect(result.match(/attributeName="x"/g).length).toBe(2);
    });

    it('calculates correct cursor width based on font size', () => {
      const charWidth = mockTerminal.fontSize * 0.6;
      const result = generateCursor('$ ', 'test', 0, 400, mockTerminal);

      expect(result).toContain(`width="${charWidth}"`);
    });
  });

  describe('generateAllLines', () => {
    it('returns empty string for empty frames', () => {
      const result = generateAllLines([], mockTerminal, 20, 20);
      expect(result).toBe('');
    });

    it('generates command lines from add-command frames', () => {
      const frames = [
        {
          type: 'add-command',
          lineIndex: 0,
          prompt: '$ ',
          command: 'echo hello',
          time: 0,
          typingDuration: 500
        }
      ];

      const result = generateAllLines(frames, mockTerminal, 20, 20);

      expect(result).toContain('id="line-0"');
      // Command is split character-by-character in tspan elements
      expect(result).toContain('>e<');
      expect(result).toContain('>c<');
      expect(result).toContain('>h<');
      expect(result).toContain('>o<');
    });

    it('generates output lines from add-output frames', () => {
      const frames = [
        {
          type: 'add-output',
          lineIndex: 1,
          content: 'hello',
          color: '#00ff00',
          time: 600
        }
      ];

      const result = generateAllLines(frames, mockTerminal, 20, 20);

      expect(result).toContain('id="line-1"');
      expect(result).toContain('hello');
    });

    it('combines command and output frames', () => {
      const frames = [
        {
          type: 'add-command',
          lineIndex: 0,
          prompt: '$ ',
          command: 'ls',
          time: 0,
          typingDuration: 200
        },
        {
          type: 'add-output',
          lineIndex: 1,
          content: 'file.txt',
          color: '#ffffff',
          time: 300
        }
      ];

      const result = generateAllLines(frames, mockTerminal, 20, 20);

      expect(result).toContain('id="line-0"');
      expect(result).toContain('id="line-1"');
    });

    it('sorts lines by index', () => {
      const frames = [
        {
          type: 'add-output',
          lineIndex: 2,
          content: 'second',
          color: '#ffffff',
          time: 500
        },
        {
          type: 'add-command',
          lineIndex: 0,
          prompt: '$ ',
          command: 'test',
          time: 0,
          typingDuration: 200
        }
      ];

      const result = generateAllLines(frames, mockTerminal, 20, 20);
      const line0Pos = result.indexOf('id="line-0"');
      const line2Pos = result.indexOf('id="line-2"');

      expect(line0Pos).toBeLessThan(line2Pos);
    });

    it('uses correct y position based on lineHeight', () => {
      const frames = [
        {
          type: 'add-output',
          lineIndex: 3,
          content: 'test',
          color: '#ffffff',
          time: 0
        }
      ];

      const lineHeight = 25;
      const result = generateAllLines(frames, mockTerminal, 20, lineHeight);

      // y = lineIndex * lineHeight = 3 * 25 = 75
      expect(result).toContain('translate(0, 75)');
    });

    it('overwrites duplicate line indices', () => {
      const frames = [
        {
          type: 'add-output',
          lineIndex: 0,
          content: 'first',
          color: '#ffffff',
          time: 0
        },
        {
          type: 'add-output',
          lineIndex: 0,
          content: 'second',
          color: '#ffffff',
          time: 100
        }
      ];

      const result = generateAllLines(frames, mockTerminal, 20, 20);

      // Should only have one line-0 with 'second' content
      expect(result.match(/id="line-0"/g).length).toBe(1);
      expect(result).toContain('second');
    });

    it('ignores unknown frame types', () => {
      const frames = [
        {
          type: 'unknown-type',
          lineIndex: 0,
          content: 'ignored',
          time: 0
        }
      ];

      const result = generateAllLines(frames, mockTerminal, 20, 20);

      expect(result).toBe('');
    });
  });
});
