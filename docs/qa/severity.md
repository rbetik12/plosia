# Severity and priority

## Severity — how bad it is when the bug happens

| Severity | When we assign it | Example in Plosia |
|---|---|---|
| **Blocker** | The customer cannot buy or pay, and there is no workaround | Payment fails for everyone |
| **Critical** | A key scenario is broken for a noticeable group, the workaround is not obvious; an error in money | A discount is calculated wrongly; an order cannot be created in one city |
| **Major** | A scenario is broken, but there is a clear workaround | Pickup does not work, but the customer can order with a courier |
| **Minor** | Inconvenient, but the purchase is not affected | The filter resets after going back |
| **Trivial** | Cosmetic | A typo in an email |

Money-related bugs are always at least **Critical**: a wrong amount, discount or charge.

## Priority — how fast we fix it

| Priority | Rule |
|---|---|
| **P1** — fix today | Blocker; or Critical that affects **≥ 30 users per day**; any payment problems |
| **P2** — in the next release | Other Critical and Major; errors seen by **≥ 10 users per day** |
| **P3** — when possible | Minor, Trivial; rare errors (**< 10 users per day**) with no impact on money |

If there is no data on the number of users, we say so, set the priority by severity and mark it "needs clarification".

## 5xx in Sentry

- We count only server errors: `http.status_code` 500–599. 4xx (a wrong promo code, a wrong password) are not server bugs.
- Warnings (`level:warning`) are not 5xx, even if they look scary.
- One Sentry issue ≠ one bug: one cause can produce several issues, and vice versa.
