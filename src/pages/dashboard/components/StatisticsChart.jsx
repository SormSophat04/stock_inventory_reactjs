import React from "react";

const StatisticsChart = () => {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Total Statistics
        </h2>
        <button className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">
          Last 6 Months
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Summary */}
        <div className="w-full md:w-1/4 pr-4">
          <div className="mb-4">
            <span className="flex items-center text-sm text-gray-500">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Total Income
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              $1,110,584.44
            </p>
          </div>
          <div className="mb-4">
            <span className="flex items-center text-sm text-gray-500">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Total Expense
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              $45,420.52
            </p>
          </div>
          <hr className="my-4" />
          <div className="mb-4">
            <span className="flex items-center text-sm text-gray-500">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Net Income
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              $84,282.08
            </p>
          </div>
          <p className="text-xs text-gray-400">Last updated today 8:00pm</p>
        </div>

        {/* Line Chart Placeholder */}
        <div className="w-full md:w-3/4 mt-6 md:mt-0">
          <p className="text-center text-gray-400">[Line Chart Placeholder]</p>
          {/* This is where you would put a real chart component e.g. <LineChart ... />
                For this example, I'll use simple SVGs to mimic the look.
              */}
          <div className="relative h-64">
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 500 200"
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1="50"
                x2="500"
                y2="50"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="100"
                x2="500"
                y2="100"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="150"
                x2="500"
                y2="150"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {/* Data lines */}
              <path
                d="M0,100 C83,50 166,150 250,100 S417,50 500,80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <path
                d="M0,120 C83,150 166,80 250,120 S417,150 500,100"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />
              <path
                d="M0,80 C83,120 166,100 250,150 S417,80 500,120"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;
