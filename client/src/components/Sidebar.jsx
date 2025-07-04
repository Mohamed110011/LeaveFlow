import React from "react";
import { Link, useLocation } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { userRole } from "../constants";

const Sidebar = ({ currentUserRole }) => {
  const location = useLocation();
  

  return (
    <div className="side-menu">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FontAwesomeIcon icon={faCalendarAlt} className="sidebar-logo-icon" />
          <h2 className="sidebar-logo-text">Leave<span>Flow</span></h2>
        </div>
      </div>
      <ul className="list-group">
        {userRole[currentUserRole].map((link, index) => (
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