import React from "react";
import { Link, useLocation } from "react-router-dom";

function SidebarItem({ icon, text, to, alert }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link
        to={to}
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group
          ${
            isActive
              ? "bg-gradient-to-tr from-blue-200 to-blue-100 text-blue-800"
              : "hover:bg-gray-50 text-gray-600"
          }
        `}
      >
        {icon}
        <span className="w-52 ml-3">{text}</span>
        {alert && (
          <div className="absolute right-2 w-2 h-2 rounded bg-blue-400" />
        )}
      </Link>
    </li>
  );
}

export default SidebarItem;
