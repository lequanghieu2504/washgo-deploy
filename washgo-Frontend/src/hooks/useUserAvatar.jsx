import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTokenRefresh } from "./useTokenRefresh";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const fetchAvatarMeta = async (userId, token) => {
  if (!userId || !token) return null;

  const response = await fetch(`${API_URL}/api/media/users/${userId}/avatar`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // A 404 Not Found is an expected outcome if the user has no avatar.
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch avatar metadata.");
  }

  return response.json();
};

const uploadAvatar = async ({ userId, file, token }) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/media/users/${userId}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Avatar upload failed: ${errorData}`);
  }

  return response.json();
};

const deleteAvatar = async ({ userId, token }) => {
  const response = await fetch(`${API_URL}/api/media/users/${userId}/avatar`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete avatar.");
  }
};

export const useUserAvatar = (targetUserId) => {
  const queryClient = useQueryClient();
  const { accessToken, userData } = useTokenRefresh();

  // Determine which user ID to use
  const userId = targetUserId || userData?.userId;

  // Query for fetching the avatar metadata
  const { data: avatarMeta, isLoading: isAvatarLoading } = useQuery({
    queryKey: ["avatar", userId],
    queryFn: () => fetchAvatarMeta(userId, accessToken),
    enabled: !!userId && !!accessToken,
  });

  // Construct the full, usable URL for the avatar
  const avatarUrl = avatarMeta?.url ? `${API_URL}${avatarMeta.url}` : null;

  // Mutation for uploading a new avatar
  const { mutate: uploadUserAvatar, isPending: isUploading } = useMutation({
    mutationFn: (file) => uploadAvatar({ userId, file, token: accessToken }),
    onSuccess: () => {
      // When upload is successful, invalidate the query to refetch the new avatar
      queryClient.invalidateQueries({ queryKey: ["avatar", userId] });
    },
  });

  // Mutation for deleting the avatar
  const { mutate: deleteUserAvatar, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteAvatar({ userId, token: accessToken }),
    onSuccess: () => {
      // When delete is successful, invalidate the query to clear the avatar
      queryClient.invalidateQueries({ queryKey: ["avatar", userId] });
    },
  });

  return {
    avatarUrl,
    isAvatarLoading,
    uploadUserAvatar,
    isUploading,
    deleteUserAvatar,
    isDeleting,
  };
};
