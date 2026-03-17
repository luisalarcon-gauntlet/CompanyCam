# 📋 SPEC.md — AI-Powered Checklist App
## Spec-Driven Development Document
### Inspired by CompanyCam | Built for Contractors

---

## 1. PROJECT OVERVIEW

### Product Name
**FieldCheck** *(working title)*

### One-Line Description
A mobile-first checklist app where contractors complete job checklists using voice, photos, and natural language — no typing required.

### Why It Exists
Contractors in the field (roofers, HVAC techs, plumbers, painters, etc.) have dirty hands, are on ladders, and don't want to tap through a form. They need to say "done" and move on. FieldCheck lets them check off job tasks with their voice or a photo — the AI does the matching.

### Target Platform
- **Primary:** Mobile web (React, mobile-first responsive)
- **Stack:** Ruby on Rails (API) + React (frontend)
- **AI:** Claude API (claude-sonnet-4-20250514) for NLP intent + vision

---

## 2. USER PERSONAS

| Persona | Title | Primary Device | Tech Comfort | Key Need |
|---|---|---|---|---|
| **Roofing Contractor** | Owner / Crew Lead | iPhone, gloves on | Low-Medium | Fast check-off, no typing |
| **HVAC Technician** | Field Tech | Android | Medium | Service checklists, photo proof |
| **Plumber** | Field Tech | iPhone | Low | Inspection sign-off, code photos |
| **Electrician** | Journeyman / Lead | Android | Medium | Panel/permit photo docs |
| **General Contractor** | Owner / PM | iPhone + desktop | High | Multi-crew visibility |
| **Painter** | Crew Lead | Android | Low | Surface prep, completion proof |
| **Property Manager** | Office + Field | Desktop + mobile | Medium | Unit turnover, maintenance |
| **Landscaper** | Crew Lead | Android | Low | Job completion, equipment check |

### Primary Design Target
> **The Field Tech / Crew Lead** — hands dirty, limited patience, on-site with poor signal.
> Every UI decision must pass the "glove test": Can this be used with one thumb while standing on a roof?

---

## 3. DESIGN SYSTEM

### Brand Reference: CompanyCam
The app should feel native to CompanyCam's ecosystem — bold, physical-world energy. Not a sterile SaaS dashboard.

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2563EB` | Primary buttons, links, active states |
| `--color-primary-dark` | `#1D4ED8` | Button hover/press |
| `--color-navy` | `#0F172A` | Page backgrounds, hero sections |
| `--color-navy-mid` | `#1E293B` | Card backgrounds |
| `--color-yellow` | `#FBBF24` | CTA highlights, warnings |
| `--color-ai-purple` | `#7C3AED` | AI feature indicators |
| `--color-ai-pink` | `#EC4899` | AI sparkle accents |
| `--color-success` | `#16A34A` | Completed items |
| `--color-surface` | `#F8FAFC` | Light mode page background |
| `--color-text-primary` | `#0F172A` | Body text |
| `--color-text-muted` | `#64748B` | Secondary text |

### Typography
- **Headlines:** Extra-bold (800), large, often uppercase — feels like job site signage
- **Body:** Clean sans-serif, 16px minimum on mobile (accessibility for outdoor reading)
- **Font:** System font stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Component Patterns
- **Buttons:** Rounded pill (`border-radius: 999px`), large touch targets (min 48px height)
- **Cards:** `border-radius: 12px`, subtle border, icon + label
- **AI Features:** Purple/pink gradient border with ✦ sparkle icon to visually distinguish AI actions
- **Checklist Items:** Large checkbox (min 44px), full-width tap target, swipe actions
- **Confirmation Dialogs:** Bottom sheet on mobile, not modal — less disruptive

### UX Principles
1. **Glove Test** — every interactive element min 48x48px
2. **One Thumb** — primary actions reachable without repositioning hand
3. **Offline First** — queue actions locally, sync when connected
4. **Zero Typing** — voice and photo are primary; keyboard is fallback
5. **Confidence UI** — always show what the AI thinks it matched before committing

---

## 4. INFORMATION ARCHITECTURE

```
App
├── Projects List (Home)
│   ├── Project Card (name, address, trade, progress %)
│   └── + New Project
│
├── Project Detail
│   ├── Project Header (name, address, trade type)
│   ├── Checklist(s)
│   │   ├── Checklist Header (name, X/Y complete)
│   │   ├── Checklist Items (completed / uncompleted)
│   │   └── + Add Item
│   ├── AI Action Bar (persistent bottom bar)
│   │   ├── 🎤 Voice Check-off
│   │   ├── 📷 Photo Check-off
│   │   └── 💬 Ask a Question
│   └── + Add Checklist
│
├── Voice Check-off Flow
│   ├── Recording UI (waveform animation)
│   ├── Transcription display
│   ├── Match Confirmation ("Did you mean: Install drip edge?")
│   └── ✓ Confirmed → Item checked
│
├── Photo Check-off Flow
│   ├── Camera / Upload picker
│   ├── AI analysis loading state
│   ├── Match Suggestion ("Looks like: Cleaned gutters")
│   └── ✓ Confirmed → Item checked + photo attached
│
└── Q&A Flow
    ├── Natural language input (or voice)
    ├── "What's next?" → Returns next uncompleted item
    ├── "What's left?" → Summary of remaining items
    └── "Am I done?" → Completion status
```

---

## 5. FEATURE SPECIFICATIONS

---

### 5.1 Projects

#### Create Project
- **Fields:** Project Name (required), Address (optional), Trade Type (select), Notes (optional)
- **Trade Types:** Roofing, HVAC, Plumbing, Electrical, General Contracting, Painting, Landscaping, Flooring, Fencing, Solar, Windows & Doors, Restoration, Pool, Other
- **On Create:** Optionally load a trade-specific checklist template
- **Validation:** Name required, max 100 chars

#### Project List View
- Cards with: project name, address, trade icon, completion percentage ring, last updated timestamp
- Sort: Most recent first (default), alphabetical, by completion
- Search: Filter by name or address
- Empty state: Illustrated prompt to create first project

#### Project Detail View
- Header: Project name (large), address, trade badge
- Progress bar: X of Y items complete across all checklists
- One or more checklists, expandable/collapsible
- Persistent AI Action Bar at bottom (always visible)

---

### 5.2 Checklists

#### Create Checklist
- Name the checklist (e.g., "Pre-Install", "Day 1", "Final Walkthrough")
- Option to load from template by trade type
- Manual item entry: tap "+ Add item", type name, press Enter

#### Checklist Templates (by Trade)
| Trade | Example Items |
|---|---|
| Roofing | Remove old shingles, Install ice & water shield, Install drip edge, Lay felt paper, Install shingles, Flash chimney, Install ridge cap, Clean gutters, Final inspection photo |
| HVAC | Check thermostat settings, Inspect air filter, Test heating cycle, Test cooling cycle, Check refrigerant levels, Inspect ductwork, Take before photo, Take after photo |
| Plumbing | Shut off water main, Inspect existing pipes, Install new fixture, Test for leaks, Restore water, Take completion photo |
| Electrical | Photograph existing panel, Label breakers, Install new circuit, Test GFCI, Final inspection photo |
| General | Site walkthrough, Safety check, Material delivery confirmed, Work complete photo, Customer sign-off |

#### Checklist Item States
- `incomplete` — default, unchecked
- `complete` — checked, shows: who checked it, how (voice/photo/manual), timestamp
- `skipped` — optional, for N/A items

#### Item Interaction
- **Tap checkbox** → manual complete
- **Long press item** → options: edit, skip, delete, add note
- **Swipe right** → complete
- **Swipe left** → add photo / note

---

### 5.3 Voice Check-off ⭐ (Core AI Feature)

#### Flow
1. User taps 🎤 button in AI Action Bar
2. Recording UI appears (bottom sheet): animated waveform, "Listening..." label
3. User speaks: *"Just finished installing the drip edge"*
4. Whisper API transcribes → text displayed
5. Claude API receives: transcription + full list of incomplete checklist items
6. Claude returns: best match item + confidence score (0–1)
7. **If confidence ≥ 0.85:** Auto-suggest with 2-second confirmation delay
8. **If confidence < 0.85:** Show confirmation UI: "Did you mean: [item name]?" with ✓ Yes / ✗ No / 🔄 Other
9. On confirm → item marked complete, method = "voice", timestamp saved
10. If "No" → show all uncomplete items as a list to manually select

#### Claude Prompt (Voice)
```
You are a job site assistant helping a contractor check off tasks.

The contractor just said: "{transcription}"

Here are the incomplete checklist items:
{items_list}

Return a JSON object:
{
  "matched_item_id": "<id or null>",
  "confidence": <0.0-1.0>,
  "reasoning": "<one sentence>"
}

Match loosely — the contractor speaks casually. "Wrapped up the ice shield" should match "Install ice & water shield".
If no reasonable match exists, return matched_item_id as null.
```

#### Edge Cases
- **No match found:** "Hmm, I didn't catch which item that was. Which one did you finish?" → show item list
- **Multiple plausible matches:** Show top 2 options side by side for user to pick
- **Background noise / unclear:** Show transcription, ask user to confirm or re-record
- **Offline:** Queue the voice action with transcription, sync when connected

---

### 5.4 Photo Check-off ⭐ (Core AI Feature)

#### Flow
1. User taps 📷 button in AI Action Bar
2. Bottom sheet: "Take Photo" or "Upload from Library"
3. Photo captured/selected
4. Loading state: "Analyzing photo..." with AI sparkle animation
5. Claude Vision API receives: image + list of incomplete checklist items
6. Claude returns: best match item + confidence + brief description of what it saw
7. Display: photo thumbnail + "Looks like: [item name]" + confidence indicator
8. User confirms ✓ → item marked complete, photo attached to item
9. User taps ✗ → "Which item does this photo go with?" → manual select

#### Claude Prompt (Vision)
```
You are a job site assistant. A contractor just uploaded a photo from their job site.

Look at this photo and determine which of these checklist items it most likely documents:
{items_list}

Return a JSON object:
{
  "matched_item_id": "<id or null>",
  "confidence": <0.0-1.0>,
  "description": "<one sentence describing what you see in the photo>",
  "reasoning": "<why this matches the item>"
}

Be practical. A photo of a clean room = "Clean bedroom". A photo of shingles on a roof = roofing-related items.
```

#### Photo Storage
- Photos uploaded to cloud storage (S3 or equivalent)
- Thumbnail generated for checklist item view
- Full resolution accessible from item detail
- Photo tagged with: item_id, project_id, captured_at, captured_by

---

### 5.5 Natural Language Q&A ⭐ (Core AI Feature)

#### Supported Queries
| User Says | AI Response |
|---|---|
| "What's next?" | Returns next uncompleted item name |
| "What's left?" | Summary: "3 items left: Install ridge cap, Clean gutters, Final inspection photo" |
| "Am I done?" | "Yes, all 9 items complete! 🎉" or "Almost — 2 items left" |
| "What did I finish today?" | Lists items completed today with timestamps |
| "How long have I been on this job?" | Calculates from first item completion |

#### UI
- Tap 💬 button → bottom sheet input (voice or text)
- Response appears as a chat bubble above the input
- Non-destructive — Q&A never modifies checklist state
- Persists last 3 exchanges in session for context

#### Claude Prompt (Q&A)
```
You are a helpful job site assistant for a contractor.

Project: {project_name}
Trade: {trade_type}
Checklist: {checklist_name}

Items:
{items_with_status_and_timestamps}

The contractor asked: "{user_question}"

Answer conversationally in 1-2 sentences. Be direct, practical, no fluff.
If they ask "what's next?", give just the next item name, nothing else.
```

---

## 6. DATA MODELS

```ruby
# Project
Project {
  id: uuid
  name: string (required)
  address: string
  trade_type: enum [roofing, hvac, plumbing, electrical, general,
                    painting, landscaping, flooring, fencing, solar,
                    windows_doors, restoration, pool, other]
  notes: text
  user_id: uuid (FK)
  created_at: datetime
  updated_at: datetime
}

# Checklist
Checklist {
  id: uuid
  project_id: uuid (FK)
  name: string
  template_id: uuid (FK, nullable)
  position: integer (for ordering)
  created_at: datetime
}

# ChecklistItem
ChecklistItem {
  id: uuid
  checklist_id: uuid (FK)
  title: string
  status: enum [incomplete, complete, skipped]
  position: integer
  completed_at: datetime (nullable)
  completed_via: enum [manual, voice, photo] (nullable)
  completed_by: uuid (FK to user, nullable)
  photo_url: string (nullable)
  photo_thumbnail_url: string (nullable)
  notes: text (nullable)
  ai_confidence: float (nullable) # confidence score when AI matched
  voice_transcription: text (nullable) # raw transcription if via voice
  created_at: datetime
  updated_at: datetime
}

# ChecklistTemplate
ChecklistTemplate {
  id: uuid
  name: string
  trade_type: enum
  items: jsonb # array of {title, position}
  is_default: boolean
  created_at: datetime
}

# User (simple auth)
User {
  id: uuid
  email: string
  name: string
  role: enum [owner, crew_lead, tech]
  created_at: datetime
}
```

---

## 7. API ENDPOINTS (Rails)

```
# Projects
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id

# Checklists
GET    /api/v1/projects/:project_id/checklists
POST   /api/v1/projects/:project_id/checklists
PATCH  /api/v1/checklists/:id
DELETE /api/v1/checklists/:id

# Checklist Items
GET    /api/v1/checklists/:checklist_id/items
POST   /api/v1/checklists/:checklist_id/items
PATCH  /api/v1/items/:id
DELETE /api/v1/items/:id
POST   /api/v1/items/:id/complete   # marks complete, accepts method + metadata

# AI Endpoints
POST   /api/v1/ai/voice-match       # { transcription, items[] } → match result
POST   /api/v1/ai/photo-match       # { image_base64, items[] } → match result
POST   /api/v1/ai/ask               # { question, project_context } → answer

# Templates
GET    /api/v1/templates
GET    /api/v1/templates?trade_type=roofing

# Upload
POST   /api/v1/uploads/photo        # returns { url, thumbnail_url }
```

---

## 8. AI INTEGRATION DETAILS

### Model
`claude-sonnet-4-20250514` for all AI calls

### Voice Pipeline
```
[User Speech]
     ↓
[OpenAI Whisper API] — transcription
     ↓
[Rails Backend] — /api/v1/ai/voice-match
     ↓
[Claude API] — intent matching
     ↓
[JSON Response] — matched_item_id + confidence
     ↓
[Frontend] — confirmation UI
```

### Photo Pipeline
```
[User Photo]
     ↓
[Frontend] — base64 encode or multipart upload
     ↓
[Rails Backend] — /api/v1/ai/photo-match
     ↓
[Claude Vision API] — image + item list
     ↓
[JSON Response] — matched_item_id + description + confidence
     ↓
[Frontend] — confirmation UI
```

### Confidence Thresholds
| Score | Action |
|---|---|
| ≥ 0.90 | Auto-suggest, 2s countdown to confirm |
| 0.70–0.89 | Show suggestion, require explicit tap to confirm |
| 0.50–0.69 | Show suggestion as a guess, prompt "Is this right?" |
| < 0.50 | No suggestion, show full item list for manual select |

---

## 9. OFFLINE BEHAVIOR

### Strategy: Optimistic UI + Queue
- All checklist state stored locally (localStorage → IndexedDB)
- Actions performed offline are queued with UUID + timestamp
- On reconnect: flush queue to API in order
- Conflict resolution: last-write-wins per item (simple for MVP)

### What Works Offline
- ✅ View all projects and checklists
- ✅ Manually check/uncheck items
- ✅ Add new items
- ✅ Voice transcription (if device supports on-device)
- ❌ AI voice matching (requires API)
- ❌ AI photo matching (requires API)
- ❌ Q&A

### Offline UI Indicators
- Subtle banner: "You're offline — changes will sync when connected"
- Pending actions show a ⏳ badge on the item
- Synced items show a ✓ badge briefly on reconnect

---

## 10. ERROR STATES & EDGE CASES

| Scenario | Behavior |
|---|---|
| Voice too short / silence | "I didn't catch that — tap and try again" |
| Photo too dark / blurry | "Photo unclear — try in better lighting or select manually" |
| AI returns no match | Show full item list: "Which item did you finish?" |
| Network timeout on AI call | Fall back to manual select, log error |
| Duplicate voice submission | Detect same transcription within 5s, ignore |
| All items already complete | "This checklist is already done! 🎉" |

---

## 11. SUCCESS METRICS

| Metric | Target |
|---|---|
| Voice match accuracy | ≥ 80% correct match on first attempt |
| Photo match accuracy | ≥ 70% correct match |
| Time to check off an item | < 10 seconds (voice/photo flow) |
| Manual fallback rate | < 30% of AI interactions |
| Items completed via AI vs manual | ≥ 50% AI-assisted at 30 days |

---

## 12. OUT OF SCOPE (MVP)

- Multi-user / team collaboration
- Push notifications
- Video check-off (frame extraction)
- PDF report export
- Customer-facing sharing
- Native mobile app (iOS/Android)
- Billing / subscription management

---

## 13. OPEN QUESTIONS

1. **Auth:** Simple email/password for MVP, or skip auth entirely for demo?
2. **Offline voice:** Use browser Web Speech API as fallback for Whisper when offline?
3. **Template authorship:** Can users create and save their own templates?
4. **Confidence display:** Show confidence % to users, or just the match suggestion?
5. **Photo retention:** How long are photos stored? Any size limits for demo?
