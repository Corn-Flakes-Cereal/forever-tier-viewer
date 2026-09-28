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
- Character models come from `.../classicplus/meta/charactercustomization/<ChrModelId>.json`. For the classic races
  ChrModelId = race*2-1+gender (HD models; 256 + that would be the legacy SD models, not used). Skyborne (Wowhead race 95 High Order / 96 Windshaper)
  use ChrModel 218 (male) / 219 (female) — HD only. `meta/character/<N>.json` maps any model id back to race/gender.
- Race/class combos are Forever's (see `RACES` in `index.html`); disallowed classes are greyed out.
- Backdrops are hotlinked capital-city screenshots (`CITIES` in `index.html`), shown behind the transparent canvas.
- Armor comes from `.../classicplus/meta/armor/<slot>/<displayId>.json`. The display IDs are hard-coded in `index.html`
  (from Wowhead's Forever item pages, `item=<id>&xml`). Role variants of a set (e.g. Justice Armor / Battlegear / Battleplate) share one appearance.

## Data

All sets live in `data.js` (`window.SETS`), generated from `data/*.json`:
- `data/hyjal-base.json` + `data/hyjal-extra.json` — Forever Season 1 Hyjal sets (Wowhead Forever DB, `item=<id>&xml`).
- `data/<class>-classic.json` — Classic Tier 1/2/3 and Dungeon Set 1/2 (Wowhead Classic DB). Their display IDs work on the
  `classicplus` model server.
Each set: `{tier, name, class, role, bonus[], db, setId?, pieces:[{slot, id, name, icon, displayId}]}`.
Tier codes: `S1` Hyjal, `T1`–`T3`, `D1`, `D2`. Slots: Head, Shoulder, Chest, Wrist, Hands, Waist, Legs, Feet.

To add a set: append it to the right JSON, then regenerate `data.js` (concatenate all sets into `window.SETS = [...]`).
To find a display ID: `https://www.wowhead.com/forever/item=<ID>&xml` (or `/classic/`) → `displayId` on the `<icon>` element.

Not affiliated with Blizzard or Wowhead. Models and item data © Blizzard Entertainment.

## Relay (required)

Wowhead's model server blocks cross-site reads, so the page loads model files through a small relay.
The live relay is a Railway Function (project `hyjal-relay`, service `relay`) at
`https://relay-production-df48.up.railway.app/`; its source is `relay/railway-function.ts`.
`relay/worker.js` is an equivalent Cloudflare Worker if you ever want to move it.
The relay URL is the first entry of `RELAYS` in `index.html`.
