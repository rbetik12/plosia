// Действующие промокоды. Срок действия — включительно, по Москве.
export const PROMOS = [
  { code: 'MEOW10', kind: 'percent', value: 10, expiresAt: '2027-12-31' },
  { code: 'MURR15', kind: 'percent', value: 15, minSubtotal: 2000, expiresAt: '2027-12-31' },
  { code: 'KITTEN50', kind: 'percent', value: 50, expiresAt: '2027-12-31' },
  { code: 'SUPERCAT70', kind: 'percent', value: 70, expiresAt: '2027-12-31' },
  { code: 'FISH300', kind: 'fixed', value: 300, minSubtotal: 1500, expiresAt: '2027-12-31' },
  { code: 'AUTUMN25', kind: 'percent', value: 25, expiresAt: '2026-09-30' },
];
