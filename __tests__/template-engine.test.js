/**
 * @fileoverview Tests for the Nunjucks template engine module.
 * @module tests/template-engine
 */

const path = require('path');
const { TerminalTemplateEngine, TemplateNotFoundError, TemplateRenderError } = require('../scripts/template-engine');

describe('TerminalTemplateEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new TerminalTemplateEngine();
  });

  describe('constructor', () => {
    it('should create engine with default template directory', () => {
      const defaultEngine = new TerminalTemplateEngine();
      expect(defaultEngine).toBeInstanceOf(TerminalTemplateEngine);
    });

    it('should create engine with custom template directory', () => {
      const customDir = path.join(__dirname, 'fixtures');
      const customEngine = new TerminalTemplateEngine(customDir);
      expect(customEngine).toBeInstanceOf(TerminalTemplateEngine);
    });

    it('should expose getEnvironment method', () => {
      expect(typeof engine.getEnvironment).toBe('function');
      expect(engine.getEnvironment()).toBeDefined();
    });
  });

  describe('renderString', () => {
    it('should render simple template string', () => {
      const result = engine.renderString('Hello {{ name }}!', { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should render template with variables', () => {
      const result = engine.renderString('{{ a }} + {{ b }} = {{ a + b }}', { a: 2, b: 3 });
      expect(result).toBe('2 + 3 = 5');
    });

    it('should render template with conditionals', () => {
      const template = '{% if show %}visible{% else %}hidden{% endif %}';
      expect(engine.renderString(template, { show: true })).toBe('visible');
      expect(engine.renderString(template, { show: false })).toBe('hidden');
    });

    it('should render template with loops', () => {
      const template = '{% for item in items %}{{ item }}{% endfor %}';
      const result = engine.renderString(template, { items: ['a', 'b', 'c'] });
      expect(result).toBe('abc');
    });

    it('should throw TemplateRenderError for invalid syntax', () => {
      expect(() => {
        engine.renderString('{{ unclosed');
      }).toThrow(TemplateRenderError);
    });

    it('should handle undefined variables gracefully', () => {
      const result = engine.renderString('Hello {{ name }}', {});
      expect(result).toBe('Hello ');
    });
  });

  describe('filters - box drawing', () => {
    it('should have box filter with double style', () => {
      const result = engine.renderString("{{ content | box('double') }}", { content: 'test' });
      expect(result).toContain('╔');
      expect(result).toContain('test');
      expect(result).toContain('╚');
    });

    it('should have doublebox filter', () => {
      const result = engine.renderString('{{ content | doublebox(20) }}', { content: 'test' });
      expect(result).toContain('╔');
      expect(result).toContain('test');
      expect(result).toContain('╚');
    });

    it('should have roundedbox filter', () => {
      const result = engine.renderString('{{ content | roundedbox(20) }}', { content: 'test' });
      expect(result).toContain('╭');
      expect(result).toContain('test');
      expect(result).toContain('╰');
    });

    it('should have titledbox filter', () => {
      const result = engine.renderString("{{ content | titledbox('Title', null, 30) }}", { content: 'test' });
      expect(result).toContain('Title');
      expect(result).toContain('test');
    });
  });

  describe('filters - text manipulation', () => {
    it('should center text', () => {
      const result = engine.renderString("{{ 'hi' | center(6) }}", {});
      expect(result).toBe('  hi  ');
    });

    it('should pad text left', () => {
      const result = engine.renderString("{{ 'hi' | pad(5, 'left') }}", {});
      expect(result).toBe('hi   ');
    });

    it('should pad text right', () => {
      const result = engine.renderString("{{ 'hi' | pad(5, 'right') }}", {});
      expect(result).toBe('   hi');
    });

    it('should truncate text', () => {
      const result = engine.renderString("{{ 'hello world' | truncate(8) }}", {});
      expect(result.length).toBeLessThanOrEqual(8);
    });

    it('should calculate display width', () => {
      const result = engine.renderString("{{ 'hello' | displaywidth }}", {});
      expect(result).toBe('5');
    });
  });

  describe('filters - styling markup', () => {
    it('should apply foreground color', () => {
      const result = engine.renderString("{{ 'text' | fg('green') }}", {});
      expect(result).toBe('[[fg:green]]text[[/fg]]');
    });

    it('should apply background color', () => {
      const result = engine.renderString("{{ 'text' | bg('blue') }}", {});
      expect(result).toBe('[[bg:blue]]text[[/bg]]');
    });

    it('should apply bold styling', () => {
      const result = engine.renderString("{{ 'text' | bold }}", {});
      expect(result).toBe('[[bold]]text[[/bold]]');
    });

    it('should apply dim styling', () => {
      const result = engine.renderString("{{ 'text' | dim }}", {});
      expect(result).toBe('[[dim]]text[[/dim]]');
    });

    it('should chain style filters', () => {
      const result = engine.renderString("{{ 'text' | fg('green') | bold }}", {});
      expect(result).toContain('[[fg:green]]');
      expect(result).toContain('[[bold]]');
    });
  });

  describe('filters - utility', () => {
    it('should repeat strings', () => {
      const result = engine.renderString("{{ '-' | repeat(5) }}", {});
      expect(result).toBe('-----');
    });

    it('should convert to JSON', () => {
      const result = engine.renderString('{{ obj | json }}', { obj: { a: 1 } });
      expect(result).toContain('"a"');
      expect(result).toContain('1');
    });
  });

  describe('globals', () => {
    it('should have BOX_STYLES available', () => {
      const result = engine.renderString('{{ BOX_STYLES.double.topLeft }}', {});
      expect(result).toBe('╔');
    });

    it('should have COLORS available', () => {
      const result = engine.renderString('{{ COLORS.GREEN }}', {});
      expect(result).toBeTruthy();
    });

    it('should have now() function', () => {
      const result = engine.renderString('{{ now().getFullYear() }}', {});
      expect(parseInt(result)).toBeGreaterThan(2020);
    });
  });

  describe('render', () => {
    it('should throw TemplateNotFoundError for missing template', () => {
      expect(() => {
        engine.render('nonexistent.njk', {});
      }).toThrow(TemplateNotFoundError);
    });

    it('should render base macros template', () => {
      // This tests that the macros file exists and is valid
      const result = engine.renderString(
        '{% from "base/macros.njk" import prompt %}{{ prompt() }}',
        {}
      );
      expect(result).toContain('william');
    });
  });

  describe('error handling', () => {
    it('should include cause in TemplateRenderError', () => {
      try {
        engine.renderString('{{ invalid.syntax.');
      } catch (error) {
        expect(error).toBeInstanceOf(TemplateRenderError);
        expect(error.cause).toBeDefined();
      }
    });

    it('should include template name in TemplateNotFoundError', () => {
      try {
        engine.render('missing.njk', {});
      } catch (error) {
        expect(error).toBeInstanceOf(TemplateNotFoundError);
        expect(error.message).toContain('missing.njk');
      }
    });
  });
});
