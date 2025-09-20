import React, { useState, useEffect } from "react";
import "./Schedule.css";

export default function Schedule() {
  const timeSlots = ["AM", "PM"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // 08:00 - 12:00 (AM) ; 13:00 - 17:00 (PM)

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookings, setBookings] = useState([]);

  const accessToken = localStorage.getItem("accessToken") || "";

  // Fetch bookings từ API (giống Manager) và chỉ giữ trạng thái PENDING/ACCEPTED
  useEffect(() => {
    let isMounted = true;

    const fetchAcceptedBookings = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/bookings/carwash-bookings",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        const activeOnly = (data || []).filter(
          (b) => b.status === "PENDING" || b.status === "ACCEPTED"
        );
        if (isMounted) setBookings(activeOnly);
      } catch {
        if (isMounted) setBookings([]);
      }
    };

    // lần đầu và polling để tự loại bỏ DONE/CANCEL khi BE cập nhật
    fetchAcceptedBookings();
    const intervalId = setInterval(fetchAcceptedBookings, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  function formatDateTime(dt) {
    if (!dt) return "";
    const date = new Date(dt);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  function formatTimeHHMM(dt) {
    if (!dt) return "";
    const date = new Date(dt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Chuyển bookings thành events cho từng ngày và slot
  const events = {};
  bookings.forEach((b) => {
    const date = new Date(b.startTime);
    const day = days[date.getDay()];
    const hour = date.getHours();
    const slot = hour < 12 ? "AM" : "PM";
    const key = `${day}-${slot}`;
    if (!events[key]) events[key] = [];
    events[key].push({
      start: formatTimeHHMM(b.startTime),
      end: formatTimeHHMM(b.endTime),
      title: b.listProductDTO?.map((p) => p.name).join(", ") || "Booking",
      description: b.notes || "",
      booking: b,
      day,
      time: slot,
      status: b.status,
    });
  });

  return (
    <div className="flex justify-center">
      {/* Calendar */}
      <div className="overflow-auto pt-8 pr-70">
        <div className="grid grid-cols-[80px_repeat(7,140px)] border border-gray-300 bg-white shadow-sm">
          {/* Header row */}
          <div className="bg-gray-100"></div>
          {days.map((day) => (
            <div
              key={day}
              className="text-center font-semibold py-3 border-gray-200 bg-gray-100 text-gray-700"
            >
              {day}
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((slot) => (
            <React.Fragment key={slot}>
              {/* Time label */}
              <div className="border-t border-gray-200 flex items-center justify-center h-[320px] font-semibold text-gray-700 bg-gray-50">
                {slot}
              </div>
              {/* Time cells */}
              {days.map((day) => {
                const key = `${day}-${slot}`;
                const hasEvents = events[key];
                return (
                  <div
                    key={key}
                    className="border-t border-l border-gray-200 h-[320px] transition relative"
                  >
                    {hasEvents && (
                      <div className="absolute inset-1 overflow-y-auto space-y-1 p-0 no-scrollbar pt-1">
                        {hasEvents.map((event, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event.booking);
                            }}
                            className={`w-full h-9 text-white text-[12px] px-2 py-1 flex justify-center items-center rounded-md shadow-sm cursor-pointer ${
                              event.status === "PENDING"
                                ? "bg-blue-600 hover:bg-blue-500"
                                : "bg-green-600 hover:bg-green-500"
                            }`}
                          >
                            {event.start} - {event.end}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-70 bg-white shadow-2xl h-screen fixed top-0 right-0 p-6 z-50 flex flex-col">
        <h2 className="text-xl font-bold text-[#cc0000] mb-4 mt-0">
          Schedule Detail
        </h2>
        {selectedEvent ? (
          <div className="space-y-2 text-gray-700 flex-1 overflow-auto">
            <p>
              <strong>Start:</strong> {formatDateTime(selectedEvent.startTime)}
            </p>
            <p>
              <strong>End:</strong> {formatDateTime(selectedEvent.endTime)}
            </p>
            <p>
              <strong>User ID:</strong> {selectedEvent.userId}
            </p>
            <p>
              <strong>Carwash ID:</strong> {selectedEvent.carwashId}
            </p>
            <p>
              <strong>Phone:</strong> {selectedEvent.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Notes:</strong> {selectedEvent.notes}
            </p>
            <div>
              <strong>Products:</strong>
              <ul className="list-disc ml-5">
                {selectedEvent.listProductDTO?.map((prod) => (
                  <li key={prod.id}>
                    {prod.name} - {prod.pricing?.price?.toLocaleString()}{" "}
                    {prod.pricing?.currency}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic flex-1">No schedule selected.</p>
        )}
      </div>
    </div>
  );
}
