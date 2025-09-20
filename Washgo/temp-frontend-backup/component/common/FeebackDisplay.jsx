import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import LoadingSpinner from "@/component/common/LoadingSpinner";

import { useTraceRender } from "@/component/debugging";

export const FeedbackTemplate = {
  imageUrls: {
    type: "images",
    label: "Images",
  },
  // id: {
  //   type: "text",
  //   label: "Feedback ID",
  // },
  clientUsername: {
    type: "text",
    label: "Client Username",
  },
  rating: {
    type: "rating",
    label: "Rating",
  },
  comment: {
    type: "textarea",
    label: "Comment",
  },
  createdAt: {
    type: "date",
    label: "Created At",
  },
  // bookingId: {
  //   type: "text",
  //   label: "Booking ID",
  // },
  // carwashId: {
  //   type: "text",
  //   label: "Carwash ID",
  // },
  carwashName: {
    type: "text",
    label: "Carwash Name",
  },
  // clientId: {
  //   type: "text",
  //   label: "Client ID",
  // },
};

export const ViewSchemaRender = ({ config, value }) => {
  switch (config.type) {
    case "text":
      return <div className="text-gray-700">{value}</div>;
    case "textarea":
      return <div className="text-gray-700 whitespace-pre-wrap">{value}</div>;
    case "date":
      return (
        <div className="text-gray-700">{new Date(value).toLocaleString()}</div>
      );
    case "rating":
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <i
              key={i}
              className={`fas fa-star ${
                i < value ? "text-yellow-500" : "text-gray-300"
              }`}
            ></i>
          ))}
        </div>
      );
    case "images":
      return (
        <div className="flex space-x-2">
          {value.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Feedback ${i + 1}`}
              className="w-16 h-16 object-cover rounded"
            />
          ))}
        </div>
      );
    default:
      return null;
  }
};

export function FeedbackDisplay() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetch("http://localhost:8080/api/feedbacks/carwash/4", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching feedbacks:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading feedbacks...</p>;
  if (error) return <p>Error loading feedbacks: {error.message}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Feedbacks</h1>

      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white space-y-4"
        >
          {console.log(feedback)}
          {Object.entries(feedback).map(([key, value]) => {
            if (FeedbackTemplate[key]) {
              return (
                <ViewSchemaRender
                  value={value}
                  config={FeedbackTemplate[key]}
                />
              );
            } else return;
          })}
        </div>
      ))}
    </div>
  );
}
