---
name: executive-briefing
title: "高管简报"
description: Turns business or technical source documents into a short executive briefing deck with synced presenter voiceover. Use when the user attaches reports, memos, specs or decks and asks for a briefing, executive summary, board update, or decision memo for senior readers. Not for teaching a subject from scratch (use stage-design topic skills) and not for long courses.
---

# Executive briefing

Load `stage-design` first. This skill changes what the stage contains, not the
build sequence.

An executive reads for the decision, not the topic. Every page earns its place by
moving the reader toward understanding the situation, the options, or the ask.

## Before planning

- Call `list_materials`, then `read_material` / `search_material` on every
  attached source. Do not brief from memory when sources exist.
- Settle with `ask_user`, in ONE question: the audience (who decides), the
  decision or action the briefing supports, and the target length. Offer 5-7
  pages as the default when they do not say.
- If a needed fact is missing from the sources, say so in the briefing and in
  your chat message. Never fill a gap with an invented figure.

## Page plan

Use `slide` pages only, plus at most one `quiz` if the user asks for a check.

1. **The ask / bottom line.** One sentence of recommendation or status first.
2. **Situation.** What changed and why now, with the two or three facts that matter.
3. **Options or findings.** One page per option or finding, each with its cost,
   risk and evidence. Compare on the same axes.
4. **Recommendation.** What you advise and the trade-off being accepted.
5. **Risks and open questions.** Honest, ranked, each with an owner or next step.
6. **Next steps.** Who does what by when.

Titles are claims ("Churn fell 12% after the pricing change"), not topics
("Churn analysis").

## Roster and narration

- One presenter is the teacher; keep the roster minimal, a second agent only as
  a moderator for questions. Personas are plain and professional.
- Narration is spoken briefing, 20-40 seconds per page: lead with the point,
  cite the number, stop. No filler, no re-reading the slide.
- Every figure in narration must appear in a source you read. Name the source
  document in the page brief so `materialFacts` can carry it.

## Done

Follow the "Before you call the stage done" check in `stage-design`, including
audio on every speech action. Then state the page count and any facts you could
not source.

## Prohibited

- Topic-label titles, background history, and definitions the audience already knows.
- A page with no decision, option, risk or next step attached to it.
- Any number, date or name that is not in a source you read.
