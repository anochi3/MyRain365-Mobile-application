/**
 * Every fixed number used by the calculations, in one place, so it can be checked and changed easily.
 * Prices are typical French figures, not quotes.
 */
import type { RoofMaterial, WaterUse } from '@/data/store/projectTypes';

/**
 * Price of mains water in the Lille metropolis (Iléo tariff), in euros per cubic metre.
 * withSewer includes sanitation; waterOnly is the drinking-water part alone.
 */
export const WATER_PRICE_EUR_PER_M3 = {
  withSewer: 4.58,
  waterOnly: 2.42,
};

/** 10% of the collected rain is diverted at the start of each shower to wash the dirtiest water away. */
export const FIRST_FLUSH_LOSS = 0.1;

/**
 * Runoff coefficient: the share of the rain falling on the roof that actually reaches the gutter.
 * Smooth metal sheds almost everything; green and thatched roofs hold much of it back.
 */
export const RUNOFF_COEFFICIENT: Record<RoofMaterial, number> = {
  tiles: 0.85,
  slate: 0.85,
  metal: 0.9,
  flat: 0.8,
  green: 0.5,
  thatched: 0.4,
};

/** Litres per person per day for each indoor use. */
export const LITRES_PER_PERSON_PER_DAY: Record<Exclude<WaterUse, 'garden'>, number> = {
  toilets: 25,
  laundry: 15,
  cleaning: 5,
  drinking: 3,
};

/** Garden watering: 30 litres a day for the whole home, only from April (4) to September (9). */
export const GARDEN_LITRES_PER_DAY = 30;
export const GARDEN_MONTHS = [4, 5, 6, 7, 8, 9];

/** Uses kept going during a water cut. */
export const ESSENTIAL_USES: WaterUse[] = ['toilets', 'cleaning'];

/** Tank sizes compared on the Tank size screen, in litres. */
export const TANK_SIZES_L = [1000, 2000, 3000, 5000];
export const WALL_TANK_MAX_L = 1000;
export const DEFAULT_TANK_L = 2000;

/** Shared courée tank: one 15,000 L tank for about ten homes. */
export const SHARED_TANK_L = 15000;
export const SHARED_HOMES = 10;
export const SHARED_COST_PER_HOME_EUR: [number, number] = [2000, 3000];
export const SHARED_UPKEEP_PER_HOME_EUR = 15;

/** A tank and its pipes last about 25 years and cost about €40 a year to keep running. */
export const SYSTEM_LIFE_YEARS = 25;
export const UPKEEP_EUR_PER_YEAR = 40;

/** A simple garden water butt on a downpipe. */
export const WATER_BUTT_COST_EUR: [number, number] = [80, 150];

/** One line of the cost table, with a low and a high price in euros. */
export type CostItem = {
  key: 'tank' | 'filters' | 'pump' | 'pipes' | 'installation';
  range: [number, number];
};

/** Price of the tank itself, by size in litres. */
const TANK_PRICE_EUR: Record<number, [number, number]> = {
  1000: [700, 1100],
  2000: [1200, 1800],
  3000: [1700, 2500],
  5000: [2500, 3500],
};

/**
 * All parts of a system. Installation costs more for a buried tank (digging) than for one
 * standing against a wall.
 */
export function systemCostItems(tankLitres: number, isBuried: boolean): CostItem[] {
  const tank = TANK_PRICE_EUR[tankLitres] ?? TANK_PRICE_EUR[DEFAULT_TANK_L];
  return [
    { key: 'tank', range: tank },
    { key: 'filters', range: [200, 400] },
    { key: 'pump', range: [300, 600] },
    { key: 'pipes', range: [800, 1400] },
    { key: 'installation', range: isBuried ? [1000, 1300] : [400, 700] },
  ];
}

/** Total cost = sum of all the low prices, and sum of all the high prices. */
export function totalCost(items: CostItem[]): [number, number] {
  return items.reduce<[number, number]>(
    ([low, high], { range }) => [low + range[0], high + range[1]],
    [0, 0],
  );
}

/** Indicative cost of a UV and carbon treatment system that would make rainwater drinkable. */
export const DRINKING_TREATMENT = {
  installEur: [1500, 3000] as [number, number],
  upkeepEurPerYear: [100, 200] as [number, number],
};
