# USER_STORIES.md — FieldCheck AI Checklist App
## Spec-Driven Development | Story Map by Sprint

---

## STORY MAP OVERVIEW

```
GOAL:          Create Project → Build Checklist → Check Off Items (AI) → View Progress
               ──────────────────────────────────────────────────────────────────────
SPRINT 1:      [Auth]   [Projects CRUD]   [Checklist CRUD]   [Manual check-off]
SPRINT 2:      [Voice check-off]   [Photo check-off]   [AI confidence UI]
SPRINT 3:      [Q&A]   [Templates]   [Offline queue]   [Polish]
```

---

## SPRINT 1 — Foundation
**Goal:** A working checklist app. No AI yet. Just solid CRUD and UX bones.
**Duration:** 1 week

---

### Epic 1.1 — Authentication

**US-001: Sign Up** ✅
```
As a contractor,
I want to create an account with my email and password,
So that my projects are saved and private.

Acceptance Criteria:
- [x] Form: name, email, password, password confirmation
- [x] Email must be unique
- [x] Password minimum 8 characters
- [x] On success: redirect to empty projects list
- [x] On error: inline field validation messages
- [x] No email verification required for MVP
```

**US-002: Log In** ✅
```
As a returning contractor,
I want to log in with my email and password,
So that I can access my projects.

Acceptance Criteria:
- [x] Form: email, password
- [x] On success: redirect to projects list
- [x] On failure: "Invalid email or password" (don't reveal which)
- [x] "Stay logged in" toggle (30-day JWT token)
- [x] Auth token stored in localStorage via JWT Bearer token
```

**US-003: Log Out** ✅
```
As a logged-in user,
I want to log out,
So that others can't access my account on a shared device.

Acceptance Criteria:
- [x] Log out option in header menu
- [x] Clears session token
- [x] Redirects to login page
```

---

### Epic 1.2 — Projects

**US-004: Create a Project** ✅
```
As a contractor,
I want to create a new project with a name and trade type,
So that I can organize my checklists by job.

Acceptance Criteria:
- [x] Fields: Project Name (required), Address (optional), Trade Type (select), Notes (optional)
- [x] Trade types: Roofing, HVAC, Plumbing, Electrical, General Contracting,
      Painting, Landscaping, Flooring, Fencing, Solar, Windows & Doors,
      Restoration, Pool, Other
- [x] Name max 100 characters
- [x] On create: navigate to the new project detail page
- [x] Trade type shows relevant emoji/icon in the UI
```

**US-005: View Projects List** ✅
```
As a contractor,
I want to see all my projects in a list,
So that I can quickly find the job I'm working on.

Acceptance Criteria:
- [x] Shows: project name, address (if set), trade badge, completion % ring
- [x] Sorted by most recently updated (default)
- [x] Empty state: illustrated prompt with "Create your first project" CTA
- [x] Search/filter bar to find by name or address
- [x] Tapping a project navigates to Project Detail
```

**US-006: View Project Detail** ✅
```
As a contractor,
I want to see a project's details and all its checklists,
So that I can see the full scope of the job.

Acceptance Criteria:
- [x] Shows: project name, address, trade badge, overall progress bar
- [x] Lists all checklists with their own progress (X of Y items)
- [x] Checklists are expandable/collapsible
- [x] Floating action bar at bottom (placeholder for AI actions in Sprint 2)
- [x] Back button returns to projects list
```

**US-007: Edit / Delete a Project** ✅
```
As a contractor,
I want to edit or delete a project,
So that I can fix mistakes or clean up old jobs.

Acceptance Criteria:
- [x] Edit: same fields as Create, pre-filled
- [x] Delete: requires confirmation bottom sheet ("Delete this project? This can't be undone.")
- [x] Delete removes all associated checklists and items
- [x] Accessible from project detail (edit/delete icons in header)
```

---

### Epic 1.3 — Checklists

**US-008: Create a Checklist** ✅
```
As a contractor,
I want to add a checklist to a project,
So that I can define the tasks for a phase of work.

Acceptance Criteria:
- [x] Name the checklist (e.g., "Pre-Install", "Day 1", "Final Walkthrough")
- [x] Option shown: "Load from template" (shows trade-matched templates)
- [x] On create: checklist appears in project detail, expanded, with empty items
```

**US-009: Add Items to Checklist (Manual)** ✅
```
As a contractor,
I want to add tasks to a checklist,
So that I can define exactly what needs to be done.

Acceptance Criteria:
- [x] Tap "+ Add item" at bottom of checklist
- [x] Inline text input appears (keyboard opens)
- [x] Press Enter or "Add" to save and immediately show next input field
- [x] Item appears at bottom of list
- [ ] Items can be reordered by drag handle (deferred — drag-and-drop requires Sprint 3)
```

**US-010: Manually Check Off an Item** ✅
```
As a contractor,
I want to tap a checkbox to mark an item complete,
So that I can track progress without any AI.

Acceptance Criteria:
- [x] Checkbox on left of each item, min 44x44px tap target
- [x] On tap: item shows strikethrough text, checkbox fills with checkmark
- [x] Completion metadata saved: timestamp, method = "manual", user
- [x] Tapping again unchecks the item
- [x] Completed items shown at bottom of list (below incomplete)
```

**US-011: Delete a Checklist Item** ✅
```
As a contractor,
I want to remove an item from a checklist,
So that I can clean up tasks that no longer apply.

Acceptance Criteria:
- [x] Long press on item → options menu with Delete
- [x] Delete requires one confirmation tap (menu button)
- [x] Item removed immediately from list
```

**US-012: Load Checklist from Template** ✅
```
As a contractor,
I want to load a pre-built checklist for my trade,
So that I don't have to type every item from scratch.

Acceptance Criteria:
- [x] Templates available for: Roofing, HVAC, Plumbing, Electrical, General,
      Painting, Landscaping (7 trades minimum)
- [x] Template preview shows item count before loading
- [x] On load: all template items added to checklist
- [x] User can add/remove/edit items after loading
- [x] Templates suggested based on project's trade type
```

---

## SPRINT 2 — AI Features
**Goal:** Voice and photo check-off with AI matching and confidence UI.
**Duration:** 1.5 weeks

---

### Epic 2.1 — Voice Check-off

**US-013: Record Voice to Check Off an Item** ✅
```
As a roofer on the job,
I want to say what I just finished and have it check the right box,
So that I can keep working without stopping to find the right item.

Acceptance Criteria:
- [x] Tap 🎤 button in AI Action Bar
- [x] Bottom sheet appears: animated waveform, "Listening..." label
- [x] Recording starts automatically (no second tap)
- [x] Tap to stop OR auto-stop after 5 seconds of silence
- [x] Transcription displayed immediately below waveform
- [x] AI match result shown (see US-014)
- [x] Cancel button dismisses without any changes
```

**US-014: AI Confirms Voice Match** ✅
```
As a contractor who just spoke a command,
I want to see what item the AI thinks I completed,
So that I can confirm it's right before it's checked off.

Acceptance Criteria:
- [x] High confidence (≥ 0.90): show item name with 2-second auto-confirm countdown
  - User can cancel countdown or tap "✓ Confirm" immediately
- [x] Medium confidence (0.70–0.89): show item name, require tap to confirm
- [x] Low confidence (0.50–0.69): show "My best guess: [item]" + "Is this right? Yes / No"
- [x] No match (< 0.50): show full uncomplete item list to select manually
- [x] On confirm: item checked, method = "voice", transcription saved
- [x] On "That's wrong": show full item list
- [x] All AI suggestions marked with ✦ violet sparkle indicator
```

**US-015: Handle Voice Recording Failures** ✅
```
As a contractor,
I want clear feedback when my voice recording didn't work,
So that I know to try again.

Acceptance Criteria:
- [x] Silence / too short: "I didn't catch that — tap to try again"
- [x] Background noise warning: show transcription, let user confirm or retry
- [x] No microphone permission: prompt to allow, show how-to
- [x] Network error during Whisper call: "Couldn't process audio — try again or select manually"
```

---

### Epic 2.2 — Photo Check-off

**US-016: Take or Upload a Photo to Check Off an Item** ✅
```
As a contractor who just finished a task,
I want to snap a photo and have it check the right box,
So that I have documentation and don't have to navigate to find the item.

Acceptance Criteria:
- [x] Tap 📷 button in AI Action Bar
- [x] Bottom sheet: "Take Photo" (opens camera) or "Upload from Library"
- [x] After capture: photo thumbnail shown with "Analyzing..." + sparkle animation
- [x] AI match result shown (see US-017)
- [x] Cancel from camera → no changes
```

**US-017: AI Confirms Photo Match** ✅
```
As a contractor who uploaded a photo,
I want to see what the AI thinks the photo shows,
So that I can confirm before anything is checked off.

Acceptance Criteria:
- [x] Show: photo thumbnail + "Looks like: [item name]" + brief AI description of photo
- [x] Same confidence thresholds as voice (US-014)
- [x] On confirm: item checked, photo attached, method = "photo"
- [x] On "That's wrong": show item list to assign photo to correct item
- [x] Photo stored and visible on the completed item
```

**US-018: View Photo Attached to Completed Item** ✅
```
As a contractor or manager reviewing a job,
I want to see the photo that was used to check off an item,
So that I have visual proof of completion.

Acceptance Criteria:
- [x] Completed items with a photo show a thumbnail on the right
- [x] Tap thumbnail → full-screen photo view
- [x] Shows: captured date/time, who checked it off
```

---

### Epic 2.3 — AI Action Bar

**US-019: Persistent AI Action Bar** ✅
```
As a contractor on a job,
I want the voice, photo, and ask buttons always visible,
So that I don't have to scroll or navigate to use them.

Acceptance Criteria:
- [x] Fixed bar at bottom of Project Detail screen
- [x] Three buttons: 🎤 Voice, 📷 Photo, 💬 Ask
- [x] Buttons labeled and large enough for one-thumb use (min 48px tap target)
- [x] Bar sits above device home indicator (safe area inset)
- [x] Bar is visible even when scrolling checklist
```

---

## SPRINT 3 — Polish & Intelligence
**Goal:** Q&A, offline, templates, and a demo-ready product.
**Duration:** 1 week

---

### Epic 3.1 — Natural Language Q&A

**US-020: Ask a Question About the Checklist** ✅
```
As a contractor,
I want to ask "what's next?" or "what's left?",
So that I can stay oriented without reading through the whole list.

Acceptance Criteria:
- [x] Tap 💬 button in AI Action Bar
- [x] Input: voice (via Whisper) or text
- [x] Supported queries:
    - "What's next?" → returns next incomplete item name only
    - "What's left?" → summary count and item names
    - "Am I done?" → yes/no with items remaining if no
    - "What did I finish today?" → list with times
- [x] Response shown as a chat bubble above input
- [x] Q&A never modifies checklist state — read-only
- [x] Last 3 exchanges kept visible in session
```

---

### Epic 3.2 — Offline Support

**US-021: Use the App Without Internet** ✅
```
As a contractor on a job site with no signal,
I want to view my checklists and manually check items off,
So that I can keep working even without internet.

Acceptance Criteria:
- [x] All projects and checklists load from local cache when offline
- [x] Manual check-off works offline — queued and synced when reconnected
- [x] Offline banner shown: "You're offline — changes will sync when connected"
- [x] Pending (unsynced) items show ⏳ badge
- [x] On reconnect: queue flushed, badges cleared
- [x] AI features (voice match, photo match) show "Needs internet" message when offline
```

---

### Epic 3.3 — Progress & Summary

**US-022: View Project Completion Progress** ✅
```
As a contractor or project manager,
I want to see at a glance how complete a project is,
So that I know if the job is done or what's left.

Acceptance Criteria:
- [x] Project card shows completion ring (e.g., 7/9 = 78% filled)
- [x] Project detail shows progress bar: "7 of 9 items complete"
- [x] Each checklist shows its own X/Y count
- [x] When all items in a checklist are done: show "✓ Complete" badge
- [x] When all checklists in a project are done: show celebration state
```

**US-023: View Completion History on an Item** ✅
```
As a project manager reviewing a job,
I want to see when and how each item was completed,
So that I can audit the work.

Acceptance Criteria:
- [x] Completed items show: ✓ [name] | Completed via [voice/photo/manual] | [time]
- [x] Tapping a completed item shows detail: full timestamp, who, method, photo (if any)
- [x] Voice completions show the transcription that triggered it
```

---

### Epic 3.4 — Demo Readiness

**US-024: Demo Mode / Seed Data** ✅
```
As a developer demoing the app to CompanyCam,
I want pre-loaded projects and checklists with realistic data,
So that I don't start from an empty state during the demo.

Acceptance Criteria:
- [x] Seed data includes: 3 projects (Roofing, HVAC, Plumbing)
- [x] Each has 1–2 checklists with 8–10 items
- [x] Mix of complete and incomplete items
- [x] At least one item with an attached photo
- [x] Demo user: demo@fieldcheck.app / password123
```

**US-025: Mobile Viewport Optimization** ✅
```
As a user on a mobile device,
I want the app to look and feel native,
So that it doesn't feel like a desktop website shrunk down.

Acceptance Criteria:
- [x] No horizontal scroll at 375px width (iPhone SE)
- [x] All buttons min 48px height
- [x] Bottom sheet animations smooth (< 16ms frame budget)
- [x] Keyboard doesn't break layout when open
- [x] Safe area insets respected on iPhone (notch, home bar)
- [x] Tested on: iPhone 14, Galaxy S22, iPad (landscape)
```

---

## BACKLOG (Post-MVP)

| Story | Description | Priority |
|---|---|---|
| US-026 | Multi-user: share a project with crew members | High |
| US-027 | Video frame extraction for check-off | Medium |
| US-028 | Export project to PDF report | Medium |
| US-029 | Push notifications for incomplete items | Low |
| US-030 | Customer-facing project share link | Low |
| US-031 | User-created custom templates | Medium |
| US-032 | Native iOS/Android app (React Native) | High (V2) |

---

## DEFINITION OF DONE

A user story is "done" when:
- [ ] Feature works as described in acceptance criteria
- [ ] Mobile-responsive (tested at 375px, 768px, 1280px)
- [ ] No console errors or warnings
- [ ] API endpoint has request spec (RSpec)
- [ ] Service object has unit test
- [ ] React component renders in all states (loading, error, empty, populated)
- [ ] Accessibility: keyboard navigable, ARIA labels on icon buttons
- [ ] Merged to main via PR with passing CI
