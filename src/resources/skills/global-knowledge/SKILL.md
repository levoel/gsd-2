---
name: global-knowledge
description: Add, update, or list topics in global knowledge (~/.gsd/KNOWLEDGE.md). Use when asked to "remember this", "add to knowledge", "save for all projects", "global knowledge", "add topic", or when the user shares infrastructure/tooling/pattern info that should persist across projects.
---

<objective>
Manage the global knowledge index (`~/.gsd/KNOWLEDGE.md`) and its detail files (`~/.gsd/knowledge/*.md`). The index is a lightweight trigger table — detail files are loaded on demand when a user's prompt matches trigger keywords.
</objective>

<structure>
```
~/.gsd/
  KNOWLEDGE.md              # Index — trigger table only
  knowledge/
    homelab.md              # Detail file
    aws.md                  # Detail file
    ...
```

**Index format** (`~/.gsd/KNOWLEDGE.md`):
```markdown
# Global Knowledge

Index of knowledge topics. Each entry links to a detail file that should be loaded when the topic is relevant.

| Topic | File | Triggers |
|-------|------|----------|
| Homelab infrastructure | `~/.gsd/knowledge/homelab.md` | homelab, macmini, mac-mini |
```

- Topic: short human-readable label
- File: path in backticks, always under `~/.gsd/knowledge/`
- Triggers: comma-separated, lowercase keywords (supports Cyrillic and Latin)
</structure>

<process>
1. **Read current index**: `~/.gsd/KNOWLEDGE.md`
2. **Determine action** from user intent:

   **Adding a new topic:**
   - Pick a slug for the filename (lowercase, hyphens): e.g. `aws.md`, `docker-registry.md`
   - Write the detail file to `~/.gsd/knowledge/{slug}.md` — use markdown with `## Headings`
   - Choose trigger keywords — think about what the user would say when this topic is relevant. Include synonyms, abbreviations, transliterations. Lowercase, comma-separated.
   - Append a row to the trigger table in `~/.gsd/KNOWLEDGE.md`

   **Updating an existing topic:**
   - Read the detail file path from the index table
   - Read and edit the detail file at `~/.gsd/knowledge/{slug}.md`
   - Update triggers in the index if the scope changed

   **Listing topics:**
   - Read and display the index table

3. **Verify**: Read back the index to confirm the row is present and the detail file exists.
</process>

<rules>
- The index file must stay lightweight — **no detail content in the index**, only the trigger table.
- Detail files live in `~/.gsd/knowledge/` — one file per topic.
- Triggers are matched case-insensitively against the user's prompt. Include:
  - English terms
  - Russian transliterations if the user communicates in Russian
  - Common abbreviations and aliases
- File paths in the table use backtick-wrapped `~/.gsd/knowledge/` prefix.
- When the user shares information that spans multiple unrelated topics, create separate files for each.
- When the user shares info that fits an existing topic, update that topic's detail file rather than creating a new one.
- Ask the user to confirm trigger keywords if the topic is ambiguous.
</rules>

<success_criteria>
- Index row added/updated in `~/.gsd/KNOWLEDGE.md`
- Detail file written to `~/.gsd/knowledge/{slug}.md`
- Triggers cover reasonable synonyms and transliterations
- Read-back confirms both files are correct
</success_criteria>
