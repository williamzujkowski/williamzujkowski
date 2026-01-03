# Project Plan: Jinja Templating for Terminal SVG Generator

**Date:** 2026-01-01 (America/New_York)  
**Owner:** @williamzujkowski  
**Status:** Draft  

---

## Goal

Refactor terminal SVG generator to use Jinja2 templates for content. Enable YAML-based content updates without Python changes. Preserve all ASCII art and color formatting.

---

## Boundary Checklist

### 1) Modules and Responsibilities

| Module | Responsibility | Owns | Must Not Know About |
|--------|---------------|------|---------------------|
| `template_engine` | Jinja2 environment setup, filter registration | Environment config, filter registry | SVG rendering, content data |
| `filters.ascii_art` | Box drawing, table formatting, text alignment | Box character sets, layout math | Colors, animation, SVG |
| `filters.ansi` | Color/style markup generation | Markup format, color names | SVG translation, templates |
| `template_context` | Build render context from data sources | Data loading, context DTOs | Templates, filters, SVG |
| `content_loader` | Load YAML content files | File I/O, YAML parsing | Templates, rendering |
| `markup_parser` | Parse `[[style]]` markup to structured spans | Markup grammar, span DTOs | SVG generation, templates |
| `svg_renderer` | Translate spans to SVG tspans (existing) | SVG output, animation timing | Templates, YAML content |

### 2) Interfaces (Contracts)

**`ITemplateEngine`** — `src/interfaces/template_engine.py`
```python
from typing import Protocol, Any

class ITemplateEngine(Protocol):
    def render(self, template_name: str, context: dict[str, Any]) -> str: ...
    def render_string(self, template_string: str, context: dict[str, Any]) -> str: ...
```
- **Inputs:** template name/string, context dict
- **Outputs:** rendered string with markup
- **Errors:** `TemplateNotFoundError`, `TemplateRenderError`

**`IContentLoader`** — `src/interfaces/content_loader.py`
```python
from typing import Protocol
from .types import Joke, NationalDay

class IContentLoader(Protocol):
    def load_random_joke(self) -> Joke | None: ...
    def load_national_day(self, date: str) -> NationalDay | None: ...
```
- **Inputs:** date string (MM-DD format)
- **Outputs:** typed DTOs or None
- **Errors:** `ContentLoadError` (file not found, parse failure)

**`IMarkupParser`** — `src/interfaces/markup_parser.py`
```python
from typing import Protocol
from .types import StyledSpan

class IMarkupParser(Protocol):
    def parse(self, text: str) -> list[StyledSpan]: ...
```
- **Inputs:** raw template output with `[[style]]` markup
- **Outputs:** list of `StyledSpan` with style metadata
- **Errors:** `MarkupParseError` (malformed markup)

### 3) Dependency Direction

```
content_loader ← template_context ← template_engine → filters.*
                                          ↓
                                    markup_parser ← svg_renderer
```

- `template_context` depends on `IContentLoader`, not implementation
- `svg_renderer` depends on `IMarkupParser`, not implementation
- No cycles. `filters.*` are pure functions with no dependencies.

### 4) Test Plan at Boundaries

| Interface | Unit Tests | Contract/Golden Tests | Integration |
|-----------|------------|----------------------|-------------|
| `ITemplateEngine` | Mock filesystem, verify render calls | Golden: known template → expected output | N/A |
| `IContentLoader` | Mock file reads, verify parsing | Golden: sample YAML → expected DTOs | Real file reads |
| `IMarkupParser` | Inline markup strings | Golden: markup samples → span lists | N/A |
| `filters.ascii_art` | Pure function tests | Golden: box inputs → exact string output | N/A |

### 5) Refactor Steps (Safe Order)

1. Define interface files + DTOs (`src/interfaces/`)
2. Implement `filters.ascii_art` (pure, no deps) + tests
3. Implement `filters.ansi` (pure, no deps) + tests
4. Implement `content_loader` satisfying `IContentLoader` + tests
5. Implement `template_engine` satisfying `ITemplateEngine` + tests
6. Create base templates (`base/macros.j2`)
7. Create block templates (`blocks/*.j2`) + golden tests
8. Implement `markup_parser` satisfying `IMarkupParser` + tests
9. Integrate with existing `svg_renderer` via interface
10. Run full pipeline, compare output to current baseline

### 6) Compatibility Notes

- **Breaking change:** No (parallel implementation)
- **Migration:** New code path enabled via feature flag or config
- **Rollback:** Delete new modules, revert to hardcoded content
- **Why worth it:** Content updates without code changes; testable in isolation

---

## Technical Decisions

### Why Jinja2

| Option | Verdict | Reason |
|--------|---------|--------|
| Jinja2 | ✅ Use | Macro system for reusable ASCII components (Source: [Jinja2 docs — Template Designer](https://jinja.palletsprojects.com/en/3.1.x/templates/#macros)) |
| Mako | ❌ Skip | Less common; macro syntax less clean |
| Mustache | ❌ Skip | Logic-less; can't express box-drawing conditionals |
| Raw Python | ❌ Skip | Violates separation of concerns |

### Markup Format

Using `[[style:params]]text[[/style]]` instead of ANSI escapes.

**Rationale:**
- ANSI escapes require stateful parsing (Source: [ECMA-48 §8.3](https://www.ecma-international.org/publications-and-standards/standards/ecma-48/))
- Custom format is context-free, easier to parse
- Direct mapping to SVG `<tspan>` attributes

**Grammar:**
```
markup     := text | styled_text | markup markup
styled_text := '[[' style ']]' markup '[[/' style_end ']]'
style      := name (':' params)?
params     := value (',' value)*
```

### Box Characters

Using Unicode box-drawing block (U+2500–U+257F).

| Style | Characters | Use Case |
|-------|------------|----------|
| `single` | `┌─┐│└─┘` | Default boxes |
| `rounded` | `╭─╮│╰─╯` | Friendly output (jokes, info) |
| `double` | `╔═╗║╚═╝` | Emphasis, headers |
| `heavy` | `┏━┓┃┗━┛` | Warnings, errors |

(Source: [Unicode Standard, Chapter 22.7 — Box Drawing](https://www.unicode.org/versions/Unicode15.0.0/ch22.pdf))

---

## File Structure

```
src/
├── interfaces/              # Boundary contracts
│   ├── __init__.py
│   ├── types.py             # Shared DTOs (Joke, NationalDay, StyledSpan)
│   ├── template_engine.py   # ITemplateEngine protocol
│   ├── content_loader.py    # IContentLoader protocol
│   └── markup_parser.py     # IMarkupParser protocol
├── filters/                 # Pure functions (no I/O)
│   ├── __init__.py
│   ├── ascii_art.py         # box, table, center, pad (~150 lines)
│   └── ansi.py              # colorize, bold, dim (~80 lines)
├── template_engine.py       # Jinja2 environment (~120 lines)
├── template_context.py      # Context builder (~100 lines)
├── content_loader.py        # YAML loader (~80 lines)
├── markup_parser.py         # [[style]] parser (~100 lines)
└── templates/
    ├── base/
    │   └── macros.j2        # Reusable components
    └── blocks/
        ├── neofetch.j2
        ├── national_day.j2
        ├── docker_ps.j2
        └── dad_joke.j2
content/
├── jokes.yaml
└── national_days.yaml
tests/
├── filters/
│   ├── test_ascii_art.py
│   └── test_ansi.py
├── test_template_engine.py
├── test_content_loader.py
├── test_markup_parser.py
└── golden/                  # Golden test fixtures
    ├── neofetch_expected.txt
    └── box_single_expected.txt
```

**Size constraints:**
- Files: ≤400 lines
- Functions: ≤50 lines

---

## Implementation

### Phase 1: Interfaces + Filters

#### `src/interfaces/types.py`
```python
"""Shared DTOs crossing module boundaries."""
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Joke:
    id: str
    setup: str
    punchline: str
    groan_level: float = 8.0

@dataclass(frozen=True, slots=True)
class NationalDay:
    name: str
    description: str
    emoji: str = "📅"

@dataclass(frozen=True, slots=True)
class StyledSpan:
    text: str
    fg: str | None = None
    bg: str | None = None
    bold: bool = False
    dim: bool = False
    italic: bool = False
```

#### `src/filters/ascii_art.py`
```python
"""ASCII box drawing filters. Pure functions, no I/O."""
from typing import Literal

BoxStyle = Literal["single", "double", "rounded", "heavy"]

BOX_CHARS: dict[BoxStyle, dict[str, str]] = {
    "single": {"tl": "┌", "tr": "┐", "bl": "└", "br": "┘", "h": "─", "v": "│"},
    "double": {"tl": "╔", "tr": "╗", "bl": "╚", "br": "╝", "h": "═", "v": "║"},
    "rounded": {"tl": "╭", "tr": "╮", "bl": "╰", "br": "╯", "h": "─", "v": "│"},
    "heavy": {"tl": "┏", "tr": "┓", "bl": "┗", "br": "┛", "h": "━", "v": "┃"},
}


def draw_box(
    content: str | list[str],
    style: BoxStyle = "single",
    width: int | None = None,
    padding: int = 1,
    title: str | None = None,
) -> str:
    """
    Draw ASCII box around content.
    
    Args:
        content: String or list of lines
        style: Box character style
        width: Fixed width (auto-calculated if None)
        padding: Horizontal padding inside box
        title: Optional title in top border
    
    Returns:
        Multi-line string with box characters
    """
    chars = BOX_CHARS[style]
    lines = content.split("\n") if isinstance(content, str) else list(content)
    
    # Calculate dimensions
    content_width = max((len(line) for line in lines), default=0)
    if title:
        content_width = max(content_width, len(title) + 2)
    inner_width = width or (content_width + padding * 2)
    
    result: list[str] = []
    
    # Top border
    if title:
        left = (inner_width - len(title) - 2) // 2
        right = inner_width - len(title) - 2 - left
        top = f"{chars['tl']}{chars['h'] * left} {title} {chars['h'] * right}{chars['tr']}"
    else:
        top = f"{chars['tl']}{chars['h'] * inner_width}{chars['tr']}"
    result.append(top)
    
    # Content lines
    pad = " " * padding
    for line in lines:
        padded = f"{pad}{line}{pad}"
        result.append(f"{chars['v']}{padded:<{inner_width}}{chars['v']}")
    
    # Bottom border
    result.append(f"{chars['bl']}{chars['h'] * inner_width}{chars['br']}")
    
    return "\n".join(result)


def center_text(text: str, width: int, fill: str = " ") -> str:
    """Center text within width."""
    return text.center(width, fill)


def pad_text(text: str, width: int, align: Literal["left", "right", "center"] = "left") -> str:
    """Pad text to width with alignment."""
    if align == "right":
        return text.rjust(width)
    if align == "center":
        return text.center(width)
    return text.ljust(width)
```

#### `src/filters/ansi.py`
```python
"""Color/style markup filters. Pure functions, no I/O."""
from typing import Literal

Color = Literal[
    "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
    "bright_black", "bright_red", "bright_green", "bright_yellow",
    "bright_blue", "bright_magenta", "bright_cyan", "bright_white",
]


def colorize(text: str, fg: Color | None = None, bg: Color | None = None) -> str:
    """Apply foreground/background color."""
    parts = []
    if fg:
        parts.append(f"fg:{fg}")
    if bg:
        parts.append(f"bg:{bg}")
    if not parts:
        return text
    return f"[[{','.join(parts)}]]{text}[[/color]]"


def fg(text: str, color: Color) -> str:
    """Foreground color shorthand."""
    return colorize(text, fg=color)


def bg(text: str, color: Color) -> str:
    """Background color shorthand."""
    return colorize(text, bg=color)


def bold(text: str) -> str:
    """Bold styling."""
    return f"[[bold]]{text}[[/bold]]"


def dim(text: str) -> str:
    """Dim styling."""
    return f"[[dim]]{text}[[/dim]]"
```

### Phase 2: Template Engine

#### `src/template_engine.py`
```python
"""Jinja2 environment with terminal-specific filters."""
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from jinja2.exceptions import TemplateError

from .filters import ascii_art, ansi


class TemplateNotFoundError(Exception):
    """Template file not found."""


class TemplateRenderError(Exception):
    """Template rendering failed."""


class TerminalTemplateEngine:
    """Jinja2 environment configured for terminal output."""
    
    def __init__(self, template_dir: Path | None = None) -> None:
        self._template_dir = template_dir or Path(__file__).parent / "templates"
        self._env = self._create_env()
        self._register_filters()
        self._register_globals()
    
    def _create_env(self) -> Environment:
        return Environment(
            loader=FileSystemLoader(self._template_dir),
            trim_blocks=True,
            lstrip_blocks=True,
            keep_trailing_newline=True,
            autoescape=False,  # Plain text output
        )
    
    def _register_filters(self) -> None:
        self._env.filters.update({
            "box": ascii_art.draw_box,
            "center": ascii_art.center_text,
            "pad": ascii_art.pad_text,
            "fg": ansi.fg,
            "bg": ansi.bg,
            "bold": ansi.bold,
            "dim": ansi.dim,
            "color": ansi.colorize,
        })
    
    def _register_globals(self) -> None:
        self._env.globals["BOX_CHARS"] = ascii_art.BOX_CHARS
    
    def render(self, template_name: str, context: dict[str, Any]) -> str:
        """Render template by name."""
        try:
            template = self._env.get_template(template_name)
            return template.render(**context)
        except TemplateNotFound as e:
            raise TemplateNotFoundError(f"Template not found: {template_name}") from e
        except TemplateError as e:
            raise TemplateRenderError(f"Render failed: {e}") from e
    
    def render_string(self, template_string: str, context: dict[str, Any]) -> str:
        """Render template from string."""
        try:
            template = self._env.from_string(template_string)
            return template.render(**context)
        except TemplateError as e:
            raise TemplateRenderError(f"Render failed: {e}") from e
```

### Phase 3: Content & Context

#### `src/content_loader.py`
```python
"""Load content from YAML files."""
from pathlib import Path
from typing import Any

import yaml

from .interfaces.types import Joke, NationalDay


class ContentLoadError(Exception):
    """Content loading failed."""


class YamlContentLoader:
    """Load jokes and national days from YAML."""
    
    def __init__(self, content_dir: Path | None = None) -> None:
        self._content_dir = content_dir or Path(__file__).parent.parent / "content"
    
    def load_random_joke(self) -> Joke | None:
        """Load random joke from jokes.yaml."""
        import random
        
        jokes_file = self._content_dir / "jokes.yaml"
        if not jokes_file.exists():
            return None
        
        try:
            data = self._load_yaml(jokes_file)
            if not data:
                return None
            joke = random.choice(data)
            return Joke(**joke)
        except (yaml.YAMLError, TypeError, KeyError) as e:
            raise ContentLoadError(f"Failed to load jokes: {e}") from e
    
    def load_national_day(self, date: str) -> NationalDay | None:
        """Load national day for date (MM-DD format)."""
        days_file = self._content_dir / "national_days.yaml"
        if not days_file.exists():
            return None
        
        try:
            data = self._load_yaml(days_file)
            day_data = data.get(date)
            if not day_data:
                return None
            return NationalDay(**day_data)
        except (yaml.YAMLError, TypeError, KeyError) as e:
            raise ContentLoadError(f"Failed to load national days: {e}") from e
    
    def _load_yaml(self, path: Path) -> Any:
        with open(path, encoding="utf-8") as f:
            return yaml.safe_load(f)
```

### Phase 4: Templates

#### `src/templates/base/macros.j2`
```jinja
{# Reusable terminal output components #}

{# Shell prompt #}
{% macro prompt(user='william', host='homelab', path='~', symbol='$') -%}
{{ user | fg('green') | bold }}@{{ host | fg('green') }}:{{ path | fg('blue') | bold }}{{ symbol }} 
{%- endmacro %}

{# Info row for neofetch-style output #}
{% macro info_row(label, value, label_color='cyan') -%}
{{ label | fg(label_color) | bold }}: {{ value }}
{%- endmacro %}

{# Color palette display #}
{% macro color_palette() -%}
{% for c in ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'] -%}
{{ '███' | fg(c) }}
{%- endfor %}
{% for c in ['bright_black', 'bright_red', 'bright_green', 'bright_yellow', 'bright_blue', 'bright_magenta', 'bright_cyan', 'bright_white'] -%}
{{ '███' | fg(c) }}
{%- endfor %}
{%- endmacro %}
```

#### `src/templates/blocks/dad_joke.j2`
```jinja
{% from "base/macros.j2" import prompt %}
{{ prompt() }}curl -s https://api.dad-jokes.local/random | jq
{
  {{ '"id"' | fg('cyan') }}: {{ ('"' ~ joke.id ~ '"') | fg('green') }},
  {{ '"setup"' | fg('cyan') }}: {{ ('"' ~ joke.setup ~ '"') | fg('green') }},
  {{ '"punchline"' | fg('cyan') }}: {{ ('"' ~ joke.punchline ~ '"') | fg('green') }},
  {{ '"groan_level"' | fg('cyan') }}: {{ joke.groan_level | fg('yellow') }}
}

{{ joke.setup ~ '\n\n' ~ joke.punchline | box(style='rounded', title='😄 Dad Joke') }}
```

---

## Content Schema

#### `content/jokes.yaml`
```yaml
# Dad jokes database
# Schema: id (string), setup (string), punchline (string), groan_level (float 0-10)

- id: "0xDEADBEEF"
  setup: "Why do programmers prefer dark mode?"
  punchline: "Because light attracts bugs!"
  groan_level: 7.5

- id: "0xCAFEBABE"
  setup: "Why do Java developers wear glasses?"
  punchline: "Because they can't C#!"
  groan_level: 8.2
```

#### `content/national_days.yaml`
```yaml
# National days by MM-DD
# Schema: name (string), description (string), emoji (string, optional)

"01-01":
  name: "National Public Domain Day"
  description: "Works entering the public domain"
  emoji: "📚"

"03-14":
  name: "Pi Day"
  description: "Celebrating mathematical constant π"
  emoji: "🥧"
```

---

## Test Examples

#### `tests/filters/test_ascii_art.py`
```python
"""Tests for ASCII art filters."""
import pytest
from src.filters.ascii_art import draw_box, center_text, pad_text


class TestDrawBox:
    def test_simple_box(self) -> None:
        result = draw_box("Hello")
        assert "┌" in result
        assert "Hello" in result
        assert "└" in result
    
    def test_box_with_title(self) -> None:
        result = draw_box("Content", title="Title")
        assert "Title" in result
        assert "Content" in result
    
    def test_rounded_style(self) -> None:
        result = draw_box("Test", style="rounded")
        assert "╭" in result
        assert "╰" in result
    
    def test_multiline_content(self) -> None:
        result = draw_box(["Line 1", "Line 2"])
        assert "Line 1" in result
        assert "Line 2" in result


class TestCenterText:
    def test_center(self) -> None:
        assert center_text("Hi", 6) == "  Hi  "
    
    def test_center_odd(self) -> None:
        assert center_text("Hi", 5) == " Hi  "


class TestPadText:
    def test_left(self) -> None:
        assert pad_text("Hi", 5, "left") == "Hi   "
    
    def test_right(self) -> None:
        assert pad_text("Hi", 5, "right") == "   Hi"
```

---

## Impact Map

| Change | Behavior Impact | API Impact | Test Impact | Migration |
|--------|-----------------|------------|-------------|-----------|
| Add `src/interfaces/` | None (new code) | New protocols | New unit tests | N/A |
| Add `src/filters/` | None (new code) | New functions | New unit tests | N/A |
| Add `src/template_engine.py` | None (new code) | New class | New unit tests | N/A |
| Add `src/templates/` | None (new code) | N/A | Golden tests | N/A |
| Add `content/` | None (new code) | N/A | Fixture files | N/A |
| Integrate with SVG renderer | Alternative render path | Add feature flag | Integration tests | Config flag |

**Verify:**
- Existing SVG output unchanged when feature flag disabled
- Performance impact of template rendering (<50ms acceptable)

---

## Execution Plan

### Week 1: Foundation

```
DOING: Create src/interfaces/ with types and protocols
EXPECT: mypy passes, no runtime imports
IF YES: Proceed to filters
IF NO: Fix type errors, re-run mypy
```

```
DOING: Implement src/filters/ascii_art.py + tests
EXPECT: pytest tests/filters/test_ascii_art.py passes (100%)
IF YES: Proceed to ansi filters
IF NO: Debug failures, fix, re-run
```

```
DOING: Implement src/filters/ansi.py + tests
EXPECT: pytest tests/filters/test_ansi.py passes (100%)
IF YES: Week 1 complete
IF NO: Debug failures, fix, re-run
```

### Week 2: Templates

```
DOING: Implement src/template_engine.py + tests
EXPECT: pytest tests/test_template_engine.py passes
IF YES: Create base macros
IF NO: Debug, fix, re-run
```

```
DOING: Create src/templates/base/macros.j2
EXPECT: Engine renders macros without error
IF YES: Create block templates
IF NO: Fix template syntax, re-test
```

```
DOING: Create block templates (neofetch, dad_joke, national_day)
EXPECT: Golden tests pass for each block
IF YES: Week 2 complete
IF NO: Compare output diff, fix templates
```

### Week 3: Content + Integration

```
DOING: Implement content_loader + YAML files
EXPECT: Loader returns typed DTOs
IF YES: Build context builder
IF NO: Fix YAML schema, re-test
```

```
DOING: Implement markup_parser
EXPECT: [[style]] markup parses to StyledSpan list
IF YES: Integrate with svg_renderer
IF NO: Fix parser grammar, re-test
```

```
DOING: Add feature flag, integrate with svg_renderer
EXPECT: SVG output identical to baseline (diff = 0)
IF YES: Week 3 complete
IF NO: Debug differences, fix translation layer
```

### Week 4: Polish + Docs

```
DOING: Run full test suite, check coverage
EXPECT: Coverage ≥80%, all tests pass
IF YES: Write migration docs
IF NO: Add missing tests, fix failures
```

---

## Dependencies

```toml
# pyproject.toml
[project.dependencies]
jinja2 = ">=3.1.0"  # (Source: PyPI, MIT license)
pyyaml = ">=6.0"    # (Source: PyPI, MIT license)

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=4.0",
    "mypy>=1.8",
]
```

---

## Security Notes

- YAML files loaded with `yaml.safe_load()` only (no arbitrary code execution)
- No secrets in content files (jokes, national days are public)
- Templates do not execute arbitrary code (Jinja2 sandbox not needed for this use case)
- File paths validated within content directory (no path traversal)

---

## Success Criteria

1. ✅ ASCII boxes render byte-identical to current output
2. ✅ Content updates require only YAML changes
3. ✅ All filters are pure functions with no I/O
4. ✅ Test coverage ≥80%
5. ✅ Files ≤400 lines, functions ≤50 lines
6. ✅ mypy strict passes
7. ✅ Render time <100ms (including template compilation)
