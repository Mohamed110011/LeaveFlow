import React from "react";
import { Link, useLocation } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const adminLinks = [
    { path: "/dashboard-admin", icon: "fas fa-home", label: "Dashboard" },
    { path: "/Profile-Admin", icon: "fas fa-building", label: "Profile" },
    { path: "/dashboard-adminG", icon: "fas fa-users", label: "User Management" },
    // { path: "/reports", icon: "fas fa-chart-bar", label: "Reports" },
    // { path: "/settings", icon: "fas fa-cog", label: "Settings" }
  ];

  const hrLinks = [
    { path: "/dashboard-hr", icon: "fas fa-home", label: "Dashboard" },
    { path: "/profile-hr", icon: "fas fa-users", label: "Profile" },
    { path: "/calendar-hr", icon: "fas fa-calendar-alt", label: "Calendar" },
    { path: "/reports", icon: "fas fa-chart-bar", label: "Reports" }
  ];

  const managerLinks = [
    { path: "/dashboard-manager", icon: "fas fa-home", label: "Dashboard" },
    { path: "/profile-manager", icon: "fas fa-user", label: "Profile" },
    { path: "/approvals", icon: "fas fa-check-circle", label: "Approvals" },
    { path: "/calendar-manager", icon: "fas fa-calendar-alt", label: "Calendar" }
  ];

  const employeeLinks = [
    { path: "/dashboard-employee", icon: "fas fa-home", label: "Dashboard" },
    { path: "/profile-employee", icon: "fas fa-user", label: "Profile" },
    { path: "/leave-request-history", icon: "fas fa-calendar-plus", label: "Leave Requests" },
    { path: "/leave-balances", icon: "fas fa-chart-pie", label: "Leave Balances" },
    { path: "/calendar-employee", icon: "fas fa-calendar-alt", label: "Calendar" }
  ];

  const getLinks = () => {
    console.log("User role in Sidebar:", userRole); // Debug
    switch(userRole) {
      case 'admin': return adminLinks;
      case 'hr': 
      case 'rh': // Adding this variant because it's used in Login.js
        return hrLinks;
      case 'manager': return managerLinks;
      case 'employee': return employeeLinks;
      default: 
        console.log("No matching role found, using default empty array");
        return [];
    }
  };

  return (
    <div className="side-menu">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FontAwesomeIcon icon={faCalendarAlt} className="sidebar-logo-icon" />
          <h2 className="sidebar-logo-text">Leave<span>Flow</span></h2>
        </div>
      </div>
      <ul className="list-group">
        {getLinks().map((link, index) => (
          <li 
            key={index} 
            className={`list-group-item ${location.pathname === link.path ? 'active' : ''}`}
          >
            <Link to={link.path || "#"} className="d-flex align-items-center">
              <i className={`${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;