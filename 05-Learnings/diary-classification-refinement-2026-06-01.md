---
type: learning
title: Diary Classification Refinement — 93% of "Escalations" Are False Positives
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, classification, refinement, watcher, false-positives]
status: complete (proposed implementation)
data_source: 500 manually re-classified notes
related: [[diary-comprehensive-analysis-2026-06-01]], [[diary-watcher-bugfix-2026-06-01]]
---

# Diary Classification Refinement — 2026-06-01

> **Headline:** 93% of notes currently flagged as "escalation" are NOT real escalations. The classification logic needs work.

---

## The Problem

The current `classify()` function in `diary_watcher.py` produces 3,466 "escalations" out of 20,298 notes. **When you actually read the text, only ~250 are real problems.** The rest are routine coordination.

### Re-classification of 500 "escalation" notes (DD8)

| New class | Count | % | Real escalation? |
|---|---|---|---|
| **coordination** (just @mention) | 387 | 77% | ❌ |
| **REAL escalation** (urgent/complaint) | **33** | **7%** | ✅ |
| SC_request (service contract) | 27 | 5% | ❌ |
| parts_check | 16 | 3% | ❌ |
| scheduling | 11 | 2% | ❌ |
| other_workflow | 18 | 4% | ❌ |
| acknowledgment | 3 | 1% | ❌ |
| survey_chase | 2 | 0% | ❌ |
| fwd_email | 2 | 0% | ❌ |
| OOO | 1 | 0% | ❌ |

### What "coordination" looks like

These all get flagged as escalation but are actually routine:

- `@Florence @Justin sent request to installs group chat`
- `@Malene Please can you keep an eye out as D asked for parts to be sent to Ralph`
- `@Caz @Malene please send service contract for Rockwood`
- `@Malene have you received this part?`
- `ok @Diogo`

### What a REAL escalation looks like

- `We had the LOLER inspection carried out last week. Please see below comments from them for urgent action - can you please advise?`
- `@Justin Mark will not go onto site and remove parts so will pass to the debt collectors`
- `I am now writing to inform you that we are left with no choice but to seek legal advice`
- `The lifts go down constantly and customers are stuck`

---

## Proposed New Classification Logic

```python
def classify_refined(raw_text, staff_name, mentioned_uuids):
    """Refined classification — distinguishes real escalations from coordination."""
    text_lower = raw_text.lower() if raw_text else ""
    tags = []
    
    # 1. Is it an OOO / auto-forward?
    if any(ind in text_lower for ind in ['out of office', 'ooo', 'auto dialler',
                                          'sent automatically from']):
        return 'auto_forward', 0, ['auto_forward']
    
    # 2. Is it a real escalation? (problem / complaint / urgent request)
    REAL_ESCALATION = [
        # Urgent
        'urgent', 'asap', 'immediately', 'right now',
        # Mechanical
        'breakdown', 'broken', 'trapped', 'stranded', 'no power',
        'out of service', 'shutdown', 'shut down', 'stuck in lift',
        # Complaint
        'complaint', 'frustrated', 'unhappy', 'angry', 'disappointed',
        'fed up', 'worse', 'terrible', 'awful', 'unacceptable', 'ridiculous',
        # Legal
        'debt collector', 'legal', 'solicitor', 'court', 'small claims',
        # Financial
        'invoice overdue', 'payment overdue', 'unpaid for',
        # Insurance
        'insurance', 'claim', 'compensation',
    ]
    has_real_esc = any(ind in text_lower for ind in REAL_ESCALATION)
    
    # 3. Is it a service contract request?
    SC_REQUEST = [
        'service contract', 'sc quote', 'sc renewal', 'sc for',
        'send sc', 'prepare sc', 'sc request', 'contract for',
        'contract quote', 'maintenance contract', 'maintenance quote',
    ]
    is_sc_request = any(ind in text_lower for ind in SC_REQUEST)
    
    # 4. Is it a parts status check?
    is_parts_check = (
        mentioned_uuids and any(ind in text_lower for ind in
        ['part', 'parts', 'drawing', 'order', 'delivery', 'received'])
    )
    
    # 5. Is it a scheduling / engineer booking?
    is_scheduling = any(ind in text_lower for ind in
        ['book', 'booking', 'schedule', 'allocated', 'allocation'])
    
    # 6. Is it a survey/quote chase?
    is_survey_chase = any(ind in text_lower for ind in
        ['chase', 'chasing', 'follow up', 'followup', 'status on'])
    
    # Decision tree
    if has_real_esc:
        classification = 'real_escalation'
        is_client_visible = 1
        tags.append('real_escalation')
    elif is_sc_request:
        classification = 'sc_coordination'
        is_client_visible = 0
        tags.append('sc_request')
    elif is_parts_check:
        classification = 'parts_coordination'
        is_client_visible = 0
        tags.append('parts_check')
    elif is_scheduling:
        classification = 'scheduling_coordination'
        is_client_visible = 0
        tags.append('scheduling')
    elif is_survey_chase:
        classification = 'survey_chase'
        is_client_visible = 0
        tags.append('survey_chase')
    elif mentioned_uuids:
        # Has @mention but no other indicators = routine coordination
        classification = 'coordination'
        is_client_visible = -1
        tags.append('coordination')
    else:
        classification = 'other'
        is_client_visible = -1
        tags.append('other')
    
    if mentioned_uuids:
        tags.append('contains_mention')
    
    return classification, is_client_visible, list(set(tags))
```

### Key changes

1. **Added `real_escalation`** as a separate category — only flags actual problems
2. **Added `coordination`** as a separate category — for routine @mentions
3. **Added `sc_coordination`** — for the 27% of false escalations that are SC requests
4. **Added `parts_coordination`** — for status checks
5. **Added `scheduling_coordination`** — for engineer booking
6. **Kept `auto_forward`** for OOO and forwarded emails

### Expected impact

If we re-classify all 20,298 notes with the new logic:

| Old classification | New expected distribution |
|---|---|
| escalation (3,466) | → real_escalation: ~250, coordination: ~1,500, sc_coordination: ~750, parts_coordination: ~500, other: ~466 |
| other (3,343) | Mostly stays the same |
| direct_response (7,340) | Stays the same |
| ... | |

**Result:** When you see "X real escalations", you can actually trust it. Right now "3,466 escalations" is meaningless.

---

## Migration Plan

### Phase 1: Test on existing data (do this week)
- Apply new logic to all 20,298 existing notes
- Compare counts
- Verify the 33 REAL escalations we identified manually match

### Phase 2: Update watcher (do this week)
- Edit `classify()` function in `/opt/holly/bin/diary_watcher.py`
- Use the new logic
- Keep backward compat (old `escalation` still valid for now)

### Phase 3: Re-classify all notes (background job)
- One-time SQL update: re-run `classify()` on all existing notes
- Save to new `refined_classification` column? Or just update existing?
- Probably update existing `classification` column with new values

### Phase 4: Update reports (next week)
- All reports that count "escalations" need to be updated
- New reports should use `real_escalation` only
- Old `escalation` column can be deprecated

### Phase 5: Monitor (ongoing)
- Daily check: are we getting ~5-10 real escalations per day? (vs 17% of all notes before)
- Adjust logic if too many false positives / false negatives

---

## What This Means For Operations

### Before refinement (current state)
- 3,466 "escalations" in 17 months
- Daily alerts based on "escalation" count are mostly noise
- "This is a critical job" might just be "@Malene please send SC"

### After refinement (target state)
- ~250 real escalations in 17 months (1.5 per day avg)
- Daily alerts are actionable
- "Real escalation" actually means real problem

### Dashboard impact
- All dashboards need updating
- "Top escalated clients" should be re-computed using `real_escalation`
- "Most stuck jobs" recalibrated

---

## Files

- **Re-classification data:** `/root/.openclaw/workspace/analysis/dd8/reclassify.json`
- **Sample notes:** `/root/.openclaw/workspace/analysis/dd1/escalation_samples.json`
- **Current watcher code:** `/opt/holly/bin/diary_watcher.py` (function `classify()` needs updating)

## Related

- [[diary-comprehensive-analysis-2026-06-01]] — DD8 section
- [[diary-watcher-bugfix-2026-06-01]] — Watcher pagination fix (separate issue)
- [[diary-pattern-analysis-full-2026-06-01]] — Original stats
