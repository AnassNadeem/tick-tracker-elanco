export const CITIES = [
  { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { name: "Bristol", lat: 51.4545, lng: -2.5879 },
  { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
  { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
  { name: "Leeds", lat: 53.8008, lng: -1.5491 },
  { name: "Leicester", lat: 52.6369, lng: -1.1398 },
  { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Manchester", lat: 53.4808, lng: -2.2426 },
  { name: "Newcastle", lat: 54.9783, lng: -1.6178 },
  { name: "Nottingham", lat: 52.9548, lng: -1.1581 },
  { name: "Sheffield", lat: 53.3811, lng: -1.4701 },
  { name: "Southampton", lat: 50.9097, lng: -1.4044 },
] as const;

export type CityName = (typeof CITIES)[number]["name"];

const cityByName = new Map(CITIES.map((city) => [city.name, city]));

export function findCity(name: string) {
  return cityByName.get(name as CityName) ?? null;
}
