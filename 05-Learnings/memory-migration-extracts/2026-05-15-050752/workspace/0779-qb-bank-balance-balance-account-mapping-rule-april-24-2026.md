## QB Bank Balance — Balance/Account Mapping Rule (April 24 2026)

**On the QB Banking page, accounts are laid out side-by-side horizontally.** DOM text extraction shows all balances together, so ALWAYS match each balance to its account by X-position:
- Left column = first account, Middle = second, Right = third
- Always verify account name is immediately adjacent to the balance in the same visual column
- Before reporting bank balances: confirm which balance belongs to which account by name AND position

**Known QB Accounts (from banking page):**
- **Revolut:** Base Lift Services Ltd Revolut (left column)
- **Metro Current (31806798):** 31806798 1. Base Me... (middle column)
- **Metro Savings:** 2. Base Metro Savings (right column)

