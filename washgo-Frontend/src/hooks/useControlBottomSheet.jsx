import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const BOTTOM_SHEET_STATE_KEY = ["global-bottom-sheet-state"];

export const SHEET_HEIGHTS = {
  HIDE: "hide",
  BOT: "bot",
  MID: "mid",
  FULL: "full",
};

const defaultState = {
  height: SHEET_HEIGHTS.HIDE,
  sheetTop: 0,
  isDragging: false,
};

export const useControlBottomSheet = () => {
  const queryClient = useQueryClient();

  const { data = defaultState } = useQuery({
    queryKey: BOTTOM_SHEET_STATE_KEY,
    queryFn: () => defaultState,
    initialData: defaultState,
    enabled: false,
    staleTime: Infinity,
  });

  const updateState = useCallback(
    (partial) => {
      queryClient.setQueryData(
        BOTTOM_SHEET_STATE_KEY,
        (prev = defaultState) => ({
          ...prev,
          ...partial,
        })
      );
    },
    [queryClient]
  );

  const setSheetHeight = useCallback(
    (newHeight) => {
      if (Object.values(SHEET_HEIGHTS).includes(newHeight)) {
        updateState({ height: newHeight });
      } else {
        console.warn(
          `Invalid sheet height: "${newHeight}". Please use one of SHEET_HEIGHTS.`
        );
      }
    },
    [updateState]
  );

  const setSheetTop = useCallback(
    (top) => {
      updateState({ sheetTop: top });
    },
    [updateState]
  );

  const setIsDragging = useCallback(
    (dragging) => {
      updateState({ isDragging: dragging });
    },
    [updateState]
  );

  return {
    sheetHeight: data.height,
    sheetTop: data.sheetTop,
    isDragging: data.isDragging,
    setSheetHeight,
    setSheetTop,
    setIsDragging,
  };
};
