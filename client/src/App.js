import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import DashboardAdmin from "./components/dashboard/DashboardAdmin/DashboardAdmin";
import DashboardHr from "./components/dashboard/dashboardHr/DashboardHr";
import DashboardEmployee from "./components/dashboard/DashboardEmploye/DashboardEmployee";
import DashboardManager from "./components/dashboard/dashbordManager/DashboardManager";
import Header from "./components/Header";
import Calendar from "./components/dashboard/common/Calendar";
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from "./components/ProtectedRoute";
import DemandeConge from "./components/dashboard/DashboardEmploye/DemandeConge";
import SoldeConges from "./components/dashboard/DashboardEmploye/SoldeConges";
import ProfileEmloyee from "./components/dashboard/DashboardEmploye/ProfileEmloyee";
import GererConges from "./components/dashboard/dashbordManager/GererConges";
import ProfileManager from "./components/dashboard/dashbordManager/ProfileManager";
import ProfileAdmin from "./components/dashboard/DashboardAdmin/ProfileAdmin";
import ProfileRh from "./components/dashboard/dashboardHr/ProfileRh";
import Landing from "./front/Landing";
import DashboardAdminGeneral from "./components/dashboard/DashboardAdmin/DashboardAdminGeneral";
import Rapports from "./components/dashboard/dashboardHr/rapports";
import verifyGoogleConfig from './utils/googleConfig';

const App = () => {  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }

    // Debug log for Google Client ID
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      clientIdFromState: clientId
    });
    
    if (!clientId) {
      console.error('Google Client ID is not configured in .env.local');
    } else {
      console.log('Google Client ID is configured:', clientId);
    }
  }, [clientId]);

  const setAuth = (boolean, role = null) => {
    setIsAuthenticated(boolean);
    setUserRole(role);
  };

  // Early return if client ID is not configured
  if (!clientId) {
    return <div>Error: Google Client ID is not configured. Please check your .env.local file.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          limit={1}
          toastStyle={{
            width: "auto",
            maxWidth: "500px"
          }}
        />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to={`/dashboard-${userRole === 'rh' ? 'hr' : userRole}`} /> : <Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register setAuth={setAuth} />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route element={<Header setAuth={setAuth} userRole={userRole} />}>
              <Route path="/dashboard-adminG" element={<DashboardAdmin setAuth={setAuth} />} />
              <Route path="/dashboard-hr" element={<DashboardHr setAuth={setAuth} />} />
              <Route path="/dashboard-manager" element={<DashboardManager setAuth={setAuth} />} />            
              <Route path="/dashboard-employee" element={<DashboardEmployee setAuth={setAuth} />} />
              <Route path="/dashboard-admin" element={<DashboardAdminGeneral setAuth={setAuth} />} />
              
              {/* Routes de calendrier pour chaque rôle */}
              <Route path="/calendar-hr" element={<Calendar userRole="hr" />} />
              <Route path="/calendar-manager" element={<Calendar userRole="manager" />} />
              <Route path="/calendar-employee" element={<Calendar userRole="employee" />} />

              {/* Autres routes */}
              <Route path="/leave-request-history" element={<DemandeConge />} />
              <Route path="/leave-balances" element={<SoldeConges />} />
              <Route path="/profile-employee" element={<ProfileEmloyee />} />
              <Route path="/profile-manager" element={<ProfileManager />} />
              <Route path="/profile-admin" element={<ProfileAdmin />} />
              <Route path="/profile-hr" element={<ProfileRh />} />
              <Route path="/approvals" element={<GererConges />} />
              <Route path="/reports" element={<Rapports />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;