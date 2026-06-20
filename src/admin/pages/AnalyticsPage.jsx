import React from "react";
import { RiBarChartLine } from "react-icons/ri";

export default function AnalyticsPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <RiBarChartLine className="text-3xl text-pink-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics</h2>
        <p className="text-sm text-secondary dark:text-gray-400 mt-1">This page is coming up next.</p>
      </div>
    </div>
  );
}
