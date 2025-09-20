import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Payment() {
  const { state } = useLocation();
  const {
    clientId,
    bookingId,
    carWashName,
    product,
    price,
    slot,
    carwashId,
    carwashImage,
  } = state || {};

  const navigate = useNavigate();
  const [method, setMethod] = useState("cash");
  const [paid, setPaid] = useState(false);
  const [qrData, setQrData] = useState("");

  const handlePayment = () => {
    if (method === "cash") {
      setPaid(true);
    } else {
      const payloadObj = {
        bookingId,
        clientId,
        carWashName,
        product,
        slot,
        price,
      };
      setQrData(JSON.stringify(payloadObj));
    }
  };

  // state chung để gửi sang Feedback
  const navState = {
    clientId,
    bookingId,
    carWashName,
    product,
    slot,
    price,
    carwashId,
  };

  // Thank-you + nút Leave Feedback
  if (paid) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Thank you for using WashGo!
          </h2>
          <p className="text-gray-600 mb-6">We hope to see you again soon.</p>
          <button
            onClick={() => navigate("/feedback", { state: navState })}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Leave Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Payment</h1>

        <div className="space-y-2 mb-6 text-gray-700">
          {clientId && (
            <div>
              <span className="font-medium">Customer ID:</span> {clientId}
            </div>
          )}
          <div>
            <span className="font-medium">Carwash:</span> {carWashName}
          </div>
          <div>
            <span className="font-medium">Service:</span> {product}
          </div>
          <div>
            <span className="font-medium">Time:</span> {slot}
          </div>
          <div>
            <span className="font-medium">Price:</span> {price}
          </div>
        </div>

        <div className="mb-6">
          <span className="font-medium">Choose Payment Method:</span>
          <div className="mt-3 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={method === "cash"}
                onChange={() => setMethod("cash")}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2">Cash</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="payment"
                value="prepaid"
                checked={method === "prepaid"}
                onChange={() => setMethod("prepaid")}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <span className="ml-2">Prepaid (QR Code)</span>
            </label>
          </div>
        </div>

        {!qrData ? (
          <button
            onClick={handlePayment}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Confirm Payment
          </button>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-left space-y-1">
              {clientId && (
                <div>
                  <span className="font-medium">Customer ID:</span> {clientId}
                </div>
              )}
              <div>
                <span className="font-medium">Carwash:</span> {carWashName}
              </div>
              <div>
                <span className="font-medium">Service:</span> {product}
              </div>
              <div>
                <span className="font-medium">Time:</span> {slot}
              </div>
              <div>
                <span className="font-medium">Price:</span> {price}
              </div>
            </div>

            <p className="mb-2 font-medium">Scan this QR code to pay:</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                qrData
              )}`}
              alt="QR Code"
              className="mx-auto mb-2"
            />

            <button
              onClick={() => navigate("/feedback", { state: navState })}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Leave Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
