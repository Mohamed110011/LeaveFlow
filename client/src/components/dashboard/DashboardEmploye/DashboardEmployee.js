import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHourglassHalf,
  faCalendarCheck,
  faCalendarTimes
} from '@fortawesome/free-solid-svg-icons';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import Calendar from '../common/Calendar';
import './DashboardEmployee.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const DashboardEmployee = () => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState(null);
  const [leaveStats, setLeaveStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const navigate = useNavigate();

  const getEmployeeData = async () => {
    setLoading(true);
    try {
      // Get employee info
      const profileRes = await fetch("http://localhost:5001/dashboard/", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!profileRes.ok) throw new Error("Failed to fetch profile data");
      const profileData = await profileRes.json();
      setName(profileData.user_name);
      setUserId(profileData.user_id);

      // Get leave requests
      const demandesRes = await fetch("http://localhost:5001/dashboard/demandes-conge", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!demandesRes.ok) throw new Error("Failed to fetch leave requests");
      const demandes = await demandesRes.json();
        setLeaveStats({
        pendingRequests: demandes.filter(d => d.statut === 'En attente').length,
        approvedRequests: demandes.filter(d => d.statut === 'Approuve').length,
        rejectedRequests: demandes.filter(d => d.statut === 'Refuse').length
      });

    } catch (err) {
      console.error(err.message);
      toast.error("Une erreur est survenue lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getEmployeeData();
  }, []);

  const chartData = {
    labels: ['En attente', 'Approuvées', 'Refusées'],
    datasets: [
      {
        data: [leaveStats.pendingRequests, leaveStats.approvedRequests, leaveStats.rejectedRequests],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)', // Jaune pour en attente
          'rgba(75, 192, 192, 0.7)',  // Vert pour approuvées
          'rgba(255, 99, 132, 0.7)'   // Rouge pour refusées
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Distribution des demandes de congés',
        font: {
          size: 16
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {name}</h1>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <main className="dashboard-content">          <div className="stats-cards">
            <div className="stat-card">
              <FontAwesomeIcon icon={faHourglassHalf} className="stat-icon pending" />
              <div className="stat-info">
                <h3>Pending Requests</h3>
                <p>{leaveStats.pendingRequests}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faCalendarCheck} className="stat-icon approved" />
              <div className="stat-info">
                <h3>Approved Requests</h3>
                <p>{leaveStats.approvedRequests}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faCalendarTimes} className="stat-icon rejected" />
              <div className="stat-info">
                <h3>Rejected Requests</h3>
                <p>{leaveStats.rejectedRequests}</p>
              </div>            </div>          
          </div>

          <div className="chart-container">
            <div className="chart-wrapper">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="calendar-section">
            <h2>Mon calendrier de congés</h2>
            <Calendar userRole="employee" userId={userId} />
          </div>
        </main>
      )}
    </div>
  );
};

export default DashboardEmployee;
