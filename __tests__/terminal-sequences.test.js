/**
 * @fileoverview Tests for the terminal sequences module.
 * @module tests/terminal-sequences
 */

const {
  buildDevOpsSequences,
  buildNetworkSequences,
  buildEasterEggSequences
} = require('../scripts/terminal-sequences');
const { DEFAULT_PROMPT, COLORS } = require('../scripts/constants');

describe('TerminalSequences', () => {
  const mockContent = {
    timestamp: 'Thu Jan 2 10:30 EST 2026',
    currentTime: new Date(2026, 0, 2, 10, 30, 0), // Jan 2, 2026
    joke: {
      q: 'Why do programmers prefer dark mode?',
      a: 'Because light attracts bugs!'
    },
    stats: {
      uptime: 44,
      daysAlive: 16001
    },
    gitLog: [
      { hash: 'abc1234', msg: 'feat: add new feature', time: '2h ago' },
      { hash: 'def5678', msg: 'fix: resolve bug', time: '5h ago' },
      { hash: 'ghi9012', msg: 'docs: update README', time: '1d ago' }
    ],
    dockerContainers: [
      { id: 'a1b2c3d4', image: 'nginx:latest', status: 'Up 2 days', ports: '80/tcp' },
      { id: 'e5f6g7h8', image: 'redis:alpine', status: 'Up 3 days', ports: '6379/tcp' }
    ],
    networkStats: {
      min_ms: '12.345',
      avg_ms: '15.678',
      max_ms: '20.123',
      mdev_ms: '2.456',
      packets_sent: 5,
      packets_received: 5,
      packet_loss: 0
    }
  };

  describe('buildDevOpsSequences', () => {
    it('returns array of 6 sequences', () => {
      const sequences = buildDevOpsSequences(mockContent);
      expect(sequences).toHaveLength(6);
    });

    it('has correct sequence types (3 commands, 3 outputs)', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const commands = sequences.filter(s => s.type === 'command');
      const outputs = sequences.filter(s => s.type === 'output');

      expect(commands).toHaveLength(3);
      expect(outputs).toHaveLength(3);
    });

    it('first command is git log', () => {
      const sequences = buildDevOpsSequences(mockContent);
      expect(sequences[0].type).toBe('command');
      expect(sequences[0].content).toBe('git log --oneline -5');
      expect(sequences[0].prompt).toBe(DEFAULT_PROMPT);
    });

    it('git log output contains commit info', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const gitOutput = sequences[1];

      expect(gitOutput.type).toBe('output');
      expect(gitOutput.content).toContain('abc1234');
      expect(gitOutput.content).toContain('feat: add new feature');
      expect(gitOutput.content).toContain('2h ago');
      expect(gitOutput.color).toBe(COLORS.YELLOW);
    });

    it('formats git commits with newlines', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const gitOutput = sequences[1].content;
      const lines = gitOutput.split('\n');

      expect(lines).toHaveLength(3);
    });

    it('second command is docker ps', () => {
      const sequences = buildDevOpsSequences(mockContent);
      expect(sequences[2].content).toContain('docker ps');
    });

    it('docker output contains container info', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const dockerOutput = sequences[3];

      expect(dockerOutput.content).toContain('CONTAINER ID');
      expect(dockerOutput.content).toContain('nginx:latest');
      expect(dockerOutput.content).toContain('redis:alpine');
      expect(dockerOutput.color).toBe(COLORS.CYAN);
    });

    it('docker rows are padded correctly', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const dockerOutput = sequences[3].content;

      // Image column should be padded to 20 chars
      expect(dockerOutput).toContain('nginx:latest');
      expect(dockerOutput).toContain('redis:alpine');
    });

    it('third command is sudo make sandwich', () => {
      const sequences = buildDevOpsSequences(mockContent);
      expect(sequences[4].content).toBe('sudo make me a sandwich');
    });

    it('sandwich output includes fun message', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const sandwichOutput = sequences[5];

      expect(sandwichOutput.content).toContain('sandwich');
      expect(sandwichOutput.content).toContain('successfully');
      expect(sandwichOutput.color).toBe(COLORS.GREEN);
    });

    it('all commands have typingDuration', () => {
      const sequences = buildDevOpsSequences(mockContent);
      const commands = sequences.filter(s => s.type === 'command');

      commands.forEach(cmd => {
        expect(typeof cmd.typingDuration).toBe('number');
        expect(cmd.typingDuration).toBeGreaterThan(0);
      });
    });

    it('all sequences have pause values', () => {
      const sequences = buildDevOpsSequences(mockContent);

      sequences.forEach(seq => {
        expect(typeof seq.pause).toBe('number');
        expect(seq.pause).toBeGreaterThan(0);
      });
    });
  });

  describe('buildNetworkSequences', () => {
    it('returns array of 6 sequences', () => {
      const sequences = buildNetworkSequences(mockContent);
      expect(sequences).toHaveLength(6);
    });

    it('has correct sequence types (3 commands, 3 outputs)', () => {
      const sequences = buildNetworkSequences(mockContent);
      const commands = sequences.filter(s => s.type === 'command');
      const outputs = sequences.filter(s => s.type === 'output');

      expect(commands).toHaveLength(3);
      expect(outputs).toHaveLength(3);
    });

    it('first command is a rotating ping joke', () => {
      const sequences = buildNetworkSequences(mockContent);
      // Should be one of the rotating ping jokes
      expect(sequences[0].content).toMatch(/^ping /);
    });

    it('ping output is humorous and has color', () => {
      const sequences = buildNetworkSequences(mockContent);
      const pingOutput = sequences[1];

      expect(pingOutput.type).toBe('output');
      expect(pingOutput.color).toBeDefined();
      // Should contain ping-like output format
      expect(pingOutput.content).toMatch(/PING|ping:|Request timeout/);
    });

    it('ping rotates deterministically based on date', () => {
      // Day 2 (Jan 2) mod 5 = 2, so should get 'ping production'
      const sequences = buildNetworkSequences(mockContent);
      expect(sequences[0].content).toBe('ping production');
      expect(sequences[1].content).toContain('probably');
    });

    it('second command is curl joke API', () => {
      const sequences = buildNetworkSequences(mockContent);
      expect(sequences[2].content).toContain('curl');
      expect(sequences[2].content).toContain('icanhazdadjoke');
    });

    it('curl output contains joke content', () => {
      const sequences = buildNetworkSequences(mockContent);
      const jokeOutput = sequences[3];

      expect(jokeOutput.content).toContain(mockContent.joke.q);
      expect(jokeOutput.content).toContain(mockContent.joke.a);
      expect(jokeOutput.color).toBe(COLORS.PINK);
    });

    it('third command is top', () => {
      const sequences = buildNetworkSequences(mockContent);
      expect(sequences[4].content).toBe('top -bn1 | head -8');
    });

    it('top output uses content stats', () => {
      const sequences = buildNetworkSequences(mockContent);
      const topOutput = sequences[5];

      expect(topOutput.content).toContain(`${mockContent.stats.uptime} years`);
      expect(topOutput.content).toContain('dad-joked');
      expect(topOutput.content).toContain('william');
      expect(topOutput.color).toBe(COLORS.WHITE);
    });

    it('top output extracts time from timestamp', () => {
      const sequences = buildNetworkSequences(mockContent);
      const topOutput = sequences[5].content;

      // Should contain time portion extracted from timestamp[11:16]
      // "Thu Jan 2 10:30 EST 2026"[11:16] = "0:30 "
      expect(topOutput).toContain('0:30');
    });
  });

  describe('buildEasterEggSequences', () => {
    it('returns array of 5 sequences', () => {
      const sequences = buildEasterEggSequences(mockContent);
      expect(sequences).toHaveLength(5);
    });

    it('has correct sequence types (2 commands, 3 outputs)', () => {
      const sequences = buildEasterEggSequences(mockContent);
      const commands = sequences.filter(s => s.type === 'command');
      const outputs = sequences.filter(s => s.type === 'output');

      expect(commands).toHaveLength(2);
      expect(outputs).toHaveLength(3);
    });

    it('first command is telnet Star Wars', () => {
      const sequences = buildEasterEggSequences(mockContent);
      expect(sequences[0].content).toBe('telnet towel.blinkenlights.nl');
    });

    it('telnet connection message is shown', () => {
      const sequences = buildEasterEggSequences(mockContent);
      const connectionOutput = sequences[1];

      expect(connectionOutput.content).toContain('Trying');
      expect(connectionOutput.content).toContain('Connected');
      expect(connectionOutput.color).toBe(COLORS.COMMENT);
    });

    it('Star Wars ASCII art is displayed', () => {
      const sequences = buildEasterEggSequences(mockContent);
      const asciiOutput = sequences[2];

      // ASCII art displays "SW" and letters separately
      expect(asciiOutput.content).toContain('SW');
      expect(asciiOutput.content).toContain('A New');
      expect(asciiOutput.content).toContain('Hope');
      expect(asciiOutput.content).toContain('Obi-Wan Kerneli');
      expect(asciiOutput.color).toBe(COLORS.ORANGE);
    });

    it('includes May the Source quote', () => {
      const sequences = buildEasterEggSequences(mockContent);
      const asciiOutput = sequences[2].content;

      expect(asciiOutput).toContain('May the Source be with you');
    });

    it('echo command confirms easter egg', () => {
      const sequences = buildEasterEggSequences(mockContent);
      expect(sequences[3].content).toContain('Easter egg found');
    });

    it('final output shows success', () => {
      const sequences = buildEasterEggSequences(mockContent);
      const finalOutput = sequences[4];

      expect(finalOutput.content).toContain('Easter egg found');
      expect(finalOutput.color).toBe(COLORS.GREEN);
    });

    it('all commands use DEFAULT_PROMPT', () => {
      const sequences = buildEasterEggSequences(mockContent);
      const commands = sequences.filter(s => s.type === 'command');

      commands.forEach(cmd => {
        expect(cmd.prompt).toBe(DEFAULT_PROMPT);
      });
    });

    it('all sequences have timing values', () => {
      const sequences = buildEasterEggSequences(mockContent);

      sequences.forEach(seq => {
        expect(typeof seq.pause).toBe('number');
        if (seq.type === 'command') {
          expect(typeof seq.typingDuration).toBe('number');
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty gitLog array', () => {
      const emptyGitContent = { ...mockContent, gitLog: [] };
      const sequences = buildDevOpsSequences(emptyGitContent);

      expect(sequences[1].content).toBe('');
    });

    it('handles empty dockerContainers array', () => {
      const emptyDockerContent = { ...mockContent, dockerContainers: [] };
      const sequences = buildDevOpsSequences(emptyDockerContent);

      expect(sequences[3].content).toContain('CONTAINER ID');
      // Should still have header, just no rows
    });

    it('ping jokes rotate through all 5 options', () => {
      const pingCommands = [];
      for (let day = 1; day <= 5; day++) {
        const content = {
          ...mockContent,
          currentTime: new Date(2026, 0, day) // Jan 1-5
        };
        const sequences = buildNetworkSequences(content);
        pingCommands.push(sequences[0].content);
      }

      // Should have 5 different ping commands (one per day)
      const uniqueCommands = new Set(pingCommands);
      expect(uniqueCommands.size).toBe(5);
    });

    it('same day always returns same ping joke', () => {
      const content1 = { ...mockContent, currentTime: new Date(2026, 0, 15) };
      const content2 = { ...mockContent, currentTime: new Date(2026, 0, 15) };

      const seq1 = buildNetworkSequences(content1);
      const seq2 = buildNetworkSequences(content2);

      expect(seq1[0].content).toBe(seq2[0].content);
      expect(seq1[1].content).toBe(seq2[1].content);
    });
  });
});
