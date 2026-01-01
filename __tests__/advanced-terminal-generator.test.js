const AdvancedTerminalGenerator = require('../scripts/advanced-terminal-generator');

describe('AdvancedTerminalGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new AdvancedTerminalGenerator();
  });

  describe('constructor', () => {
    test('initializes with default config', () => {
      expect(generator.config).toBeDefined();
      expect(generator.config.window).toBeDefined();
      expect(generator.config.terminal).toBeDefined();
    });

    test('window config has required properties', () => {
      const { window } = generator.config;
      expect(window.width).toBeGreaterThan(0);
      expect(window.height).toBeGreaterThan(0);
      expect(window.backgroundColor).toBeDefined();
      expect(window.borderRadius).toBeGreaterThanOrEqual(0);
      expect(window.titleBar).toBeDefined();
    });

    test('terminal config has required properties', () => {
      const { terminal } = generator.config;
      expect(terminal.padding).toBeGreaterThan(0);
      expect(terminal.fontFamily).toBeDefined();
      expect(terminal.fontSize).toBeGreaterThan(0);
      expect(terminal.lineHeight).toBeGreaterThan(0);
      expect(terminal.textColor).toBeDefined();
      expect(terminal.cursorColor).toBeDefined();
      expect(terminal.prompt).toBeDefined();
      expect(terminal.promptColor).toBeDefined();
    });

    test('title bar has button colors', () => {
      const { buttons } = generator.config.window.titleBar;
      expect(buttons.close).toBeDefined();
      expect(buttons.minimize).toBeDefined();
      expect(buttons.maximize).toBeDefined();
    });
  });

  describe('escapeXml', () => {
    test('escapes ampersand', () => {
      expect(generator.escapeXml('A & B')).toBe('A &amp; B');
    });

    test('escapes less than', () => {
      expect(generator.escapeXml('A < B')).toBe('A &lt; B');
    });

    test('escapes greater than', () => {
      expect(generator.escapeXml('A > B')).toBe('A &gt; B');
    });

    test('escapes double quotes', () => {
      expect(generator.escapeXml('A "B" C')).toBe('A &quot;B&quot; C');
    });

    test('escapes single quotes', () => {
      expect(generator.escapeXml("A 'B' C")).toBe('A &apos;B&apos; C');
    });

    test('escapes multiple special characters', () => {
      expect(generator.escapeXml('<script>alert("test")</script>'))
        .toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
    });

    test('handles empty string', () => {
      expect(generator.escapeXml('')).toBe('');
    });

    test('handles string with no special characters', () => {
      expect(generator.escapeXml('Hello World')).toBe('Hello World');
    });
  });

  describe('getTextWidth', () => {
    test('returns 0 for empty string', () => {
      expect(generator.getTextWidth('', 14)).toBe(0);
    });

    test('calculates width based on character count', () => {
      const text = 'Hello';
      const fontSize = 14;
      const width = generator.getTextWidth(text, fontSize);
      expect(width).toBe(text.length * fontSize * 0.6);
    });

    test('increases with font size', () => {
      const text = 'Test';
      const small = generator.getTextWidth(text, 12);
      const large = generator.getTextWidth(text, 16);
      expect(large).toBeGreaterThan(small);
    });
  });

  describe('generateTerminal', () => {
    const simpleSequences = [
      {
        type: 'command',
        prompt: 'user@host:~$ ',
        content: 'echo hello',
        typingDuration: 500,
        pause: 200
      },
      {
        type: 'output',
        content: 'hello',
        color: '#ffffff',
        pause: 200
      }
    ];

    test('returns valid SVG string', () => {
      const svg = generator.generateTerminal(simpleSequences);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    test('SVG has correct dimensions', () => {
      const svg = generator.generateTerminal(simpleSequences);
      expect(svg).toContain(`width="${generator.config.window.width}"`);
      expect(svg).toContain(`height="${generator.config.window.height}"`);
    });

    test('includes window title', () => {
      const svg = generator.generateTerminal(simpleSequences);
      expect(svg).toContain(generator.config.window.titleBar.title);
    });

    test('includes window control buttons', () => {
      const svg = generator.generateTerminal(simpleSequences);
      expect(svg).toContain('window-controls');
      expect(svg).toContain(generator.config.window.titleBar.buttons.close);
      expect(svg).toContain(generator.config.window.titleBar.buttons.minimize);
      expect(svg).toContain(generator.config.window.titleBar.buttons.maximize);
    });

    test('includes defs section with patterns and filters', () => {
      const svg = generator.generateTerminal(simpleSequences);
      expect(svg).toContain('<defs>');
      expect(svg).toContain('id="scanlines"');
      expect(svg).toContain('id="textGlow"');
      expect(svg).toContain('id="shadow"');
    });

    test('escapes special characters in command', () => {
      const sequences = [{
        type: 'command',
        prompt: 'user@host:~$ ',
        content: 'echo "<test>"',
        typingDuration: 500,
        pause: 200
      }];

      const svg = generator.generateTerminal(sequences);
      // Each character is wrapped in its own tspan, so check individually
      expect(svg).toContain('&lt;');  // < is escaped
      expect(svg).toContain('&gt;');  // > is escaped
    });

    test('handles empty sequences', () => {
      const svg = generator.generateTerminal([]);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    test('includes terminal viewport clip path', () => {
      const svg = generator.generateTerminal(simpleSequences);
      expect(svg).toContain('clipPath');
      expect(svg).toContain('terminalViewport');
    });
  });

  describe('createAnimationFrames', () => {
    const sequences = [
      {
        type: 'command',
        prompt: 'user@host:~$ ',
        content: 'test',
        typingDuration: 1000,
        pause: 500
      },
      {
        type: 'output',
        content: 'output line',
        color: '#ffffff',
        pause: 300
      }
    ];

    test('returns frames and totalDuration', () => {
      const lineHeight = 21;
      const maxVisibleLines = 20;
      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        maxVisibleLines
      );

      expect(result).toHaveProperty('frames');
      expect(result).toHaveProperty('totalDuration');
      expect(Array.isArray(result.frames)).toBe(true);
    });

    test('frames have time property', () => {
      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        20
      );

      result.frames.forEach(frame => {
        expect(frame).toHaveProperty('time');
        expect(typeof frame.time).toBe('number');
      });
    });

    test('creates add-command frame for command sequences', () => {
      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        20
      );

      const commandFrames = result.frames.filter(f => f.type === 'add-command');
      expect(commandFrames.length).toBeGreaterThan(0);
    });

    test('creates add-output frame for output sequences', () => {
      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        20
      );

      const outputFrames = result.frames.filter(f => f.type === 'add-output');
      expect(outputFrames.length).toBeGreaterThan(0);
    });

    test('includes final frame', () => {
      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        20
      );

      const finalFrame = result.frames.find(f => f.type === 'final');
      expect(finalFrame).toBeDefined();
    });

    test('total duration increases with more sequences', () => {
      const shortSequences = sequences.slice(0, 1);
      const result1 = generator.createAnimationFrames(
        shortSequences,
        generator.config.terminal,
        20
      );
      const result2 = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        20
      );

      expect(result2.totalDuration).toBeGreaterThan(result1.totalDuration);
    });
  });

  describe('generateDefs', () => {
    test('returns scanline pattern', () => {
      const defs = generator.generateDefs();
      expect(defs).toContain('id="scanlines"');
      expect(defs).toContain('patternUnits="userSpaceOnUse"');
    });
  });

  describe('generateFilters', () => {
    test('includes text glow filter', () => {
      const filters = generator.generateFilters();
      expect(filters).toContain('id="textGlow"');
      expect(filters).toContain('feGaussianBlur');
    });

    test('includes shadow filter', () => {
      const filters = generator.generateFilters();
      expect(filters).toContain('id="shadow"');
    });

    test('includes CRT filter', () => {
      const filters = generator.generateFilters();
      expect(filters).toContain('id="crt"');
      expect(filters).toContain('feTurbulence');
    });
  });

  describe('generateWindow', () => {
    test('creates window background rect', () => {
      const window = generator.generateWindow(generator.config.window);
      expect(window).toContain('<rect');
      expect(window).toContain(`width="${generator.config.window.width}"`);
      expect(window).toContain(`height="${generator.config.window.height}"`);
      expect(window).toContain(`rx="${generator.config.window.borderRadius}"`);
    });
  });

  describe('generateTitleBar', () => {
    test('creates title bar rect', () => {
      const titleBar = generator.generateTitleBar(generator.config.window);
      expect(titleBar).toContain('<rect');
      expect(titleBar).toContain(`height="${generator.config.window.titleBar.height}"`);
    });

    test('includes window title text', () => {
      const titleBar = generator.generateTitleBar(generator.config.window);
      expect(titleBar).toContain('<text');
      expect(titleBar).toContain(generator.config.window.titleBar.title);
    });

    test('includes window control circles', () => {
      const titleBar = generator.generateTitleBar(generator.config.window);
      expect(titleBar).toContain('<circle');
      expect(titleBar).toContain('id="window-controls"');
    });
  });

  describe('config customization', () => {
    test('allows window dimension changes', () => {
      generator.config.window.width = 1200;
      generator.config.window.height = 800;

      const svg = generator.generateTerminal([]);
      expect(svg).toContain('width="1200"');
      expect(svg).toContain('height="800"');
    });

    test('allows title change', () => {
      generator.config.window.titleBar.title = 'Custom Title';

      const svg = generator.generateTerminal([]);
      expect(svg).toContain('Custom Title');
    });

    test('allows color changes', () => {
      generator.config.window.backgroundColor = '#123456';

      const svg = generator.generateTerminal([]);
      expect(svg).toContain('#123456');
    });
  });

  describe('scrolling behavior', () => {
    test('creates scroll frames when content exceeds viewport', () => {
      // Create many lines to trigger scrolling
      const sequences = [];
      for (let i = 0; i < 30; i++) {
        sequences.push({
          type: 'output',
          content: `Line ${i}`,
          color: '#ffffff',
          pause: 100
        });
      }

      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        10 // Small viewport
      );

      const scrollFrames = result.frames.filter(f => f.type === 'scroll');
      expect(scrollFrames.length).toBeGreaterThan(0);
    });

    test('scroll frames have scrollLines property', () => {
      const sequences = [];
      for (let i = 0; i < 30; i++) {
        sequences.push({
          type: 'output',
          content: `Line ${i}`,
          color: '#ffffff',
          pause: 100
        });
      }

      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        10
      );

      const scrollFrames = result.frames.filter(f => f.type === 'scroll');
      scrollFrames.forEach(frame => {
        expect(frame).toHaveProperty('scrollLines');
        expect(frame.scrollLines).toBeGreaterThan(0);
      });
    });
  });

  describe('multiline output', () => {
    test('splits multiline content into separate frames', () => {
      const sequences = [{
        type: 'output',
        content: 'Line 1\nLine 2\nLine 3',
        color: '#ffffff',
        pause: 100
      }];

      const result = generator.createAnimationFrames(
        sequences,
        generator.config.terminal,
        20
      );

      const outputFrames = result.frames.filter(f => f.type === 'add-output');
      expect(outputFrames.length).toBe(3);
    });
  });
});
