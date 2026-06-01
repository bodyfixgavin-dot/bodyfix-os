# TASA font assets

BodyFix OS expects the self-hosted TASA webfont files in this folder:

- `TASAExplorer-Regular.woff2`
- `TASAOrbiter-Regular.woff2`

The global `@font-face` declarations in `app/globals.css` point to these exact paths and restrict the font usage to Latin / symbol ranges so Chinese copy continues to fall back to the existing BodyFix Chinese sans-serif stack.

If replacing these files with a newer TASA release, keep the filenames stable unless the `@font-face` URLs are updated at the same time.
