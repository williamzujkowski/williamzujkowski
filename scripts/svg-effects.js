/**
 * SVG visual effects for terminal generation.
 * Includes filters, patterns, and defs for CRT-style terminal appearance.
 * Extracted from advanced-terminal-generator.js per coding standards (≤400 lines).
 * @module svg-effects
 */

/**
 * Generates SVG defs section with patterns.
 * @returns {string} SVG pattern definitions
 */
function generateDefs() {
  return `
    <!-- Terminal scanline effect -->
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="2">
      <rect width="1" height="1" fill="transparent"/>
      <rect y="1" width="1" height="1" fill="rgba(255,255,255,0.02)"/>
    </pattern>`;
}

/**
 * Generates SVG filter definitions for visual effects.
 * Includes text glow, window shadow, and CRT scanline effects.
 * @returns {string} SVG filter definitions
 */
function generateFilters() {
  return `
    <!-- 3-Layer Phosphor Glow Filter -->
    <filter id="textGlow" x="-50%" y="-50%" width="200%" height="200%">
      <!-- Layer 1: Core glow (tight) -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.2" result="coreBlur"/>

      <!-- Layer 2: Medium glow with green phosphor tint -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="mediumBlur"/>
      <feColorMatrix in="mediumBlur" type="matrix" result="greenGlow"
        values="0 0 0 0 0
                0 1 0 0 0.3
                0 0 0 0 0
                0 0 0 1 0"/>

      <!-- Layer 3: Outer halo (subtle) -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="outerBlur"/>

      <!-- Composite all layers with screen blend mode -->
      <feBlend in="coreBlur" in2="greenGlow" mode="screen" result="layer12"/>
      <feBlend in="layer12" in2="outerBlur" mode="screen" result="allLayers"/>

      <!-- Merge with original text on top -->
      <feMerge>
        <feMergeNode in="allLayers"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Window shadow with depth -->
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="15"/>
      <feOffset dx="0" dy="15" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.8"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- CRT scanline effect -->
    <filter id="crt">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.8" numOctaves="1" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="desaturatedNoise"/>
      <feComponentTransfer in="desaturatedNoise" result="theNoise">
        <feFuncA type="table" tableValues="0 0 0.05 0"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="theNoise" mode="screen"/>
    </filter>`;
}

module.exports = {
  generateDefs,
  generateFilters
};
