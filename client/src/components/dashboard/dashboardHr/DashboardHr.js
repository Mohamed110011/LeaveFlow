import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./rapports.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserClock, 
  faCalendarCheck, 
  faListAlt,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faFaceSmile,
  faFaceMeh,
  faFaceFrown
} from "@fortawesome/free-solid-svg-icons";

// Status constants that match the backend
const VALID_STATUSES = {
  PENDING: 'En attente',
  APPROVED: 'Approuve',
  REJECTED: 'Refuse'
};

const DashboardHr = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeSatisfaction, setEmployeeSatisfaction] = useState([]);
  const navigate = useNavigate();

  // Vérification du rôle
  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch("http://localhost:5001/dashboard/", {
          method: "GET",
          headers: { token: localStorage.token }
        });

        const data = await response.json();
        console.log("User role check:", data);

        if (data.role !== 'rh') {
          toast.error("Access denied: HR only");
          // Rediriger vers la page appropriée basée sur le rôle
          navigate(data.role ? `/dashboard-${data.role}` : "/login");
          return;
        }
      } catch (err) {
        console.error(err.message);
        toast.error("Failed to verify access");
        navigate("/login");
      }
    };

    checkRole();
  }, [navigate]);

  const getHrData = async () => {
    setLoading(true);
    try {
      console.log("Current token:", localStorage.token);
      
      // Get current user info and role
      const roleRes = await fetch("http://localhost:5001/dashboard/", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!roleRes.ok) throw new Error("Failed to fetch user role");
      const roleData = await roleRes.json();
      setName(roleData.user_name);

      // Récupérer les utilisateurs
      const usersRes = await fetch("http://localhost:5001/dashboard/users", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!usersRes.ok) throw new Error("Failed to fetch user data");
      const usersData = await usersRes.json();
      setUsers(usersData);
      console.log("Users data:", usersData);

      // Récupérer les demandes de congés
      const leaveReqRes = await fetch("http://localhost:5001/dashboard/demandes-conge", {
        method: "GET",
        headers: { token: localStorage.token }
      });      
      
      if (!leaveReqRes.ok) throw new Error("Failed to fetch leave requests");
      const leaveReqData = await leaveReqRes.json();
      console.log("Leave requests data:", leaveReqData); // Debug log
      setLeaveRequests(leaveReqData);

      // Log the counts for each status for debugging
      console.log("Leave request counts:", {
        pending: leaveReqData.filter(req => req.statut === 'En attente').length,
        approved: leaveReqData.filter(req => req.statut === 'Approuve').length,
        rejected: leaveReqData.filter(req => req.statut === 'Refuse').length
      });

      // Récupérer les types de congés
      const typesRes = await fetch("http://localhost:5001/dashboard/type-conges", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!typesRes.ok) throw new Error("Failed to fetch leave types");
      const typesData = await typesRes.json();
      setLeaveTypes(typesData);

      // Récupérer les soldes de congés
      const currentYear = new Date().getFullYear();
      const balancesRes = await fetch(`http://localhost:5001/dashboard/solde-conges?year=${currentYear}`, {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!balancesRes.ok) throw new Error("Failed to fetch leave balances");
      const balancesData = await balancesRes.json();      setLeaveBalances(balancesData);

      // Récupérer les satisfactions des employés
      const satisfactionRes = await fetch("http://localhost:5001/satisfaction/all", {
        method: "GET",
        headers: { token: localStorage.token }
      });

      if (!satisfactionRes.ok) throw new Error("Failed to fetch satisfaction data");
      const satisfactionData = await satisfactionRes.json();
      setEmployeeSatisfaction(satisfactionData);

    } catch (err) {
      console.error(err.message);
      toast.error("Failed to fetch HR dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
      toast.success("Logout successfully");
      navigate("/login");
    } catch (err) {
      console.error(err.message);
      toast.error("Logout failed");
    }
  };
  useEffect(() => {
    getHrData();
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
              <div className="stat-info">              <h3>Pending Requests</h3>
                <p>{leaveRequests.filter(req => req.statut === 'En attente').length}</p>
              </div>
            </div>
            <div className="stat-card">
              <FontAwesomeIcon icon={faCheckCircle} className="stat-icon approved" />
              <div className="stat-info">
                <h3>Approved Requests</h3>
                <p>{leaveRequests.filter(req => req.statut === 'Approuve').length}</p>
              </div>
            </div>
            <div className="stat-card">
              <FontAwesomeIcon icon={faTimesCircle} className="stat-icon rejected" />
              <div className="stat-info">
                <h3>Rejected Requests</h3>
                <p>{leaveRequests.filter(req => req.statut === 'Refuse').length}</p>
              </div>
            </div>
          </div>          {/* Soldes de congés */}
          <section className="leave-balances">
            <h2>Leave Balances Overview</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    {leaveTypes.map(type => (
                      <th key={type.id}>{type.nom}</th>
                    ))}
                  </tr>
                </thead>                <tbody>
                  {users
                    .filter(user => user.role === 'employee') // Filter only employees
                    .map(user => {
                      // Get all balances for this user
                      const userBalances = leaveBalances.filter(
                        b => b.utilisateur_id === user.user_id
                      );

                    return (
                      <tr key={user.user_id}>
                        <td>{user.user_name}</td>
                        {leaveTypes.map(type => {
                          const balance = userBalances.find(
                            b => b.type_conge_id === type.id
                          );
                          const currentYear = new Date().getFullYear();
                          
                          // If no balance exists for this leave type, check if we need to create it
                          if (!balance) {
                            // You might want to call an API to initialize the balance
                            return (
                              <td key={type.id} className="no-balance">
                                0/0
                              </td>
                            );
                          }
                          
                          return (
                            <td key={type.id} className={balance.solde_restant < 5 ? 'low-balance' : ''}>
                              {balance.solde_restant}/{balance.solde_initial}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>          {/* Section des satisfactions */}
          <section className="satisfaction-overview">
            <div className="satisfaction-header-wrapper">
              <h2>Employee Satisfaction Overview</h2>
              <div className="satisfaction-legend">
                <div className="legend-item">
                  <FontAwesomeIcon icon={faFaceSmile} className="legend-icon happy" />
                  <span>Very Satisfied (80-100%)</span>
                </div>
                <div className="legend-item">
                  <FontAwesomeIcon icon={faFaceMeh} className="legend-icon neutral" />
                  <span>Satisfied (50-79%)</span>
                </div>
                <div className="legend-item">
                  <FontAwesomeIcon icon={faFaceFrown} className="legend-icon sad" />
                  <span>Needs Attention (0-49%)</span>
                </div>
              </div>
            </div>
            <div className="satisfaction-grid">
              {employeeSatisfaction.map((satisfaction) => (
                <div 
                  key={satisfaction.user_id} 
                  className={`satisfaction-card ${
                    satisfaction.satisfaction_score >= 80 
                      ? 'high-satisfaction'
                      : satisfaction.satisfaction_score >= 50 
                      ? 'medium-satisfaction'
                      : 'low-satisfaction'
                  }`}
                >
                  <div className="satisfaction-card-header">
                    <h3>{satisfaction.user_name}</h3>
                    <div className="satisfaction-score-wrapper">
                      <div className="satisfaction-emoji">
                        {satisfaction.satisfaction_score >= 80 ? (
                          <FontAwesomeIcon icon={faFaceSmile} className="emoji happy" />
                        ) : satisfaction.satisfaction_score >= 50 ? (
                          <FontAwesomeIcon icon={faFaceMeh} className="emoji neutral" />
                        ) : (
                          <FontAwesomeIcon icon={faFaceFrown} className="emoji sad" />
                        )}
                      </div>
                      <div className="satisfaction-score">
                        <div className="score-circle">
                          <span>{satisfaction.satisfaction_score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {satisfaction.comment && (
                    <div className="satisfaction-comment">
                      <p>{satisfaction.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default DashboardHr;
