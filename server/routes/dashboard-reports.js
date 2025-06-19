const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

// Route pour générer des rapports HR
router.get("/reports", authorization, async (req, res) => {
  try {
    const { startDate, endDate, employeeId, departmentId, reportType } = req.query;
    
    // Vérification des paramètres requis
    if (!startDate || !endDate || !reportType) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required parameters: startDate, endDate, and reportType are required" 
      });
    }
    
    let reportData;
    
    switch (reportType) {
      case 'leaves':
        reportData = await generateLeaveRequestsReport(startDate, endDate, employeeId, departmentId);
        break;
      case 'balance':
        reportData = await generateLeaveBalanceReport(startDate, endDate, employeeId, departmentId);
        break;
      case 'departments':
        reportData = await generateDepartmentAnalysisReport(startDate, endDate, departmentId);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: "Invalid report type. Must be one of: leaves, balance, departments" 
        });
    }
    
    res.json(reportData);
  } catch (err) {
    console.error("Error generating report:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Server error while generating report: " + err.message
    });
  }
});

// Fonction pour générer un rapport de demandes de congés
async function generateLeaveRequestsReport(startDate, endDate, employeeId, departmentId) {
  // Construire la requête de base
  let query = `
    SELECT 
      dc.id, 
      u.user_name as employee, 
      u.role as department,
      dc.date_debut as startdate,
      dc.date_fin as enddate,
      tc.nom as type,
      dc.statut as status
    FROM demandes_conge dc
    JOIN users u ON dc.utilisateur_id = u.user_id
    JOIN type_conges tc ON dc.type_conge_id = tc.id
    WHERE dc.date_debut >= $1 AND dc.date_fin <= $2
  `;
    // Paramètres pour la requête
  const params = [startDate, endDate];
  let paramIndex = 3;
  
  // Filtrer par employé si spécifié
  if (employeeId) {
    query += ` AND dc.utilisateur_id = $${paramIndex}`;
    params.push(employeeId);
    paramIndex++;
  }
  
  // Filtrer par département si spécifié
  if (departmentId) {
    query += ` AND u.role = $${paramIndex}`;
    params.push(departmentId);
  }
  
  // Exécuter la requête
  const result = await pool.query(query, params);
  const details = result.rows;
  
  // Requête pour obtenir les statistiques de statut
  let statusQuery = `
    SELECT 
      dc.statut as status,
      COUNT(*) as count
    FROM demandes_conge dc
    JOIN users u ON dc.utilisateur_id = u.user_id
    WHERE dc.date_debut >= $1 AND dc.date_fin <= $2
  `;
    // Paramètres pour la requête de statut
  const statusParams = [startDate, endDate];
  let statusParamIndex = 3;
  
  // Appliquer les mêmes filtres
  if (employeeId) {
    statusQuery += ` AND dc.utilisateur_id = $${statusParamIndex}`;
    statusParams.push(employeeId);
    statusParamIndex++;
  }
  
  if (departmentId) {
    statusQuery += ` AND u.role = $${statusParamIndex}`;
    statusParams.push(departmentId);
  }
  
  statusQuery += ` GROUP BY dc.statut`;
  
  const statusResult = await pool.query(statusQuery, statusParams);
    // Requête pour obtenir les statistiques par département
  let deptQuery = `
    SELECT 
      u.role as name,
      COUNT(*) as count,
      SUM(CASE WHEN dc.statut = 'Approuve' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN dc.statut = 'Refuse' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN dc.statut = 'En attente' THEN 1 ELSE 0 END) as pending
    FROM demandes_conge dc
    JOIN users u ON dc.utilisateur_id = u.user_id
    WHERE dc.date_debut >= $1 AND dc.date_fin <= $2
  `;
    // Paramètres pour la requête par département
  const deptParams = [startDate, endDate];
  let deptParamIndex = 3;
  
  // Appliquer les mêmes filtres
  if (employeeId) {
    deptQuery += ` AND dc.utilisateur_id = $${deptParamIndex}`;
    deptParams.push(employeeId);
    deptParamIndex++;
  }
  
  if (departmentId) {
    deptQuery += ` AND u.role = $${deptParamIndex}`;
    deptParams.push(departmentId);
  }
  
  deptQuery += ` GROUP BY u.role`;
  
  const deptResult = await pool.query(deptQuery, deptParams);
  
  // Compter les totaux
  const approved = statusResult.rows.find(r => r.status === 'Approuve')?.count || 0;
  const rejected = statusResult.rows.find(r => r.status === 'Refuse')?.count || 0;
  const pending = statusResult.rows.find(r => r.status === 'En attente')?.count || 0;
  const total = parseInt(approved) + parseInt(rejected) + parseInt(pending);
  
  // Construire l'objet de rapport
  return {
    title: 'Leave Requests Report',
    period: `${startDate} to ${endDate}`,
    summary: {
      total,
      approved,
      rejected,
      pending
    },
    byDepartment: deptResult.rows,
    details
  };
}

// Fonction pour générer un rapport de soldes de congés
async function generateLeaveBalanceReport(startDate, endDate, employeeId, departmentId) {  
  // Construire la requête pour les détails des soldes
  let query = `    SELECT 
      u.user_id as id,
      u.user_name as employee,
      u.role as department,
      COALESCE(SUM(CASE WHEN tc.nom = 'Annual Leave' THEN sc.solde_restant ELSE 0 END), 0) as annualbalance,
      COALESCE(SUM(CASE WHEN tc.nom = 'Sick Leave' THEN sc.solde_restant ELSE 0 END), 0) as sickbalance,
      COALESCE((sc.solde_initial - sc.solde_restant), 0) as totaltaken
    FROM users u
    LEFT JOIN solde_conges sc ON sc.utilisateur_id = u.user_id
    LEFT JOIN type_conges tc ON sc.type_conge_id = tc.id
    WHERE (sc.annee = $1 OR sc.annee IS NULL)
  `;
  
  // Paramètres pour la requête
  const currentYear = new Date().getFullYear();
  const params = [currentYear];
  let paramIndex = 2;
  
  // Filtrer par employé si spécifié
  if (employeeId) {
    query += ` AND u.user_id = $${paramIndex}`;
    params.push(employeeId);
    paramIndex++;
  }
    // Filtrer par département si spécifié
  if (departmentId) {
    query += ` AND u.role = $${paramIndex}`;
    params.push(departmentId);
  }
  
  query += ` GROUP BY u.user_id, u.user_name, u.role, (sc.solde_initial - sc.solde_restant)`;
  
  // Exécuter la requête
  const result = await pool.query(query, params);
  const details = result.rows;
    // Requête pour obtenir les moyennes par département
  let deptQuery = `    SELECT 
      u.role as name,
      COALESCE(AVG(CASE WHEN tc.nom = 'Annual Leave' THEN sc.solde_restant ELSE NULL END), 0) as avgannual,
      COALESCE(AVG(CASE WHEN tc.nom = 'Sick Leave' THEN sc.solde_restant ELSE NULL END), 0) as avgsick
    FROM users u
    LEFT JOIN solde_conges sc ON sc.utilisateur_id = u.user_id
    LEFT JOIN type_conges tc ON sc.type_conge_id = tc.id
    WHERE (sc.annee = $1 OR sc.annee IS NULL) AND u.role IS NOT NULL
  `;
  
  // Paramètres pour la requête par département
  const deptParams = [currentYear];
  let deptParamIndex = 2;
  
  // Appliquer les mêmes filtres
  if (employeeId) {
    deptQuery += ` AND u.user_id = $${deptParamIndex}`;
    deptParams.push(employeeId);
    deptParamIndex++;
  }
    if (departmentId) {
    deptQuery += ` AND u.role = $${deptParamIndex}`;
    deptParams.push(departmentId);
  }
  
  deptQuery += ` GROUP BY u.role`;
  
  const deptResult = await pool.query(deptQuery, deptParams);
  
  // Calculer les statistiques globales
  const totalEmployees = details.length;
  const avgAnnualBalance = details.reduce((acc, curr) => acc + parseFloat(curr.annualbalance || 0), 0) / (totalEmployees || 1);
  const avgSickBalance = details.reduce((acc, curr) => acc + parseFloat(curr.sickbalance || 0), 0) / (totalEmployees || 1);
  
  // Construire l'objet de rapport
  return {
    title: 'Leave Balance Report',
    period: `As of ${new Date().toISOString().split('T')[0]}`,
    summary: {
      totalEmployees,
      avgAnnualBalance: avgAnnualBalance.toFixed(1),
      avgSickBalance: avgSickBalance.toFixed(1)
    },
    byDepartment: deptResult.rows.map(dept => ({
      ...dept,
      avgAnnual: parseFloat(dept.avgannual || 0).toFixed(1),
      avgSick: parseFloat(dept.avgsick || 0).toFixed(1)
    })),
    details: details.map(item => ({
      ...item,
      annualbalance: parseInt(item.annualbalance || 0),
      sickbalance: parseInt(item.sickbalance || 0),
      totaltaken: parseInt(item.totaltaken || 0)
    }))
  };
}

// Fonction pour générer un rapport d'analyse par département
async function generateDepartmentAnalysisReport(startDate, endDate, departmentId) {  
  // Requête pour obtenir les statistiques de congés par département (rôle)
  let query = `
    SELECT 
      u.role as name,
      COUNT(DISTINCT u.user_id) as employeecount,
      COALESCE(SUM(
        CASE 
          WHEN dc.statut = 'Approuve' THEN 
            EXTRACT(DAY FROM (dc.date_fin - dc.date_debut + INTERVAL '1 day'))
          ELSE 0 
        END
      ), 0) as totaldays
    FROM users u
    LEFT JOIN demandes_conge dc ON dc.utilisateur_id = u.user_id 
      AND dc.date_debut >= $1 AND dc.date_fin <= $2
    WHERE u.role IS NOT NULL
  `;
  
  // Paramètres pour la requête
  const params = [startDate, endDate];
  let paramIndex = 3;
    // Filtrer par département si spécifié
  if (departmentId) {
    query += ` AND u.role = $${paramIndex}`;
    params.push(departmentId);
  }
  
  query += ` GROUP BY u.role`;
  
  // Exécuter la requête
  const result = await pool.query(query, params);
  
  // Calculer la moyenne par employé pour chaque département
  const departments = result.rows.map(dept => ({
    ...dept,
    name: dept.name,
    totaldays: parseInt(dept.totaldays || 0),
    employeecount: parseInt(dept.employeecount || 0),
    avgperemployee: dept.employeecount > 0 ? parseFloat(dept.totaldays) / parseFloat(dept.employeecount) : 0
  }));
  
  // Trouver le département avec le plus/moins de congés
  let highestLeaves = { name: 'None', days: 0 };
  let lowestLeaves = { name: 'None', days: Number.MAX_SAFE_INTEGER };
  
  departments.forEach(dept => {
    if (dept.totaldays > highestLeaves.days) {
      highestLeaves = { name: dept.name, days: dept.totaldays };
    }
    if (dept.totaldays < lowestLeaves.days && dept.totaldays > 0) {
      lowestLeaves = { name: dept.name, days: dept.totaldays };
    }
  });
  
  // Si aucun département n'a de congés, initialiser lowestLeaves correctement
  if (lowestLeaves.days === Number.MAX_SAFE_INTEGER) {
    lowestLeaves = { name: 'None', days: 0 };
  }
  
  // Construire l'objet de rapport
  return {
    title: 'Department Leave Analysis',
    period: `${startDate} to ${endDate}`,
    summary: {
      totalDepartments: departments.length,
      highestLeaves: departments.length > 0 ? `${highestLeaves.name} (${highestLeaves.days} days)` : 'None',
      lowestLeaves: departments.length > 0 ? `${lowestLeaves.name} (${lowestLeaves.days} days)` : 'None'
    },
    departments
  };
}

// Fonction modifiée pour obtenir les départements avec leur ID
router.get("/departements", authorization, async (req, res) => {
  try {
    const query = await pool.query(`
      SELECT DISTINCT role as nom, role as id 
      FROM users 
      WHERE role IS NOT NULL 
      ORDER BY role
    `);
    res.json(query.rows);
  } catch (err) {
    console.error("Error fetching departments:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Export the router module
module.exports = router;
