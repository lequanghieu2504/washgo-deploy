import React, { useState, useEffect, useMemo } from "react";
import PropTypes from 'prop-types'; // Import prop-types

const ProductSchedule = ({ onSlotClick }) => {
  // 1. currentTime updates every second (keep as is)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second might be excessive, consider 10-60 seconds unless high precision is needed
    return () => clearInterval(timer);
  }, []);

  // 2. State to track the selected slot (keep as is)
  const [selectedSlot, setSelectedSlot] = useState(null);

  // 3. Calculate week start date (Sunday) (keep as is)
  const weekStart = useMemo(() => {
    const d = new Date(currentTime);
    // Adjust to ensure it always gets the *current* week's Sunday, even on Sunday itself
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0); // Start of the day
    return d;
  }, [currentTime]); // Update weekly view based on currentTime

  // 4. Generate array of 7 days for the week (keep as is)
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  // 5. Fixed time slots (keep as is, or potentially make dynamic via props later)
  const timeSlots = [7, 8, 9, 15, 16, 17];

  // Helper to check if a date is today
  const isToday = (someDate) => {
    const today = new Date(currentTime); // Use state currentTime for comparison
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
  };

  return (
    // Main container for the schedule grid
    <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      {/* Optional: Display current time */}
      {/* <div className="text-xs text-gray-400 mb-3 text-right">
        Current: {currentTime.toLocaleTimeString()}
      </div> */}

      {/* Grid Layout */}
      {/* Use inline-block/min-w if horizontal scrolling is desired on smaller screens */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-3 min-w-[500px]"> {/* Min width prevents excessive squishing */}
          {weekDays.map((date) => {
             const isCurrentDay = isToday(date);
             return (
                <div
                    key={date.toDateString()}
                    // Styling for each day column
                    className={`border border-gray-200 rounded-md p-2 ${isCurrentDay ? 'bg-red-50' : 'bg-white'}`} // Highlight current day slightly
                >
                {/* Day Header */}
                <div className="text-center mb-2 pb-1 border-b border-gray-100">
                    <div className={`font-semibold text-sm ${isCurrentDay ? 'text-[#cc0000]' : 'text-gray-700'}`}>
                    {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </div>
                    <div className={`text-xs ${isCurrentDay ? 'text-red-500' : 'text-gray-500'}`}>
                    {date.getDate()} {/* Show only day number */}
                    </div>
                </div>

                {/* Time Slot Buttons */}
                <div className="flex flex-col gap-1.5"> {/* Slightly more gap */}
                    {timeSlots.map((hour) => {
                    const slotTime = new Date(date);
                    slotTime.setHours(hour, 0, 0, 0);

                    // Determine slot states
                    const isPast = slotTime < currentTime; // Is the slot in the past?
                    const isSelected = selectedSlot?.getTime() === slotTime.getTime(); // Is it selected?

                    // Define base style
                    const baseButtonClass = "text-xs text-center py-1.5 px-1 rounded-md transition duration-150 ease-in-out w-full focus:outline-none focus:ring-2 focus:ring-offset-1";

                    // Determine dynamic styles based on state priority
                    let stateClass = "";
                    if (isPast) {
                        // Style for past/disabled slots
                        stateClass = "bg-gray-100 text-gray-400 cursor-not-allowed opacity-75";
                    } else if (isSelected) {
                        // Style for selected slot (use primary red)
                        stateClass = "bg-[#cc0000] text-white font-semibold shadow-md cursor-pointer focus:ring-[#cc0000]";
                    } else {
                        // Style for available slots (hover effect)
                        stateClass = "bg-gray-50 text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 focus:ring-gray-400";
                    }

                    return (
                        <button
                        key={hour}
                        disabled={isPast} // Disable past slots
                        onClick={() => {
                            if (isPast) return; // Prevent action on past slots
                            const newSelected = isSelected ? null : slotTime; // Toggle selection
                            setSelectedSlot(newSelected);
                            onSlotClick?.(newSelected); // Notify parent (pass null if deselecting)
                        }}
                        className={`${baseButtonClass} ${stateClass}`}
                        >
                        {/* Format time e.g., 07:00 or 7:00 AM */}
                        {slotTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </button>
                    );
                    })}
                </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Define PropTypes
ProductSchedule.propTypes = {
  onSlotClick: PropTypes.func, // Callback function when a slot is clicked/selected
  // Add other props if needed, e.g., schedules: PropTypes.array,
};


export default ProductSchedule;