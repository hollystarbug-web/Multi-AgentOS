# Layer C — Staff Communication Patterns

> Persistent learned understanding of how Base Lift Services staff interact via ServiceM8 job diaries.
> Derived from analysis of ~20,000 diary events across Jan 2025 – May 2026.

---

## Staff Profiles

### Justin Howard
**UUID:** `9e0a6b5e-35a0-4993-b7fd-2244331f852b`
**Role:** Director / Approver / Escalation point

**Communication Pattern:**
- Rarely adds routine notes — appears primarily for approvals, escalations, and reviews
- Tags staff members when action is needed (`@Caz`, `@Malene`, `@Diogo`)
- Flags issues: "urgent", "problem", "needs review", "chase"
- Acts as final approver on quotes and escalations
- Typical entry: approving, directing, reviewing

**Anti-pattern to watch for:**
- Notes tagged `@Justin` that go unanswered → escalation risk
- Multiple tags on same job → complex coordination needed

---

### Caz Howorth
**UUID:** `23b9df50-18dc-4a54-8f37-2244319c50fb`
**Role:** Service coordinator / Admin

**Communication Pattern:**
- Acts on jobs but may not always reply to tags
- Updates job status: "booked", "arranged", "engineer attended", "completed"
- Sends quotes and service contracts to customers
- Coordinates with field staff
- Sometimes adds notes without tagging back → response gap risk

**Anti-pattern to watch for:**
- Tags received but no reply within 24h → job stuck
- "Action done" note but customer hasn't been notified
- Escalation note to Justin but no follow-up from Caz

**Coaching guidance:**
- When Caz is tagged: don't assume reply means task is done — verify
- When Caz updates a job: check if customer was notified

---

### Malene Hansen
**UUID:** `c87abc87-7665-40ef-8183-225a7efdb49b`
**Role:** Administrator / Customer comms

**Communication Pattern:**
- Properly responds to all tags — best response rate among staff
- Sends customer communications: "thanks", "confirmed", "noted", "sorted"
- Follows up on outstanding items
- Clear, professional tone

**Anti-pattern to watch for:**
- Malene NOT tagged on jobs she should be → coordination gap
- Customer-facing notes without internal tag → follow-up missed

**Strength:**
- Reliable respondent — when Malene is tagged, expect a reply

---

### Diogo Vasquez
**UUID:** `f3e00f8a-7ddb-4424-a928-228a7c0ce26b`
**Role:** Field technician / Site operative

**Communication Pattern:**
- Updates job status from site: "arrived", "attended", "completed"
- Brief, action-focused notes: "done", "sorted", "needs parts"
- May not reply to tags — field work takes priority
- Updates without notification to customer/admin

**Anti-pattern to watch for:**
- Job marked "updated" but no client communication sent
- Parts ordered but not logged in system
- Job closed without full note

**Coaching guidance:**
- When Diogo is tagged: allow response time (may be on site)
- Diogo's "done" note → verify all steps completed before closing job

---

### Tom K
**UUID:** `a5ec4657-d449-4853-b019-228a732c78fb`
**Role:** Field technician

**Communication Pattern:**
- Similar to Diogo — field-focused updates
- Brief job notes from site
- May not reply to tags if on jobs

---

### Florence
**Role:** Chaser / Coordinator

**Communication Pattern:**
- Asks questions and chases for updates
- Flags issues to Justin or other staff
- Proactive: "Do we have an update?", "Can someone check?", "Flagging this"
- Tags multiple staff members to drive action

**Strength:**
- Good escalation indicator — when Florence tags, something needs attention

---

## Classification Types

| Classification | Description | Flags |
|---|---|---|
| escalation | Tags Justin or flags urgent/problem | Needs immediate attention |
| direct_response | Staff member replied to a tag | Response occurred |
| job_action_no_reply | Action taken but no reply to tagger | Potential gap |
| unanswered_tag | Staff member tagged, no reply | Response pending |
| job_update | Status update without client comms | Verify client notified |
| internal_note | Marked internal/private | Admin/coordination only |
| client_communication | Client-facing note | Visible to customer |
| other | Unclassified | Review needed |

---

## Response Time Expectations

| Staff | Expected response to tag | Notes |
|---|---|---|
| Malene | Within hours | Most reliable |
| Justin | Within 24h (approvals) | Check queue if delayed |
| Caz | Same day | May need follow-up |
| Diogo | 24-48h | Field work priority |
| Tom K | 24-48h | Field work priority |

---

## Anti-Patterns to Flag

1. **Escalation without response**: Justin tagged on escalation, no reply in 24h
2. **Unanswered tag chain**: 3+ unanswered tags on same job
3. **Client comms missing**: Job marked complete but no client-facing note
4. **Quote sent, not logged**: Caz sent quote but no SM8 note confirming
5. **Parts not logged**: Diogo mentioned parts but no SM8 note
6. **Same job, multiple updaters**: Coordination confusion risk

---

## Coaching Guidance

### For Justin:
- When flagging urgent: use `@justin` AND add "URGENT" or "NEEDS REVIEW" in text
- Quotes and approvals: ensure linked job has full note before marking complete

### For Caz:
- After taking action on a tagged job: reply to the tag even if brief ("Sorted", "Done")
- When sending quote to customer: add note in SM8 with quote reference

### For Diogo/Tom:
- When on site: brief note even if just "Attending" or "Site clear"
- Parts used: note part number/name in job diary
- Job complete: ensure note reflects full scope

### For Malene:
- Continue reliable response pattern — it's working well
- When customer replies via email, log in SM8 diary

---

## Report Triggers

This pattern knowledge drives the following automated checks:

1. **Unanswered Tags Report**: Jobs with >24h unanswered tags → alert Justin
2. **Escalation Tracking**: Jobs with multiple escalations → flag for review
3. **Client Comm Gap**: Jobs marked complete without client-facing note → alert Caz
4. **Staff Response Rate**: Weekly summary of each staff's tag response rate

---

*Last updated: 2026-05-28 — based on analysis of ~20,139 diary events from Jan 2025 to May 2026*
