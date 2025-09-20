import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const CARWASH_TO_MAP_KEY = ["carwash-route-to-map"];

export const useCarwashRouteToMap = () => {
  const queryClient = useQueryClient();
  const { data: routeCarwash } = useQuery({
    queryKey: CARWASH_TO_MAP_KEY,
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
  });

  const setCarwashForMap = useCallback(
    (carwashObject) => {
      queryClient.setQueryData(CARWASH_TO_MAP_KEY, carwashObject);
    },
    [queryClient]
  );

  const clearCarwashForMap = useCallback(() => {
    queryClient.setQueryData(CARWASH_TO_MAP_KEY, null);
  }, [queryClient]);

  return { routeCarwash, setCarwashForMap, clearCarwashForMap };
};
