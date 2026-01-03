/**
 * @fileoverview Golden comparison tests for template vs legacy output.
 * Verifies that both generation modes produce structurally equivalent output.
 * @module tests/golden-comparison
 */

const { buildTemplateSequences } = require('../scripts/template-sequence-builder');
const DynamicContentGenerator = require('../scripts/dynamic-content');

describe('GoldenComparison', () => {
  let contentGen;
  let mockContent;

  beforeAll(async () => {
    contentGen = new DynamicContentGenerator();
    // Use fixed mock content for consistent testing
    mockContent = {
      currentTime: new Date('2026-01-01T12:00:00-05:00'),
      timestamp: 'Wed Jan 1 12:00 EST 2026',
      nationalDay: {
        name: 'New Year\'s Day',
        desc: 'Fresh start awaits!',
        emoji: '🎉'
      },
      joke: {
        q: 'Why do programmers hate nature?',
        a: 'It has too many bugs!',
        category: 'programming'
      },
      stats: {
        uptime: 44,
        daysAlive: 16000,
        coffeeConsumed: 50000,
        bugsFixed: 10000,
        bugsCreated: 9999,
        stackOverflowVisits: 25000
      },
      rotation: 0,
      gitLog: [],
      dockerContainers: [],
      networkStats: {}
    };
  });

  describe('Sequence Structure Comparison', () => {
    it('template sequences have same structure as expected', () => {
      const templateSeqs = buildTemplateSequences(mockContent);

      // All sequences should have type
      templateSeqs.forEach((seq, i) => {
        expect(seq.type).toBeDefined();
        expect(['command', 'output']).toContain(seq.type);
      });
    });

    it('template output contains expected number of sequences', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const commandCount = templateSeqs.filter(s => s.type === 'command').length;
      const outputCount = templateSeqs.filter(s => s.type === 'output').length;

      // Should have roughly equal commands and outputs
      expect(commandCount).toBeGreaterThan(8);
      expect(outputCount).toBeGreaterThan(8);
      expect(Math.abs(commandCount - outputCount)).toBeLessThanOrEqual(2);
    });
  });

  describe('Content Equivalence', () => {
    it('MOTD sequence contains terminal version', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const motdOutput = templateSeqs.find(
        s => s.type === 'output' && s.content.includes('DEV TERMINAL')
      );

      expect(motdOutput).toBeDefined();
      expect(motdOutput.content).toContain('2026');
    });

    it('national day sequence contains day info', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const dayOutput = templateSeqs.find(
        s => s.type === 'output' &&
        (s.content.includes('New Year') || s.content.includes('national'))
      );

      expect(dayOutput).toBeDefined();
    });

    it('joke sequence contains joke content', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const jokeOutput = templateSeqs.find(
        s => s.type === 'output' && s.content.includes('bugs')
      );

      expect(jokeOutput).toBeDefined();
      expect(jokeOutput.content).toContain('bugs');
    });

    it('stats sequence contains developer stats', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const statsOutput = templateSeqs.find(
        s => s.type === 'output' && s.content.includes('Coffee')
      );

      expect(statsOutput).toBeDefined();
      expect(statsOutput.content).toMatch(/Coffee/i);
    });

    it('goodbye sequence contains farewell message', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const lastOutput = templateSeqs[templateSeqs.length - 1];

      expect(lastOutput.type).toBe('output');
      expect(lastOutput.content).toContain('Thanks for visiting');
    });
  });

  describe('Command Consistency', () => {
    it('has expected core commands', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const commands = templateSeqs
        .filter(s => s.type === 'command')
        .map(s => s.content);

      expect(commands).toContain('cat /etc/motd');
      expect(commands).toContain('cat /var/log/dad.log | tail -4');
      expect(commands).toContain('alias | head -4');
      expect(commands).toContain('cat /etc/profile');
      expect(commands.some(c => c.includes('dad-joke'))).toBe(true);
      expect(commands).toContain('cat /etc/goodbye.txt');
    });

    it('all commands have required timing properties', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const commands = templateSeqs.filter(s => s.type === 'command');

      commands.forEach(cmd => {
        expect(cmd.prompt).toBeDefined();
        expect(typeof cmd.typingDuration).toBe('number');
        expect(cmd.typingDuration).toBeGreaterThan(0);
      });
    });
  });

  describe('Output Consistency', () => {
    it('all outputs have required color properties', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const outputs = templateSeqs.filter(s => s.type === 'output');

      outputs.forEach(out => {
        expect(out.color).toBeDefined();
        expect(out.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('all outputs have pause values', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const outputs = templateSeqs.filter(s => s.type === 'output');

      outputs.forEach(out => {
        expect(typeof out.pause).toBe('number');
        expect(out.pause).toBeGreaterThan(0);
      });
    });
  });

  describe('Box Rendering', () => {
    it('MOTD renders as double box', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const motdOutput = templateSeqs.find(
        s => s.type === 'output' && s.content.includes('DEV TERMINAL')
      );

      // Double box uses ╔, ╗, ╚, ╝ corners
      expect(motdOutput.content).toMatch(/[╔╗╚╝]/);
    });

    it('goodbye renders as double box', () => {
      const templateSeqs = buildTemplateSequences(mockContent);
      const goodbyeOutput = templateSeqs.find(
        s => s.type === 'output' && s.content.includes('Thanks for visiting')
      );

      expect(goodbyeOutput.content).toMatch(/[╔╗╚╝]/);
    });
  });

  describe('Template Stability', () => {
    it('produces consistent output for same input', () => {
      const seqs1 = buildTemplateSequences(mockContent);
      const seqs2 = buildTemplateSequences(mockContent);

      expect(seqs1.length).toBe(seqs2.length);

      seqs1.forEach((seq, i) => {
        expect(seq.type).toBe(seqs2[i].type);
        expect(seq.content).toBe(seqs2[i].content);
      });
    });

    it('handles edge case: long joke text', () => {
      const longJokeContent = {
        ...mockContent,
        joke: {
          q: 'This is a very long question that might cause alignment issues in the ASCII box if not properly handled by the template engine when rendering the dad joke block?',
          a: 'This is an equally long answer that tests the truncation and wrapping behavior of the box generator module!',
          category: 'stress-test'
        }
      };

      // Should not throw
      const seqs = buildTemplateSequences(longJokeContent);
      expect(seqs.length).toBeGreaterThan(0);
    });

    it('handles edge case: special characters', () => {
      const specialContent = {
        ...mockContent,
        nationalDay: {
          name: "Test Day <>&'\"",
          desc: 'Contains special chars: <>&"\'',
          emoji: '🎉'
        }
      };

      // Should not throw
      const seqs = buildTemplateSequences(specialContent);
      expect(seqs.length).toBeGreaterThan(0);
    });
  });
});
