# Training scene layout

The guided course advances between scenarios automatically. Its floor builders now skip the stair core before creating stairs, signs, colliders, navigation transitions or floor openings. The former lobby stair footprint becomes ordinary floor space. Reception, closed gate barriers and the answer-driven course transition remain the active first-stage route.

The outdoor introduction uses fixed parked sedans in marked bays and the existing loading-area truck. Moving road traffic has been removed, reducing distracting motion and per-frame traffic updates.

CourseLayoutChecks.Run validates stair removal, continuous floor space, vehicle placement, reception reachability and the closed gate. Desktop Chinese and mobile English full-course checks validate the authored objectives and scene transitions.

Version 0.4.4-web.2 passed all 20 layout checks, 202 desktop course checks, 207 mobile ETC2 course checks, 24 JavaScript tests and seven packager tests. A fresh-player desktop walkthrough entered the lobby in approximately 2.5 seconds after the final opening dialogue on the local server. Mobile checks use browser emulation.

Both WebGL builds reported Succeeded. The editor logged three URP probe-resource type diagnostics per variant. The initial build through the long C drive junction failed at the native linker; the successful rebuild used the canonical D drive workspace. Browser course and first-play checks found no runtime errors.

Further reductions can focus on lift lobbies, distant exterior buildings and optional non-course staff. Each can be measured against its teaching purpose, scene build cost and download size before removal.
