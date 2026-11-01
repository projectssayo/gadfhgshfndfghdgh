# Practical Manual Viewer (Pages 19–32)

Mobile-first static website that shows the manual pages in order.
Tap any page to open the full-screen viewer:

- **Pinch** with two fingers to zoom in/out
- **Drag** to pan when zoomed
- **Double-tap** to zoom in / back to fit
- **Swipe left/right** (when not zoomed) for next/previous page
- Desktop: mouse wheel / trackpad pinch to zoom, arrow keys, `+` `-` `0`, `Esc`

No build step, no dependencies. Just static files.

## Deploy on GitHub Pages
1. Create a new repository on GitHub (e.g. `manual-viewer`).
2. Upload everything in this folder (keep the structure and the hidden `.nojekyll` file).
3. Repo **Settings → Pages → Build and deployment → Deploy from a branch**,
   choose branch `main` and folder `/ (root)`, then **Save**.
4. After a minute your site is live at `https://<your-username>.github.io/<repo-name>/`.

## Using git from the command line
```bash
git init
git add .
git commit -m "Add manual viewer"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Structure
```
index.html
css/style.css
js/app.js
images/page_19.png ... page_32.png
.nojekyll
README.md
```
