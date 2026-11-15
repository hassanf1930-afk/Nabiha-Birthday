# A Birthday Website

A 4-page birthday site (Home, Wishes, Little Memories, Things I Appreciate) with a
"tap to open" cover that starts your song, floating heart animations,
a persistent music player, and a design that follows the pink event-flyer
look you shared. Pure HTML/CSS/JS — no build step, no dependencies to
install, works great on GitHub Pages.

## Pages
- `index.html` — cover ("tap to open"), hero, quick links to the other pages
- `wishes.html` — a birthday letter + short wishes
- `our-story.html` — a vertical timeline of friendship memories
- `love.html` — flip cards with things you appreciate about her

## 1. Edit everything in one place: `content.js`
Every bit of text on the site — her name, the nickname, the birthday
letter, the timeline chapters, the things you appreciate about her, even the photo
filenames — lives in `content.js` at the top of this folder. Open it
in any text editor (Notepad, TextEdit, VS Code, anything). It looks
like this:

```js
const SITE_CONTENT = {
  "site": { "herName": "Nabiha", "fromName": "Hassan", ... },
  "wishes": { "letter": ["My dearest {{herName}},", "..."], "miniWishes": [...] },
  "story": { "chapters": [ { "title": "...", "text": "..." } ] },
  "love": { "reasons": [ { "icon": "heart", "title": "...", "back": "..." } ] }
};
```

Only edit what's *inside* the `{ ... }` — leave the `const SITE_CONTENT =`
at the very top and the closing `};` at the very bottom untouched.

The site uses clean vector icons (no emoji) for all decoration. Wherever
an `"icon"` field appears in `content.js` (in `home.cta` and
`love.reasons`), use one of these names: `heart`, `star`, `sparkle`,
`flower`, `ribbon`, `envelope`, `clock`, `balloon`.

A few tips:
- Keep the quotes `"..."` around every bit of text.
- To add or remove a wish, timeline chapter, or love-reason, just add
  or delete an entry in that list (copy the `{ }` shape of an existing one).
- `{{herName}}` and `{{fromName}}` anywhere in the text get automatically
  swapped for the real names from `"site"` — change the name once, and
  it updates everywhere.
- Save the file, refresh the page — that's it, no code required.

You still won't touch any `.html`, `.css`, or `.js` file for normal edits.

## 2. Add your song
Put your mp3 in `assets/audio/` and name it exactly `song.mp3`, or point
`"songPath"` in `content.js` at a different filename.
Music keeps playing as she moves between pages, and remembers her
position/play state via the browser's local storage. Because browsers
block autoplay before any tap, the music starts the moment she taps
"Tap to Open" on the cover page — and a small pink music button in the
bottom-right corner lets her play/pause anytime.

## 3. Add your photos
Drop images into `assets/images/`, then point to them by filename in
`content.js`:
- `home.ribbon.photoSrc` — the homepage polaroid
- `story.photos` — the list of photos on the Little Memories page (add or
  remove entries here, each with its own `src` and `caption`)

No image yet? Each frame shows a nice pink "replace photo" placeholder,
so nothing looks broken.

## 4. Preview it locally
Just double-click `index.html` to open it in a browser — it works
straight away, no server needed. (If you'd rather run one anyway,
`python3 -m http.server 8000` from this folder and visit
`http://localhost:8000` works too.)

## 5. Put it on GitHub Pages
1. Create a new **public** GitHub repository.
2. Upload everything in this folder to the repo (keep the folder
   structure — `css/`, `js/`, `assets/` should stay at the top level,
   next to the `.html` files).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to `Deploy from a
   branch`, branch `main`, folder `/ (root)`. Save.
5. GitHub will give you a link like
   `https://yourusername.github.io/your-repo-name/` — that's the
   birthday site link to send her. It can take a minute or two to go
   live after the first deploy.

## Notes
- Everything is responsive — it looks and behaves well on phones,
  tablets, and laptops.
- Animations respect "reduced motion" settings for accessibility.
- No frameworks, no build tools, no npm install — just static files,
  so it's about as simple as hosting gets.


## Personalization in this version
This copy is set up for Nabiha’s birthday on 16 December, from Hassan. Her birth year is intentionally not displayed because it was not provided. Edit `content.js` if you want to personalize any wording or replace the sample photos with your own pictures.
