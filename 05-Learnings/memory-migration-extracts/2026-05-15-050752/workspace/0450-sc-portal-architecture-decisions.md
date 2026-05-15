### SC PORTAL ARCHITECTURE DECISIONS

- **SC V7 form is a CHECKLIST ITEM on SM8 job card** — confirmed 10:06. NOT a separate portal form.
- **Portal creates SM8 job + adds "Service Contract v7" task** via POST /task.json. Staff complete the checklist in SM8.
- **5 checklist fields** (lifts_covered, visits_per_year, full_day_rate, per_hour_rate, minimum_call_out) are SM8 task fields, not portal DB fields.
- **Signed contract PDF:** Goes to ORIGINAL job diary in SM8, not renewal job diary (confirmed Justin 2026-04-25)
- **Badge addition:** Via SM8 API (POST /job_badge.json) ✅
- **Task/checklist addition:** Via SM8 API (POST /task.json) ✅

---

