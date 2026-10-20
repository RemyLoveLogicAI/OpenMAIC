---
name: product-explainer
title: "产品讲解"
description: Builds a short scripted product announcement or explainer as a narrated stage that is ready for video export. Use when the user wants a product demo, launch announcement, feature walkthrough or explainer video script from a product description, docs or notes. The video render itself is run from the classroom export in the UI, not by this skill.
---

# Product explainer

Load `stage-design` first. This skill supplies the script structure; the build
sequence, roster and done check come from `stage-design`.

## Scope boundary

You produce the stage: pages, narration and audio. Rendering to video is done by
the user from the classroom's video export; there is no agent tool for it. Say so
plainly when handing over. Do not claim a video file exists.

## Before planning

Read any attached docs with `list_materials` / `read_material`. Settle with
`ask_user`, one question: who the viewer is, the single thing they should do
after watching, and the target length (default 60-90 seconds, 6-8 pages).
Product claims must come from the user's material. Do not invent features,
numbers, customers or pricing; leave a gap and flag it.

## Script structure

1. **Hook.** The viewer's problem in one concrete sentence. No logo wall.
2. **The product in one line.** What it is and who it is for.
3. **Three beats, one page each.** One benefit per page, shown as a concrete
   before/after or a step, not a feature list.
4. **Proof.** One real fact from the material (metric, quote, case), or omit the
   page if none exists.
5. **Call to action.** One action, one place. Nothing else on the page.

Use `slide` pages. Keep text on screen to a headline and at most one supporting
line: the narration carries the explanation.

## Narration and timing

- Narration is the script. Write it first in the page brief, 8-15 seconds per
  page, plain spoken language, one idea per sentence.
- Single presenter voice is enough; use `list_voices` and bind one.
- Run `generate_tts` on every page after any narration edit so no page ships
  silent.

## Done

Run the `stage-design` done check. Hand over with: page count, estimated length,
which claims came from which material, and what is missing. Tell the user the
next step is the video export in the classroom UI.

## Prohibited

- Feature lists, logo walls and dense on-screen text.
- Invented metrics, customers, awards or pricing.
- Telling the user a video file was produced.
