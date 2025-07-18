#!/usr/bin/env python3
import os
import random
import gifos
from datetime import datetime

# Set output filename via environment variable
os.environ['GIFOS_OUTPUT_GIF_NAME'] = 'terminal.gif'

# Terminal configuration
WIDTH = 800
HEIGHT = 600
XPAD = 10
YPAD = 10

# Dad jokes collection
DAD_JOKES = [
    "I used to hate facial hair, but then it grew on me.",
    "Why don't scientists trust atoms? Because they make up everything!",
    "I'm reading a book on anti-gravity. It's impossible to put down!",
    "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
    "Why did the developer go broke? Because he used up all his cache!",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
    "Why do Python programmers prefer snakes? Because they don't like Java!",
    "I would tell you a UDP joke, but you might not get it.",
    "My wife asked me to stop singing 'Wonderwall' to our kids. I said maybe...",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "I told my computer I needed a break, and now it won't stop sending me Kit-Kat ads.",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "I'm afraid for the calendar. Its days are numbered.",
    "Why did the git commit cross the road? To push to the other repository!",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
    "I used to play piano by ear, but now I use my hands.",
    "Why can't a bicycle stand up by itself? It's two tired!",
    "What did the router say to the doctor? It hurts when IP!",
    "I just wrote a book on reverse psychology. Don't read it!",
    "Why did the functions stop calling each other? They had constant arguments.",
    "My server went down, but don't worry - it's just a little REST.",
    "Why do security experts love nature? Because it has the best firewalls!"
]

def generate_terminal_gif():
    # Initialize terminal
    t = gifos.Terminal(width=WIDTH, height=HEIGHT, xpad=XPAD, ypad=YPAD)
    
    # Get current date for dynamic content
    current_date = datetime.now().strftime('%a %b %d %H:%M:%S UTC %Y')
    
    # Track row position
    row = 1
    max_rows = 32  # Terminal has 32 rows
    
    # Boot sequence with ASCII art
    t.toggle_show_cursor(False)
    t.gen_text(text="\x1b[36m+----------------------------------------+\x1b[0m", row_num=row, contin=True)
    row += 1
    t.gen_text(text="\x1b[36m|\x1b[0m  William's GitHub Terminal v2.0        \x1b[36m|\x1b[0m", row_num=row, contin=True)
    row += 1
    t.gen_text(text="\x1b[36m+----------------------------------------+\x1b[0m", row_num=row, contin=True)
    row += 1
    t.gen_text(text="", row_num=row, contin=True)
    row += 1
    
    # Boot messages with random services
    services = [
        "Starting william.service...",
        "Loading dad-joke-generator...",
        "Mounting /dev/coffee...",
        "Initializing home-automation.service...",
        "Starting security-scanner.service...",
        "Loading family-priority-daemon...",
        "Mounting /dev/kids-attention...",
        "Starting weekend-project-manager...",
        "Loading raspberry-pi-cluster...",
        "Initializing smart-home-controller..."
    ]
    
    # Pick 3 random services to show
    selected_services = random.sample(services, 3)
    for service in selected_services:
        t.gen_text(text=f"\x1b[32m[  OK  ]\x1b[0m {service}", row_num=row, contin=True)
        row += 1
    t.gen_text(text="", row_num=row, contin=True)
    row += 1
    
    # Terminal prompt
    t.toggle_show_cursor(True)
    t.gen_text(text="\x1b[36mwilliam@dad-joke-hq\x1b[0m:\x1b[34m~\x1b[0m$ ", row_num=row, contin=True)
    t.gen_typing_text(text="whoami --verbose", row_num=row, contin=True)
    row += 1
    
    # Profile info
    t.gen_text(text="\x1b[33mname:\x1b[0m William Zujkowski", row_num=row, contin=True)
    row += 1
    t.gen_text(text="\x1b[33mrole:\x1b[0m Senior Security Specialist", row_num=row, contin=True)
    row += 1
    t.gen_text(text="\x1b[33muptime:\x1b[0m 35+ years", row_num=row, contin=True)
    row += 1
    t.gen_text(text="\x1b[33mshell:\x1b[0m /bin/dad-jokes", row_num=row, contin=True)
    row += 1
    t.gen_text(text="", row_num=row, contin=True)
    row += 1
    
    # Dad joke command
    t.gen_text(text="\x1b[36mwilliam@dad-joke-hq\x1b[0m:\x1b[34m~\x1b[0m$ ", row_num=row, contin=True)
    t.gen_typing_text(text="./dad-joke --random", row_num=row, contin=True)
    row += 1
    
    # Random dad joke
    selected_joke = random.choice(DAD_JOKES)
    t.gen_text(text="\x1b[35m[*] Generating dad joke...\x1b[0m", row_num=row, contin=True)
    row += 1
    t.gen_text(text="", row_num=row, contin=True)
    row += 1
    
    # Display joke with simple formatting
    if len(selected_joke) <= 60:
        t.gen_text(text=f"\x1b[93m> \"{selected_joke}\"\x1b[0m", row_num=row, contin=True)
        row += 1
    else:
        # Split long jokes
        words = selected_joke.split()
        line1 = []
        line2 = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= 55:
                line1.append(word)
                current_length += len(word) + 1
            else:
                line2.append(word)
        
        t.gen_text(text=f"\x1b[93m> \"{' '.join(line1)}\x1b[0m", row_num=row, contin=True)
        row += 1
        if line2:
            t.gen_text(text=f"\x1b[93m   {' '.join(line2)}\"\x1b[0m", row_num=row, contin=True)
            row += 1
    
    t.gen_text(text="", row_num=row, contin=True)
    row += 1
    t.gen_text(text="\x1b[90m[Groan Factor: ############## 100%]\x1b[0m", row_num=row, contin=True)
    row += 1
    
    # Final tagline - only if we have room
    if row < max_rows - 3:
        t.gen_text(text="", row_num=row, contin=True)
        row += 1
        t.gen_text(text="\x1b[36mwilliam@dad-joke-hq\x1b[0m:\x1b[34m~\x1b[0m$ ", row_num=row, contin=True)
        t.gen_typing_text(text="echo \"Living life one git commit at a time\"", row_num=row, contin=True)
        row += 1
        t.gen_text(text="\x1b[92mLiving life one git commit at a time\x1b[0m", row_num=row)
    
    # Generate the GIF
    t.gen_gif()
    print("✅ Terminal GIF generated successfully!")

if __name__ == "__main__":
    generate_terminal_gif()