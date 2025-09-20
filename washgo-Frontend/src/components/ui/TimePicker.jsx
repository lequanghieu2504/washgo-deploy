import React, { useRef, useLayoutEffect, useMemo } from "react";

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

const Wheel = ({ options, value, onChange }) => {
  const scrollRef = useRef(null);
  const isScrolling = useRef(null);

  useLayoutEffect(() => {
    const index = options.indexOf(value);
    if (index !== -1 && scrollRef.current) {
      scrollRef.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, [value, options]);

  const handleScroll = () => {
    clearTimeout(isScrolling.current);
    isScrolling.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const { scrollTop } = scrollRef.current;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      scrollRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
      if (options[index] && options[index] !== value) {
        onChange(options[index]);
      }
    }, 150);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="overflow-y-scroll no-scrollbar"
      style={{ height: `${CONTAINER_HEIGHT}px`, scrollSnapType: "y mandatory" }}
    >
      <div style={{ height: `${PADDING}px` }} />
      {options.map((option) => (
        <div
          key={option}
          className="flex items-center justify-center text-xl"
          style={{ height: `${ITEM_HEIGHT}px`, scrollSnapAlign: "center" }}
        >
          {option}
        </div>
      ))}
      <div style={{ height: `${PADDING}px` }} />
    </div>
  );
};

export const TimePicker = ({ value, onChange, minuteStep = 5 }) => {
  const timeOptions = useMemo(
    () => ({
      hours: Array.from({ length: 12 }, (_, i) =>
        (i + 1).toString().padStart(2, "0")
      ),

      minutes: Array.from({ length: 60 / minuteStep }, (_, i) =>
        (i * minuteStep).toString().padStart(2, "0")
      ),
      ampm: ["AM", "PM"],
    }),
    [minuteStep]
  );

  return (
    <div className="w-full bg-white rounded-lg p-4 relative">
      {/* Visual selection indicator */}
      <div
        className="absolute top-1/2 left-0 right-0 h-[36px] -translate-y-1/2 bg-gray-200/50 border-y border-gray-300 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      <div className="flex items-center justify-center space-x-2">
        <Wheel
          options={timeOptions.hours}
          value={value.hour}
          onChange={(newHour) => onChange({ ...value, hour: newHour })}
        />
        <Wheel
          options={timeOptions.minutes}
          value={value.minute}
          onChange={(newMinute) => onChange({ ...value, minute: newMinute })}
        />
        <Wheel
          options={timeOptions.ampm}
          value={value.ampm}
          onChange={(newAmpm) => onChange({ ...value, ampm: newAmpm })}
        />
      </div>
    </div>
  );
};
