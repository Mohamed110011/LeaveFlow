import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf
} from "@fortawesome/free-solid-svg-icons";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Calendar from '../common/Calendar';
import "./GererConges.css";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardManager = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);  const [teamStats, setTeamStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const getManagerData = async () => {
    setLoading(true);
    try {
      // Récupérer les informations du manager
      const profileRes = await fetch("http://localhost:5001/dashboard/", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!profileRes.ok) throw new Error("Failed to fetch profile data");
      const profileData = await profileRes.json();
      setName(profileData.user_name);      // Récupérer les demandes de congés
      const demandesRes = await fetch("http://localhost:5001/dashboard/demandes-conge", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!demandesRes.ok) throw new Error("Failed to fetch leave requests");
      const demandes = await demandesRes.json();
      
      // Calculer les statistiques
      const stats = {
        pendingRequests: demandes.filter(d => d.statut === 'En attente').length,
        approvedRequests: demandes.filter(d => d.statut === 'Approuve').length,
        rejectedRequests: demandes.filter(d => d.statut === 'Refuse').length
      };
      
      setTeamStats(stats);

    } catch (err) {
      console.error(err.message);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getManagerData();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {name}</h1>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <main className="dashboard-content">
          {/* Statistiques rapides */}          <div className="stats-cards">
            <div className="stat-card">
              <FontAwesomeIcon icon={faHourglassHalf} className="stat-icon pending" />
              <div className="stat-info">
                <h3>Pending Requests</h3>
                <p>{teamStats.pendingRequests}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faCheckCircle} className="stat-icon approved" />
              <div className="stat-info">
                <h3>Approved Requests</h3>
                <p>{teamStats.approvedRequests}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faTimesCircle} className="stat-icon rejected" />
              <div className="stat-info">
                <h3>Rejected Requests</h3>
                <p>{teamStats.rejectedRequests}</p>
              </div>            </div>
          </div>

          {/* Graphique des statistiques */}
          <div className="chart-container">
            <h2>Leave Requests Distribution</h2>
            <div className="chart-wrapper">
              <Pie
                data={{
                  labels: ['Pending', 'Approved', 'Rejected'],
                  datasets: [
                    {
                      data: [
                        teamStats.pendingRequests,
                        teamStats.approvedRequests,
                        teamStats.rejectedRequests,
                      ],
                      backgroundColor: [
                        'rgba(241, 196, 15, 0.6)',
                        'rgba(46, 204, 113, 0.6)',
                        'rgba(231, 76, 60, 0.6)',
                      ],
                      borderColor: [
                        'rgba(241, 196, 15, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(231, 76, 60, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const value = context.raw;
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${context.label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          
        </main>
      )}
    </div>
  );
};
export default DashboardManager;
