export const FOOD_KINDS = {
  dry: 'Dry food',
  wet: 'Wet food',
  treat: 'Treat',
};

export const BRANDS = {
  murlyks: { id: 'murlyks', title: 'Purrlix' },
  kotletta: { id: 'kotletta', title: 'Catlet' },
  rybka: { id: 'rybka', title: 'Fish of the Day' },
  barsik: { id: 'barsik', title: 'Well-Fed Barsik' },
  hvostik: { id: 'hvostik', title: 'Tailwag' },
};

const food = (id, sku, data) => ({ id, sku, type: 'food', ...data });

export const FOOD = [
  food('food-01', 'PL-F-0101', { title: 'Chicken for Kittens', brand: BRANDS.murlyks, kind: 'dry', age: 'kitten', weight: '1.5 kg', price: 890, image: '/img/food/food-01.jpg' }),
  food('food-02', 'PL-F-0102', { title: 'Salmon and Rice', brand: BRANDS.murlyks, kind: 'dry', age: 'adult', weight: '2 kg', price: 1190, image: '/img/food/food-06.jpg' }),
  food('food-03', 'PL-F-0103', { title: 'Turkey 7+', brand: BRANDS.murlyks, kind: 'dry', age: 'senior', weight: '1.5 kg', price: 1090, image: '/img/food/food-04.jpg' }),
  food('food-04', 'PL-F-0201', { title: 'Rabbit Pâté', brand: BRANDS.kotletta, kind: 'wet', age: 'adult', weight: '12 × 85 g', price: 780, image: '/img/food/food-12.jpg' }),
  food('food-05', 'PL-F-0202', { title: 'Tuna in Jelly', brand: BRANDS.kotletta, kind: 'wet', age: 'adult', weight: '12 × 85 g', price: 820, image: '/img/food/food-08.jpg' }),
  food('food-06', 'PL-F-0203', { title: 'Gentle Mousse for Kittens', brand: BRANDS.kotletta, kind: 'wet', age: 'kitten', weight: '12 × 85 g', price: 760, image: '/img/food/food-07.jpg' }),
  food('food-07', 'PL-F-0301', { title: 'Sardine in Its Own Juice', brand: BRANDS.rybka, kind: 'wet', age: 'adult', weight: '6 × 70 g', price: 540, image: '/img/food/food-11.jpg' }),
  food('food-08', 'PL-F-0302', { title: 'Crunchies with Cod', brand: BRANDS.rybka, kind: 'treat', age: 'adult', weight: '60 g', price: 190, image: '/img/food/food-05.jpg' }),
  food('food-09', 'PL-F-0401', { title: 'Beef, Big Bag', brand: BRANDS.barsik, kind: 'dry', age: 'adult', weight: '10 kg', price: 4990, image: '/img/food/food-02.jpg' }),
  food('food-10', 'PL-F-0402', { title: 'For Neutered Cats', brand: BRANDS.barsik, kind: 'dry', age: 'adult', weight: '3 kg', price: 1890, image: '/img/food/food-09.jpg' }),
  food('food-11', 'PL-F-0501', { title: 'Mint Pillows', brand: BRANDS.hvostik, kind: 'treat', age: 'adult', weight: '50 g', price: 210, image: '/img/food/food-03.jpg' }),
  food('food-12', 'PL-F-0502', { title: 'Soft Bites 8+', brand: BRANDS.hvostik, kind: 'treat', age: 'senior', weight: '80 g', price: 260, image: '/img/food/food-10.jpg' }),
  food('food-13', 'PL-F-0104', { title: 'Lamb, Hypoallergenic', brand: BRANDS.murlyks, kind: 'dry', age: 'adult', weight: '2 kg', price: 1390, image: '/img/food/food-01.jpg' }),
  food('food-14', 'PL-F-0100', { title: 'Classic', brand: BRANDS.murlyks, kind: 'dry', age: 'adult', weight: '2 kg', price: 990, image: '/img/food/food-06.jpg', discontinued: true }),
  food('food-15', 'PL-F-0204', { title: 'Duck Stew', brand: BRANDS.kotletta, kind: 'wet', age: 'adult', weight: '12 × 85 g', price: 840, image: '/img/food/food-12.jpg', discontinued: true }),
];
