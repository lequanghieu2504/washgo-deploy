import React, { use, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import Schedule from "@/pages/admin/Schedule";
import Product from "@/pages/admin/Product";
import Dashboard from "@/pages/admin/Dashboard";
import Overview from "@/pages/admin/Overview";
import Subscription from "@/pages/admin/Subscription";
import Chat from "@/pages/admin/Chat";
import CarwashImage from "@/pages/admin/CarwashMedia";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

// Sidebar
const sidebarItems = [
  { name: "Home", path: "/manager" },
  { name: "Schedule", path: "/manager/schedule" },
  { name: "Product", path: "/manager/product" },
  { name: "Dashboard", path: "/manager/dashboard" },
  { name: "Overview", path: "/manager/overview" },
  { name: "Subscription", path: "/manager/subscription" },
  { name: "Chat", path: "/manager/chat" },
  { name: "Media", path: "/manager/carwashimage" },
];

async function fetchBookings(token) {
  const res = await fetch(
    "http://localhost:8080/api/bookings/carwash-bookings",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch bookings");
  const data = await res.json();
  return data.map((b) => ({ ...b, id: b.bookingId }));
}

async function updateBookingStatus(
  token,
  bookingId,
  status,
  newStartTime = "",
  newEndTime = ""
) {
  const res = await fetch(
    `http://localhost:8080/api/bookings/manager/update/${bookingId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, newStartTime, newEndTime }),
    }
  );
  if (!res.ok) throw new Error("Failed to update booking status");
}

function formatDateTime(dt) {
  if (!dt) return "";
  const date = new Date(dt);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function HomeKanban({ bookings, onSelect, selected, onStatusChange, onEdit }) {
  const statusMap = {
    PENDING: "Pending",
    ACCEPTED: "Accept",
    DONE: "Done",
    CANCEL: "Cancel",
  };
  const statuses = ["Pending", "Accept", "Done", "Cancel"];

  const grouped = statuses.reduce(
    (acc, status) => {
      acc[status] = bookings.filter((b) => statusMap[b.status] === status);
      return acc;
    },
    { Pending: [], Accept: [], Done: [], Cancel: [] }
  );

  // Check overlap: two intervals overlap if start < otherEnd && end > otherStart
  const overlaps = (a, b) => {
    if (!a || !b) return false;
    const aStart = new Date(a.startTime).getTime();
    const aEnd = new Date(a.endTime).getTime();
    const bStart = new Date(b.startTime).getTime();
    const bEnd = new Date(b.endTime).getTime();
    if (
      Number.isNaN(aStart) ||
      Number.isNaN(aEnd) ||
      Number.isNaN(bStart) ||
      Number.isNaN(bEnd)
    )
      return false;
    return aStart < bEnd && aEnd > bStart;
  };

  // Conflict detail toggle and list
  const [showConflictDetails, setShowConflictDetails] = React.useState(false);
  React.useEffect(() => {
    setShowConflictDetails(false);
  }, [selected?.id]);

  const isActive =
    selected?.status === "PENDING" || selected?.status === "ACCEPTED";
  const conflictBookings = selected
    ? bookings.filter(
        (b) =>
          (b.status === "PENDING" || b.status === "ACCEPTED") &&
          b.id !== selected.id &&
          overlaps(selected, b)
      )
    : [];

  return (
    <div className="flex">
      <div className="grid grid-cols-4 gap-6 pr-70 pt-6">
        {statuses.map((status) => (
          <div
            key={status}
            className="min-w-[210px] bg-white shadow rounded-sm p-3 flex flex-col"
          >
            <h2 className="font-bold text-lg mb-4 border-b border-gray-300 pb-2 flex items-center justify-between">
              {status}
              <span className="text-[15px] text-gray-700 py-0.5">
                {grouped[status].length}
              </span>
            </h2>
            <div className="flex-1 space-y-4">
              {grouped[status].map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => onSelect(item)}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">
                      Booking #{item.id || idx + 1}
                    </div>
                    {status === "Pending" && (
                      <button
                        className="text-blue-500 hover:scale-105 transition cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(item);
                        }}
                      >
                        <FaEdit size={14} />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Start:</strong> {formatDateTime(item.startTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>User ID:</strong> {item.userId}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Notes:</strong> {item.notes}
                  </div>

                  {status === "Pending" && (
                    <div className="flex justify-between gap-2 pt-2">
                      <button
                        className="flex-1 bg-green-500 text-white text-sm rounded py-1 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(item, "ACCEPTED", "", "");
                        }}
                      >
                        Accept
                      </button>
                      <button
                        className="flex-1 bg-red-600 text-white text-sm rounded py-1 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(item, "CANCEL", "", "");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {status === "Accept" && (
                    <div className="flex justify-between gap-2 pt-2">
                      <button
                        className="flex-1 bg-blue-500 text-white text-sm rounded py-1 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(item, "DONE", "", "");
                        }}
                      >
                        Done
                      </button>
                      <button
                        className="flex-1 bg-red-600 text-white text-sm rounded py-1 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(item, "CANCEL", "", "");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      <div className="w-70 fixed top-0 right-0 h-screen bg-white shadow-2xl z-50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-[#cc0000]">Booking Detail</h3>
          {selected?.status === "PENDING" && (
            <button
              className="text-blue-500 hover:scale-105 transition"
              onClick={() => onEdit(selected)}
            >
              <FaEdit size={20} />
            </button>
          )}
        </div>

        {selected ? (
          <div className="text-sm text-gray-700 space-y-3">
            <div>
              <strong>Products:</strong>
              <ul className="list-disc ml-5">
                {selected.listProductDTO?.map((prod) => (
                  <li key={prod.id}>
                    {prod.name} - {prod.pricing?.price?.toLocaleString()}{" "}
                    {prod.pricing?.currency}
                  </li>
                ))}
              </ul>
            </div>

            <p>
              <strong>Start:</strong> {formatDateTime(selected.startTime)}
            </p>
            <p>
              <strong>End:</strong> {formatDateTime(selected.endTime)}
            </p>
            <p>
              <strong>Carwash ID:</strong> {selected.carwashId}
            </p>
            <p>
              <strong>User ID:</strong> {selected.userId}
            </p>
            <p>
              <strong>Phone:</strong> {selected.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Notes:</strong> {selected.notes}
            </p>

            {(() => {
              const hasConflict = isActive && conflictBookings.length > 0;
              if (!hasConflict) return null;
              return (
                <div className="py-2 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex text-[13px] items-center text-red-500 gap-1">
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.753 20.5 2.5 16.247 2.5 11S6.753 1.5 12 1.5 21.5 5.753 21.5 11 17.247 20.5 12 20.5z"
                        />
                      </svg>
                      <span className="font-medium">Trùng lịch</span>
                    </div>
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => setShowConflictDetails((v) => !v)}
                    >
                      {showConflictDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
                    </button>
                  </div>
                  {showConflictDetails && (
                    <div className="mt-2 border rounded-md bg-red-50 border-red-200 p-3 space-y-2">
                      {conflictBookings.map((b) => (
                        <div
                          key={b.id}
                          className="text-[13px] text-red-800 flex flex-col"
                        >
                          <div className="flex justify-between">
                            <span className="font-semibold">
                              Booking #{b.id}
                            </span>
                            <span className="uppercase text-[11px]">
                              {b.status}
                            </span>
                          </div>
                          <div>
                            <span>{formatDateTime(b.startTime)}</span>
                            <span> → {formatDateTime(b.endTime)}</span>
                          </div>
                          <div>User: {b.userId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {selected.status === "PENDING" && (
              <div className="flex justify-between pt-3 gap-2">
                <button
                  className="flex-1 bg-green-500 text-white py-2 rounded font-semibold"
                  onClick={() => onStatusChange(selected, "ACCEPTED")}
                >
                  Accept
                </button>
                <button
                  className="flex-1 bg-red-600 text-white py-2 rounded font-semibold"
                  onClick={() => onStatusChange(selected, "CANCEL")}
                >
                  Cancel
                </button>
              </div>
            )}

            {selected.status === "ACCEPTED" && (
              <div className="flex justify-between pt-3 gap-2">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold"
                  onClick={() => onStatusChange(selected, "DONE")}
                >
                  Done
                </button>
                <button
                  className="flex-1 bg-red-600 text-white py-2 rounded font-semibold"
                  onClick={() => onStatusChange(selected, "CANCEL")}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 italic">No booking selected.</p>
        )}
      </div>
    </div>
  );
}

function EditBookingModal({ booking, onClose, onSave }) {
  const [start, setStart] = useState(booking?.startTime?.slice(0, 16) || "");
  const [end, setEnd] = useState(booking?.endTime?.slice(0, 16) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[450px] shadow-xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Edit Booking Time</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition-shadow"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#cc0000] focus:border-transparent transition-shadow"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-2 text-red-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t">
          <button
            className={`flex-1 px-4 py-2 rounded-lg bg-[#cc0000] text-white font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={async () => {
              setError("");
              if (!start || !end) {
                setError("Vui lòng chọn thời gian bắt đầu và kết thúc");
                return;
              }
              if (new Date(start) >= new Date(end)) {
                setError("Thời gian kết thúc phải sau thời gian bắt đầu");
                return;
              }
              setLoading(true);
              await onSave(start, end);
              setLoading(false);
            }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Done"}
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ManagerPage() {
  const [selected, setSelected] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { accessToken } = useTokenRefresh();
  useEffect(() => {
    setLoading(true);
    fetchBookings(accessToken)
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (booking, status) => {
    try {
      await updateBookingStatus(
        accessToken,
        booking.id,
        status,
        "", // chỉ đổi status, không đổi giờ
        ""
      );

      // Cập nhật bookings
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status } : b))
      );

      // Cập nhật selected nếu cần
      if (selected?.id === booking.id) {
        setSelected((prev) => ({
          ...prev,
          status,
        }));
      }
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f7fa]">
      <aside className="w-64 bg-white shadow-lg p-6 space-y-4 fixed top-0 left-0 bottom-0 z-20">
        <div className="text-2xl font-bold mb-8 text-[#cc0000]">
          WashGO Admin
        </div>
        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`block py-2 px-3 rounded font-semibold transition ${
              location.pathname === item.path
                ? "bg-[#cc0000] text-white"
                : "text-gray-700 hover:text-[#cc0000] hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              loading ? (
                <div className="flex justify-center items-center h-full text-lg">
                  Loading bookings...
                </div>
              ) : (
                <HomeKanban
                  bookings={bookings}
                  selected={selected}
                  onSelect={setSelected}
                  onStatusChange={handleStatusChange}
                  onEdit={(b) => setEditingBooking(b)}
                />
              )
            }
          />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/product" element={<Product />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/carwashimage" element={<CarwashImage />} />
        </Routes>
        {editingBooking && (
          <EditBookingModal
            booking={editingBooking}
            onClose={() => setEditingBooking(null)}
            onSave={async (newStart, newEnd) => {
              try {
                const formatDate = (str) =>
                  str ? new Date(str).toISOString().slice(0, 19) : null;

                const bookingId = editingBooking.id;

                if (!bookingId) {
                  alert("Booking ID is missing. Cannot update.");
                  return;
                }

                const payload = {
                  status: editingBooking.status,
                  newStartTime: formatDate(newStart),
                  newEndTime: formatDate(newEnd),
                };

                const res = await fetch(
                  `http://localhost:8080/api/bookings/manager/update/${bookingId}`,
                  {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                  }
                );

                if (!res.ok) {
                  const errorText = await res.text();
                  throw new Error(errorText);
                }

                // Cập nhật danh sách bookings
                setBookings((prev) =>
                  prev.map((b) =>
                    b.id === bookingId
                      ? { ...b, startTime: newStart, endTime: newEnd }
                      : b
                  )
                );

                // Cập nhật selected nếu nó là booking đang edit
                setSelected((prev) =>
                  prev?.id === bookingId
                    ? { ...prev, startTime: newStart, endTime: newEnd }
                    : prev
                );

                // ✅ Đóng modal
                setEditingBooking(null);
              } catch (err) {
                alert("Failed to update time: " + err.message);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}

export default ManagerPage;
