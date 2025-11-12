import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const SidebarDropdown = ({ text, children, defaultOpen = false }) => {
  const location = useLocation();

  // Check if any child link is active
  const isChildActive = React.Children.toArray(children).some((child) => {
    return child.props.to && location.pathname.startsWith(child.props.to);
  });

  const [isOpen, setIsOpen] = useState(defaultOpen || isChildActive);

  // If the active route changes, re-evaluate if the dropdown should be open
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  return (
    <li className="my-3">
      <div
        className="flex justify-between items-center cursor-pointer py-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase">
          {text}
        </span>
        {isOpen ? (
          <FiChevronUp size={16} className="text-gray-400" />
        ) : (
          <FiChevronDown size={16} className="text-gray-400" />
        )}
      </div>
      {isOpen && <ul className="pl-2">{children}</ul>}
    </li>
  );
};

export default SidebarDropdown;
