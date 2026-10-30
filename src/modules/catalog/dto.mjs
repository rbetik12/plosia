import { FOOD_KINDS } from '../../data/food.mjs';

export function formatAge(months) {
  if (months < 12) return `${months} mo.`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 year' : `${years} years`;
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
    isNew: Boolean(cat.isNew),
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
