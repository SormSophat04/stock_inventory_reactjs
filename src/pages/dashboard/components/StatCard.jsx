import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const StatCard = ({
  title,
  value,
  percentage,
  trend,
  icon,
  iconBgColor,
}) => {
  const TrendIcon = trend === "up" ? FiTrendingUp : FiTrendingDown;
  const trendTextColor = trend === "up" ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        <div className={`flex items-center mt-4 text-sm ${trendTextColor}`}>
          <TrendIcon className="w-5 h-5 mr-1" />
          <span>{percentage}%</span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-full ${iconBgColor}`}>{icon}</div>
    </div>
  );
};

export default StatCard;
