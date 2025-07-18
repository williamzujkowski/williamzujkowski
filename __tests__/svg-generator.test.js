const SVGGenerator = require('../scripts/svg-generator');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('SVGGenerator', () => {
  let generator;
  
  beforeEach(() => {
    generator = new SVGGenerator();
    jest.clearAllMocks();
  });

  describe('generateSVG', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        status: 200,
        data: '<svg>Mock SVG Content</svg>'
      });
    });

    it('should generate SVG for valid sections', async () => {
      const sections = [
        {
          heading: "$ test",
          content: "Test content"
        }
      ];
      
      const svg = await generator.generateSVG(sections);
      expect(svg).toContain('<svg>');
      expect(axios.get).toHaveBeenCalled();
    });

    it('should throw error for empty sections', async () => {
      await expect(generator.generateSVG([])).rejects.toThrow('Sections must be a non-empty array');
    });

    it('should throw error for non-array input', async () => {
      await expect(generator.generateSVG('not an array')).rejects.toThrow('Sections must be a non-empty array');
    });

    it('should handle API errors', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      
      const sections = [{heading: "$ test", content: "Test"}];
      await expect(generator.generateSVG(sections)).rejects.toThrow('Failed to generate SVG: Network error');
    });
  });

  describe('buildParams', () => {
    it('should build correct parameters', () => {
      const config = {
        heading: "$ test",
        content: "Test content",
        color: "#00ff00",
        size: 20
      };
      const lines = ["$ test", "Test content"];
      
      const params = generator.buildParams(config, lines);
      
      expect(params.get('color')).toBe('00ff00');
      expect(params.get('size')).toBe('20');
      expect(params.get('lines')).toBe('$ test;Test content');
    });

    it('should use default values for missing properties', () => {
      const config = {};
      const lines = ["Test"];
      
      const params = generator.buildParams(config, lines);
      
      expect(params.get('font')).toBe('Fira Code');
      expect(params.get('size')).toBe('16');
      expect(params.get('duration')).toBe('2000');
    });

    it('should handle color without hash', () => {
      const config = { color: "36BCF7" };
      const lines = ["Test"];
      
      const params = generator.buildParams(config, lines);
      expect(params.get('color')).toBe('36BCF7');
    });
  });

  describe('fetchSVG', () => {
    it('should retry on failure', async () => {
      axios.get
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({ status: 200, data: '<svg>Success</svg>' });
      
      const params = new URLSearchParams({ test: 'value' });
      const result = await generator.fetchSVG(params, 2);
      
      expect(result).toBe('<svg>Success</svg>');
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      axios.get.mockRejectedValue(new Error('API error'));
      
      const params = new URLSearchParams({ test: 'value' });
      await expect(generator.fetchSVG(params, 2)).rejects.toThrow('API error');
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it('should handle non-200 status codes', async () => {
      axios.get.mockResolvedValue({ status: 404, data: null });
      
      const params = new URLSearchParams({ test: 'value' });
      await expect(generator.fetchSVG(params, 1)).rejects.toThrow('Invalid response: status 404');
    });
  });

  describe('createAnimatedSVG', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        status: 200,
        data: '<svg>Animated SVG</svg>'
      });
    });

    it('should combine multiple sections', async () => {
      const sections = [
        { heading: "$ cmd1", content: "Output 1" },
        { heading: "$ cmd2", content: "Output 2" }
      ];
      
      const svg = await generator.createAnimatedSVG(sections);
      expect(svg).toContain('<svg>');
      
      const params = axios.get.mock.calls[0][1].params;
      expect(params.get('lines')).toContain('$ cmd1');
      expect(params.get('lines')).toContain('Output 1');
      expect(params.get('lines')).toContain('$ cmd2');
      expect(params.get('lines')).toContain('Output 2');
    });

    it('should handle sections without heading', async () => {
      const sections = [
        { content: "Just content" }
      ];
      
      await generator.createAnimatedSVG(sections);
      
      const params = axios.get.mock.calls[0][1].params;
      expect(params.get('lines')).toBe('Just content');
    });
  });

  describe('sleep', () => {
    it('should delay for specified milliseconds', async () => {
      const start = Date.now();
      await generator.sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some margin
      expect(end - start).toBeLessThan(150);
    });
  });
});