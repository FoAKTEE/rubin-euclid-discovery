# Rubin / Euclid Multi-Archive Discovery Portal

Static site published at <https://foaktee.github.io/rubin-euclid-discovery/>.

Searches across Vera C. Rubin Observatory, ESA Euclid, DECam and further public archives proposed
157 Solar System candidates. An independent audit regraded every claim from its own archive
queries, orbit fits and archival pixels. This repository holds the public portal that reports the
outcome.

## Audited figures

| Quantity | Value |
|---|---|
| Solar System claims before the audit | 157 |
| Audited survivors (candidates awaiting follow-up) | 93 |
| Disputed claims, not counted | 17 |
| Eliminated claims | 6 |
| Claims matched to catalogued objects | 41 |
| Real-pixel movie targets | 96 (94 discovery targets + 2 recovery controls) |
| Real archival frames | 388 (249 single exposures) |
| Synthetic frames | 0 |
| Coverage gaps | 0 |
| Targets with no detection-epoch pixels (static coadds only) | 12 |

The recovery controls are the catalogued objects `2019 UM31` and `2021 QB98`. They are not discoveries.
Every surviving body is a candidate that awaits a Minor Planet Center designation and independent recovery.

## Contents

| Path | What it is |
|---|---|
| `index.html` | Portal hub: audited figures, links to every portal and artifact |
| `movie_gallery/` | Real-pixel multi-epoch movie gallery with per-frame provenance |
| `discovery_blog/` | Research monograph (English and Chinese) and the audited ledger |
| `eyes_3d/` | WebGL 3D explorer and model studio |
| `adam_console/` | Trajectory and planetary-defense demonstration console |
| `outputs/movies/` | Movie manifest, animated WebP movies, 300-dpi contact sheets (PNG) and vector contact sheets (PDF) |
| `outputs/real_cutouts/` | Cutout manifest and one `metadata.json` per target |
| `outputs/manuscript_regenerated/ms.pdf` | Compiled manuscript |
| `outputs/real_cutout_atlases/` | Vector cutout and photometry atlases |
| `data/audit_verdicts/` | Verdict ledgers of the independent audit |

## Notes on the data

- No frame is synthetic. All pixels come from public archives: Euclid DR1 VIS and MER, CTIO DECam,
  Rubin DP1 and DP2, and Legacy Surveys DR10.
- The animated GIF copies and the pixel arrays (`frames.npz`) named in the manifests are not
  published here. The WebP movies and the contact sheets carry the same frames.
- 25 `metadata.json` files named an absolute local cache directory; it is published as `<local>/<directory>`, and the manifest records the digest of both versions.
- The source code of the search pipelines is not part of this repository; it remains private in
  `FoAKTEE/find`.
