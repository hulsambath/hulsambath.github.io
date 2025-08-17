# NoteMyMinds Deep Link Setup

This portfolio website hosts the deep link landing page for NoteMyMinds app.

## Files

- **`public/note.html`** - Landing page for note deep links

  - Used when sharing note links on Facebook, Telegram, etc.
  - Auto-redirects to NoteMyMinds app on mobile devices
  - Includes Open Graph meta tags for social media previews

- **`public/.well-known/assetlinks.json`** - Android App Links verification
  - Required for Android App Links to work
  - Contains package names and SHA-256 fingerprints for:
    - `com.notemyminds.app` (production)
    - `com.notemyminds.app.dev` (development)
    - `com.sambath.myportfolio` (portfolio app)

## URL Format

**Note Deep Links:**

```
https://hulsambath.github.io/note.html?title=MyNote
```

**Examples:**

- Simple: `https://hulsambath.github.io/note.html?title=Daily%20Journal`
- With spaces: `https://hulsambath.github.io/note.html?title=My%20Daily%20Thoughts`

## How It Works

1. User shares link: `https://hulsambath.github.io/note.html?title=MyNote`
2. Social media (Facebook, etc.) crawls the page and shows preview
3. User clicks link → Opens in browser
4. JavaScript detects mobile device → Redirects to app
5. App opens → NoteMyMinds opens with the note

## Testing

### Test Link Preview

Use Facebook's Sharing Debugger:

1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://hulsambath.github.io/note.html?title=TestNote`
3. Click "Debug" to see preview

### Test on Device

```bash
# Test HTTPS app link
adb -s DEVICE_ID shell am start -W -a android.intent.action.VIEW \
    -d "https://hulsambath.github.io/note.html?title=TestNote" \
    com.notemyminds.app
```

### Verify App Links

```bash
adb shell pm get-app-links com.notemyminds.app
```

Should show: `hulsambath.github.io: verified`

## Deployment

The `note.html` file is automatically deployed when you push to the `develop` branch (via GitHub Actions).

After deployment, verify:

- File is accessible: `https://hulsambath.github.io/note.html`
- Assetlinks is accessible: `https://hulsambath.github.io/.well-known/assetlinks.json`

## Customization

To update the preview image, edit `note.html`:

```html
<meta property="og:image" content="https://hulsambath.github.io/favicon.png" />
```

To update title/description:

```html
<meta property="og:title" content="Your Custom Title" />
<meta property="og:description" content="Your custom description" />
```

## Troubleshooting

### Link Preview Not Showing

1. Clear Facebook cache: https://developers.facebook.com/tools/debug/
2. Verify Open Graph tags are present in HTML
3. Check image URL is accessible

### App Not Opening

1. Verify app links: `adb shell pm get-app-links com.notemyminds.app`
2. Check AndroidManifest has `android:autoVerify="true"`
3. Verify host matches: `hulsambath.github.io`
