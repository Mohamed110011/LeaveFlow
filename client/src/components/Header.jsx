import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import "./Header.css";

function Header({ setAuth, userRole }) {
  const navigate = useNavigate();
  
  console.log("User role in Header:", userRole); // Debug

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false, null);
      toast.success("Logout successfully");
      navigate("/landing");
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to logout");
    }
  };
  return (
    <div className="app-container">
      <div className="sidebar-wrapper">
        <Sidebar userRole={userRole} />
      </div>
      <div className="app-content">
        <header className="app-header">
          <div className="header-brand">
            <FontAwesomeIcon icon={faCalendarAlt} className="brand-logo" />
            <h1 className="brand-title">Leave<span>Flow</span></h1>
            <div className="user-role">{userRole}</div>
          </div>
          <button className="logout-button" onClick={logout}>
            <FontAwesomeIcon icon={faPowerOff} className="logout-icon" />
            <span>Logout</span>
          </button>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Header;