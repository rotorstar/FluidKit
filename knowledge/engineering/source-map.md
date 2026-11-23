---
type: Coverage Map
title: Quellen und Dokumentationsabdeckung
description: Jede aktive Quelldatei ist belegten Engineering-Konzepten zugeordnet.
audience: engineering
tags:
  - reference
  - generated
status: draft
generated:
  by: process:fluidkit-knowledge-sync
  at: 2026-11-23T10:46:25.000Z
stale_after: 2026-12-02T00:00:00Z
sources:
  - id: implementation
    resource: assets/source-inventory.json
    title: SHA-gebundenes Quellinventar
---

# Quellabdeckung

Das Inventar umfasst Runtime, Studio, Werkzeuge, Tests, Manifeste und kanonische Statusregister. Legacy-Prototyp, installierte Abhängigkeiten und generierte Builddateien sind keine aktive Implementierungsquelle. Ein Konzeptbezug beweist thematische Erschließung, keine vollständige Produktabnahme.[^implementation]

| Quelldatei | SHA-256, gekürzt | Konzepte |
|---|---|---|
| `README.md` | `a4c45d511b733a54` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `apps/studio/app/[locale]/layout.tsx` | `b61920771a3e6eda` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/app/[locale]/page.tsx` | `779fb1568e832468` | [url-routing](url-routing.md), [workspace-case](workspace-case.md), [studio](studio.md) |
| `apps/studio/app/[locale]/studio/acceptance/page.tsx` | `db763d8c90076c6e` | [url-routing](url-routing.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/[locale]/studio/authoring/page.tsx` | `d757f5c6fb66287e` | [url-routing](url-routing.md), [studio](studio.md), [architecture](architecture.md), [workspace-case](workspace-case.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/[locale]/studio/behaviors/page.tsx` | `f6e1852d5b7361c2` | [url-routing](url-routing.md), [studio](studio.md), [architecture](architecture.md), [workspace-case](workspace-case.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/[locale]/studio/flows/page.tsx` | `7d77dac8952f3207` | [url-routing](url-routing.md), [perspectives](perspectives.md), [studio](studio.md), [state-flows](state-flows.md) |
| `apps/studio/app/[locale]/studio/m7/page.tsx` | `d13ce95ad1aff6b3` | [url-routing](url-routing.md), [rehearsal](rehearsal.md), [quality-testing](quality-testing.md), [performance-lifecycle](performance-lifecycle.md) |
| `apps/studio/app/[locale]/studio/m8/page.tsx` | `eedb94f585ad8666` | [url-routing](url-routing.md), [studio](studio.md), [quality-testing](quality-testing.md), [release-roadmap](release-roadmap.md) |
| `apps/studio/app/[locale]/studio/page.tsx` | `324a28697fba8037` | [url-routing](url-routing.md), [user-flows](user-flows.md), [studio](studio.md) |
| `apps/studio/app/[locale]/studio/rehearsal/page.tsx` | `fbad7b58b2028874` | [url-routing](url-routing.md), [rehearsal](rehearsal.md), [studio](studio.md) |
| `apps/studio/app/[locale]/studio/simulations/[caseId]/page.tsx` | `d8f67f01288712c9` | [url-routing](url-routing.md), [simulation-cases](simulation-cases.md) |
| `apps/studio/app/[locale]/studio/transitions/page.tsx` | `55b372d14d92ab1b` | [url-routing](url-routing.md), [effects](effects.md), [studio](studio.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/api/authoring/route.ts` | `2f888431db17f7fe` | [url-routing](url-routing.md), [studio](studio.md), [contracts](contracts.md), [security](security.md) |
| `apps/studio/app/api/design-review/route.ts` | `78d9bf72b803af7b` | [url-routing](url-routing.md), [ai-review](ai-review.md), [security](security.md) |
| `apps/studio/app/api/evidence/route.ts` | `8ca2d21decedc9b4` | [url-routing](url-routing.md), [quality-testing](quality-testing.md), [security](security.md) |
| `apps/studio/app/api/local-project/route.ts` | `233a21d790bf787b` | [url-routing](url-routing.md), [data-actions](data-actions.md), [studio](studio.md), [security](security.md) |
| `apps/studio/app/api/validate/route.ts` | `3a57866efc905e59` | [url-routing](url-routing.md), [contracts](contracts.md), [security](security.md) |
| `apps/studio/app/error.tsx` | `4291d554410a9e3b` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/app/globals.css` | `7881bfbb2ca43df0` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/app/layout.tsx` | `44075c83d588cbd9` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/app/not-found.tsx` | `18d95d44ded37f00` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/app/page.tsx` | `1d78d6b4eb3aee2f` | [url-routing](url-routing.md), [workspace-case](workspace-case.md), [studio](studio.md) |
| `apps/studio/app/studio/acceptance/page.tsx` | `bb2f214b2be36b1b` | [url-routing](url-routing.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/studio/authoring/page.tsx` | `b061eebaf8d48392` | [url-routing](url-routing.md), [studio](studio.md), [architecture](architecture.md), [workspace-case](workspace-case.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/studio/behaviors/page.tsx` | `4c46605849b3ea0e` | [url-routing](url-routing.md), [studio](studio.md), [architecture](architecture.md), [workspace-case](workspace-case.md), [quality-testing](quality-testing.md) |
| `apps/studio/app/studio/flows/page.tsx` | `1b4932cf7bb035ea` | [url-routing](url-routing.md), [perspectives](perspectives.md), [studio](studio.md), [state-flows](state-flows.md) |
| `apps/studio/app/studio/m7/page.tsx` | `961c8a846361002d` | [url-routing](url-routing.md), [rehearsal](rehearsal.md), [quality-testing](quality-testing.md), [performance-lifecycle](performance-lifecycle.md) |
| `apps/studio/app/studio/m7/qualification.css` | `21c659fa954d7b0d` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/app/studio/m8/page.tsx` | `9b4196e00c29b1dc` | [url-routing](url-routing.md), [studio](studio.md), [quality-testing](quality-testing.md), [release-roadmap](release-roadmap.md) |
| `apps/studio/app/studio/page.tsx` | `d1c1cbee28561944` | [url-routing](url-routing.md), [user-flows](user-flows.md), [studio](studio.md) |
| `apps/studio/app/studio/rehearsal/page.tsx` | `572889d7f45ee9c1` | [url-routing](url-routing.md), [rehearsal](rehearsal.md), [studio](studio.md) |
| `apps/studio/app/studio/simulations/[caseId]/page.tsx` | `ff06f173c4e68eb8` | [url-routing](url-routing.md), [simulation-cases](simulation-cases.md) |
| `apps/studio/app/studio/transitions/page.tsx` | `289b55ef313bba67` | [url-routing](url-routing.md), [effects](effects.md), [studio](studio.md), [quality-testing](quality-testing.md) |
| `apps/studio/components/acceptance-browser.tsx` | `7f705ce2db39c0ac` | [quality-testing](quality-testing.md) |
| `apps/studio/components/ai-review-panel.tsx` | `b86bec2718173ee4` | [ai-review](ai-review.md), [studio](studio.md) |
| `apps/studio/components/appearance-provider.module.css` | `ca0bca1fb5135bae` | [appearance](appearance.md), [contracts](contracts.md), [rendering](rendering.md) |
| `apps/studio/components/appearance-provider.tsx` | `bf382a0bdcc57ff6` | [appearance](appearance.md), [contracts](contracts.md), [rendering](rendering.md) |
| `apps/studio/components/appearance-storage.ts` | `b1977c3ca0233f23` | [appearance](appearance.md), [contracts](contracts.md), [rendering](rendering.md) |
| `apps/studio/components/authoring-workshop.module.css` | `300a8e9e45ca83d0` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/authoring-workshop.tsx` | `cb2d0f45464e114e` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/behavior-comparison.module.css` | `950331e8b11844ae` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/behavior-comparison.tsx` | `0b097e0035f4ccfa` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/diagnostic-locale.ts` | `d81b3a182e676851` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/effect-lab.tsx` | `30e5928a51228a71` | [effects](effects.md), [studio](studio.md) |
| `apps/studio/components/effect-showcase-tour.tsx` | `74124327f4753033` | [effects](effects.md), [studio](studio.md) |
| `apps/studio/components/flow-explorer.module.css` | `9a71ed0277241195` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `apps/studio/components/flow-explorer.tsx` | `50e9c7cdad9b4303` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `apps/studio/components/flow-proof-export.tsx` | `0190d68378b309a0` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/lifecycle-proof.tsx` | `9bbebdad712a9019` | [performance-lifecycle](performance-lifecycle.md), [quality-testing](quality-testing.md) |
| `apps/studio/components/local-draft-library.tsx` | `ff5907c461f0627f` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/m7-motion-environment.tsx` | `6f9a7486e0cad73c` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/m7-surface-qualification.tsx` | `dda89e9a86e0a877` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/m7-workspace-qualification.tsx` | `c3079028c2238de5` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/m8-timing.tsx` | `4079603769de5b29` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/m8-workspace-qualification.tsx` | `16ed2a88dd70610e` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/native-input-observer.tsx` | `5cd19eb0620f8845` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/native-proof-export.tsx` | `bdd0ade14a87a3f8` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/rehearsal-workshop.css` | `506c983f7a50eae5` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `apps/studio/components/rehearsal-workshop.tsx` | `99f6199771269ab8` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `apps/studio/components/review-evidence-library.tsx` | `10a68399a89efd21` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/sequence-review.tsx` | `305d4396ef802924` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/showcase-cases.module.css` | `91a6eaf3a292ab29` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/showcase-cases.tsx` | `798b2b0d6971e091` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/simulation-showcase.tsx` | `adfd4004d6ff8637` | [simulation-cases](simulation-cases.md), [studio](studio.md) |
| `apps/studio/components/structural-controls.tsx` | `7a39ce5488c913c2` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/structural-workspace.module.css` | `d3e3d354925e30fd` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-controls.tsx` | `c2d662b04f3e327b` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-fluid-surface.tsx` | `b149387ab9533e99` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-locale.tsx` | `ed97d13a08c88480` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-navigation.module.css` | `1e1da03e7adb6444` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-navigation.tsx` | `eeb63f4891b17796` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-proof.tsx` | `f4a0e4eb00c1d3bb` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/studio-showcase.tsx` | `5f489f3800a26643` | [workspace-case](workspace-case.md), [url-routing](url-routing.md), [studio](studio.md) |
| `apps/studio/components/ui-quality.tsx` | `1771b9c9bdef6a33` | [quality-testing](quality-testing.md) |
| `apps/studio/components/workspace-intent.tsx` | `ae161da228cb95b8` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `apps/studio/components/workspace-page.tsx` | `481b52a7de466436` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/components/workspace-surface.tsx` | `31a8a31204bb43c2` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/ai-request-status.ts` | `617f8351ad30778f` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/authoring-controller.ts` | `3f860e9dc50819b0` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/diagnostic-messages.ts` | `70e9f9dcadd8ce7a` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/flow-proof.ts` | `621bbcaeb24f99f3` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/locale-routing.ts` | `f04e0fef0ada7dd9` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/m7-surface-qualification.ts` | `91d96075c8964cd2` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/m8-native-targets.ts` | `4e39610967c7cc45` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/native-input-observation.ts` | `9bfc0c5ee5452f31` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/read-workspace.ts` | `df3ad0e480e4ae32` | [workspace-case](workspace-case.md) |
| `apps/studio/lib/rehearsal-capture.ts` | `a25d8325a41cfa9c` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `apps/studio/lib/studio-destinations.ts` | `00b78ee4c38cd947` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/studio-messages.ts` | `2f12697444c9b78c` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/workspace-intent.ts` | `6428ee2f0059047a` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `apps/studio/lib/workspace-navigation.ts` | `fafc5cc084aa0068` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/lib/workspace-stage.ts` | `bbd6713b6bb01332` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/next.config.ts` | `560dfe52ea16f7f8` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/package.json` | `4dfbd95b1981e131` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/proxy.ts` | `b732bfec50e87fbc` | [studio](studio.md), [architecture](architecture.md) |
| `apps/studio/tsconfig.json` | `2065e0ad016a9a5c` | [studio](studio.md), [architecture](architecture.md) |
| `design-quality.config.json` | `7cb71eab742ca9d7` | [quality-testing](quality-testing.md) |
| `docs/acceptance-matrix.md` | `33c9700d86d87689` | [quality-testing](quality-testing.md) |
| `docs/acceptance/ledger.json` | `a79a0a5953f3ecd4` | [quality-testing](quality-testing.md) |
| `docs/acceptance/m8-adoption-2026-11-13.json` | `99fc655cfdf68b80` | [quality-testing](quality-testing.md) |
| `docs/decisions/0002-base-ui.md` | `6ed74588b070c118` | [layout-text-input](layout-text-input.md), [studio](studio.md) |
| `docs/decisions/0003-renderer-policy.md` | `4af429ab4e49d3da` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/0004-typegpu-effects.md` | `7c1f755a5a715ebf` | [gpu-kernels](gpu-kernels.md), [effects](effects.md) |
| `docs/decisions/0005-design-quality.md` | `d687543a13cac19e` | [quality-testing](quality-testing.md) |
| `docs/decisions/0006-stageshow.md` | `187a20320cc48dbb` | [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/decisions/0007-ui-sdk.md` | `eca06b79b130f6d5` | [architecture](architecture.md), [contracts](contracts.md), [core-runtime](core-runtime.md), [studio](studio.md), [release-roadmap](release-roadmap.md) |
| `docs/decisions/base-ui-scores.json` | `5ceb9d6fd69fbb30` | [layout-text-input](layout-text-input.md), [studio](studio.md) |
| `docs/decisions/m10-sound-scores.json` | `a11f9afda866527e` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/m11-language-scores.json` | `15b0422e134ae71c` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/m7-followup-scores.json` | `b7b22568ad715d9e` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/m7-scores.json` | `e3eefcfb34e2c608` | [effects](effects.md), [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/decisions/m9-scores.json` | `ded57528ef7aba1b` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/showcase-scores.json` | `1c59590f03fbf083` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/stageshow-scores.json` | `394bed1c6f77a13a` | [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/decisions/structural-scores.json` | `b39f0b4a5be8ba0c` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/decisions/typegpu-scores.json` | `21bf48259c35f1b1` | [gpu-kernels](gpu-kernels.md), [effects](effects.md) |
| `docs/decisions/ui-sdk-scores.json` | `0df9e8c27dd0c0bc` | [architecture](architecture.md), [contracts](contracts.md), [core-runtime](core-runtime.md), [studio](studio.md), [release-roadmap](release-roadmap.md) |
| `docs/feature-status.json` | `eed7e39abb372de8` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/feature-status.md` | `7fe251d4f52d1dcd` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/flows/data-adapters.md` | `a1a0acc22b1a6f98` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/flows/design-quality.md` | `fad4aef6ab85b178` | [quality-testing](quality-testing.md) |
| `docs/flows/design-rehearsal.md` | `b1b66d2a0c58504d` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `docs/flows/effects.md` | `6d6873230707c5de` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/flows/m7-qualification.md` | `f118dd5310655585` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/flows/simulation-cases.md` | `3229380e09d5f1b2` | [simulation-cases](simulation-cases.md), [studio](studio.md) |
| `docs/flows/sound.md` | `6b96bc01007fb5ac` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/flows/workspace-state.mmd` | `8a829291a5b34310` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/flows/workspace.md` | `00eb0cbce07e24ae` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/implementation-plan-v1.md` | `b117d1eebc706813` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/implementation-plan.md` | `c5a8074d0182bb87` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/github-readme-plan.md` | `444ba270e8a44b43` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/knowledge-plan.md` | `38ea0089db99cfd3` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m1.md` | `810844fb5126b7b3` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m10-sound-plan.md` | `67227f4f184995c6` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m11-multilingual-plan.md` | `85fd1b31c0b636b4` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m2-plan.md` | `672a9b2803a0e604` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m2.md` | `d8a8ddc527c1b471` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m3-plan.md` | `0eb264dc404f9103` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m3-run.json` | `15767f96905bcc01` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m3.md` | `5f6cea766797e14d` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m4-plan.md` | `3113cf0d35b0f0db` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m4.md` | `387d70907d24f351` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m5-plan.md` | `6fccf29a15e59ea7` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m5.md` | `4d9c10a9f7181696` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m6-execution.md` | `fd838f6bbf537ba4` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m6-plan.md` | `c28c8ecf66bb98d4` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m6.md` | `4f44d1dd0fd129ea` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m7-followup.md` | `c2e8630997ac9a1d` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m7-plan.md` | `9c73a89f39d3a95e` | [effects](effects.md), [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m8-agent-bridge.md` | `bedfdb625d8fbed3` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m8-authoring.md` | `5a31242e45643516` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/m8-plan.md` | `b6fc6f443637674b` | [architecture](architecture.md), [contracts](contracts.md), [core-runtime](core-runtime.md), [studio](studio.md), [release-roadmap](release-roadmap.md) |
| `docs/milestones/m9-plan.md` | `2be874d3cf54881a` | [perspectives](perspectives.md), [appearance](appearance.md), [release-roadmap](release-roadmap.md) |
| `docs/milestones/openai-review-execution.md` | `e9526b1b4713a374` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/structural-transitions.md` | `59603b11f8ec5209` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/ui-rationale-plan.md` | `6f1245c2532a8b32` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/milestones/ui-sdk-evaluation.md` | `6720994f5451d4b7` | [architecture](architecture.md), [contracts](contracts.md), [core-runtime](core-runtime.md), [studio](studio.md), [release-roadmap](release-roadmap.md) |
| `docs/milestones/workspace-source.json` | `be2d243c72d852ee` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/qa/2026-11-02-m6/lifecycle-100.json` | `3a169bf76d60cd31` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/qa/2026-11-02-openai/brief-injection-v1.json` | `7a49a0cb9d2c8ff0` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/qa/2026-11-02-openai/final-layout-matrix.json` | `cb9ba1593bf54b0c` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/qa/2026-11-02-openai/secret-boundary.json` | `7ced9b545d96103e` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/qa/2026-11-02-openai/verification.json` | `14f48528e74c7979` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/quality/ai-review.md` | `a40ceabfea83dc5a` | [quality-testing](quality-testing.md) |
| `docs/quality/fluid-design-workflow.md` | `df405e9e8feb8fbd` | [quality-testing](quality-testing.md) |
| `docs/readme/assets/m11-workspace-screenshots.json` | `4ba47adb83205cd4` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/readme/screenshots.json` | `8edd7207aef45902` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/release/public-source.md` | `09722a00c7c4d117` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/ai-design-check-evaluation.json` | `5f125308ba7d6894` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/ai-design-check.md` | `efa39eb74bda6e9b` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/base-ui.md` | `126079a04a936d43` | [layout-text-input](layout-text-input.md), [studio](studio.md) |
| `docs/research/effect-extension.md` | `31e91dbc23a8b8bc` | [effects](effects.md), [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/research/fluid-ui-rationale.md` | `8320c10df06c6e5f` | [why-fluid](why-fluid.md), [overview](overview.md), [rendering](rendering.md) |
| `docs/research/m2-ui.md` | `381a1397bb268abb` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/m7-followup-qualification.md` | `db323bcc2d651ef5` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/provider-apis.md` | `828841441283f748` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/sound-feedback.md` | `ecbaa99e2ff6b73f` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `docs/research/stageshow-sources.json` | `0689625be5899892` | [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/research/stageshow.md` | `c88920cd9a2784d1` | [rehearsal](rehearsal.md), [quality-testing](quality-testing.md) |
| `docs/research/typegpu.md` | `a62cd7c0e86326dd` | [gpu-kernels](gpu-kernels.md), [effects](effects.md) |
| `docs/research/vercel-ui-sdk.md` | `196f17f85a37d83a` | [architecture](architecture.md), [contracts](contracts.md), [core-runtime](core-runtime.md), [studio](studio.md), [release-roadmap](release-roadmap.md) |
| `docs/research/vision-abgleich-2026-11-20.md` | `ff63a0e0afa13b1a` | [release-roadmap](release-roadmap.md), [quality-testing](quality-testing.md) |
| `eslint.config.mjs` | `cbf1fd39a88b07c1` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `font-bake.config.json` | `27b15e00f2ab68aa` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `knowledge/editions/engineering.json` | `b8d107522d4993cc` | [knowledge-maintenance](knowledge-maintenance.md), [url-routing](url-routing.md) |
| `knowledge/editions/public.json` | `0e83e65fb45b2f62` | [knowledge-maintenance](knowledge-maintenance.md), [url-routing](url-routing.md) |
| `package-lock.json` | `3ba4e6ef4e01ec4c` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `package.json` | `4683e6813f856a74` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `packages/cases/package.json` | `7fa0fd704e3ecb9b` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/authoring.ts` | `f57682a8f0715b09` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/fixtures/commerce.json` | `9ec1009c28ef5cb6` | [simulation-cases](simulation-cases.md) |
| `packages/cases/src/fixtures/real-estate.json` | `aa41fc3e35ead0be` | [simulation-cases](simulation-cases.md) |
| `packages/cases/src/fixtures/travel.json` | `46a6543b09f53bee` | [simulation-cases](simulation-cases.md) |
| `packages/cases/src/flow-explorer.ts` | `e5ad1e3f2f94a1d4` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/index.ts` | `9d44a20dd7360586` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/messages.ts` | `63b1e2501a7e0268` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/simulation-flow.ts` | `45943076161457da` | [simulation-cases](simulation-cases.md) |
| `packages/cases/src/simulation.ts` | `ccb41b017ffd3486` | [simulation-cases](simulation-cases.md) |
| `packages/cases/src/workspace-atlas.ts` | `aa9482c3f44a2ed5` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/workspace-compare.ts` | `b671844b6a6e9b35` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/workspace-layout.ts` | `17c9e70d21fc09de` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/workspace-story.ts` | `76426499238383f0` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/src/workspace.ts` | `4077ec64b29d67f2` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cases/tsconfig.build.json` | `2f7bfa1698a5359c` | [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `packages/cli/package.json` | `710ada70fa127443` | [development-cli](development-cli.md) |
| `packages/cli/src/index.ts` | `11ddeb980b3ec2d7` | [development-cli](development-cli.md) |
| `packages/cli/tsconfig.build.json` | `2f7bfa1698a5359c` | [development-cli](development-cli.md) |
| `packages/contracts/package.json` | `d990ea0697002ffe` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/acceptance.ts` | `fc169cf5d26315f8` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/agent.ts` | `0950118a66fb9c8b` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/authoring.ts` | `e6d8926df9bff4b3` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/components.ts` | `978f512b9be95e10` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/data.ts` | `f9582829ef9102b3` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/design-tokens.ts` | `14582afa48cc7421` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/development-proposal.ts` | `cc75fce1edcb2b3c` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/effects.ts` | `7f3a6f057f5ce08b` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/index.ts` | `7c667ac5c60a87ca` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/input-observation.ts` | `9278c8419af854cd` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/lifecycle.ts` | `5e5b306c921e50f6` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/load.d.ts` | `0e0a043790dc1f8a` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/load.js` | `2f6ec160deeab20f` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/load.ts` | `651bc9ba418f20f1` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/local-project.ts` | `59491de51b8699d8` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/m8-qualification.ts` | `96e702c95577c97f` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/m8-timing.ts` | `15f0e80d1ce968ce` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/motion-geometry.ts` | `832246e071dafd46` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/motion.ts` | `55565b9675edb278` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/native-targets.ts` | `5a2ed4b368c13907` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/presentation.ts` | `8f3448674b995b40` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/proof-capture.ts` | `88b4e5923c1f43c7` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/quality.ts` | `456ddc825df5ea82` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/rehearsal.ts` | `bba5769cbd976e7f` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/sequence-geometry.ts` | `6f2947e989b1c894` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/sequence.ts` | `974ec791aad84a21` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/surface-qualification.ts` | `868e09c649e51e92` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/text-geometry.ts` | `8929f99e580c1b4b` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/src/theme.ts` | `03833366198bcbce` | [appearance](appearance.md), [contracts](contracts.md), [rendering](rendering.md) |
| `packages/contracts/src/workspace-qualification.ts` | `a66508b114c0f2e0` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/contracts/tsconfig.build.json` | `2f7bfa1698a5359c` | [contracts](contracts.md), [schema-reference](schema-reference.md) |
| `packages/core/package.json` | `f298239511121f8c` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/core/src/agent.ts` | `85c9ebd8fcfeb93f` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/core/src/collection.ts` | `ca7e7448bfa99028` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/core/src/data.ts` | `783b46c38fc2463f` | [data-actions](data-actions.md) |
| `packages/core/src/index.ts` | `d420b9d87941da3d` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/core/src/layout.ts` | `76fb887701f82962` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/core/src/surface-interactions.ts` | `73ff8a9b6b218f46` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/core/tsconfig.build.json` | `2f7bfa1698a5359c` | [core-runtime](core-runtime.md), [state-flows](state-flows.md) |
| `packages/effects/package.json` | `b7057ad98ff67517` | [effects](effects.md) |
| `packages/effects/src/index.ts` | `304b22e15224030e` | [effects](effects.md) |
| `packages/effects/src/motion-plan.ts` | `ab67708cd8fd2fa8` | [effects](effects.md) |
| `packages/effects/src/motion-sampler.ts` | `50e0380a2c891696` | [effects](effects.md) |
| `packages/effects/src/presentation.ts` | `a173e4bd68db9602` | [effects](effects.md) |
| `packages/effects/tsconfig.build.json` | `2f7bfa1698a5359c` | [effects](effects.md) |
| `packages/gpu-kernels/package.json` | `835b3e93efa3554f` | [gpu-kernels](gpu-kernels.md) |
| `packages/gpu-kernels/src/coupling.ts` | `56f1344de18b1d1f` | [gpu-kernels](gpu-kernels.md) |
| `packages/gpu-kernels/src/index.ts` | `819ba3045524faa3` | [gpu-kernels](gpu-kernels.md) |
| `packages/gpu-kernels/tsconfig.build.json` | `1ac4416dc03b88c2` | [gpu-kernels](gpu-kernels.md) |
| `packages/gpu-kernels/vite.config.ts` | `39ee9c649dba51d1` | [gpu-kernels](gpu-kernels.md) |
| `packages/i18n/package.json` | `d9a1a1d08b29bc4d` | [contracts](contracts.md), [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/i18n/src/host-catalog.ts` | `68545ca3379598e7` | [contracts](contracts.md), [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/i18n/src/index.ts` | `a519cc574cced3ca` | [contracts](contracts.md), [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/i18n/src/locale.ts` | `a10cfd95d94e5bb7` | [contracts](contracts.md), [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/i18n/tsconfig.build.json` | `2f7bfa1698a5359c` | [contracts](contracts.md), [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/intelligence/package.json` | `84367483fc70de3b` | [architecture](architecture.md), [workspace-case](workspace-case.md), [release-roadmap](release-roadmap.md) |
| `packages/intelligence/src/index.ts` | `ec9301ef69104f2d` | [architecture](architecture.md), [workspace-case](workspace-case.md), [release-roadmap](release-roadmap.md) |
| `packages/intelligence/src/workspace-intent.ts` | `11b53090f3aea74d` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `packages/intelligence/tsconfig.build.json` | `2f7bfa1698a5359c` | [architecture](architecture.md), [workspace-case](workspace-case.md), [release-roadmap](release-roadmap.md) |
| `packages/react/package.json` | `d43f55442fa58a15` | [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/react/src/index.tsx` | `f40fbed8adbbcbd5` | [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/react/tsconfig.build.json` | `2f7bfa1698a5359c` | [react-integration](react-integration.md), [layout-text-input](layout-text-input.md) |
| `packages/server/package.json` | `91af1f9868e64451` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/ai-authoring.ts` | `3b682785e3548f3f` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/ai-review.ts` | `68ef09ac3edda642` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/development-proposal.ts` | `e4ea5aeb1d065bfe` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/evidence-files.ts` | `fbc00702173058dd` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/index.ts` | `db24b7ee263b61cc` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/local-access.ts` | `9ef3d3566f0766b1` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/local-project.ts` | `f7271bc8c0e775c6` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/openai-review.ts` | `7b0bb65f07293543` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/response-language.ts` | `f53a8287896d140c` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/review-access.ts` | `f4700d06006cf1f5` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/src/review-policy.ts` | `4bf394b6fef59451` | [ai-review](ai-review.md), [security](security.md) |
| `packages/server/tsconfig.build.json` | `2f7bfa1698a5359c` | [ai-review](ai-review.md), [security](security.md) |
| `packages/testing/package.json` | `c4cf9028d355bd29` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/dom-quality.ts` | `9fc3e56c30739a75` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/index.ts` | `8f6ff2eeacca426f` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/load.ts` | `30610c1e70750d70` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/proof-capture.ts` | `82691be1ca2763ca` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/quality.ts` | `d4e49b5d1f7af68a` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/sequence.ts` | `8014d3b7a71cf38b` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/story.ts` | `6ad20c0c49071681` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/src/workspace-qualification.ts` | `fd8003128a955fb0` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/testing/tsconfig.build.json` | `2f7bfa1698a5359c` | [quality-testing](quality-testing.md), [rehearsal](rehearsal.md) |
| `packages/webgpu/package.json` | `b4fe2fe7eade12e1` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/backend-policy.ts` | `74f168764f08efd8` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/capabilities.ts` | `9939e4b83976fe7a` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/coupling-layer.ts` | `b61fad41c1f4b183` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/effect-layers.ts` | `f2c9173bd9075cc7` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/focus-ring.ts` | `69dedaaecb694ae5` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/font-assets.ts` | `278b080796cd166d` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/fonts.ts` | `a8ebd96ad207ac96` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/hit-testing.ts` | `95915df933ebbbe9` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/index.ts` | `9b738df88061e227` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/motion.ts` | `352deb016d1c83ea` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/privacy.ts` | `461a175940eb2e82` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/resources.ts` | `cbb8b658c16e28d5` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/restage.ts` | `4f1cfdbf2ffd4fa0` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/selection-visibility.ts` | `b4dc12212f257068` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/text-input.ts` | `9ded19853a9d3b4b` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/text-layout.ts` | `dd68314040d25324` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/src/timeline.ts` | `0c7b26d730ae9d10` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `packages/webgpu/tsconfig.build.json` | `2f7bfa1698a5359c` | [rendering](rendering.md), [layout-text-input](layout-text-input.md), [performance-lifecycle](performance-lifecycle.md) |
| `scripts/acceptance-source.ts` | `ccfacae5683db73a` | [quality-testing](quality-testing.md) |
| `scripts/acceptance-validation.ts` | `daa323ad7ebe9132` | [quality-testing](quality-testing.md) |
| `scripts/ai-design-check.d.ts` | `070ae4bcd034e224` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/bake-font.mjs` | `7a2f93222935294c` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/build-gpu-kernels.mjs` | `ac50d89256eb86ea` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/build-packages.mjs` | `7cab8dd3943459d2` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/check-acceptance.ts` | `73dcac5aac731d1c` | [quality-testing](quality-testing.md) |
| `scripts/check-design.ts` | `af7c7fa3a9daeb59` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/check-mermaid.mjs` | `40f55b32624d740f` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/check-plan.mjs` | `ebf52eb274b3d7bd` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/collect-load.ts` | `a6c17dc47e2a6504` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/design-static.ts` | `a0a31814a31d36ae` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/evaluate-ai-review.ts` | `b80f44d0a7b1c8dc` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/knowledge/build.ts` | `670a711e87c6e3c6` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/check.ts` | `78cc5efe8490b336` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/config.ts` | `5ee1d6be854f0bcd` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/edition-reader.js` | `c515c9249ef4e05a` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/editions.ts` | `c37221c3a4401cbd` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/export.ts` | `9e46cf65e3591c5f` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/files.ts` | `5d9d92e8f461d03f` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/format.ts` | `a29a5ca7993038af` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/publish.ts` | `322b222fc80b3035` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/reader.ts` | `6fb2c17092d7b01b` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/serve.ts` | `ee0a987bf3d525b3` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/style.css` | `632ebd6c018c1365` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/knowledge/sync.ts` | `c6b7b5174dc04648` | [knowledge-maintenance](knowledge-maintenance.md) |
| `scripts/m8-bundle-comparison.mjs` | `9004d9b2c4821025` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/m8-evidence.ts` | `87133627c2c483c2` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/qualify-i18n.mjs` | `c03a428bf0b6a3f6` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/qualify-ui-sdk.mjs` | `fd06df070260b408` | [architecture](architecture.md), [contracts](contracts.md), [core-runtime](core-runtime.md), [studio](studio.md), [release-roadmap](release-roadmap.md) |
| `scripts/react-host/assess.ts` | `ace939a6243e30e7` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/react-host/main.tsx` | `401e50ab67f5917a` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/react-host/timing.ts` | `3eb129fe5c75b541` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/release/public-assets.json` | `22e4834f011745d0` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/update-feature-docs.ts` | `43e2d292d54b0224` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `scripts/verify-react-host.ts` | `920828a39fe55ca4` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `tests/browser/locale-surface/index.html` | `496e17e14fdf81dc` | [quality-testing](quality-testing.md) |
| `tests/browser/locale-surface/qualification.ts` | `afdbf392d62cd6b0` | [quality-testing](quality-testing.md) |
| `tests/e2e/form-review.spec.ts` | `b37188eaa020b437` | [quality-testing](quality-testing.md) |
| `tests/e2e/multilingual-books.spec.ts` | `a63febacf6bd4931` | [quality-testing](quality-testing.md) |
| `tests/e2e/multilingual-diagnostics.spec.ts` | `a9483a7e09092c02` | [quality-testing](quality-testing.md) |
| `tests/e2e/multilingual-workspace.spec.ts` | `88bb31f2b678d963` | [quality-testing](quality-testing.md) |
| `tests/e2e/structural-workspace.spec.ts` | `284c7fbc03d00823` | [quality-testing](quality-testing.md) |
| `tests/e2e/studio-evidence.spec.ts` | `76231c3ab7591370` | [quality-testing](quality-testing.md) |
| `tests/e2e/workspace-intent.spec.ts` | `ae49c3f5d6b1a5d1` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `tests/evaluations/ai-review-v1.json` | `8e844a37781f134f` | [quality-testing](quality-testing.md) |
| `tests/evaluations/workspace-intent-holdout-v1.json` | `b1b593b46e525c37` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `tests/unit/acceptance.test.ts` | `a6316d8e204d8872` | [quality-testing](quality-testing.md) |
| `tests/unit/agent-bridge.test.ts` | `096e558a19ca6394` | [quality-testing](quality-testing.md) |
| `tests/unit/agent-callback-boundaries.test.ts` | `2d47880137b296b6` | [quality-testing](quality-testing.md) |
| `tests/unit/ai-authoring.test.ts` | `aa1243f33713347a` | [quality-testing](quality-testing.md) |
| `tests/unit/ai-review-panel.test.ts` | `c26ad2dd1fa0697c` | [quality-testing](quality-testing.md) |
| `tests/unit/ai-review.test.ts` | `e1cfaf5c4cff940f` | [quality-testing](quality-testing.md) |
| `tests/unit/authoring-case.test.ts` | `ae5a7caacffbda09` | [quality-testing](quality-testing.md) |
| `tests/unit/authoring-controller.test.ts` | `2be9924a382e50dd` | [quality-testing](quality-testing.md) |
| `tests/unit/authoring-route.test.ts` | `680bdcbe2fcab70b` | [quality-testing](quality-testing.md) |
| `tests/unit/authoring-workshop.test.ts` | `9bfdbe6b15e2ea90` | [quality-testing](quality-testing.md) |
| `tests/unit/backend-policy.test.ts` | `1627413db192d624` | [quality-testing](quality-testing.md) |
| `tests/unit/base-ui-contracts.test.ts` | `e8a45df243bb4ed5` | [layout-text-input](layout-text-input.md), [studio](studio.md) |
| `tests/unit/behavior-comparison.test.ts` | `5d3de71ec66f638a` | [quality-testing](quality-testing.md) |
| `tests/unit/client-import-boundary.test.ts` | `4827dbba0a9acc96` | [quality-testing](quality-testing.md) |
| `tests/unit/collection-bridge.test.ts` | `e1d1c34fb2142259` | [quality-testing](quality-testing.md) |
| `tests/unit/collection.test.ts` | `372a42e412b93f09` | [quality-testing](quality-testing.md) |
| `tests/unit/component-definition.test.ts` | `21d9377682b0d63e` | [quality-testing](quality-testing.md) |
| `tests/unit/core-collection.test.ts` | `3959e010829e3e88` | [quality-testing](quality-testing.md) |
| `tests/unit/coupling-kernel.test.ts` | `b306d1fbb68227af` | [quality-testing](quality-testing.md) |
| `tests/unit/coupling-layer.test.ts` | `029065d55fd74e2b` | [quality-testing](quality-testing.md) |
| `tests/unit/data.test.ts` | `babf5880f3de3e81` | [quality-testing](quality-testing.md) |
| `tests/unit/design-quality.test.ts` | `0e4ab9cc943fa797` | [quality-testing](quality-testing.md) |
| `tests/unit/development-proposal.test.ts` | `1740ea824a0090ba` | [quality-testing](quality-testing.md) |
| `tests/unit/effect-showcase-tour.test.ts` | `7fdced27105cdbad` | [quality-testing](quality-testing.md) |
| `tests/unit/effects.test.ts` | `a8f60eb8019663fb` | [quality-testing](quality-testing.md) |
| `tests/unit/evidence-files.test.ts` | `c42d21642779c4aa` | [quality-testing](quality-testing.md) |
| `tests/unit/flow-explorer-ui.test.ts` | `b1a9bbc671e271cd` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `tests/unit/flow-explorer.test.ts` | `e80abb710a789dde` | [perspectives](perspectives.md), [workspace-case](workspace-case.md), [user-flows](user-flows.md), [url-routing](url-routing.md) |
| `tests/unit/flow-proof-export.test.ts` | `37e828bb1de34c52` | [quality-testing](quality-testing.md) |
| `tests/unit/flow-proof.test.ts` | `ef062bbb76859d07` | [quality-testing](quality-testing.md) |
| `tests/unit/focus-ring.test.ts` | `997b93fe7bf37cb6` | [quality-testing](quality-testing.md) |
| `tests/unit/font-fallback.test.ts` | `81e707316df4133d` | [quality-testing](quality-testing.md) |
| `tests/unit/glyph-selection-commit.test.ts` | `a16d8ac2084c63ac` | [quality-testing](quality-testing.md) |
| `tests/unit/hit-testing.test.ts` | `fcee6bf3c51cd9bf` | [quality-testing](quality-testing.md) |
| `tests/unit/i18n.test.ts` | `f7d92a905658ce56` | [quality-testing](quality-testing.md) |
| `tests/unit/knowledge.test.ts` | `e176670945ebee8a` | [quality-testing](quality-testing.md) |
| `tests/unit/lens-kernel.test.ts` | `413996530bf16f62` | [quality-testing](quality-testing.md) |
| `tests/unit/load-lifetime.test.ts` | `e7d81cb4476282ea` | [quality-testing](quality-testing.md) |
| `tests/unit/load.test.ts` | `8ea018ad8e946e99` | [quality-testing](quality-testing.md) |
| `tests/unit/local-project.test.ts` | `6abe2417e74c2233` | [quality-testing](quality-testing.md) |
| `tests/unit/local-review-evidence.test.ts` | `e1b9f66c3a273057` | [quality-testing](quality-testing.md) |
| `tests/unit/locale-hosts.test.ts` | `57f4dce28ada34f6` | [quality-testing](quality-testing.md) |
| `tests/unit/m11-workspace-locales.test.ts` | `c43a9032beb02efb` | [quality-testing](quality-testing.md) |
| `tests/unit/m7-surface-qualification.test.ts` | `b096c2f2aca37d3e` | [quality-testing](quality-testing.md) |
| `tests/unit/m8-evidence.test.ts` | `5db4266556d41079` | [quality-testing](quality-testing.md) |
| `tests/unit/m8-qualification.test.ts` | `fe1bf4346bd45957` | [quality-testing](quality-testing.md) |
| `tests/unit/m8-timing.test.ts` | `d1c5ed41871931aa` | [quality-testing](quality-testing.md) |
| `tests/unit/motion-correspondence.test.ts` | `de6babe1d43cd057` | [quality-testing](quality-testing.md) |
| `tests/unit/native-input-limit.test.ts` | `364b6a663d0f9a50` | [quality-testing](quality-testing.md) |
| `tests/unit/native-input-observation.test.ts` | `b5c8250d33b5dc34` | [quality-testing](quality-testing.md) |
| `tests/unit/native-proof-export.test.ts` | `83d3d306be819a23` | [quality-testing](quality-testing.md) |
| `tests/unit/presentation.test.ts` | `145bef086212fd98` | [quality-testing](quality-testing.md) |
| `tests/unit/proof-capture.test.ts` | `e6db8d76945ca9cc` | [quality-testing](quality-testing.md) |
| `tests/unit/react-host-timing.test.ts` | `27af8cf217f61dc6` | [quality-testing](quality-testing.md) |
| `tests/unit/react-recovery-state.test.ts` | `4aa3cef2b1c96c29` | [quality-testing](quality-testing.md) |
| `tests/unit/rehearsal-capture.test.ts` | `dc61cff07653a1eb` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `tests/unit/rehearsal-controls.test.ts` | `153400f11580c077` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `tests/unit/rehearsal.test.ts` | `82aed931ecafd4bb` | [rehearsal](rehearsal.md), [studio](studio.md) |
| `tests/unit/resolved-layout.test.ts` | `304f64ab7349cd5e` | [quality-testing](quality-testing.md) |
| `tests/unit/resources.test.ts` | `7ae8349ca5bd182d` | [quality-testing](quality-testing.md) |
| `tests/unit/runtime-failures.test.ts` | `8d86ef905142eff9` | [quality-testing](quality-testing.md) |
| `tests/unit/runtime-history-effects.test.ts` | `68364f8adf8f4bf0` | [quality-testing](quality-testing.md) |
| `tests/unit/runtime-transactions.test.ts` | `20dc880e8e18d6a4` | [quality-testing](quality-testing.md) |
| `tests/unit/runtime.test.ts` | `2b1052ea502e4316` | [quality-testing](quality-testing.md) |
| `tests/unit/selection-visibility.test.ts` | `eda6deb26a91c303` | [quality-testing](quality-testing.md) |
| `tests/unit/sequence.test.ts` | `c039a8e0a86033b6` | [quality-testing](quality-testing.md) |
| `tests/unit/showcase-cases.test.ts` | `3840c5ab5ec10e00` | [quality-testing](quality-testing.md) |
| `tests/unit/simulation.test.ts` | `ce23bd6bf11a1ca3` | [simulation-cases](simulation-cases.md), [studio](studio.md) |
| `tests/unit/studio-locale.test.ts` | `49ffd77e9c5609ea` | [quality-testing](quality-testing.md) |
| `tests/unit/studio-workspace-intent.test.ts` | `cb73b2046b860456` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `tests/unit/surface-authority.test.ts` | `97ea9e40e1456984` | [quality-testing](quality-testing.md) |
| `tests/unit/surface-capabilities.test.ts` | `bb18f8db90383932` | [quality-testing](quality-testing.md) |
| `tests/unit/surface-lifecycle-policy.test.ts` | `04337f1e94934167` | [quality-testing](quality-testing.md) |
| `tests/unit/text-input.test.ts` | `c9b2054146b5097e` | [quality-testing](quality-testing.md) |
| `tests/unit/theme-provider.test.ts` | `acd30c5f685d86da` | [appearance](appearance.md), [contracts](contracts.md), [rendering](rendering.md) |
| `tests/unit/theme.test.ts` | `374d58614230c8fe` | [appearance](appearance.md), [contracts](contracts.md), [rendering](rendering.md) |
| `tests/unit/ui-quality.test.ts` | `cb61cafde89dc8ee` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace-collection.test.ts` | `d27def794de6dbf8` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace-coupling.test.ts` | `048efe250a794866` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace-intent-eval.test.ts` | `30695294feea0b63` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `tests/unit/workspace-intent.test.ts` | `4196c92455723ff9` | [workspace-case](workspace-case.md), [state-flows](state-flows.md), [quality-testing](quality-testing.md) |
| `tests/unit/workspace-motion-ink.test.ts` | `ecede4f5d29aa614` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace-perspectives.test.ts` | `891ad30a719572c3` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace-qualification.test.ts` | `72f463c660820b5c` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace-story.test.ts` | `058ba12ab1fe6102` | [quality-testing](quality-testing.md) |
| `tests/unit/workspace.test.ts` | `86201a5657458c58` | [quality-testing](quality-testing.md) |
| `tsconfig.json` | `8c749f057b21d1f9` | [development-cli](development-cli.md), [architecture](architecture.md) |
| `vitest.config.ts` | `64462e7912fbfe3f` | [development-cli](development-cli.md), [architecture](architecture.md) |

[^implementation]: Vollständige Hashes im maschinenlesbaren Quellinventar.
