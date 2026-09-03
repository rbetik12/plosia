import { FOOD_KINDS } from '../../data/food.mjs';

export function formatAge(months) {
  if (months < 12) return `${months} мес.`;
  const years = Math.floor(months / 12);
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod10 === 1 && mod100 !== 11) return `${years} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${years} года`;
  return `${years} лет`;
}

export function toCatCard(cat) {
  return {
    id: cat.id,
    slug: cat.slug,
    name: cat.title,
    breed: cat.breed.title,
    age: formatAge(cat.ageMonths),
    sex: cat.sex,
    price: cat.price,
    image: cat.image,
  };
}

export function toFoodCard(item) {
  return {
    id: item.id,
    title: item.title,
    brand: item.brand.title,
    kind: FOOD_KINDS[item.kind],
    weight: item.weight,
    price: item.price,
    image: item.image,
  };
}
