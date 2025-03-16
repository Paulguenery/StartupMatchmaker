type GeocodingResult = {
  city: string;
  latitude: number;
  longitude: number;
  department: string;
  postalCode: string;
};

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=5`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche de la ville');
    }

    const data = await response.json();

    return data.features.map((feature: any) => {
      const props = feature.properties;
      return {
        city: props.city || props.name,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        department: props.context.split(',')[0].trim(),
        postalCode: props.postcode
      };
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de la ville:', error);
    return [];
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
}