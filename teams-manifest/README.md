# Teams manifest — not ready to sideload yet

This manifest is a placeholder for when the MVP is ready to test inside real Teams. Still needed before it can be zipped and sideloaded:

- Replace `TODO_GENERATE_A_NEW_GUID` with a new GUID (this is the Teams app's own id, unrelated to the Entra client ID).
- Replace `TODO_ENTRA_CLIENT_ID` with the Entra app registration's client ID, in both places it appears.
- Replace `TODO_STATIC_WEB_APP_DOMAIN` with the actual `*.azurestaticapps.net` hostname, in all four places it appears (`developer` URLs, `contentUrl`, `resource`, `validDomains`).
- Add `color.png` (192x192) and `outline.png` (32x32, transparent) to this folder — Teams requires real PNG icons, the app's SVG assets don't satisfy this.
- Zip `manifest.json` + the two PNGs together (flat, no subfolder) to get the sideloadable package.

Sideload via the Teams Developer Portal (dev.teams.microsoft.com) once the above is filled in — see `PLAN.md` for the full flow.
