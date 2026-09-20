import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/styles/Layout.css";
interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const PATH_NAME_MAP: Record<string, string> = {
  "/": "Main Grid",
  "/calendar": "일정 관리",
};

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  toggleSidebar,
}) => {
  const location = useLocation();

  const currentPathLabel = PATH_NAME_MAP[location.pathname];
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? "◀" : "▶"}
        </button>
        <nav className="breadcrumb">
          {/* <span>HOME</span>
          <span className="divider"> / </span> */}
          <Link to={"/"} className="breadcrumb-link">
            <span>Dashboard</span>
          </Link>
          {location.pathname !== "/" && (
            <>
              {" "}
              <span className="divider"> / </span>
              <span className="current">{currentPathLabel}</span>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
