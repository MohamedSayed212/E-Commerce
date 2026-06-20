import React, { useEffect } from "react";
import { RiCheckLine, RiErrorWarningLine, RiCloseLine } from "react-icons/ri";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border animate-fade-in ${
        isSuccess
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          isSuccess ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {isSuccess ? (
          <RiCheckLine className="text-white text-xs" />
        ) : (
          <RiErrorWarningLine className="text-white text-xs" />
        )}
      </span>
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-60 hover:opacity-100 transition"
      >
        <RiCloseLine />
      </button>
    </div>
  );
}
