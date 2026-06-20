import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RiCheckboxCircleLine, RiHome2Line } from "react-icons/ri";

function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <RiCheckboxCircleLine className="text-5xl text-green-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Order Placed!
        </h1>

        <p className="text-gray-500 mb-2">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>

        {orderId && (
          <p className="text-sm text-gray-400 mb-8">
            Order ID:{" "}
            <span className="font-mono text-gray-600 text-xs">
              #{orderId.slice(0, 8).toUpperCase()}
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-primary text-white font-medium px-6 py-3 rounded-xl hover:bg-primaryHover transition"
          >
            <RiHome2Line />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
