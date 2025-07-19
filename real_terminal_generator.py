#!/usr/bin/env python3
"""
Real Terminal SVG Generator - With proper cursor mechanics
"""

import json
import html
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class TerminalConfig:
    """Terminal configuration settings"""
    width: int = 800
    height: int = 600
    title: str = "Terminal"
    font_size: int = 14
    font_family: str = "Ubuntu Mono, Consolas, Monaco, 'Courier New', monospace"
    line_height: float = 1.4
    padding: int = 10
    prompt: str = "$ "
    background_color: str = "#300a24"
    text_color: str = "#ffffff"
    prompt_color: str = "#87d75f"
    cursor_color: str = "#ffffff"
    char_width: float = 8.4
    typing_speed_min: int = 30
    typing_speed_max: int = 100
    typing_speed_avg: int = 60


class RealTerminalSVGGenerator:
    """Generate animated terminal SVG with proper cursor mechanics"""
    
    def __init__(self, config_data: Dict):
        """Initialize generator with configuration"""
        self.config_data = config_data
        self.config = self._parse_config(config_data.get('config', {}))
        self.sequences = config_data.get('sequences', [])
        
    def _parse_config(self, config: Dict) -> TerminalConfig:
        """Parse configuration into TerminalConfig object"""
        tc = TerminalConfig()
        
        # Window settings
        window = config.get('window', {})
        tc.width = window.get('width', tc.width)
        tc.height = window.get('height', tc.height)
        tc.title = window.get('title', tc.title)
        
        # Terminal settings
        terminal = config.get('terminal', {})
        tc.font_size = terminal.get('fontSize', tc.font_size)
        tc.font_family = terminal.get('fontFamily', tc.font_family)
        tc.line_height = terminal.get('lineHeight', tc.line_height)
        tc.padding = terminal.get('padding', tc.padding)
        tc.prompt = terminal.get('prompt', tc.prompt)
        
        # Animation settings
        animation = config.get('animation', {})
        typing = animation.get('typingSpeed', {})
        tc.typing_speed_min = typing.get('min', tc.typing_speed_min)
        tc.typing_speed_max = typing.get('max', tc.typing_speed_max)
        tc.typing_speed_avg = typing.get('avg', tc.typing_speed_avg)
        
        # Colors
        colors = config.get('colors', {})
        tc.background_color = colors.get('background', tc.background_color)
        tc.text_color = colors.get('text', tc.text_color)
        tc.prompt_color = colors.get('prompt', tc.prompt_color)
        tc.cursor_color = colors.get('cursor', tc.cursor_color)
        
        return tc
    
    def generate(self) -> str:
        """Generate the complete SVG animation"""
        return f'''<svg width="{self.config.width}" height="{self.config.height}" 
     xmlns="http://www.w3.org/2000/svg">
    <defs>
        {self._generate_defs()}
    </defs>
    
    <!-- Window -->
    <rect width="{self.config.width}" height="{self.config.height}" 
          rx="8" ry="8" fill="{self.config.background_color}"/>
    
    <!-- Title bar -->
    <rect width="{self.config.width}" height="40" rx="8" ry="8" fill="#2b2b2b"/>
    <rect y="20" width="{self.config.width}" height="20" fill="#2b2b2b"/>
    
    <!-- Window controls -->
    <circle cx="20" cy="20" r="6" fill="#ff5f56"/>
    <circle cx="40" cy="20" r="6" fill="#ffbd2e"/>
    <circle cx="60" cy="20" r="6" fill="#27c93f"/>
    
    <!-- Title -->
    <text x="{self.config.width / 2}" y="25" font-family="{self.config.font_family}" 
          font-size="13" fill="#cccccc" text-anchor="middle">{self.config.title}</text>
    
    <!-- Terminal viewport -->
    <g clip-path="url(#terminalViewport)">
        <rect y="40" width="{self.config.width}" 
              height="{self.config.height - 40}" fill="{self.config.background_color}"/>
        
        <!-- Terminal content area -->
        <g id="terminal-content" transform="translate({self.config.padding}, {40 + self.config.padding})">
            <!-- Dynamic content will be added here by JavaScript -->
        </g>
        
        <!-- Cursor - always present but moves -->
        <rect id="cursor" x="{self.config.padding}" y="{40 + self.config.padding}" 
              width="{self.config.char_width}" height="{self.config.font_size}" 
              fill="{self.config.cursor_color}">
            <animate attributeName="opacity" values="1;1;0;0" 
                     dur="1000ms" repeatCount="indefinite"/>
        </rect>
    </g>
    
    <!-- JavaScript animation engine -->
    <script type="text/javascript"><![CDATA[
{self._generate_animation_engine()}
    ]]></script>
</svg>'''
    
    def _generate_defs(self) -> str:
        """Generate SVG definitions"""
        return f'''
        <!-- Viewport clipping -->
        <clipPath id="terminalViewport">
            <rect x="0" y="40" width="{self.config.width}" 
                  height="{self.config.height - 40}"/>
        </clipPath>
        
        <!-- Text glow filter -->
        <filter id="textGlow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>'''
    
    def _generate_animation_engine(self) -> str:
        """Generate the JavaScript animation engine"""
        # Escape the config for JavaScript
        config_json = json.dumps({
            'fontSize': self.config.font_size,
            'fontFamily': self.config.font_family,
            'lineHeight': self.config.font_size * self.config.line_height,
            'charWidth': self.config.char_width,
            'padding': self.config.padding,
            'promptColor': self.config.prompt_color,
            'textColor': self.config.text_color,
            'typingSpeedMin': self.config.typing_speed_min,
            'typingSpeedMax': self.config.typing_speed_max,
            'typingSpeedAvg': self.config.typing_speed_avg,
            'viewportHeight': self.config.height - 40 - (self.config.padding * 2)
        })
        
        sequences_json = json.dumps(self.sequences)
        
        return f'''
// Terminal animation engine
(function() {{
    'use strict';
    
    // Configuration
    const config = {config_json};
    const sequences = {sequences_json};
    
    // Terminal state
    const terminal = {{
        lines: [],           // Array of completed lines
        currentLine: null,   // Current line element being typed
        currentText: '',     // Current line text
        cursorX: 0,          // Cursor position in characters
        cursorY: 0,          // Cursor position in lines
        totalHeight: 0,      // Total height of content
        scrollOffset: 0,     // Current scroll offset
        isTyping: false,     // Currently typing flag
        sequenceIndex: 0,    // Current sequence being processed
        startTime: Date.now()
    }};
    
    // Get DOM elements
    const contentGroup = document.getElementById('terminal-content');
    const cursor = document.getElementById('cursor');
    
    // Utility functions
    function sleep(ms) {{
        return new Promise(resolve => setTimeout(resolve, ms));
    }}
    
    function getTypingSpeed() {{
        const r = Math.random();
        if (r < 0.1) {{
            // 10% chance of pause
            return Math.floor(Math.random() * (500 - 200) + 200);
        }} else if (r < 0.3) {{
            // 20% chance of slow
            return Math.floor(Math.random() * (config.typingSpeedMax - config.typingSpeedAvg) + config.typingSpeedAvg);
        }} else {{
            // 70% normal speed
            return Math.floor(Math.random() * (config.typingSpeedAvg - config.typingSpeedMin) + config.typingSpeedMin);
        }}
    }}
    
    // Create a new text line element
    function createLineElement(y, color) {{
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '0');
        text.setAttribute('y', String(y + config.fontSize));
        text.setAttribute('font-family', config.fontFamily);
        text.setAttribute('font-size', String(config.fontSize));
        text.setAttribute('fill', color || config.textColor);
        text.setAttribute('filter', 'url(#textGlow)');
        return text;
    }}
    
    // Update cursor position
    function updateCursor(x, y) {{
        cursor.setAttribute('x', String(config.padding + x));
        cursor.setAttribute('y', String(40 + config.padding + y));
    }}
    
    // Type a single character
    async function typeCharacter(char) {{
        if (!terminal.currentLine) {{
            terminal.currentLine = createLineElement(terminal.cursorY * config.lineHeight, config.textColor);
            contentGroup.appendChild(terminal.currentLine);
        }}
        
        terminal.currentText += char;
        terminal.currentLine.textContent = terminal.currentText;
        terminal.cursorX++;
        
        updateCursor(terminal.cursorX * config.charWidth, terminal.cursorY * config.lineHeight);
        
        await sleep(getTypingSpeed());
    }}
    
    // Type a complete string
    async function typeText(text, color) {{
        terminal.currentLine = createLineElement(terminal.cursorY * config.lineHeight, color);
        contentGroup.appendChild(terminal.currentLine);
        terminal.currentText = '';
        terminal.cursorX = 0;
        
        for (let i = 0; i < text.length; i++) {{
            terminal.currentText = text.substring(0, i + 1);
            terminal.currentLine.textContent = terminal.currentText;
            terminal.cursorX = i + 1;
            
            updateCursor(terminal.cursorX * config.charWidth, terminal.cursorY * config.lineHeight);
            
            await sleep(getTypingSpeed());
        }}
    }}
    
    // Print a line instantly (for output)
    async function printLine(text, color) {{
        const line = createLineElement(terminal.cursorY * config.lineHeight, color);
        line.textContent = text;
        contentGroup.appendChild(line);
        
        terminal.lines.push(line);
        terminal.currentLine = null;
        terminal.currentText = '';
        terminal.cursorX = 0;
        terminal.cursorY++;
        
        // Check if we need to scroll
        await checkScroll();
        
        updateCursor(0, terminal.cursorY * config.lineHeight);
        
        await sleep(20); // Small delay between output lines
    }}
    
    // Move to next line
    async function newLine() {{
        if (terminal.currentLine) {{
            terminal.lines.push(terminal.currentLine);
        }}
        
        terminal.currentLine = null;
        terminal.currentText = '';
        terminal.cursorX = 0;
        terminal.cursorY++;
        
        await checkScroll();
        
        updateCursor(0, terminal.cursorY * config.lineHeight);
    }}
    
    // Check and perform scrolling if needed
    async function checkScroll() {{
        const visibleLines = Math.floor(config.viewportHeight / config.lineHeight);
        
        if (terminal.cursorY >= visibleLines) {{
            // Need to scroll
            terminal.scrollOffset += config.lineHeight;
            
            // Animate the scroll
            const currentTransform = contentGroup.getAttribute('transform');
            const newTransform = `translate(${{config.padding}}, ${{40 + config.padding - terminal.scrollOffset}})`;
            
            // Simple scroll animation
            contentGroup.setAttribute('transform', newTransform);
            
            await sleep(150); // Scroll animation time
        }}
    }}
    
    // Process a command sequence
    async function processCommand(sequence) {{
        const prompt = sequence.prompt || '$ ';
        const command = sequence.content || '';
        
        // Type prompt instantly
        terminal.currentLine = createLineElement(terminal.cursorY * config.lineHeight, config.promptColor);
        terminal.currentLine.textContent = prompt;
        contentGroup.appendChild(terminal.currentLine);
        terminal.currentText = prompt;
        terminal.cursorX = prompt.length;
        
        updateCursor(terminal.cursorX * config.charWidth, terminal.cursorY * config.lineHeight);
        
        // Type command character by character
        for (let i = 0; i < command.length; i++) {{
            terminal.currentText += command[i];
            terminal.currentLine.textContent = terminal.currentText;
            terminal.cursorX++;
            
            updateCursor(terminal.cursorX * config.charWidth, terminal.cursorY * config.lineHeight);
            
            await sleep(getTypingSpeed());
        }}
        
        // Move to next line after command
        await newLine();
        
        // Process output if present
        if (sequence.output) {{
            await sleep(200); // Small delay before output
            
            const outputLines = sequence.output.content.split('\\n');
            const outputColor = sequence.output.color || config.textColor;
            
            for (const line of outputLines) {{
                await printLine(line, outputColor);
            }}
        }}
    }}
    
    // Process all sequences
    async function processSequences() {{
        for (const sequence of sequences) {{
            // Add initial delay if specified
            if (sequence.delay) {{
                await sleep(sequence.delay);
            }}
            
            // Process based on type
            switch (sequence.type) {{
                case 'command':
                    await processCommand(sequence);
                    break;
                    
                case 'text':
                case 'output':
                    const lines = sequence.content.split('\\n');
                    const color = sequence.color || config.textColor;
                    for (const line of lines) {{
                        await printLine(line, color);
                    }}
                    break;
                    
                case 'ascii':
                    const asciiLines = sequence.content.split('\\n');
                    const asciiColor = sequence.color || config.textColor;
                    for (const line of asciiLines) {{
                        await printLine(line, asciiColor);
                    }}
                    break;
            }}
            
            // Pause after sequence
            const pause = sequence.pause || 600;
            await sleep(pause);
        }}
    }}
    
    // Start the animation
    setTimeout(() => {{
        processSequences().catch(console.error);
    }}, 100);
}})();
'''


def main():
    """CLI interface for the generator"""
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description='Generate real terminal SVG animation')
    parser.add_argument('input', help='Input JSON file')
    parser.add_argument('-o', '--output', help='Output SVG file (default: stdout)')
    
    args = parser.parse_args()
    
    try:
        # Load JSON configuration
        with open(args.input, 'r') as f:
            config_data = json.load(f)
        
        # Generate SVG
        generator = RealTerminalSVGGenerator(config_data)
        svg = generator.generate()
        
        # Output
        if args.output:
            with open(args.output, 'w') as f:
                f.write(svg)
            print(f"Generated SVG written to {args.output}")
        else:
            print(svg)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()