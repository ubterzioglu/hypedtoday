# Voting + Flip Card — AI Agent Prompt Pack (Single MD)

This document consolidates all requirements discussed in this chat about:
1) A minimal-effort **5-category voting** system (scale **1–10**) for projects
2) A **tap/click flip-card** UI (front/back) to avoid information overload
3) An **apply-to-existing-page** implementation prompt (minimal diffs)

Use this MD as the single source of truth for your AI agent.

---

## 0) High-level Goal

Build a project showcase page where each project can be rated in **5 categories** using a **1–10** scale with minimal effort on mobile and web.

To avoid overwhelming users:
- The project card shows a **summary (front)** by default
- Tapping/clicking the card flips it to a **detail (back)** view where voting happens
- Tapping/clicking again flips it back to the summary

---

## 1) Voting System Spec (5 categories, 1–10)

### 1.1 Categories
- Each project is rated in exactly **5 categories**
- Category names are configurable (e.g., UI, Value, Stability, Innovation, Documentation)

### 1.2 Scale
- Score range is **1 to 10**
- Motivation: better differentiation across projects than 1–5

### 1.3 Input UI (STRICT)
- Do **NOT** use:
  - Sliders (too error-prone on mobile)
  - Dropdowns (too slow)
  - Numeric inputs (too fiddly)
- Use **tap-select** controls:
  - Each category uses a **1–10 grid** arranged as **2 rows** for mobile tap accuracy

Layout requirement:

Row 1: `1 2 3 4 5`  
Row 2: `6 7 8 9 10`

- One tap selects the score for that category
- Provide a clear selected state (active pill/button)

### 1.4 Minimal Effort Accelerators (Recommended)
Implement these to reduce friction:

#### A) Preset “Set All” buttons
- Provide quick actions:
  - “Give all 7”
  - “Give all 8”
  - “Give all 9”
  - “Give all 10”
- One tap sets the same score across all 5 categories

#### B) Smart Copy (Optional but powerful)
- After user selects the **first category** score, show a small prompt:
  - “Apply the same score to other categories?”
- If user accepts, auto-fill remaining categories with that score
- User can still adjust any category afterward

### 1.5 Submit
- Provide a single “Submit” action
- On submit:
  - Collect the 5 category scores
  - Optionally compute `avg_score` as the mean of the 5 scores for display/sorting

### 1.6 Backend and Safety (Conceptual)
- The `ANON` key can be public in client apps; security must be enforced server-side/DB rules (e.g., Supabase RLS)
- Recommended anti-abuse controls:
  - Rate limiting
  - One vote per project per user/device
  - Throttling by IP/device hash
- Do not store secrets in client env; keep server-only keys private

---

## 2) Flip Card UI Spec (Front/Back)

### 2.1 Behavior Model (STRICT toggle)
- Card has two faces:
  - **Front** = summary
  - **Back** = detail + voting
- Interaction:
  - First tap/click → flips to **Back**
  - Second tap/click → flips back to **Front**
- Must be **tap/click-based**, not hover-based

### 2.2 No extra flip buttons
- Do not add separate “flip” buttons
- The card itself is the interaction surface

### 2.3 Animation Rules (CSS 3D)
Must use:
- `perspective`
- `transform-style: preserve-3d`
- `rotateY(180deg)`
- `backface-visibility: hidden`
- Smooth transition: **250–350ms**

### 2.4 Interaction Safety (CRITICAL)
- Inputs/buttons inside the back face must **NOT** trigger flip
- Use `event.stopPropagation()` on inner interactive elements or use event delegation checks

### 2.5 Multi-card behavior (choose one)
- Option 1: each card flips independently
- Option 2 (optional): only one card flipped at a time (auto-close others)

### 2.6 Accessibility
- Each card must be keyboard accessible:
  - `tabindex="0"`
  - `role="button"`
  - `Enter` and `Space` toggle flip
- Respect `prefers-reduced-motion: reduce` by disabling transitions

---

## 3) Reference Implementation (Vanilla HTML/CSS/JS)

### 3.1 HTML structure
```html
<div class="flip-card" tabindex="0" role="button" aria-expanded="false">
  <div class="flip-inner">
    <div class="flip-front">
      <!-- existing summary content -->
      <h3>Project Name</h3>
      <p>Short summary</p>
      <small>Tap for details</small>
    </div>

    <div class="flip-back">
      <!-- detail + voting UI -->
      <h3>Vote</h3>

      <!-- Example category row -->
      <div class="category">
        <div class="category-label">UI</div>
        <div class="score-grid" data-category="ui">
          <button type="button" class="score" data-score="1">1</button>
          <button type="button" class="score" data-score="2">2</button>
          <button type="button" class="score" data-score="3">3</button>
          <button type="button" class="score" data-score="4">4</button>
          <button type="button" class="score" data-score="5">5</button>
          <button type="button" class="score" data-score="6">6</button>
          <button type="button" class="score" data-score="7">7</button>
          <button type="button" class="score" data-score="8">8</button>
          <button type="button" class="score" data-score="9">9</button>
          <button type="button" class="score" data-score="10">10</button>
        </div>
      </div>

      <!-- Presets -->
      <div class="presets">
        <button type="button" class="preset" data-all="7">Give all 7</button>
        <button type="button" class="preset" data-all="8">Give all 8</button>
        <button type="button" class="preset" data-all="9">Give all 9</button>
        <button type="button" class="preset" data-all="10">Give all 10</button>
      </div>

      <button type="button" class="submit">Submit</button>
      <small>Tap card to go back</small>
    </div>
  </div>
</div>
```

### 3.2 CSS (flip essentials + score grid)
```css
.flip-card {
  width: 100%;
  max-width: 360px;
  height: 260px;
  perspective: 1000px;
  cursor: pointer;
}

.flip-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 300ms ease;
}

.flip-card.is-flipped .flip-inner {
  transform: rotateY(180deg);
}

.flip-front,
.flip-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: 16px;
}

.flip-back {
  transform: rotateY(180deg);
}

/* 1–10 grid: 2 rows */
.score-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.score {
  padding: 10px 0;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,.15);
  background: #fff;
}

.score.is-selected {
  border-color: rgba(0,0,0,.45);
  font-weight: 700;
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .flip-inner { transition: none; }
}
```

### 3.3 JS (toggle flip + stop propagation + selection)
```js
document.querySelectorAll('.flip-card').forEach((card) => {
  const inner = card.querySelector('.flip-inner');

  const setExpanded = (isFlipped) => {
    card.setAttribute('aria-expanded', String(isFlipped));
  };

  const toggleFlip = () => {
    card.classList.toggle('is-flipped');
    setExpanded(card.classList.contains('is-flipped'));
  };

  // Click/tap on card toggles
  card.addEventListener('click', () => toggleFlip());

  // Keyboard toggle
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
  });

  // Prevent flip when interacting inside back face controls
  card.querySelectorAll('button, input, select, textarea, a').forEach((el) => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });

  // Score selection
  card.querySelectorAll('.score-grid').forEach((grid) => {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.score');
      if (!btn) return;
      const score = Number(btn.dataset.score);

      // Clear selection within this grid
      grid.querySelectorAll('.score').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');

      // TODO: store score in a state object keyed by category + projectId
    });
  });

  // Presets: set all categories
  card.querySelectorAll('.preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      const allScore = Number(btn.dataset.all);
      card.querySelectorAll('.score-grid').forEach((grid) => {
        grid.querySelectorAll('.score').forEach((b) => {
          b.classList.toggle('is-selected', Number(b.dataset.score) === allScore);
        });
      });
      // TODO: update stored state for all categories
    });
  });

  // Submit
  const submit = card.querySelector('.submit');
  if (submit) {
    submit.addEventListener('click', () => {
      // TODO: collect selections, validate 5 categories, submit to backend or localStorage
    });
  }
});
```

---

## 4) APPLY TO EXISTING WEB PAGE (Minimal Diff Prompt)

You will modify an **existing** web page/codebase. Do NOT rewrite the whole page. Apply only the features below with minimal, clean diffs.

### 4.1 Constraints (VERY IMPORTANT)
- Do NOT change the overall design unnecessarily.
- Do NOT introduce page navigation, route changes, or modals.
- Do NOT rely on hover; must work on mobile with tap.
- Do NOT use sliders or dropdowns for 1–10 scoring.
- Do NOT break existing card behavior unless it conflicts; if it conflicts, preserve original intent and implement flip via a wrapper.
- Output only the changed/added code snippets + file names + exact insertion points.

### 4.2 Flip Integration
- Wrap each existing card content as `.flip-front`
- Add a `.flip-back` face containing the voting UI
- Use `.flip-card` click/tap to toggle class `is-flipped`
- Ensure interactive elements on `.flip-back` do NOT trigger flip (stop propagation)

### 4.3 Voting Integration
- Back face contains 5 categories with 1–10 tap-select grid (2 rows as specified)
- Add preset buttons: Give all 7/8/9/10
- Add Submit button; integrate with existing backend endpoint if present, else store to localStorage as placeholder

### 4.4 Accessibility
- Cards must support Enter/Space toggling
- Respect prefers-reduced-motion

### 4.5 Deliverable Format
Return:
1) Files touched
2) Exact patches/snippets per file
3) Where to insert (before/after which lines/selectors)
4) Any required HTML class additions to existing card markup
5) Any new helper JS functions

Do not output unrelated refactors.

---

## 5) Notes / Decisions
- Mobile ideal maximum rating scale: **10**
- UI for 1–10 must be **tap-select grid** (2 rows), not slider
- Flip is a **toggle**: tap to flip, tap again to flip back
- The flip UX is chosen specifically to avoid showing too much info at once

