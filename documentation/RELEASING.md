# Releasing the theme

How a change in this repo gets to the live site (https://www.dsebastien.net, Ghost(Pro) instance `dsebastien.ghost.io`).

## 1. Prepare

- All changes committed on `main`, working tree clean (`git status`).
- Push before deploying: the live theme must always correspond to a pushed commit so any machine can rebuild (and roll back) any deployed version.

## 2. Test

```bash
bun run test        # tailwind + gulp build + gscan
```

Must end with "compatible with Ghost 6.x". Never deploy a build that fails gscan.

## 3. Build the deploy artifact

```bash
bun run zip         # minified production build -> dist/dsebastien.zip
```

`dist/` is git-ignored; the zip is a build artifact, not a tracked file.

## 4. Deploy to the site

Two paths (full details in the vault process note "Deploying the dsebastien.net Ghost theme (Process)"):

- **Admin UI (manual):** Ghost Admin → Settings → Design & branding → Change theme → Upload theme → select `dist/dsebastien.zip`. Same-named upload replaces the current version and stays active.
- **Admin API (scripted):** the vault skill `developassion-theme-deploy` wraps this: it uploads to `/ghost/api/admin/themes/upload/` and activates if needed. Requires `GHOST_ADMIN_KEY` (Ghost custom integration key, `id:secret`).

**AI assistants: always ask Sébastien for confirmation before uploading.** Building and testing is free; the upload changes the live site. Do not deploy as a side effect of unrelated work.

## 5. Verify

- Load the home page and one article page; check the changed areas.
- Targeted check: `curl -s https://www.dsebastien.net/ | grep <expected-change>`.
- Browser console: no new JS errors on home + one post.

## 6. Roll back (if needed)

Check out the previous commit, `bun run zip`, upload that build via either path.
