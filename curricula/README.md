# OpenMAIC Curriculum Library & Archive

This directory stores archived, versioned, or domain-specific classroom curricula for OpenMAIC.

## Directory Structure

Each curriculum folder is self-contained:
```text
curricula/
├── <curriculum-slug>/
│   ├── manifest.json       # Metadata: stage name, original ID, scenes, timestamps
│   ├── classroom.json      # Complete classroom state (stage definition, blackboard, scenes, quizzes)
│   ├── <classroomId>.json  # Direct drop-in copy of the active classroom data
│   └── <classroomId>/      # (Optional) Audio and media assets generated for this curriculum
│       └── audio/
│           ├── scene_01_0.mp3
│           └── ...
```

## Management Commands

From the root `openmaic` project:

- **List active & archived curricula**:
  ```bash
  pnpm curriculum:list
  ```

- **Archive the current active classroom**:
  ```bash
  pnpm curriculum:save my-custom-subject
  # or specify an explicit classroom ID if multiple exist:
  pnpm curriculum:save my-custom-subject --id TJ0q3IsuaR
  ```

- **Load an archived curriculum into active state**:
  ```bash
  pnpm curriculum:load covert-influence-and-defense
  ```

- **Reset to clean, baseline classroom system (wipes `data/classrooms/`)**:
  ```bash
  pnpm curriculum:reset --force
  ```
