export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation {
  coords: Coordinates;
  city: string;
  state: string;
  displayName: string;
}

export const DEFAULT_NAGPUR_LOCATION: UserLocation = {
  coords: {
    latitude: 21.1458,
    longitude: 79.0882,
  },
  city: "Nagpur",
  state: "Maharashtra",
  displayName: "Nagpur, Maharashtra",
};
