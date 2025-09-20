import { useQuery, useQueryClient } from "@tanstack/react-query";

const FILTER_STATE_KEY = ["global-filter-state"];

const defaultState = {
  showFilter: false,
  isExpanded: false,
};

export const useShowGlobalFilterState = () => {
  const queryClient = useQueryClient();

  const { data = defaultState } = useQuery({
    queryKey: FILTER_STATE_KEY,
    queryFn: () => defaultState,
    initialData: defaultState,
    enabled: false,
  });

  const updateState = (partial) => {
    queryClient.setQueryData(FILTER_STATE_KEY, (prev = defaultState) => ({
      ...prev,
      ...partial,
    }));
  };

  return {
    ...data,
    setShowFilter: (show) =>
      updateState({
        showFilter: show,
      }),
    setIsExpanded: (expanded) =>
      updateState({
        isExpanded: expanded,
        showFilter: expanded ? data.showFilter : false,
      }),
    toggleFilter: () => updateState({ showFilter: !data.showFilter }),
    closeAll: () => updateState({ showFilter: false, isExpanded: false }),
  };
};
