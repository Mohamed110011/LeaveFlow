 const adminLinks = [
    { path: "/dashboard-admin", icon: "fas fa-home", label: "Dashboard" },
    { path: "/Profile-Admin", icon: "fas fa-building", label: "Profile" },
    { path: "/dashboard-adminG", icon: "fas fa-users", label: "User Management" },
    // { path: "/reports", icon: "fas fa-chart-bar", label: "Reports" },
    // { path: "/settings", icon: "fas fa-cog", label: "Settings" }
  ];

  const hrLinks = [
    { path: "/dashboard-hr", icon: "fas fa-home", label: "Dashboard" },
    { path: "/profile-hr", icon: "fas fa-users", label: "Profile" },
    { path: "/calendar-hr", icon: "fas fa-calendar-alt", label: "Calendar" },
    { path: "/reports", icon: "fas fa-chart-bar", label: "Reports" }
  ];

  const managerLinks = [
    { path: "/dashboard-manager", icon: "fas fa-home", label: "Dashboard" },
    { path: "/profile-manager", icon: "fas fa-user", label: "Profile" },
    { path: "/approvals", icon: "fas fa-check-circle", label: "Approvals" },
    { path: "/calendar-manager", icon: "fas fa-calendar-alt", label: "Calendar" }
  ];

  const employeeLinks = [
    { path: "/dashboard-employee", icon: "fas fa-home", label: "Dashboard" },
    { path: "/profile-employee", icon: "fas fa-user", label: "Profile" },
    { path: "/leave-request-history", icon: "fas fa-calendar-plus", label: "Leave Requests" },
    { path: "/leave-balances", icon: "fas fa-chart-pie", label: "Leave Balances" },
    { path: "/calendar-employee", icon: "fas fa-calendar-alt", label: "Calendar" }
  ];
   const userRole = {
     admin: adminLinks,
    hr: hrLinks,
    rh: [], // Adding this variant because it's used in Login.js
    manager: managerLinks,
    employee: employeeLinks
  }
 export { userRole };