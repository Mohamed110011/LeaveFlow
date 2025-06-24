import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHourglassHalf,
  faCalendarCheck,
  faCalendarTimes,
  faFaceSmile,
  faFaceMeh,
  faFaceFrown,
  faStar
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
  const [userId, setUserId] = useState(null);  const [satisfaction, setSatisfaction] = useState(80); // Score de satisfaction sur 100
  const [tempSatisfaction, setTempSatisfaction] = useState(80); // Score temporaire
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [leaveStats, setLeaveStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  const navigate = useNavigate();
  const getSatisfactionScore = async () => {
    try {
      const response = await fetch("http://localhost:5001/satisfaction/", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!response.ok) throw new Error("Failed to fetch satisfaction score");
      const data = await response.json();
      setSatisfaction(data.satisfaction_score);
      if (data.comment) {
        setComment(data.comment);
      }
    } catch (err) {
      console.error("Error fetching satisfaction score:", err.message);
      // En cas d'erreur, on utilise un score par défaut
      setSatisfaction(80);
      setComment('');
    }
  };
  const updateSatisfactionScore = async (newScore, newComment = comment) => {
    try {
      const response = await fetch("http://localhost:5001/satisfaction/", {
        method: "POST",
        headers: { 
          token: localStorage.token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          satisfaction_score: newScore,
          comment: newComment
        })
      });

      if (!response.ok) throw new Error("Failed to update satisfaction score");
      const data = await response.json();
      setSatisfaction(data.satisfaction_score);
      setComment(newComment);
      setShowCommentInput(false);
      toast.success("Score de satisfaction mis à jour");
    } catch (err) {
      console.error("Error updating satisfaction score:", err.message);
      toast.error("Erreur lors de la mise à jour du score de satisfaction");
    }
  };

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

      // Get satisfaction score
      await getSatisfactionScore();

    } catch (err) {
      console.error(err.message);
      toast.error("Une erreur est survenue lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };  useEffect(() => {
    getEmployeeData();
  }, []);

  useEffect(() => {
    setTempSatisfaction(satisfaction);
  }, [satisfaction]);

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
                <h3>En attente</h3>
                <p>{leaveStats.pendingRequests}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faCalendarCheck} className="stat-icon approved" />
              <div className="stat-info">
                <h3>Approuvées</h3>
                <p>{leaveStats.approvedRequests}</p>
              </div>
            </div>

            <div className="stat-card">
              <FontAwesomeIcon icon={faCalendarTimes} className="stat-icon rejected" />
              <div className="stat-info">
                <h3>Refusées</h3>
                <p>{leaveStats.rejectedRequests}</p>
              </div>            </div>          </div>
          
          <div className="charts-satisfaction-container">
            <div className="satisfaction-container">
              <div className="satisfaction-card satisfaction-transition">
                <div className="satisfaction-header">
                  <h3>Satisfaction</h3>
                  <div className="satisfaction-emoji">                    {tempSatisfaction >= 80 ? (
                      <FontAwesomeIcon icon={faFaceSmile} style={{ color: "#40c057" }} />
                    ) : tempSatisfaction >= 50 ? (
                      <FontAwesomeIcon icon={faFaceMeh} style={{ color: "#ffd43b" }} />
                    ) : (
                      <FontAwesomeIcon icon={faFaceFrown} style={{ color: "#ff6b6b" }} />
                    )}
                  </div>
                  <div className="satisfaction-score">{tempSatisfaction}%</div>
                </div>

                <div className="satisfaction-controls">
                  <FontAwesomeIcon
                    icon={faStar}                    className={`control-icon ${tempSatisfaction >= 20 ? 'active' : ''}`}
                    onClick={() => setTempSatisfaction(20)}
                  />
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`control-icon ${tempSatisfaction >= 40 ? 'active' : ''}`}
                    onClick={() => setTempSatisfaction(40)}
                  />
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`control-icon ${tempSatisfaction >= 60 ? 'active' : ''}`}
                    onClick={() => setTempSatisfaction(60)}
                  />
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`control-icon ${tempSatisfaction >= 80 ? 'active' : ''}`}
                    onClick={() => setTempSatisfaction(80)}
                  />
                  <FontAwesomeIcon
                    icon={faStar}
                    className={`control-icon ${tempSatisfaction >= 100 ? 'active' : ''}`}
                    onClick={() => setTempSatisfaction(100)}
                  />
                </div>

                <div className="satisfaction-comment">
                  {showCommentInput ? (
                    <>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        autoFocus
                      />                      <button onClick={() => updateSatisfactionScore(tempSatisfaction, comment)}>
                        Enregistrer
                      </button>
                    </>
                  ) : (
                    <div onClick={() => setShowCommentInput(true)} style={{ cursor: 'pointer' }}>
                      {comment || "Cliquez pour ajouter un commentaire..."}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-wrapper">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default DashboardEmployee;
