export const FOOD_KINDS = {
  dry: 'Сухой корм',
  wet: 'Влажный корм',
  treat: 'Лакомство',
};

export const BRANDS = {
  murlyks: { id: 'murlyks', title: 'Мурлыкс' },
  kotletta: { id: 'kotletta', title: 'Котлетта' },
  rybka: { id: 'rybka', title: 'Рыбка Дня' },
  barsik: { id: 'barsik', title: 'Сытый Барсик' },
  hvostik: { id: 'hvostik', title: 'Хвостик' },
};

const food = (id, sku, data) => ({ id, sku, type: 'food', ...data });

export const FOOD = [
  food('food-01', 'PL-F-0101', { title: 'Курочка для котят', brand: BRANDS.murlyks, kind: 'dry', age: 'kitten', weight: '1,5 кг', price: 890, image: '/img/food/food-01.jpg' }),
  food('food-02', 'PL-F-0102', { title: 'Лосось и рис', brand: BRANDS.murlyks, kind: 'dry', age: 'adult', weight: '2 кг', price: 1190, image: '/img/food/food-06.jpg' }),
  food('food-03', 'PL-F-0103', { title: 'Индейка 7+', brand: BRANDS.murlyks, kind: 'dry', age: 'senior', weight: '1,5 кг', price: 1090, image: '/img/food/food-04.jpg' }),
  food('food-04', 'PL-F-0201', { title: 'Паштет с кроликом', brand: BRANDS.kotletta, kind: 'wet', age: 'adult', weight: '12 × 85 г', price: 780, image: '/img/food/food-12.jpg' }),
  food('food-05', 'PL-F-0202', { title: 'Тунец в желе', brand: BRANDS.kotletta, kind: 'wet', age: 'adult', weight: '12 × 85 г', price: 820, image: '/img/food/food-08.jpg' }),
  food('food-06', 'PL-F-0203', { title: 'Нежный мусс для котят', brand: BRANDS.kotletta, kind: 'wet', age: 'kitten', weight: '12 × 85 г', price: 760, image: '/img/food/food-07.jpg' }),
  food('food-07', 'PL-F-0301', { title: 'Сардина в собственном соку', brand: BRANDS.rybka, kind: 'wet', age: 'adult', weight: '6 × 70 г', price: 540, image: '/img/food/food-11.jpg' }),
  food('food-08', 'PL-F-0302', { title: 'Хрустики с треской', brand: BRANDS.rybka, kind: 'treat', age: 'adult', weight: '60 г', price: 190, image: '/img/food/food-05.jpg' }),
  food('food-09', 'PL-F-0401', { title: 'Говядина, большой мешок', brand: BRANDS.barsik, kind: 'dry', age: 'adult', weight: '10 кг', price: 4990, image: '/img/food/food-02.jpg' }),
  food('food-10', 'PL-F-0402', { title: 'Для стерилизованных', brand: BRANDS.barsik, kind: 'dry', age: 'adult', weight: '3 кг', price: 1890, image: '/img/food/food-09.jpg' }),
  food('food-11', 'PL-F-0501', { title: 'Мятные подушечки', brand: BRANDS.hvostik, kind: 'treat', age: 'adult', weight: '50 г', price: 210, image: '/img/food/food-03.jpg' }),
  food('food-12', 'PL-F-0502', { title: 'Мягкие кусочки 8+', brand: BRANDS.hvostik, kind: 'treat', age: 'senior', weight: '80 г', price: 260, image: '/img/food/food-10.jpg' }),
  food('food-13', 'PL-F-0104', { title: 'Ягнёнок, гипоаллергенный', brand: BRANDS.murlyks, kind: 'dry', age: 'adult', weight: '2 кг', price: 1390, image: '/img/food/food-01.jpg' }),
  food('food-14', 'PL-F-0100', { title: 'Классик', brand: BRANDS.murlyks, kind: 'dry', age: 'adult', weight: '2 кг', price: 990, image: '/img/food/food-06.jpg', discontinued: true }),
  food('food-15', 'PL-F-0204', { title: 'Рагу из утки', brand: BRANDS.kotletta, kind: 'wet', age: 'adult', weight: '12 × 85 г', price: 840, image: '/img/food/food-12.jpg', discontinued: true }),
];
