import React from "react";
import { RiUserLine } from "react-icons/ri";

export default function CustomersPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <RiUserLine className="text-3xl text-orange-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customers</h2>
        <p className="text-sm text-secondary dark:text-gray-400 mt-1">This page is coming up next.</p>
      </div>
    </div>
  );
}
