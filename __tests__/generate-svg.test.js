const main = require('../scripts/generate-svg');
const ConfigReader = require('../scripts/config-reader');
const SchemaValidator = require('../scripts/schema-validator');
const SVGGenerator = require('../scripts/svg-generator');
const fs = require('fs');
const path = require('path');

// Mock the modules
jest.mock('../scripts/config-reader');
jest.mock('../scripts/schema-validator');
jest.mock('../scripts/svg-generator');

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation()
};

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit called with "${code}"`);
});

describe('generate-svg main script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default mocks
    ConfigReader.mockImplementation(() => ({
      read: jest.fn().mockResolvedValue([
        { heading: "$ test", content: "Test content" }
      ])
    }));
    
    SchemaValidator.mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(),
      validate: jest.fn().mockReturnValue({ valid: true, errors: [] })
    }));
    
    SVGGenerator.mockImplementation(() => ({
      generateSVG: jest.fn().mockResolvedValue('<svg>Generated SVG</svg>')
    }));
    
    // Mock fs operations
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'mkdirSync').mockImplementation();
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully generate SVG with valid configuration', async () => {
    await expect(main()).rejects.toThrow('process.exit called with "0"');
    
    expect(consoleSpy.log).toHaveBeenCalledWith('🚀 Starting SVG generation...');
    expect(consoleSpy.log).toHaveBeenCalledWith('✨ Configuration is valid!');
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('✅ SVG generated successfully'));
    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('should exit with code 1 for validation errors', async () => {
    SchemaValidator.mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(),
      validate: jest.fn().mockReturnValue({
        valid: false,
        errors: [
          { path: '/0', message: 'Missing required property: heading' }
        ]
      })
    }));

    await expect(main()).rejects.toThrow('process.exit called with "1"');
    
    expect(consoleSpy.error).toHaveBeenCalledWith('❌ Configuration validation failed:');
    expect(consoleSpy.error).toHaveBeenCalledWith('   - /0: Missing required property: heading');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should exit with code 2 for SVG generation errors', async () => {
    SVGGenerator.mockImplementation(() => ({
      generateSVG: jest.fn().mockRejectedValue(new Error('Failed to generate SVG: API error'))
    }));

    await expect(main()).rejects.toThrow('process.exit called with "2"');
    
    expect(consoleSpy.error).toHaveBeenCalledWith('❌ Error:', 'Failed to generate SVG: API error');
    expect(mockExit).toHaveBeenCalledWith(2);
  });

  it('should exit with code 3 for file system errors', async () => {
    ConfigReader.mockImplementation(() => ({
      read: jest.fn().mockRejectedValue(new Error('Configuration file not found'))
    }));

    await expect(main()).rejects.toThrow('process.exit called with "3"');
    
    expect(consoleSpy.error).toHaveBeenCalledWith('❌ Error:', 'Configuration file not found');
    expect(mockExit).toHaveBeenCalledWith(3);
  });

  it('should create output directory if it does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(main()).rejects.toThrow('process.exit called with "0"');
    
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('src'),
      { recursive: true }
    );
  });

  it('should write SVG content to file', async () => {
    const mockSVGContent = '<svg>Test SVG</svg>';
    SVGGenerator.mockImplementation(() => ({
      generateSVG: jest.fn().mockResolvedValue(mockSVGContent)
    }));

    await expect(main()).rejects.toThrow('process.exit called with "0"');
    
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('terminal.svg'),
      mockSVGContent,
      'utf-8'
    );
  });
});