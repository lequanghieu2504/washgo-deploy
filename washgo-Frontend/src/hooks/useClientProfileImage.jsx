import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTokenRefresh } from "./useTokenRefresh";

const AVATAR_MEDIA_ID_KEY = "washgo_user_avatar_media_id";

const fetchUserAvatar = async ({ mediaId, token }) => {
  if (!mediaId || !token) {
    return null;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const response = await fetch(`${apiUrl}/api/media/serve/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "anyvalue",
    },
  });

  if (!response.ok) {
    // If the image is not found, remove the invalid ID from storage
    if (response.status === 404) {
      localStorage.removeItem(AVATAR_MEDIA_ID_KEY);
    }
    throw new Error("Failed to fetch avatar image.");
  }

  const imageBlob = await response.blob();
  return URL.createObjectURL(imageBlob);
};

const updateUserAvatar = async ({ userId, file, token }) => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  if (!userId || !file || !token) {
    throw new Error("User ID, file, and token are required for avatar upload.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/api/media/users/${userId}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "anyvalue",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload avatar.");
  }

  return response.json();
};

export const useClientProfileImage = () => {
  const queryClient = useQueryClient();
  const { userData, accessToken } = useTokenRefresh();

  const {
    data: avatarUrl,
    isLoading: isFetchingAvatar,
    isError: isFetchError,
  } = useQuery({
    queryKey: ["userAvatar"],
    queryFn: () => {
      const mediaId = localStorage.getItem(AVATAR_MEDIA_ID_KEY);
      return fetchUserAvatar({ mediaId, token: accessToken });
    },
    // Only run the query if we have an access token
    enabled: !!accessToken,
    staleTime: Infinity, // The URL is good until the mediaId changes
  });

  // Mutation to upload a new avatar
  const { mutate: updateAvatar, isPending: isUploading } = useMutation({
    mutationFn: (file) => {
      return updateUserAvatar({
        userId: userData?.userId,
        file,
        token: accessToken,
      });
    },
    onSuccess: (data) => {
      if (data && data.id) {
        // Save the new mediaId to localStorage
        localStorage.setItem(AVATAR_MEDIA_ID_KEY, data.id);
        // Invalidate the userAvatar query to force a refetch with the new ID
        queryClient.invalidateQueries({ queryKey: ["userAvatar"] });
      }
      // Also invalidate the session in case the backend is fixed later
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.error("Avatar upload failed:", error);
    },
  });

  return {
    avatarUrl,
    isFetchingAvatar,
    isFetchError,
    updateAvatar,
    isUploading,
  };
};
