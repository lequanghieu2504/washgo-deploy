import React, { use, useCallback, useMemo, useRef, useState } from "react";
import Feedback from "../common/Feedback";

export function Test() {
  const fetchFeedbackByBooking = async (bookingId) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const response = await fetch(
      `${API_URL}/api/feedback/booking/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      // It's not an error if feedback just doesn't exist (404)
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch feedback.");
    }
    return response.json();
  };
  return (
    <div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => fetchFeedbackByBooking(1)}
      >
        Fetch Feedback
      </button>
    </div>
  );
}
