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
  faHourglassHalf
} from "@fortawesome/free-solid-svg-icons";
import Calendar from '../common/Calendar';

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
  const navigate = useNavigate();
  const getHrData = async () => {
    setLoading(true);    try {
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
          </section>

          {/* Calendrier des congés */}
          <div className="calendar-section">
            <h2>Calendrier des congés</h2>
            <Calendar userRole="hr" />
          </div>
        </main>
      )}
    </div>
  );
};
export default DashboardHr;
