## Service Contract Cross-Check (OneDrive vs ServiceM8)

**Credentials:** `~/.openclaw/workspace/.credentials/microsoft-onedrive.json`
**OneDrive URL:** Shared Excel file (.xlsx) containing Base Lift Services Service Contracts list
**Login:** hollystarbug@gmail.com / Reddwarf2026!

**Source file:** OneDrive → shared Excel spreadsheet of Service Contracts
**Reference:** ServiceM8 API — Service Contract category UUID: `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`

**Data storage:**
- Raw extractions: `data/service-contract-crosscheck/YYYY-MM-DD/`
- Latest report: `data/service-contract-crosscheck/latest.json`
- All runs: `data/service-contract-crosscheck/history/` (each run timestamped)

**Cross-check logic:**
1. Download/parse OneDrive Excel for all contracts
2. Query ServiceM8 for all active Service Contract jobs
3. Compare and categorise:
   - On OneDrive only → not in ServiceM8 (need adding?)
   - In ServiceM8 only → not on OneDrive (possibly lapsed/missing)
   - Duplicates (same client/address in both)
   - Matches (present in both)

**When to run:** Manual only — trigger by saying "Service Contract Cross-Check" or "SC Cross-Check"

---

