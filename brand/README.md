# Brand source artwork

`secryn-icon-512.png` is the master mark. Everything else in the repo is
generated from it:

| Generated file | Size | Used by |
| --- | --- | --- |
| `src/assets/secryn-mark.png` | 128 | `LogoMark` (header, footer) |
| `public/favicon.png` | 192 | browser tab |
| `public/apple-touch-icon.png` | 180 | iOS home screen |
| `public/og.png` | 1200×630 | social share card |

The favicon and touch icon bake in the white plate; the component asset does
not, because the plate is drawn in CSS so it can pick up the page's radius and
ring tokens.

Mark colours: indigo `#394f95`, cyan `#02dde1`. The indigo measures 7.0:1 on a
light ground and 2.65:1 on the site background, which is why the mark always
sits on a light plate rather than directly on the page.

Regenerate after changing the master with the snippet in the project README.
