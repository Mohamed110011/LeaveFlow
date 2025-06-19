import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ListUsers from "./ListUsers";
import config from '../../../config';

const DashboardAdmin = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Separate function to get the admin's own data
  const getProfile = async () => {
    try {
      const response = await fetch(`${config.API_URL}/dashboard/`, {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const parseData = await response.json();
      setName(parseData.user_name); // Set the admin's name
    } catch (err) {
      console.error("Profile error:", err.message);
      toast.error("Failed to fetch profile data");
    }
  };
  // Function to get all users
  const getAdminData = async () => {
    try {
      const res = await fetch(`${config.API_URL}/dashboard/users`, {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }

      const parseData = await res.json();
      setUsers(parseData);
      
      // Alternatively, you can get the admin name from localStorage
      
    } catch (err) {
      console.error("Users error:", err.message);
      toast.error("Failed to fetch user data");
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      setAuth(false);
      toast.success("Logout successfully");
      navigate("/login");
    } catch (err) {
      console.error(err.message);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    getProfile();  // Get the admin's profile data
    getAdminData(); // Get all users
  }, []);
  return (
    <div>
      <main>  
        {/* <h1>Welcome, {name || "Admin"}</h1> */}
        <ListUsers allUsers={users} setUsersChange={setUsers} />
      </main>
    </div>
  );
};

export default DashboardAdmin;