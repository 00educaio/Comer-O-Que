import * as Linking from 'expo-linking';

const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=';

export function buildNearbyPlacesUrl(searchQuery: string): string {
  return `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(searchQuery)}`;
}

export function openNearbyPlaces(searchQuery: string): Promise<true> {
  return Linking.openURL(buildNearbyPlacesUrl(searchQuery));
}
