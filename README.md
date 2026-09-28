# Hyjal Fitting Room

A single-page "dressing room" for the WoW: Forever Season 1 (Hyjal Summit / Barrow Deeps) class tier sets.
Pick a race + gender, pick a class and set variant, toggle pieces, and rotate the model.

Everything is one file: `index.html`. No build step.

## Hosting on GitHub Pages

1. Create a new public repo on GitHub (e.g. `forever-tier-viewer`).
2. Upload `index.html` (and this README) to the repo root.
3. Repo **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/forever-tier-viewer/`.

It must be served over http(s); opening `index.html` straight from disk won't load the 3D viewer.

## How it works

- 3D rendering is Wowhead's ZAM model viewer, loaded from `https://wow.zamimg.com/modelviewer/classicplus/viewer/viewer.min.js`.
  `classicplus` is Wowhead's data environment for WoW: Forever.
- Character models come from `.../classicplus/meta/charactercustomization/<race*2-1+gender>.json`.
- Armor comes from `.../classicplus/meta/armor/<slot>/<displayId>.json`. The display IDs are hard-coded in `index.html`
  (from Wowhead's Forever item pages, `item=<id>&xml`). Role variants of a set (e.g. Justice Armor / Battlegear / Battleplate) share one appearance.

## Adding more sets later

Edit the `CLASSES` array in `index.html`: each class has a `display` object with six display IDs
(head, shoulder, chest, hands, legs, feet) and a `chestSlot` of `5` (chest) or `20` (robe). To find a display ID for a new
item, open `https://www.wowhead.com/forever/item=<ITEM_ID>&xml` and read the `displayId` attribute on the `<icon>` element.

Not affiliated with Blizzard or Wowhead. Models and item data © Blizzard Entertainment.

## Relay (required)

Wowhead's model server blocks cross-site reads, so the page loads model files through a small relay.
`relay/worker.js` is a Cloudflare Worker (free tier is plenty):

1. dash.cloudflare.com → **Workers & Pages → Create → Start with Hello World** → name it (e.g. `hyjal-relay`) → Deploy.
2. **Edit code**, replace everything with `relay/worker.js`, **Deploy**.
3. Copy the worker URL (`https://hyjal-relay.<account>.workers.dev/`) into the first `RELAYS` entry in `index.html`.
