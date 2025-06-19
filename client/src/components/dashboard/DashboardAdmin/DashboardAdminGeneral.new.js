import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./DashboardAdminGeneral.css";
import ListUsers from "./ListUsers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserShield, faCalendarCheck, faClipboardCheck, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

const DashboardAdminGeneral = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeaveRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    roleDistribution: {},
    leaveTypeStats: [],
    monthlyRequests: []
  });
  const navigate = useNavigate();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
  );

  useEffect(() => {
    getProfile();
    getAdminData();
    getLeaveStats();
  }, []);

  const getProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const parseData = await response.json();
      setName(parseData.user_name);
    } catch (err) {
      console.error("Profile error:", err.message);
      toast.error("Failed to fetch profile data");
    }
  };

  const getAdminData = async () => {
    try {
      const usersRes = await fetch("http://localhost:5000/dashboard/users", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!usersRes.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const usersData = await usersRes.json();
      
      const roleCount = {};
      usersData.forEach(user => {
        const role = user.role || 'user';
        roleCount[role] = (roleCount[role] || 0) + 1;
      });

      setStats(prevStats => ({
        ...prevStats,
        totalUsers: usersData.length,
        roleDistribution: roleCount
      }));

    } catch (err) {
      console.error("Users error:", err.message);
      toast.error("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const getLeaveStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/reports/stats", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave statistics");
      }

      const data = await response.json();
      
      setStats(prevStats => ({
        ...prevStats,
        totalLeaveRequests: data.totalRequests,
        pendingRequests: data.pendingRequests,
        approvedRequests: data.approvedRequests,
        rejectedRequests: data.rejectedRequests,
        leaveTypeStats: data.leaveTypeStats,
        monthlyRequests: data.monthlyRequests
      }));
    } catch (err) {
      console.error("Error fetching leave stats:", err.message);
      toast.error("Failed to fetch leave statistics");
    }
  };

  const preparePieChartData = () => {
    const leaveTypeData = stats.leaveTypeStats;
    return {
      labels: leaveTypeData.map(type => type.type_name),
      datasets: [
        {
          label: 'Leave Requests by Type',
          data: leaveTypeData.map(type => type.request_count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareLineChartData = () => {
    const monthlyData = stats.monthlyRequests;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels: monthlyData.map(item => monthNames[parseInt(item.month) - 1]),
      datasets: [
        {
          label: 'Monthly Leave Requests',
          data: monthlyData.map(item => item.request_count),
          fill: {
            target: 'origin',
            above: 'rgba(75, 192, 192, 0.2)'
          },
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4
        }
      ]
    };
  };

  const prepareBarChartData = () => {
    const roleData = stats.roleDistribution;
    return {
      labels: Object.keys(roleData),
      datasets: [
        {
          label: 'Users by Role',
          data: Object.values(roleData),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  return (
    <div className="dashboard-admin-container">
      <div className="dashboard-header">
        <h1>Welcome, {name || "Admin"}</h1>
      </div>
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className="stats-cards">
            <div className="stat-card users-card" data-delay="0s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="stat-details">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="stat-card pending-card" data-delay="0.1s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div className="stat-details">
                <h3>Pending Requests</h3>
                <p className="stat-value">{stats.pendingRequests}</p>
              </div>
            </div>
            <div className="stat-card success-card" data-delay="0.2s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="stat-details">
                <h3>Approved Requests</h3>
                <p className="stat-value">{stats.approvedRequests}</p>
              </div>
            </div>
            <div className="stat-card danger-card" data-delay="0.3s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faTimesCircle} />
              </div>
              <div className="stat-details">
                <h3>Rejected Requests</h3>
                <p className="stat-value">{stats.rejectedRequests}</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container pie-chart" data-delay="0.4s">
              <h3>Leave Types Distribution</h3>
              <div className="chart-wrapper">
                <Pie data={preparePieChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="chart-container line-chart" data-delay="0.5s">
              <h3>Monthly Leave Requests</h3>
              <div className="chart-wrapper">
                <Line data={prepareLineChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="chart-container bar-chart" data-delay="0.6s">
              <h3>User Role Distribution</h3>
              <div className="chart-wrapper">
                <Bar data={prepareBarChartData()} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdminGeneral;
