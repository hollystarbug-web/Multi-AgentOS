### ServiceM8 API — Badge & Checklist (CONFIRMED WORKING 2026-04-25)

**Add Badge to Job:**
```bash
curl -X POST \
  -H "X-API-Key: smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7" \
  -H "Content-Type: application/json" \
  -d '{"job_uuid": "<job_uuid>", "badge_uuid": "<badge_uuid>"}' \
  "https://api.servicem8.com/api_1.0/job_badge.json"
```

**Known badge UUIDs:**
- Warranty: `228c489b-577c-41d7-b521-22443dd9780b`
- VIP: `d410b594-c477-456a-b187-22443ce1fd3b`

**Add Checklist Item (Task) to Job:**
```bash
curl -X POST \
  -H "X-API-Key: smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Contract v7",
    "task_details": "Complete SC v7 form and attach to job diary",
    "related_object": "job",
    "related_object_uuid": "<job_uuid>",
    "active": 1
  }' \
  "https://api.servicem8.com/api_1.0/task.json"
```

**Test job:** Bas-4325 (Pretend Client to Test SC Limited)
- UUID: `e23faaf0-f119-4c4d-8d67-24190bea3f0d`
- VIP badge added 2026-04-25 09:44 ✅
- Test checklist item added 2026-04-25 ✅

---

