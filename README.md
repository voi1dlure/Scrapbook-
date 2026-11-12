# Volume One — Digital Friendship Scrapbook

A responsive, editable digital scrapbook built with plain HTML, CSS, and JavaScript. It includes the scrapbook visitor experience, connected memory/song/plan IDs, a local editing workbench, photo selection, a joke generator, an ISC checklist/countdown, a clickable stylised NYC map , and JSON import/export.

## Files

- `index.html` — page structure
- `styles.css` — design, responsive layouts, reduced-motion support
- `content.js` — default text, jokes, memories, playlist, destinations, checklists, and settings
- `app.js` — interactive functionality and local editor
- `assets/photos/` — put your own photos here if you want to reference filenames from `content.js`

## Preview on your computer

1. Download and unzip the project.
2. Open `index.html` in a recent browser.
3. For best results, run a tiny local server (some browsers restrict local file features):
   - If Python is installed, open a terminal in this folder and run `python -m http.server 8000`
   - Visit `http://localhost:8000`
4. The Google Fonts connection is optional. If offline, the page uses fallback fonts.

## Edit the scrapbook without editing code

1. Open the site and click **EDIT ARCHIVE**.
2. Use **TEXT & DETAILS** for the name, opening text, letter, exam date, and footer.
3. Use **MEMORIES** to add, edit, reorder, and remove memories. Each memory has a unique ID. A song can connect through `songId`, and a future plan can connect through `relatedPlan`.
4. Use **PHOTOS** to choose photos from your device for the cover, final page, or each memory.
5. Click **SAVE CHANGES**. These edits are saved in this browser on this device.
6. Open **BACKUP** to export a JSON file. Keep a backup before resetting or moving devices.

### Important local-storage limits

This starter version is deliberately backend-free. Text edits and chosen photos are stored in browser `localStorage` on the device and browser where you made them. Browser storage can be cleared, can run out of space for large image data, and does **not** sync to another phone or computer. Export a JSON backup and keep the original photos separately.

The editor is a local workbench, not a secure private online CMS. It does not upload photos to a server and it does not automatically publish edits to a public URL.

## Change the published/default version

For edits that should appear to everyone when you publish the website, update `content.js` and any image paths, then redeploy the folder to your host. Keep the JSON structure and commas valid. You can place photos in `assets/photos/` and set e.g. `"image": "assets/photos/teachers-day.jpg"` in a memory entry. A blank `image` shows an intentional placeholder.

The in-browser editor's JSON backup is also useful as a working content file. For a fully online editor that publishes to every visitor immediately, you need a backend/database and image storage (for example, a secured hosted database and storage bucket). Do not put private service credentials in `app.js` or any other public frontend file.

## Publish for free

A static host can serve this folder for free, for example GitHub Pages, Netlify, or Cloudflare Pages. Create a repository or upload the folder according to the host's current instructions, then publish the site. Do not claim a URL exists until the host gives you one.

**Publishing updates:** after editing `content.js` or replacing image files, publish/deploy the updated folder again. Browser-only edits are private to the browser and will not update the hosted version.

## Music

The playlist contains the requested track titles, with **Heart to Heart — Mac DeMarco** first. The recordings are not bundled with the website. To play a song inside the page, open **EDIT ARCHIVE → SOUNDTRACK**, choose an audio file from your device for that track, and press play. The selected audio is saved in this browser's IndexedDB and plays through the built-in cassette player without redirecting to YouTube. The audio files stay on this device and browser, so upload the files again on another device. Direct audio-file URLs are also supported. A title or a YouTube page link alone cannot be played by the HTML audio player. Browsers may block autoplay with sound, so visitors need to press play.

## Content structure

`content.js` contains:
- `siteSettings`
- `openingScreen`
- `teachersDayMemories`
- `birthdayMemories`
- `photoGallery`
- `fieldNotes`
- `jokes`
- `thankYouLetter`
- `iscSection`
- `newYorkTravelGuide`
- `bucketList`
- `playlist`
- `futurePlans`
- `finalPage`

## Connected archive model

Every gallery memory has an `id`. Playlist entries can point to a memory using `memoryId`. Memory entries can refer to a song with `songId`, a future plan with `relatedPlan`. Use these IDs consistently so the same underlying memory can be connected across the photo gallery, soundtrack, and future plans.

## Notes

- The map is a stylised, approximate illustration, not a navigation map.
- Destination links are provided as starting points; check official information and current conditions before travel.
- Disneyland is in California, not New York City, and is explicitly treated as a separate trip.
- No personal memories or photographs are fabricated. Placeholder text is marked for replacement.


## Latest edits included
- The opening soundtrack entry is now **Heart to Heart — Mac DeMarco**.
- The EDIT ARCHIVE workbench includes a **SOUNDTRACK** tab to add, remove, and edit song titles, artists, direct audio URLs, notes, and uploaded audio files. Uploaded audio plays inside the page without opening YouTube.
- Uploaded cover photos display without decorative layers over them and preserve the full image.
- Memory photos display without cropping.
- Browser autoplay with sound is restricted by most browsers, so visitors may still need to press play or tap the song link.

### Playlist update

This build includes the updated seven-track playlist, starting with **Heart to Heart — Mac DeMarco**, followed by the six requested songs. On the first launch, it replaces an older playlist saved by a previous version of this archive while keeping the rest of your saved edits. After that, playlist edits you make in Edit Archive are preserved.

- The front page now has a **PLAY ME ♫** button. It plays or pauses the opening track, **Heart to Heart — Mac DeMarco**, directly in the scrapbook without opening another website. Add the audio file in EDIT ARCHIVE → SOUNDTRACK first.

## Teachers’ Day and birthday photos
Open **EDIT ARCHIVE → PHOTOS → EVENT PHOTOS**. There is a separate upload slot for the Teachers’ Day lore card and the birthday archive card. Choose or replace each image, then press **SAVE CHANGES**. The full image is shown without cropping. The same section has remove-photo buttons when an image has been added. To edit the event headings, story text, section headings, and captions, open **EDIT ARCHIVE → TEXT & DETAILS** and scroll to **TEACHERS’ DAY LORE** and **BIRTHDAY LORE**.
