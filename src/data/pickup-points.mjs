// Pickup points. hours: null — a parcel locker, open around the clock.
export const PICKUP_POINTS = [
  { id: 'msk-pokrovka', city: 'Moscow', type: 'shop', title: 'Plosia Store', address: 'Pokrovka St., 17', hours: { open: '10:00', close: '21:00' } },
  { id: 'msk-leninsky', city: 'Moscow', type: 'pvz', title: 'Pickup point "Cat House"', address: 'Leninsky Ave., 52', hours: { open: '09:00', close: '22:00' } },
  { id: 'msk-sokol', city: 'Moscow', type: 'pvz', title: 'Pickup point "Purr Market"', address: 'Leningradsky Ave., 74', hours: { open: '10:00', close: '20:00' } },
  { id: 'spb-nevsky', city: 'Saint Petersburg', type: 'shop', title: 'Plosia Store', address: 'Nevsky Ave., 88', hours: { open: '10:00', close: '21:00' } },
  { id: 'spb-marata', city: 'Saint Petersburg', type: 'pvz', title: 'Pickup point "Cat and Dog"', address: 'Marata St., 12', hours: { open: '09:00', close: '21:00' } },
  { id: 'kzn-bauman', city: 'Kazan', type: 'pvz', title: 'Pickup point "Tail"', address: 'Bauman St., 44', hours: { open: '10:00', close: '20:00' } },
  { id: 'kzn-koltso', city: 'Kazan', type: 'locker', title: 'Plosia Parcel Locker', address: 'Koltso Mall, 1st floor', hours: null },
  { id: 'nsk-krasny', city: 'Novosibirsk', type: 'locker', title: 'Plosia Parcel Locker', address: 'Krasny Ave., 101', hours: null },
  { id: 'nsk-lenina', city: 'Novosibirsk', type: 'pvz', title: 'Pickup point "Paws"', address: 'Lenin St., 21', hours: { open: '09:00', close: '21:00' } },
  { id: 'ekb-vainera', city: 'Yekaterinburg', type: 'pvz', title: 'Pickup point "Siberian Cat"', address: 'Weiner St., 15', hours: { open: '10:00', close: '21:00' } },
];
