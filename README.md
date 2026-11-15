# ByteStudio Remote Desktop — product site

Static GitHub Pages site for **ByteStudio Remote Desktop**, the Meta Quest app that brings a
Windows or Linux desktop into VR over standard RDP.

- `index.html` — product page: features, Free vs Ultra, screenshots, setup, FAQ, Store calls to action.
- `privacy.html` — privacy policy, including the in-app purchase disclosure.
- `images/` — app icon, Store cover and layout screenshots.

The app is a free download on the Meta Horizon Store; the Ultra edition is a one-time in-app
purchase that adds a third screen, curved panels and layout presets. Quest Pro, Quest 3 and Quest 3S.

Windows 10/11 Pro is expected to work because it exposes standard RDP, but it is **not officially
supported yet**: it has not been tested. Testers are welcome to report back at
`bytestudio.rdp@gmail.com`.

Store listing: https://www.meta.com/experiences/1466447889876925/

## Preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000/.

## Deploy

Push to the `main` branch of `bytestudio-vr.github.io`; GitHub Pages serves the repository root as
is, with no build step.
