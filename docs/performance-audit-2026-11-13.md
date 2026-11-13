# EZSVS onboarding performance and regression audit

Test date: 13 November 2026. Improved source/player: **0.4.3-web.1**. Unity **6000.3.22f1**, URP **17.3.0**. Work was performed on the supplied onboarding Unity source, separately from the unrelated ATS repository. The original source directory was subsequently deleted by the user; the user authorized retaining this working copy as the deliverable. No publishing or Git push was performed.

## Measured Stage 2 result

The supplied v0.4.2 website ZIP was served alongside the rebuilt project on localhost. Both used visible Chrome, hardware graphics, the same laptop, a 1280×720 viewport at DPR 1, Auto quality with scene render scale 1, and Stage 2 review camera 3 (cold aisle). Each sample lasted 15 seconds. Two samples were taken per build, with no Unity compilation running during them. Both scenes retained one room and nine character/shared bundles. Screenshots show the same camera and near-field geometry; this is not a pixel-identical render test.

| Measure | Supplied v0.4.2 | Improved 0.4.3-web.1 |
| --- | ---: | ---: |
| Animation-frame FPS, sample 1 | 22.92 | 32.79 |
| Animation-frame FPS, sample 2 | 23.17 | 33.88 |
| Mean FPS across samples | 23.05 | 33.33 |
| 95th-percentile frame gap | 50.0–50.1 ms | 38.9 ms |
| Unity-reported median FPS | 23.07–23.38 | 33.04–33.98 |
| Unity allocated memory | about 426 MB | about 442 MB |
| Resolution / scene scale | 1280×720 / 1.0 | 1280×720 / 1.0 |

The repeatable cold-aisle scene was **about 45% faster**. These are local laboratory observations of requestAnimationFrame cadence, corroborated by Unity's FPS metric. They are not physical-display measurements, field percentiles, a whole-course average, or physical-phone results. Desktop shadow/lighting submission differs between native renderer cells and the old manual instance path; no art-quality approval is implied.

A later confirmation after the full build command and final packaging measured 22.13 FPS for the supplied build and 34.09 FPS for the final delivery, with the same camera/resolution/Auto settings. The primary 45% figure above uses the two original samples per build, not a selected best frame rate.

The measured Stage 2 entry's longest main-thread task fell from **4,065 ms to 764 ms**. The recorded end-to-end entries were 7.91 s and 3.51 s respectively, but the first used network downloads and the latter verified cached assets, so these times must **not** be presented as a controlled network-loading speedup. See raw load records in `evidence/` for exact conditions.

To remove that cache mismatch, a separate final comparison cleared the verified asset cache for both builds and entered Stage 2 immediately from the initial site. Entry took **6.39 s → 4.73 s** (about 26% less time) and the longest entry task was **2,774 ms → 811 ms**. No Unity compilation or package compression ran during these measurements. Verified bytes fetched through that point were 190.88 MB → 199.62 MB; the DXT texture choice slightly increases transfer size. This is one cold-cache pair over localhost, not a prediction for GitHub Pages or mobile-network loading. One Stage 1 bundle was still retiring at the first Stage 2 metric; after settling the final scene retained nine bundles.

The navigation regression fixture (93 obstacles) constructed the original navigation map in 90.85 ms and the indexed map in 7.40 ms. Across four equivalent dynamic routes, callback work fell from 119,264 checks to 38,271. These are synthetic editor measurements, separate from real Stage 2 browser timing.

## Changes made

1. **Navigation:** index static obstacle rectangles in 2 m spatial buckets while retaining exact circle/rectangle clearance. Check dynamic agents only for visited path nodes, memoizing within a synchronous search. Restrict nearby start-node candidates before expensive agent checks. Bounds, body clearance, destinations and route semantics remain covered against the supplied implementation.
2. **Rendering:** use the existing spatial mesh-combination path in desktop WebGL, avoiding thousands of managed-to-JavaScript manual draw submissions each frame. Preserve the existing 2 m cells, conservative solid-wall occlusion and rack LOD rules. Mark generated visual cells so navigation rebuilds do not create giant enclosing colliders. Original scenery colliders remain authoritative.
3. **Camera collision:** reuse physics query buffers and select the nearest solid without sorting/allocating every frame. Grow and repeat saturated queries so nearby walls are still found behind ignored actor colliders; retain overlap handling.
4. **Streaming:** asynchronously load character prefabs and their dependencies under the loading gate rather than synchronously during room creation. Cache loaded prefabs, deduplicate concurrent loads, and wait for in-flight loading before retiring bundles. Trim prefab references with unloaded bundles.
5. **Textures and delivery:** build desktop DXT and mobile ETC2 players with matching streamed bundles. Select by actual GPU S3TC support, then use that variant's loader, core data, WASM, framework and bundle manifest together. Release the selection probe's WebGL context. Existing bounded, hash-verified downloads and cache behavior are retained.
6. **Display controls:** make desktop Smooth change the runtime 3D scene scale to 0.6, including after startup, without reducing UI canvas density. Auto and High retain full desktop scene scale; mobile's existing scales remain unchanged.
7. **Build/package checks:** reject missing Web Build Support and incomplete player outputs; validate fresh success summaries for each requested variant. Package both variants with relative paths, 4 MiB parts, SHA-256 checks and ZIP CRC validation. Preserve pre-existing delivery folders/ZIPs. Add tests for loader failures and variant selection, display metrics and package reconstruction.

The course's twenty red lines, answer rules, authored Chinese/English content, save schema 3 and storage keys were not changed. Production audio preferences were preserved; Chrome was launched with `--mute-audio` for the user's comfort. No new runtime package, backend or hosting provider was introduced.

## Validation

| Check | Result |
| --- | --- |
| Supplied editor handoff checks: scene, fonts, data, characters, rigs, mesh/material/script references | 89 passed |
| New navigation/camera regression comparisons, including 8,392 clearance queries, routes, wall slides, overlap/buffer overflow and visual-only cells | 15 passed |
| Loader/cache/integrity/concurrency/retry/GPU-selection and display-metric Node tests | 17 passed |
| Python packager tests, including two variants, reassembly, mismatched versions, existing-output preservation and dotted version names | 6 passed |
| Desktop English full-course player checks | 207 passed |
| Desktop Chinese full-course player checks | 202 passed |
| ETC2/mobile English course under Android touch emulation | 207 passed |
| Fresh desktop DXT and mobile ETC2 WebGL player builds | Valid HTML, loader, WASM and streamed bundles produced |
| Combined website package | Both variants' part sizes, hashes, reassembly and ZIP CRC checked |

English adds five translation/name-preservation assertions; this explains the 207 versus 202 check counts. The player checks exercise correct-answer and wrong-first-answer runs, all twenty red lines, Stage 2 hazards, route reachability, save round trips and torn-write recovery. They use the supplied local QA harness, which drives internal gameplay methods; they do not replace a human playthrough of every interaction.

Additional browser observations:

- Visited stages 1 → 5 → 2 → 1 → 2 in a fresh normal review instance. Settled room count stayed at one; bundle counts were 7, 10, 9, 7, 9. Stage 2 allocated memory was about 448 then 450 MB after visiting other floors, versus 442 MB in the fixed initial scene. This is a short lifetime check, not a long-session leak certification. Reserved WASM/process memory need not shrink immediately.
- Injected HTTP 503 failures into all five parts of Stage 2's YANDY bundle, after removing those parts from the isolated browser's verified cache. All parts exhausted their retries (15 retries total); the previous room stayed visible behind a Retry overlay, with no application error. Removing the outage and clicking Retry entered Stage 2 successfully, settled to one room/nine bundles, and reused completed downloads.
- Checked the actual ETC2 variant with Android user-agent/touch emulation and a 900×340 viewport at DPR 2.625. Canvas density was capped to 1.5, resulting in 1350×510 pixels, scene scale 0.75. The objective, touch stick and action controls were visible; there was no horizontal page overflow and `ezsvsErrors` stayed empty. The test disabled the desktop S3TC extension only in browser instrumentation to force the mobile package on a desktop GPU. This is compatibility emulation, not evidence of phone GPU speed.
- A real emulated touch-start/move/end sequence on the movement stick moved the saved player position by 2.29 m over 1.2 seconds, with no application errors. Review saves use the existing isolated `qa-0` slot; normal user progress was not used.
- Switching Smooth during desktop play changed scene scale to 0.6 while retaining the 1280×720 UI canvas; switching Auto restored scale 1. The Smooth sample remained about 33.6 FPS on this laptop. Reduced pixel count alone did not materially improve this view, consistent with remaining CPU/submission cost; this is an inference, not a profiler attribution.

The artifact ZIP contains both texture families and is approximately 515 MB. A session selects one variant rather than downloading both. This increases deployment storage and build time; the new desktop scene's memory is about 16 MB higher than the measured baseline.

## Known limits and next work

- Stage 2 improved materially but is **not a stable 60 FPS scene** on the tested laptop. Further work should profile CPU frame submission during normal guided movement, then reduce expensive visible material/renderer groups with art review. Do not advertise a universal frame-rate guarantee from a fixed-camera sample.
- No physical Android/iOS device was available. Validate sustained FPS, thermal behavior, browser process memory, touch movement and recovery on the employee devices before rollout. Desktop ETC2 emulation can emit texture-decompression warnings because it is not a mobile GPU; the automatically selected desktop DXT build no longer emitted the old ETC2 decompression warnings.
- Unity/URP reported three editor-resource diagnostics per build involving `TraceRenderingLayerMask.urtshader` host types; the desktop build also reported two existing C# warnings (unreachable code and an unused field). Build summaries say `Succeeded`, actual outputs were validated and played, but these are not zero-diagnostic builds. Browser logs also retain existing WebGL/shader/persistent-data warnings, plus the intentionally induced HTTP errors. Do not describe the console as completely clean.
- A later full-command check after relocating the project alias hit Unity's internal Bee error “Backend has requested a buildprogram run 6 times.” The wrapper correctly rejected the failed build despite old artifacts still being present. Its failure log is retained separately; failed runs are not release evidence. Keep the project/editor paths stable and use a writable local Bee cache.
- Repeating the same full build command with the populated cache then succeeded: desktop 12.25 s and mobile 14.12 s, with valid artifacts for both. The final package was rebuilt from these successful outputs. The scripts do not automatically retry or silently accept a failed Unity run.
- External GitHub Pages latency, slow/mobile networks, Safari/iOS, offline operation and long-session memory were not certified. No production deployment, APK/EXE rebuild, native snapshot restore or artistic acceptance was performed.
- The old native snapshots and art-authoring files were in the original directory/archive, which the user deleted. They are outside this working copy; no claims are made about updating or restoring them. The playable Unity assets needed for this WebGL build are included.

## Reproduction and evidence

Use the commands in the root README. Logs contain exact build summaries, editor checks and compiler diagnostics. `Docs/evidence/` contains raw performance samples, course reports, lifetime observations, outage recovery and screenshots. QA/review URLs work only on localhost. Performance comparisons must use a fresh **non-QA** review instance; the QA asset audit temporarily retains all actor assets and changes memory behavior.

A manager-ready update: “We now have a rebuilt and tested source version. In the controlled Stage 2 scene it improved from about 23 to 33 FPS at the same resolution, and the largest measured scene-entry stall dropped substantially. Course regressions passed in Chinese and English, and interrupted downloads recovered. The remaining release checks are sustained testing on employee phones and review of the documented Unity warnings. The updated site has not been published.”
