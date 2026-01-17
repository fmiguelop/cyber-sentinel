export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  region: "NA" | "SA" | "EU" | "AS" | "OC" | "AF";
}
export const CITIES: City[] = [
  {
    name: "San Francisco",
    country: "USA",
    lat: 37.7749,
    lng: -122.4194,
    region: "NA",
  },
  {
    name: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    region: "NA",
  },
  {
    name: "Washington D.C.",
    country: "USA",
    lat: 38.9072,
    lng: -77.0369,
    region: "NA",
  },
  {
    name: "Toronto",
    country: "Canada",
    lat: 43.6511,
    lng: -79.347,
    region: "NA",
  },
  {
    name: "São Paulo",
    country: "Brazil",
    lat: -23.5505,
    lng: -46.6333,
    region: "SA",
  },
  {
    name: "San Salvador",
    country: "El Salvador",
    lat: 13.6929,
    lng: -89.2182,
    region: "SA",
  },
  {
    name: "Santiago",
    country: "Chile",
    lat: -33.4489,
    lng: -70.6693,
    region: "SA",
  },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, region: "EU" },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, region: "EU" },
  {
    name: "Moscow",
    country: "Russia",
    lat: 55.7558,
    lng: 37.6173,
    region: "EU",
  },
  {
    name: "Kyiv",
    country: "Ukraine",
    lat: 50.4501,
    lng: 30.5234,
    region: "EU",
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    lat: 52.3676,
    lng: 4.9041,
    region: "EU",
  },
  {
    name: "Beijing",
    country: "China",
    lat: 39.9042,
    lng: 116.4074,
    region: "AS",
  },
  {
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    region: "AS",
  },
  {
    name: "Seoul",
    country: "South Korea",
    lat: 37.5665,
    lng: 126.978,
    region: "AS",
  },
  {
    name: "Bengaluru",
    country: "India",
    lat: 12.9716,
    lng: 77.5946,
    region: "AS",
  },
  {
    name: "Singapore",
    country: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    region: "AS",
  },
  {
    name: "Tel Aviv",
    country: "Israel",
    lat: 32.0853,
    lng: 34.7818,
    region: "AS",
  },
  {
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    region: "OC",
  },
];
export const getRandomCity = (): City => {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
};
export const getRandomTarget = (sourceCity: City): City => {
  let target = getRandomCity();
  while (target.name === sourceCity.name) {
    target = getRandomCity();
  }
  return target;
};
