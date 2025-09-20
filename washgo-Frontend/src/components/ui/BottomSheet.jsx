import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  useControlBottomSheet,
  SHEET_HEIGHTS,
} from "@/hooks/useControlBottomSheet";

const BottomSheet = ({ children, onClose }) => {
  const { sheetHeight, setSheetHeight, setIsDragging, setSheetTop } =
    useControlBottomSheet(); // Get setSheetTop
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [snapCounter, setSnapCounter] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const sheetElement = sheetRef.current;
    if (!sheetElement?.parentElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const parent = entries[0];
      if (parent) {
        setContainerHeight(parent.contentRect.height);
      }
    });

    resizeObserver.observe(sheetElement.parentElement);

    return () => resizeObserver.disconnect();
  }, []);

  const snapHeights = useMemo(() => {
    if (containerHeight === 0) return { full: 0, mid: 0, hide: 0 };
    return {
      full: Math.round(containerHeight * 0.9),
      mid: Math.round(containerHeight * 0.4),
      hide: 0,
    };
  }, [containerHeight]);

  useEffect(() => {
    const targetHeight = snapHeights[sheetHeight] ?? snapHeights.hide;
    setCurrentHeight(targetHeight);
    setSheetTop(targetHeight);

    if (containerHeight > 0 && !isInitialized) {
      setTimeout(() => setIsInitialized(true), 50);
    }
  }, [
    sheetHeight,
    snapHeights,
    snapCounter,
    containerHeight,
    isInitialized,
    setSheetTop,
  ]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    isDragging.current = true;
    startY.current = e.clientY || e.touches?.[0]?.clientY;
    startHeight.current = currentHeight;
    if (sheetRef.current) sheetRef.current.style.transition = "none";
    if (e.target.setPointerCapture && e.pointerId) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    const currentY = e.clientY || e.touches?.[0]?.clientY;
    const deltaY = currentY - startY.current;
    const newHeight = Math.max(
      0,
      Math.min(containerHeight, startHeight.current - deltaY)
    );
    setCurrentHeight(newHeight);
    setSheetTop(newHeight); // Also report the height while dragging
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    isDragging.current = false;
    if (sheetRef.current)
      sheetRef.current.style.transition = "height 300ms ease-out";

    setSnapCounter((c) => c + 1);

    const { full, mid, hide } = snapHeights;
    const distToFull = Math.abs(currentHeight - full);
    const distToMid = Math.abs(currentHeight - mid);
    const distToHide = Math.abs(currentHeight - hide);
    const minDistance = Math.min(distToFull, distToMid, distToHide);

    if (minDistance === distToFull) setSheetHeight(SHEET_HEIGHTS.FULL);
    else if (minDistance === distToMid) setSheetHeight(SHEET_HEIGHTS.MID);
    else setSheetHeight(SHEET_HEIGHTS.HIDE);
  };

  const lastTouchY = useRef(0);

  const handleContentTouchStart = (e) => {
    lastTouchY.current = e.touches?.[0]?.clientY ?? 0;
  };

  const handleContentTouchMove = (e) => {
    if (!contentRef.current) return;

    const currentY = e.touches?.[0]?.clientY ?? 0;
    const deltaY = currentY - lastTouchY.current;
    lastTouchY.current = currentY;

    const scrollTop = contentRef.current.scrollTop;

    if (deltaY < 0) {
      setSheetHeight(SHEET_HEIGHTS.FULL);
    }

    if (deltaY > 0 && scrollTop <= 0) {
      setSheetHeight(SHEET_HEIGHTS.MID);
    }
  };

  return (
    <div
      ref={sheetRef}
      className="absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-2xl pointer-events-auto"
      style={{
        height: `${currentHeight}px`,
        transition: isInitialized ? "height 300ms ease-out" : "none",
        touchAction: "none",
        visibility:
          sheetHeight !== SHEET_HEIGHTS.HIDE && containerHeight > 0
            ? "visible"
            : "hidden",
      }}
    >
      {/* Drag Handle Area */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full py-4 flex justify-center items-center cursor-grab"
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
        {onClose && (
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div
        ref={contentRef}
        className="overflow-y-auto"
        style={{
          height: "calc(100% - 40px)",

          overflowY: sheetHeight === SHEET_HEIGHTS.FULL ? "auto" : "hidden",
        }}
        onTouchStart={handleContentTouchStart}
        onTouchMove={handleContentTouchMove}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
