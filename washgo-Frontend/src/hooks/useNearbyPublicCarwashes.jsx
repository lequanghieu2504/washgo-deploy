import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchNearbyPublicCarwashes = async (latitude, longitude, range) => {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `
    [out:json][timeout:25];
    (
      node["amenity"="car_wash"](around:${range},${latitude},${longitude});
    );
    out body;
  `,
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  if (!data || !data.elements || !Array.isArray(data.elements)) {
    throw new Error("Invalid data format received from Overpass API");
  }

  return data.elements;
};

export function useNearbyPublicCarwashes({
  latitude,
  longitude,
  range = 5000,
}) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["publicCarwashes", longitude, latitude, range],
    queryFn: async () => {
      const data = await fetchNearbyPublicCarwashes(latitude, longitude, range);

      if (Array.isArray(data)) {
        data.forEach((carwash) => {
          queryClient.setQueryData(["publicCarwash", carwash.id], carwash);
        });
        return data.map((carwash) => ({
          ...carwash,
          latitude: carwash.lat,
          longitude: carwash.lon,
        }));
      }
      return data;
    },
    staleTime: 15 * 60 * 1000,
  });
}
