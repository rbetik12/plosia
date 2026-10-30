# Plosia risk zones

Where a bug costs the most, in descending order.

1. **Payment** (`checkout`, MurPay gateway) — lost money and orders. Any change calls for a full regression of checkout and payment.
2. **Amount calculation** (`cart`, promo codes, delivery) — a wrong discount or total. We check money on boundary values.
3. **Authorization** (`auth`) — the user gets logged out of their account or cannot log in.
4. **Checkout** (`checkout`) — delivery methods, cities, pickup points.
5. **Catalog** (`catalog`) — the most visited section: any bug here is immediately visible to many people.
6. **Orders and receipts** (`orders`) — the receipt is a document for the customer, so it must always open.
7. **Email** (`mail`) — unpleasant, but it does not break the purchase.

Shared code (`src/lib/`) affects all modules: changes there are a reason for a broad regression, even if the commit is called "refactoring".

## What can usually be skipped

- Commits that only touch documentation, the README, or tooling configs.
- Texts and styles, if the logic around them did not change — a visual check is enough.
