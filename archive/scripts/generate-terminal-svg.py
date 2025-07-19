#!/usr/bin/env python3
"""
Generate terminal SVG for GitHub profile
"""

import os
import sys
import json

# Add parent directory to path to import the generator
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fixed_terminal_generator import FixedTerminalSVGGenerator


def main():
    """Generate terminal SVG from configuration"""
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    config_path = os.path.join(root_dir, 'terminal-jokes-config.json')
    output_path = os.path.join(root_dir, 'src', 'terminal.svg')
    
    try:
        print('🖥️  Generating terminal SVG...')
        
        # Load configuration
        with open(config_path, 'r') as f:
            config_data = json.load(f)
        
        # Generate SVG
        generator = FixedTerminalSVGGenerator(config_data)
        svg = generator.generate()
        
        # Write output
        with open(output_path, 'w') as f:
            f.write(svg)
        
        # Get file size
        size_kb = os.path.getsize(output_path) / 1024
        
        print(f'✅ Terminal SVG generated successfully!')
        print(f'📄 Output: {output_path}')
        print(f'📏 Size: {size_kb:.2f} KB')
        
        # Basic validation
        if '<svg' not in svg or '</svg>' not in svg:
            print('❌ Warning: SVG may be invalid')
            sys.exit(1)
        
        print('✨ All checks passed!')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        sys.exit(1)


if __name__ == '__main__':
    main()