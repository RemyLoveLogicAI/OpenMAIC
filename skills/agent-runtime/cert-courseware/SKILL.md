---
name: cert-courseware
title: "认证课程"
description: Generates a complete certification or compliance training course end to end - modules, interactive slides, voice track and knowledge checks that map to stated learning objectives. Use when the user asks for certification prep, compliance or onboarding training, or a multi-module course with assessments and a pass standard. For a physical hands-on procedure use vocational instead.
---

# Certification courseware

Load `stage-design` first, then `understanding-by-design` for the objective-to-
assessment backward plan. For procedures with tools and safety limits, load
`vocational` instead of using the module shapes below.

## Before planning

Settle with `ask_user` (one question, defaults offered): the certification or
standard and its source material, the learner's starting level, the number of
modules, and the pass standard. Read attached material with `list_materials` and
`read_material`. If the exam blueprint or syllabus is not provided, use
`web_search` / `fetch_url` and say which source you used. Do not invent a
syllabus.

## Structure

- A course is a **series**: use `create_folder` and pass its `folderId` to each
  `create_stage`, so one module is one stage and one stage is built per
  `stage-design`.
- Write the objectives first, as observable outcomes. Then map every objective to
  at least one assessed page. An objective with no check is a gap; name it.
- Each module: one orienting `slide` (objectives, time), two to four content
  pages mixing `slide` and `interactive`, then a `quiz` that checks that module's
  objectives only. Close the course with a cumulative `quiz` weighted to the
  exam blueprint.
- Questions test application, not recall: scenario, then decision, with
  distractors drawn from real misconceptions. Each answer carries a short
  explanation that cites the objective it checks.

## Roster and voice

One teacher, at least one learner-side agent who asks the natural misconception
questions. Bind voices from `list_voices`. Keep narration conversational and
short; leave detail to on-screen text.

## Done

Per module, run the `stage-design` done check, including audio. At the end give
the learner-facing summary: modules built, objectives covered, objectives with
no assessed page, and any page that failed to generate. Never claim the course is
accreditation-ready; say what has been mapped to which source.
