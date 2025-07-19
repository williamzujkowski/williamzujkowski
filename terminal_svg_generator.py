#!/usr/bin/env python3
"""
Terminal SVG Generator - Convert JSON configuration to animated terminal SVG
"""

import json
import math
import random
import html
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from xml.etree import ElementTree as ET


@dataclass
class TerminalConfig:
    """Terminal configuration settings"""
    width: int = 800
    height: int = 600
    title: str = "Terminal"
    theme: str = "dark"
    font_size: int = 14
    font_family: str = "Consolas, Monaco, 'Courier New', monospace"
    line_height: float = 1.5
    padding: int = 20
    cursor_style: str = "block"
    prompt: str = "$ "
    background_color: str = "#000000"
    text_color: str = "#00ff00"
    prompt_color: str = "#00ff00"
    cursor_color: str = "#00ff00"
    typing_speed_min: int = 30
    typing_speed_max: int = 120
    typing_speed_avg: int = 60
    scroll_speed: int = 300
    pause_between_sequences: int = 500


@dataclass
class AnimationState:
    """Track animation state throughout generation"""
    current_time: int = 0
    current_y: float = 0
    cursor_x: float = 0
    cursor_y: float = 0
    scroll_offset: float = 0
    line_height: float = 0
    char_width: float = 8.4
    viewport_height: float = 0
    elements: List[str] = field(default_factory=list)
    scroll_transforms: List[Tuple[int, float]] = field(default_factory=list)


class TerminalSVGGenerator:
    """Generate animated terminal SVG from JSON configuration"""
    
    def __init__(self, config_data: Dict):
        """Initialize generator with configuration"""
        self.config_data = config_data
        self.config = self._parse_config(config_data.get('config', {}))
        self.sequences = config_data.get('sequences', [])
        self.state = AnimationState()
        
    def _parse_config(self, config: Dict) -> TerminalConfig:
        """Parse configuration into TerminalConfig object"""
        tc = TerminalConfig()
        
        # Window settings
        window = config.get('window', {})
        tc.width = window.get('width', tc.width)
        tc.height = window.get('height', tc.height)
        tc.title = window.get('title', tc.title)
        tc.theme = window.get('theme', tc.theme)
        
        # Terminal settings
        terminal = config.get('terminal', {})
        tc.font_size = terminal.get('fontSize', tc.font_size)
        tc.font_family = terminal.get('fontFamily', tc.font_family)
        tc.line_height = terminal.get('lineHeight', tc.line_height)
        tc.padding = terminal.get('padding', tc.padding)
        tc.cursor_style = terminal.get('cursorStyle', tc.cursor_style)
        tc.prompt = terminal.get('prompt', tc.prompt)
        
        # Animation settings
        animation = config.get('animation', {})
        typing = animation.get('typingSpeed', {})
        tc.typing_speed_min = typing.get('min', tc.typing_speed_min)
        tc.typing_speed_max = typing.get('max', tc.typing_speed_max)
        tc.typing_speed_avg = typing.get('avg', tc.typing_speed_avg)
        tc.scroll_speed = animation.get('scrollSpeed', tc.scroll_speed)
        tc.pause_between_sequences = animation.get('pauseBetweenSequences', tc.pause_between_sequences)
        
        # Colors
        colors = config.get('colors', {})
        tc.background_color = colors.get('background', tc.background_color)
        tc.text_color = colors.get('text', tc.text_color)
        tc.prompt_color = colors.get('prompt', tc.prompt_color)
        tc.cursor_color = colors.get('cursor', tc.cursor_color)
        
        return tc
    
    def generate(self) -> str:
        """Generate the complete SVG animation"""
        # Initialize state
        self.state.line_height = self.config.font_size * self.config.line_height
        self.state.viewport_height = self.config.height - 40 - (self.config.padding * 2)  # 40 for title bar
        self.state.current_y = 0
        
        # Process all sequences
        for i, sequence in enumerate(self.sequences):
            self._process_sequence(sequence, i)
            
        # Generate final SVG
        return self._build_svg()
    
    def _process_sequence(self, sequence: Dict, index: int):
        """Process a single sequence"""
        seq_type = sequence.get('type', 'text')
        
        # Add delay if specified
        if 'delay' in sequence:
            self.state.current_time += sequence['delay']
        
        # Process based on type
        if seq_type == 'command':
            self._process_command(sequence)
        elif seq_type == 'output' or seq_type == 'text':
            self._process_output(sequence)
        elif seq_type == 'ascii':
            self._process_ascii(sequence)
        elif seq_type == 'clear':
            self._process_clear(sequence)
        elif seq_type == 'pause':
            self.state.current_time += sequence.get('duration', 1000)
        elif seq_type == 'progress':
            self._process_progress(sequence)
            
        # Add pause between sequences
        pause = sequence.get('pause', self.config.pause_between_sequences)
        self.state.current_time += pause
        
        # Check if scrolling is needed
        self._check_scroll()
    
    def _process_command(self, sequence: Dict):
        """Process a command sequence"""
        prompt = sequence.get('prompt', self.config.prompt)
        command = sequence.get('content', '')
        
        # Add some spacing before command if not at start
        if self.state.current_y > 0:
            self.state.current_y += self.state.line_height * 0.3
        
        # Generate prompt
        prompt_elem = self._create_text_element(
            prompt, 0, self.state.current_y, 
            self.config.prompt_color, self.state.current_time, instant=True
        )
        self.state.elements.append(prompt_elem)
        
        # Generate typed command
        if command and not sequence.get('instant', False):
            typing_elements, end_time = self._create_typing_animation(
                command, len(prompt) * self.state.char_width, 
                self.state.current_y, self.config.text_color, self.state.current_time
            )
            self.state.elements.extend(typing_elements)
            self.state.current_time = end_time
        elif command:
            cmd_elem = self._create_text_element(
                command, len(prompt) * self.state.char_width, 
                self.state.current_y, self.config.text_color, 
                self.state.current_time, instant=True
            )
            self.state.elements.append(cmd_elem)
        
        self.state.current_y += self.state.line_height
        
        # Process output if present
        if 'output' in sequence:
            self.state.current_time += 200  # Small delay before output
            self._process_output(sequence['output'])
    
    def _process_output(self, sequence: Dict):
        """Process output/text sequence"""
        content = sequence.get('content', '') if isinstance(sequence, dict) else sequence
        color = sequence.get('color', self.config.text_color) if isinstance(sequence, dict) else self.config.text_color
        
        lines = content.split('\n')
        for line in lines:
            text_elem = self._create_text_element(
                line, 0, self.state.current_y, color, 
                self.state.current_time, instant=True, fade_in=True
            )
            self.state.elements.append(text_elem)
            self.state.current_y += self.state.line_height
            self.state.current_time += 20  # Small delay between lines
    
    def _process_ascii(self, sequence: Dict):
        """Process ASCII art sequence"""
        content = sequence.get('content', '')
        color = sequence.get('color', self.config.text_color)
        
        # Add spacing before ASCII art
        if self.state.current_y > 0:
            self.state.current_y += self.state.line_height * 0.5
        
        lines = content.split('\n')
        for line in lines:
            text_elem = self._create_text_element(
                line, 0, self.state.current_y, color, 
                self.state.current_time, instant=True, fade_in=True,
                glow=sequence.get('style', {}).get('glow', False)
            )
            self.state.elements.append(text_elem)
            self.state.current_y += self.state.line_height
    
    def _process_clear(self, sequence: Dict):
        """Process clear screen sequence"""
        # Add clear animation
        clear_elem = f'''
        <rect x="-50" y="-50" width="{self.config.width + 100}" 
              height="{self.state.current_y + self.state.viewport_height + 100}" 
              fill="{self.config.background_color}" opacity="0"
              transform="translate(0, {-self.state.scroll_offset})">
            <animate attributeName="opacity" from="0" to="1" 
                     begin="{self.state.current_time}ms" dur="50ms" fill="freeze"/>
        </rect>'''
        self.state.elements.append(clear_elem)
        
        # Reset position
        self.state.current_y = 0
        self.state.scroll_offset = 0
        self.state.current_time += 100
    
    def _process_progress(self, sequence: Dict):
        """Process progress bar sequence"""
        label = sequence.get('label', '')
        progress = sequence.get('progress', 0)
        duration = sequence.get('duration', 2000)
        color = sequence.get('color', self.config.text_color)
        
        # Add spacing
        if self.state.current_y > 0:
            self.state.current_y += self.state.line_height * 0.5
        
        # Label
        if label:
            label_elem = self._create_text_element(
                label, 0, self.state.current_y, color, 
                self.state.current_time, instant=True
            )
            self.state.elements.append(label_elem)
            self.state.current_y += self.state.line_height
        
        # Progress bar
        bar_width = 300
        bar_height = 10
        bar_elem = f'''
        <g transform="translate(0, {self.state.current_y - self.state.scroll_offset})" opacity="0">
            <animate attributeName="opacity" from="0" to="1" 
                     begin="{self.state.current_time}ms" dur="50ms" fill="freeze"/>
            
            <rect x="0" y="0" width="{bar_width}" height="{bar_height}" 
                  fill="none" stroke="{color}" stroke-width="1"/>
            
            <rect x="1" y="1" width="0" height="{bar_height - 2}" fill="{color}">
                <animate attributeName="width" from="0" to="{(bar_width - 2) * progress}" 
                         begin="{self.state.current_time + 100}ms" dur="{duration}ms" fill="freeze"/>
            </rect>
            
            <text x="{bar_width + 10}" y="{bar_height - 2}" 
                  font-family="{self.config.font_family}" font-size="{self.config.font_size * 0.9}" 
                  fill="{color}">{int(progress * 100)}%</text>
        </g>'''
        self.state.elements.append(bar_elem)
        
        self.state.current_y += bar_height + self.state.line_height
        self.state.current_time += duration + 100
    
    def _check_scroll(self):
        """Check if scrolling is needed and add scroll animation"""
        if self.state.current_y > self.state.viewport_height - (self.state.line_height * 3):
            # Calculate scroll amount
            scroll_amount = min(
                self.state.current_y - (self.state.line_height * 2),
                self.state.line_height * 10
            )
            
            # Store scroll transform
            self.state.scroll_transforms.append((self.state.current_time, scroll_amount))
            
            # Update state
            self.state.scroll_offset += scroll_amount
            self.state.current_y -= scroll_amount
            self.state.current_time += self.config.scroll_speed
    
    def _create_text_element(self, text: str, x: float, y: float, color: str, 
                            start_time: int, instant: bool = False, 
                            fade_in: bool = False, glow: bool = False) -> str:
        """Create a text SVG element"""
        escaped_text = html.escape(text)
        y_pos = y + self.config.font_size  # Adjust for baseline
        
        opacity_anim = ''
        if instant and fade_in:
            opacity_anim = f'''
            <animate attributeName="opacity" from="0" to="1" 
                     begin="{start_time}ms" dur="50ms" fill="freeze"/>'''
        elif not instant:
            opacity_anim = f'''
            <animate attributeName="opacity" from="0" to="1" 
                     begin="{start_time}ms" dur="10ms" fill="freeze"/>'''
        
        filter_attr = 'filter="url(#textGlow)"' if not glow else 'filter="url(#enhancedGlow)"'
        
        # Apply scroll transform
        transform = f'translate(0, {-self.state.scroll_offset})'
        
        return f'''
        <text x="{x}" y="{y_pos}" font-family="{self.config.font_family}" 
              font-size="{self.config.font_size}" fill="{color}" 
              {filter_attr} opacity="{'0' if opacity_anim else '1'}"
              transform="{transform}">
            {escaped_text}{opacity_anim}
        </text>'''
    
    def _create_typing_animation(self, text: str, start_x: float, y: float, 
                                color: str, start_time: int) -> Tuple[List[str], int]:
        """Create character-by-character typing animation"""
        elements = []
        current_time = start_time
        x_offset = start_x
        
        for char in text:
            # Calculate typing speed
            speed = self._get_typing_speed()
            
            # Create character element
            char_elem = self._create_text_element(
                char, x_offset, y, color, current_time
            )
            elements.append(char_elem)
            
            # Add cursor animation
            cursor_elem = self._create_cursor_element(
                x_offset, y, current_time, current_time + speed
            )
            elements.append(cursor_elem)
            
            x_offset += self.state.char_width
            current_time += speed
        
        return elements, current_time
    
    def _create_cursor_element(self, x: float, y: float, start: int, end: int) -> str:
        """Create animated cursor element"""
        transform = f'translate(0, {-self.state.scroll_offset})'
        
        return f'''
        <rect x="{x}" y="{y}" width="{self.state.char_width}" 
              height="{self.config.font_size}" fill="{self.config.cursor_color}"
              opacity="0" transform="{transform}">
            <animate attributeName="opacity" from="0" to="1" 
                     begin="{start}ms" dur="10ms" fill="freeze"/>
            <animate attributeName="opacity" from="1" to="0" 
                     begin="{end}ms" dur="10ms" fill="freeze"/>
        </rect>'''
    
    def _get_typing_speed(self) -> int:
        """Get randomized typing speed"""
        r = random.random()
        if r < 0.1:  # 10% chance of pause
            return random.randint(200, 500)
        elif r < 0.3:  # 20% chance of slow
            return random.randint(self.config.typing_speed_avg, self.config.typing_speed_max)
        else:  # 70% normal speed
            return random.randint(self.config.typing_speed_min, self.config.typing_speed_avg)
    
    def _build_svg(self) -> str:
        """Build the final SVG string"""
        # Create scroll group with all transforms
        scroll_group = '<g id="scrollGroup">\n'
        for element in self.state.elements:
            scroll_group += element + '\n'
        
        # Add scroll animations
        for i, (time, amount) in enumerate(self.state.scroll_transforms):
            prev_total = sum(amt for _, amt in self.state.scroll_transforms[:i])
            new_total = prev_total + amount
            
            scroll_group += f'''
            <animateTransform attributeName="transform" type="translate"
                from="0 {-prev_total}" to="0 {-new_total}"
                begin="{time}ms" dur="{self.config.scroll_speed}ms"
                fill="freeze" additive="sum"/>'''
        
        scroll_group += '</g>\n'
        
        # Build complete SVG
        svg = f'''<svg width="{self.config.width}" height="{self.config.height}" 
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
        
        <!-- Terminal content -->
        <g transform="translate({self.config.padding}, {40 + self.config.padding})">
            {scroll_group}
        </g>
    </g>
    
    <!-- Effects overlay -->
    <rect y="40" width="{self.config.width}" height="{self.config.height - 40}" 
          fill="url(#scanlines)" opacity="0.1"/>
</svg>'''
        
        return svg
    
    def _generate_defs(self) -> str:
        """Generate SVG definitions for filters and patterns"""
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
        </filter>
        
        <!-- Enhanced glow filter -->
        <filter id="enhancedGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        
        <!-- Scanline pattern -->
        <pattern id="scanlines" patternUnits="userSpaceOnUse" width="1" height="2">
            <rect width="1" height="1" fill="transparent"/>
            <rect y="1" width="1" height="1" fill="rgba(0,255,0,0.05)"/>
        </pattern>'''


def main():
    """CLI interface for the generator"""
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description='Generate animated terminal SVG from JSON')
    parser.add_argument('input', help='Input JSON file')
    parser.add_argument('-o', '--output', help='Output SVG file (default: stdout)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    try:
        # Load JSON configuration
        with open(args.input, 'r') as f:
            config_data = json.load(f)
        
        # Generate SVG
        generator = TerminalSVGGenerator(config_data)
        svg = generator.generate()
        
        # Output
        if args.output:
            with open(args.output, 'w') as f:
                f.write(svg)
            if args.verbose:
                print(f"Generated SVG written to {args.output}")
        else:
            print(svg)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()