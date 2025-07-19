#!/usr/bin/env python3
"""
Generate Linux-style terminal SVG
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from terminal_svg_generator import main

if __name__ == '__main__':
    # Override sys.argv to use Linux config
    sys.argv = ['generate-linux-terminal.py', 'terminal-config-linux.json', '-o', 'src/terminal.svg']
    main()