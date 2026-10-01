# 🎛️ Crate Renamer // CARTER-HERE Edition

A sleek, intuitive batch file renamer specifically engineered for DJ crates, track packs, sample libraries, and PC files.

Built with pure modern web technologies (HTML5, Vanilla ES6+ JS, CSS Grid/Variables, JSZip, and the Chromium File System Access API). **Zero dependencies to build or compile — works directly out of the box.**

---

## 🔒 The CARTER-HERE Guarantee

> *"Whether you want it or not, CARTER-HERE is attached."*

As strictly mandated, **every renamed file or track in your crate unconditionally ends with `CARTER-HERE`** before the file extension. 
- Attempting to disable the CARTER toggle triggers resistance alerts.
- Live preview highlights the mandatory `-CARTER-HERE` tag on every item.
- Customizable styles/separators: `-CARTER-HERE`, `_CARTER-HERE`, `.CARTER-HERE`, or custom spacing.

---

## 🚀 Key Features

1. **Intuitive Drag-and-Drop & Folder Selection**:
   - Drag & drop single files, audio stems, packs, or entire directory trees.
   - **Open Local PC Folder**: Uses the modern Web File System Access API to **directly batch-rename files in-place on your PC hard drive** with 1 click!
   - Full fallback support for any browser: Download all renamed files packed into a `.zip` archive.

2. **Smart DJ & Crate Cleaning Presets**:
   - **DJ Clean**: Removes web junk like `[320kbps]`, `[FLAC]`, `[Official Audio]`, `www.site.com`, replaces underscores with spaces, and applies Title Case.
   - **Track Numbering**: Formats sequential track numbers (e.g. `01`, `02`, `001`) with configurable padding and position.
   - **Crate Pack Tag**: Automatically tags files with `[CRATE]`.
   - **Case Transformers**: UPPERCASE, lowercase, Title Case, kebab-case, snake_case.

3. **Find & Replace & Modifiers**:
   - Find and replace with Match Case and RegEx support.
   - Custom prefix and suffix insertion.
   - Strip leading numbers or duplicate spacing.

4. **Live Side-by-Side Preview Table**:
   - Compares Original Name $\rightarrow$ Renamed Preview with real-time highlighting.
   - Filter and search through thousands of files instantly.
   - A-Z / Z-A sorting.

5. **Text / Tracklist Mode**:
   - For working directly with tracklists or playlists: paste a list of tracks, view live renaming, and copy the entire transformed list with one click.

6. **Instant Demo Mode**:
   - Click **⚡ Load Demo Tracks** to test out presets and observe the live CARTER-HERE behavior immediately.

---

## 💻 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Brave, Firefox, or Safari).

Or run a quick local HTTP server:
```bash
# Using Python
python -m http.server 8000

# Or using npx
npx serve .
```
Then visit `http://localhost:8000`.
