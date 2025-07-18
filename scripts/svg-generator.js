const axios = require('axios');

class SVGGenerator {
  constructor() {
    this.baseUrl = 'https://readme-typing-svg.herokuapp.com';
    this.defaultConfig = {
      font: 'Fira Code',
      weight: 400,
      size: 16,
      duration: 2000,
      pause: 1000,
      color: '36BCF7',
      background: '00000000',
      vCenter: false,
      multiline: false,
      width: 500,
      height: 50
    };
  }

  async generateSVG(sections) {
    if (!Array.isArray(sections) || sections.length === 0) {
      throw new Error('Sections must be a non-empty array');
    }

    try {
      const svgContent = await this.createAnimatedSVG(sections);
      return svgContent;
    } catch (error) {
      throw new Error(`Failed to generate SVG: ${error.message}`);
    }
  }

  async createAnimatedSVG(sections) {
    const lines = [];
    
    for (const section of sections) {
      const config = { ...this.defaultConfig, ...section };
      
      // Add heading if present
      if (config.heading) {
        lines.push(config.heading);
      }
      
      // Add content
      if (config.content) {
        lines.push(config.content);
      }
    }

    const params = this.buildParams(sections[0], lines);
    const svgContent = await this.fetchSVG(params);
    
    return svgContent;
  }

  buildParams(config, lines) {
    const mergedConfig = { ...this.defaultConfig, ...config };
    
    // Remove color hash if present
    const color = mergedConfig.color.replace('#', '');
    const background = mergedConfig.background.replace('#', '');
    
    const params = new URLSearchParams({
      font: mergedConfig.font,
      weight: mergedConfig.weight,
      size: mergedConfig.size,
      duration: mergedConfig.duration,
      pause: mergedConfig.pause,
      color: color,
      background: background,
      center: mergedConfig.vCenter.toString(),
      vCenter: mergedConfig.vCenter.toString(),
      multiline: mergedConfig.multiline.toString(),
      width: mergedConfig.width,
      height: mergedConfig.height * lines.length, // Adjust height for multiple lines
      lines: lines.join(';')
    });

    return params;
  }

  async fetchSVG(params, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(this.baseUrl, {
          params,
          timeout: 10000,
          headers: {
            'User-Agent': 'GitHub-Terminal-SVG-Generator/1.0'
          }
        });

        if (response.status === 200 && response.data) {
          return response.data;
        }

        throw new Error(`Invalid response: status ${response.status}`);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        await this.sleep(delay);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SVGGenerator;