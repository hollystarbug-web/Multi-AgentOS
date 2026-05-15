### Badge Assignment — API CONFIRMED WORKING (2026-04-25)
- Job Bas-4325 UUID: `e23faaf0-f119-4c4d-8d67-24190bea3f0d`
- Badge UUIDs: Warranty=`228c489b-577c-41d7-b521-22443dd9780b`, VIP=`d410b594-c477-456a-b187-22443ce1fd3b`
- API: POST to `/job_badge.json` with `{"job_uuid": "<uuid>", "badge_uuid": "<uuid>"}` ✅
- Also confirmed: Task/checklist items can be added via POST `/task.json` with `related_object="job"`, `related_object_uuid="<job_uuid>"` ✅
- Active badges: Warranty, VIP, Take Payment Facilities

