import { PICKUP_POINTS } from '../../data/pickup-points.mjs';

const TYPE_TITLES = { shop: 'Store', pvz: 'Pickup point', locker: 'Parcel locker' };

export function listPickupPoints(city) {
  return PICKUP_POINTS.filter((point) => point.city === city).map(toPointDto);
}

export function findPickupPoint(id) {
  return PICKUP_POINTS.find((point) => point.id === id);
}

function toPointDto(point) {
  return {
    id: point.id,
    type: point.type,
    typeTitle: TYPE_TITLES[point.type],
    title: point.title,
    address: point.address,
    hours: `${point.hours.open}–${point.hours.close}`,
  };
}
