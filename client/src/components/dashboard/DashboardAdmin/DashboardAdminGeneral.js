import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./DashboardAdminGeneral.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUserShield, faCalendarCheck, faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import config from '../../../config';

const DashboardAdminGeneral = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeaveRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    roleDistribution: {}
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
      setName(parseData.user_name);
    } catch (err) {
      console.error("Profile error:", err.message);
      toast.error("Failed to fetch profile data");
    }
  };  const getAdminData = async () => {
    try {
      const usersRes = await fetch(`${config.API_URL}/dashboard/users`, {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!usersRes.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const usersData = await usersRes.json();
      updateUserStats(usersData);

      setLoading(false);
    } catch (err) {
      console.error("Users error:", err.message);
      toast.error("Failed to fetch user data");
      setLoading(false);
    }
  };  const getLeaveStats = async () => {
    try {
      const response = await fetch(`${config.API_URL}/dashboard/reports/stats`, {
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

  useEffect(() => {
    getProfile();
    getAdminData();
    getLeaveStats();
  }, []);

  const preparePieChartData = () => {
    const roleData = stats.roleDistribution;
    const colors = {
      admin: { bg: 'rgba(99, 102, 241, 0.8)', border: 'rgba(99, 102, 241, 1)' },
      manager: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
      rh: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },
      employee: { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)' }
    };

    return {
      labels: Object.keys(roleData),
      datasets: [
        {
          label: 'Utilisateurs par Rôle',
          data: Object.values(roleData),
          backgroundColor: Object.keys(roleData).map(role => colors[role]?.bg || 'rgba(156, 163, 175, 0.8)'),
          borderColor: Object.keys(roleData).map(role => colors[role]?.border || 'rgba(156, 163, 175, 1)'),
          borderWidth: 2,
          hoverOffset: 15
        },
      ],
    };
  };

  // Met à jour les statistiques quand les données des utilisateurs changent
  const updateUserStats = (usersData) => {
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
            <div className="stat-card status-card" data-delay="0.2s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faClipboardCheck} />
              </div>
              <div className="stat-details">
                <h3>Active Users</h3>
                <p className="stat-value">{stats.roleDistribution.employee || 0}</p>
              </div>
            </div>
            <div className="stat-card admin-card" data-delay="0.3s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUserShield} />
              </div>
              <div className="stat-details">
                <h3>Admins</h3>
                <p className="stat-value">{stats.roleDistribution.admin || 0}</p>
              </div>
            </div>
            <div className="stat-card leave-requests-card" data-delay="0.4s">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div className="stat-details">
                <h3>Total Leave Requests</h3>
                <p className="stat-value">{stats.totalLeaveRequests}</p>
              </div>
            </div>
          </div>
          <div className="charts-section">
            <div className="pie-chart" data-delay="0.4s">
              <h3>User Role Distribution</h3>
              <div className="chart-wrapper">                <Pie 
                  data={preparePieChartData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: {
                        top: 10,
                        bottom: 10
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          font: {
                            size: 12,
                            weight: '500'
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        bodyFont: {
                          size: 14
                        },
                        callbacks: {
                          label: function(context) {
                            let label = context.label || '';
                            let value = context.raw || 0;
                            let total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            let percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    elements: {
                      arc: {
                        borderWidth: 2
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardAdminGeneral;
