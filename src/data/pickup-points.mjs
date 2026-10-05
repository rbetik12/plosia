// Пункты выдачи. hours: null — постамат, работает круглосуточно.
export const PICKUP_POINTS = [
  { id: 'msk-pokrovka', city: 'Москва', type: 'shop', title: 'Магазин Plosia', address: 'ул. Покровка, 17', hours: { open: '10:00', close: '21:00' } },
  { id: 'msk-leninsky', city: 'Москва', type: 'pvz', title: 'Пункт выдачи «Кошкин дом»', address: 'Ленинский пр-т, 52', hours: { open: '09:00', close: '22:00' } },
  { id: 'msk-sokol', city: 'Москва', type: 'pvz', title: 'Пункт выдачи «Мур-маркет»', address: 'Ленинградский пр-т, 74', hours: { open: '10:00', close: '20:00' } },
  { id: 'spb-nevsky', city: 'Санкт-Петербург', type: 'shop', title: 'Магазин Plosia', address: 'Невский пр-т, 88', hours: { open: '10:00', close: '21:00' } },
  { id: 'spb-marata', city: 'Санкт-Петербург', type: 'pvz', title: 'Пункт выдачи «Кот и пёс»', address: 'ул. Марата, 12', hours: { open: '09:00', close: '21:00' } },
  { id: 'kzn-bauman', city: 'Казань', type: 'pvz', title: 'Пункт выдачи «Хвост»', address: 'ул. Баумана, 44', hours: { open: '10:00', close: '20:00' } },
  { id: 'kzn-koltso', city: 'Казань', type: 'locker', title: 'Постамат Plosia', address: 'ТЦ «Кольцо», 1 этаж', hours: null },
  { id: 'nsk-krasny', city: 'Новосибирск', type: 'locker', title: 'Постамат Plosia', address: 'Красный пр-т, 101', hours: null },
  { id: 'nsk-lenina', city: 'Новосибирск', type: 'pvz', title: 'Пункт выдачи «Лапки»', address: 'ул. Ленина, 21', hours: { open: '09:00', close: '21:00' } },
  { id: 'ekb-vainera', city: 'Екатеринбург', type: 'pvz', title: 'Пункт выдачи «Сибирский кот»', address: 'ул. Вайнера, 15', hours: { open: '10:00', close: '21:00' } },
];
