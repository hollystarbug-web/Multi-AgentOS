---
type: project
name: Install Pricing Data
created: 2026-06-01
status: active
owner: Justin / Base Lift Services
data_source: ServiceM8
review_period: Sept 2024 - Present
---

# Install Pricing Data

## Project Overview
Review and analysis of all installation quotes from September 2024 to present date.

## Data Source
- **Primary:** ServiceM8 job records via API
- **Categories Included:**
  - New Installation
  - Site Survey / Survey Visit - New Lift Supply
  - Full Refurb/Modernisation
  - General Repair Works (high value only >= GBP 5,000 with quote sent)
- **Date Range:** September 2024 onwards

## Structure
```
install-pricing-data/
├── README.md              # This file
├── data/
│   └── install_jobs_sept2024.json   # Raw SM8 data (337 jobs)
├── quotes/
│   ├── summary.md         # Full summary by month
│   ├── new-installation/  # 188 job files + index
│   ├── surveys/            # 18 job files + index
│   ├── refurb-modernisation/  # 34 job files + index
│   └── general-repair-high-value/  # 97 job files + index
└── analysis/              # (to be added)
```

## Current Data Summary
| Category | Count | Total Value |
|----------|-------|-------------|
| New Installation | 188 | TBC |
| Site Surveys | 18 | TBC |
| Full Refurb/Modernisation | 34 | TBC |
| General Repair (High Value) | 97 | TBC |
| **Total** | **337** | **TBC** |

## Awaiting from Valente
- Purchase price data
- Profit margin data

## Next Steps
1. Await Valente's purchase price and profit margin data
2. Cross-reference quotes with actual costs
3. Build pricing benchmarks by lift type
4. Identify profitable vs unprofitable job types

## Contact
- Valente (TBC) - Additional data provider
