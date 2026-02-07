import React from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}

export default Layout;
