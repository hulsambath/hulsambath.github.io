# App Links Landing Pages

This directory contains landing pages that redirect to the NoteMyMinds app.

## Files

### `app.html` - Main Screen Landing Page

**Purpose:** Opens NoteMyMinds app to main screen (Notes list)

**URL:** `https://hulsambath.github.io/app.html`

**Use Cases:**

- Share link to open the app
- Facebook posts linking to app
- General app deep links

**Features:**

- Auto-redirects to app on mobile
- Shows dialog in Facebook webview
- Uses Android Intent URL for system dialog
- Fallback button if auto-redirect fails

### `note.html` - Note Deep Link Landing Page

**Purpose:** Opens NoteMyMinds app to a specific note

**URL:** `https://hulsambath.github.io/note.html?title=MyNote`

**Use Cases:**

- Share specific notes
- Facebook posts with note links
- Note-specific deep links

**Features:**

- Extracts title from URL
- Opens note with title in app
- Auto-redirects on mobile
- Facebook webview support

## Why Not Use Root Path?

**`https://hulsambath.github.io/`** opens your portfolio website (React app), not the NoteMyMinds app.

To open the app, use:

- ✅ `https://hulsambath.github.io/app.html` - Opens app (main screen)
- ✅ `notemyminds://open` - Opens app directly (custom scheme)
- ❌ `https://hulsambath.github.io/` - Opens portfolio website

## URL Mapping

| URL                                              | Destination                                   |
| ------------------------------------------------ | --------------------------------------------- |
| `https://hulsambath.github.io/`                  | Portfolio website                             |
| `https://hulsambath.github.io/app.html`          | NoteMyMinds app (main screen)                 |
| `https://hulsambath.github.io/note.html?title=X` | NoteMyMinds app (note with title)             |
| `https://hulsambath.github.io/home`              | NoteMyMinds app (invalid route → main screen) |

## Deployment

These files are automatically deployed when you push to the `develop` branch (via GitHub Actions).

After deployment:

- `app.html` → `https://hulsambath.github.io/app.html`
- `note.html` → `https://hulsambath.github.io/note.html`
