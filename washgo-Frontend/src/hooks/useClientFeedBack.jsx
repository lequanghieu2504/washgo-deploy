import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTokenRefresh } from "./useTokenRefresh";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const createClientFeedback = async (feedbackData, token) => {
  const response = await fetch(`${API_URL}/api/feedback/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(feedbackData),
  });

  if (!response.ok) {
    throw new Error("Failed to submit feedback.");
  }
  return response.json();
};

const fetchCarwashFeedback = async (carwashId, token) => {
  if (!carwashId || !token) return []; // Return empty array if no ID or token
  const response = await fetch(`${API_URL}/api/feedback/carwash/${carwashId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch carwash feedback.");
  }
  return response.json();
};

const fetchClientFeedback = async (clientId, token) => {
  if (!clientId || !token) return []; // Return empty array if not authenticated
  const response = await fetch(`${API_URL}/api/feedback/client/${clientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch your feedback history.");
  }
  return response.json();
};

const fetchBookingFeedback = async (bookingId, token) => {
  if (!bookingId || !token) return null;
  const response = await fetch(`${API_URL}/api/feedback/booking/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return null; // Not an error, just no feedback yet
    }
    throw new Error("Failed to fetch feedback for booking.");
  }
  return response.json();
};

export const useClientFeedback = ({ carwashId, bookingId, clientId } = {}) => {
  const queryClient = useQueryClient();
  const { accessToken } = useTokenRefresh();

  // Mutation for creating new feedback
  const {
    mutate: createFeedback,
    isPending: isCreatingFeedback,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useMutation({
    mutationFn: (feedbackData) => {
      if (!accessToken)
        throw new Error("You must be logged in to give feedback.");
      return createClientFeedback(feedbackData, accessToken);
    },
    onSuccess: (data) => {
      // When feedback is created, invalidate other queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["carwashFeedback", data.carwashID],
      });
      queryClient.invalidateQueries({
        queryKey: ["clientFeedback", clientId],
      });
      // Also invalidate the specific booking feedback query
      queryClient.invalidateQueries({
        queryKey: ["bookingFeedback", data.bookingId],
      });

      queryClient.invalidateQueries({ queryKey: ["clientBookingHistory"] });
    },
  });

  const {
    data: carwashFeedback,
    isLoading: isCarwashFeedbackLoading,
    error: carwashFeedbackError,
  } = useQuery({
    queryKey: ["carwashFeedback", carwashId],
    queryFn: () => fetchCarwashFeedback(carwashId, accessToken),
    enabled: !!carwashId && !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

  // Query for fetching the current client's own feedback
  const {
    data: myFeedback,
    isLoading: isMyFeedbackLoading,
    error: myFeedbackError,
  } = useQuery({
    queryKey: ["clientFeedback", clientId],
    queryFn: () => fetchClientFeedback(clientId, accessToken),
    enabled: !!clientId && !!accessToken, // Only run if we have the user's ID and token
  });

  // Query for fetching feedback for a specific booking
  const {
    data: bookingFeedback,
    isLoading: isBookingFeedbackLoading,
    error: bookingFeedbackError,
  } = useQuery({
    queryKey: ["bookingFeedback", bookingId],
    queryFn: () => fetchBookingFeedback(bookingId, accessToken),
    enabled: !!bookingId && !!accessToken, // Only run if bookingId and token are provided
  });

  return {
    // Create Feedback
    createFeedback,
    isCreatingFeedback,
    isCreateSuccess,
    createError,

    // Carwash Feedback
    carwashFeedback,
    isCarwashFeedbackLoading,
    carwashFeedbackError,

    // My Feedback
    myFeedback,
    isMyFeedbackLoading,
    myFeedbackError,

    // Booking-specific Feedback
    bookingFeedback,
    isBookingFeedbackLoading,
    bookingFeedbackError,
  };
};
