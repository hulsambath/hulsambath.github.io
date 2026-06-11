# Deep Linking & App Links

This portfolio's GitHub Pages domain (`hulsambath.github.io`) doubles as the
**deep-link / universal-link host** for the *NoteMyMinds* mobile app. This is a
hosting arrangement only — it doesn't affect the portfolio UI.

> Original notes: `DEEP_LINK_SETUP.md` (root) and `public/README_APP_LINKS.md`.

## Files involved (all in `public/`, shipped to the static site root)

| File | Role |
|---|---|
| `public/note.html` | Landing page for shared note links. Detects mobile and redirects into the app; includes Open Graph tags for social previews |
| `public/.well-known/assetlinks.json` | Android App Links verification (digital asset links) |
| `favicon.png` | Used as the default Open Graph preview image |

## Android App Links (`assetlinks.json`)
Declares verified package names + SHA-256 signing fingerprints so Android can
open links to this domain directly in the app. Packages declared:
- `com.notemyminds.app` (production)
- `com.notemyminds.app.dev` (development)
- `com.sambath.myportfolio` (portfolio app)

## Note deep-link URL format
```
https://hulsambath.github.io/note.html?title=MyNote
```
Flow: user shares the link → social crawler renders the OG preview → on a mobile
device the page's JS redirects into NoteMyMinds with the note context.

## Relationship to the OAuth server
The OAuth server (see [oauth-server.md](oauth-server.md)) redirects to
`https://hulsambath.github.io/auth?token=...` as its **universal-link** fallback
after login. So this domain serves two app-integration roles: note deep links
and the OAuth success redirect.

## Deployment & verification
Deployed with the rest of the site on push to `develop`. After deploy, confirm:
- `https://hulsambath.github.io/note.html` is reachable.
- `https://hulsambath.github.io/.well-known/assetlinks.json` is reachable.
- `adb shell pm get-app-links com.notemyminds.app` shows
  `hulsambath.github.io: verified`.

See `DEEP_LINK_SETUP.md` for full testing commands and troubleshooting.
