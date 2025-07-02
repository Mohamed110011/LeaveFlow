import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../../config';
import { 
  faFilePdf, 
  faFileExcel, 
  faCalendarAlt, 
  faUserTie, 
  faSearch, 
  faChartLine,
  faFilter,
  faSpinner,
  faMicrophone,  // Ajout de l'icône du microphone
  faCircleStop   // Ajout de l'icône stop
} from '@fortawesome/free-solid-svg-icons';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  subWeeks,
  subMonths,
  parse,
  format
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import './rapports.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
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

// Utility functions for formatting
const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

const formatNumber = (value, decimals = 0) => {
  try {
    if (value === null || value === undefined) return '0';
    return Number(value).toFixed(decimals);
  } catch (e) {
    console.error('Error formatting number:', e);
    return value;
  }
};

const Rapports = () => {  // State for filters
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('leaves'); // 'leaves', 'balance'
  
  // Charts references
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  // Fetch employees and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);      try {
        // Fetch employees
        const employeesRes = await fetch(`${config.API_URL}/dashboard/users`, {
          method: 'GET',
          headers: { token: localStorage.token }
        });
        
        if (!employeesRes.ok) throw new Error('Failed to fetch employees');
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);
        
        // Initialize with empty date range
        setDateRange({
          startDate: '',
          endDate: ''
        });
        
        // Generate initial report
        // Waiting for filters to be set before generating the first report
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load initial data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);// Generate report based on filters
  const generateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.warning('Please select a date range');
      return;
    }
    
    setLoading(true);
    setReportData(null); // Reset previous report data
    
    try {      // Build query parameters
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      params.append('reportType', reportType);
      
      console.log('Generating report with params:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        employeeId: selectedEmployee || 'all',
        reportType
      });
      
      // Fetch report data
      const res = await fetch(`${config.API_URL}/dashboard/reports?${params.toString()}`, {
        method: 'GET',
        headers: { token: localStorage.token }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }
      
      const data = await res.json();
      console.log('Report data received:', data);
      
      // Handle empty results
      const hasNoData = (reportType === 'leaves' && (!data.details || data.details.length === 0)) ||
                       (reportType === 'balance' && (!data.details || data.details.length === 0));
                       
      if (hasNoData) {
        toast.info('No data found for the selected criteria. Try adjusting your filters.');
      } else {
        toast.success('Report generated successfully');
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(`Failed to generate report: ${error.message}`);
      
      // Clear any previous report data on error
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };
    // Removed unused mock data generation function
  
  // Export as PDF
  const exportPDF = () => {
    if (!reportData) {
      toast.warning('Please generate a report first');
      return;
    }
    
    toast.info('Exporting as PDF...');
    
    // Import both modules and then use them
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([{ default: JsPDF }, { default: autoTable }]) => {
      // Initialize jsPDF
      const doc = new JsPDF();
      
      // Add the autoTable plugin to the jsPDF instance
      autoTable(doc, {
        // Empty table to initialize the plugin
        head: [['']],
        body: [['']]
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text(reportData.title, 14, 22);
      
      // Add period
      doc.setFontSize(12);
      doc.text(`Period: ${reportData.period}`, 14, 30);
      
      // Add summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 40);
      
      let summaryData = [];
      
      if (reportType === 'leaves') {
        summaryData = [
          ['Total Requests', reportData.summary.total],
          ['Approved', reportData.summary.approved],
          ['Rejected', reportData.summary.rejected],
          ['Pending', reportData.summary.pending]
        ];
      } else if (reportType === 'balance') {
        summaryData = [
          ['Total Employees', reportData.summary.totalEmployees],
          ['Avg. Annual Balance', reportData.summary.avgAnnualBalance + ' days'],
          ['Avg. Sick Balance', reportData.summary.avgSickBalance + ' days']
        ];
      }
      
      // Use autoTable for the summary
      autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5
        }
      });
      
      // Add details table
      doc.setFontSize(14);
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 45;
      doc.text('Details', 14, finalY + 10);
      
      let columns = [];
      let data = [];
      
      if (reportType === 'leaves') {
        columns = ['Employee', 'Department', 'Start Date', 'End Date', 'Type', 'Status'];
        data = reportData.details.map(item => {
          let displayStatus = item.status === 'Approuve' ? 'Approved' : 
                           item.status === 'Refuse' ? 'Rejected' : 
                           item.status === 'En attente' ? 'Pending' : 
                           item.status;
          return [
            item.employee,
            item.department,
            formatDate(item.startdate),
            formatDate(item.enddate),
            item.type,
            displayStatus
          ];
        });
      } else if (reportType === 'balance') {
        columns = ['Employee', 'Department', 'Annual Balance', 'Sick Balance', 'Total Taken'];
        data = reportData.details.map(item => [
          item.employee,
          item.department,
          formatNumber(item.annualbalance) + ' days',
          formatNumber(item.sickbalance) + ' days',
          formatNumber(item.totaltaken) + ' days'
        ]);
      }
      
      // Use autoTable for the details
      autoTable(doc, {
        startY: finalY + 15,
        head: [columns],
        body: data,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 }
        }
      });
      
      // Save the PDF
      doc.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF exported successfully');
    }).catch(error => {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF: ' + error.message);
    });
  };
    
  // Export as Excel
  const exportExcel = () => {
    if (!reportData) {
      toast.warning('Please generate a report first');
      return;
    }    toast.info('Exporting as Excel...');
    Promise.all([
      import('xlsx'),
      import('file-saver')
    ]).then(([XLSX, FileSaver]) => {
      try {
        const { utils, write } = XLSX;
        const saveAs = FileSaver.default;
        // Create workbook
        const wb = utils.book_new();
        
        // Create summary worksheet
        const summaryData = [
          ['Report Title', reportData.title],
          ['Period', reportData.period],
          [''], // Empty row for spacing
          ['Summary']
        ];
        
        if (reportType === 'leaves') {
          summaryData.push(
            ['Total Requests', reportData.summary.total],
            ['Approved', reportData.summary.approved],
            ['Rejected', reportData.summary.rejected],
            ['Pending', reportData.summary.pending]
          );
        } else if (reportType === 'balance') {
          summaryData.push(
            ['Total Employees', reportData.summary.totalEmployees],
            ['Avg. Annual Balance', reportData.summary.avgAnnualBalance + ' days'],
            ['Avg. Sick Balance', reportData.summary.avgSickBalance + ' days']
          );
        } else if (reportType === 'departments') {
          summaryData.push(
            ['Total Departments', reportData.summary.totalDepartments],
            ['Highest Leave Usage', reportData.summary.highestLeaves],
            ['Lowest Leave Usage', reportData.summary.lowestLeaves]
          );
        }
        
        const summaryWS = utils.aoa_to_sheet(summaryData);
        utils.book_append_sheet(wb, summaryWS, 'Summary');
        
        // Create details worksheet
        let detailsData = [];
        
        if (reportType === 'leaves') {
          detailsData.push(['Employee', 'Department', 'Start Date', 'End Date', 'Type', 'Status']);
          reportData.details.forEach(item => {
            let displayStatus = item.status === 'Approuve' ? 'Approved' : 
                            item.status === 'Refuse' ? 'Rejected' : 
                            item.status === 'En attente' ? 'Pending' :
                            item.status;
            detailsData.push([
              item.employee,
              item.department,
              formatDate(item.startdate),
              formatDate(item.enddate),
              item.type,
              displayStatus
            ]);
          });
        } else if (reportType === 'balance') {
          detailsData.push(['Employee', 'Department', 'Annual Balance', 'Sick Balance', 'Total Taken']);
          reportData.details.forEach(item => {
            detailsData.push([
              item.employee,
              item.department,
              formatNumber(item.annualbalance) + ' days',
              formatNumber(item.sickbalance) + ' days',
              formatNumber(item.totaltaken) + ' days'
            ]);
          });
        }
        
        const detailsWS = utils.aoa_to_sheet(detailsData);
        utils.book_append_sheet(wb, detailsWS, 'Details');
        
        // Generate Excel file
        const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        
        // Save the file
        saveAs(data, `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        toast.success('Excel file exported successfully');
      } catch (error) {
        console.error('Error generating Excel:', error);
        toast.error('Failed to generate Excel file: ' + error.message);
      }
    }).catch(error => {
      console.error('Error loading Excel modules:', error);
      toast.error('Failed to load Excel export modules: ' + error.message);
    });
  };
    // Prepare chart data for leaves report
  const prepareLeaveChartData = () => {
    if (!reportData || reportType !== 'leaves') return null;
      // Bar chart data for leaves status
    const barData = {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [
        {
          label: 'Leave Requests',
          data: [
            reportData.summary.approved || 0,
            reportData.summary.rejected || 0,
            reportData.summary.pending || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    // Pie chart data
    const pieData = {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [
        {
          data: [
            parseInt(reportData.summary.approved) || 0,
            parseInt(reportData.summary.rejected) || 0,
            parseInt(reportData.summary.pending) || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return { barData, pieData };
  };  // Prepare chart data for balance report
  const prepareBalanceChartData = () => {
    if (!reportData || reportType !== 'balance') return null;
    
    // Bar chart data for leaves balance
    const barData = {
      labels: ['Annual Balance', 'Sick Balance'],
      datasets: [
        {
          label: 'Leave Balance',
          data: [
            reportData.summary.avgAnnualBalance || 0,
            reportData.summary.avgSickBalance || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return { barData };
  };  // Removed departments chart data
    // Get the appropriate chart data based on report type
  const getChartData = () => {
    switch (reportType) {
      case 'leaves':
        return prepareLeaveChartData();
      case 'balance':
        return prepareBalanceChartData();
      default:
        return null;
    }
  };
  
  // Render report details based on type
  const renderReportDetails = () => {
    if (!reportData) return null;
    
    switch (reportType) {
      case 'leaves':
        return (
          <div className="report-details">
            <h3>Leave Requests Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>                
                {reportData.details.map(item => (
                  <tr key={item.id}>
                    <td>{item.employee}</td>
                    <td>{item.department}</td>
                    <td>{formatDate(item.startdate)}</td>
                    <td>{formatDate(item.enddate)}</td>
                    <td>{item.type}</td>                    <td>                      <span className={`status-badge status-${(item.status || '').toLowerCase()}`}>
                        {item.status === 'Approuve' ? 'Approved' : 
                         item.status === 'Refuse' ? 'Rejected' : 
                         item.status === 'En attente' ? 'Pending' : 
                         item.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'balance':
        return (
          <div className="report-details">
            <h3>Leave Balance Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Annual Leave Balance</th>
                  <th>Sick Leave Balance</th>
                  <th>Total Days Taken</th>
                </tr>
              </thead>
              <tbody>                
                {reportData.details.map(item => (
                  <tr key={item.id}>
                    <td>{item.employee}</td>
                    <td>{item.department}</td>
                    <td>{formatNumber(item.annualbalance)} days</td>
                    <td>{formatNumber(item.sickbalance)} days</td>
                    <td>{formatNumber(item.totaltaken)} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
  
      
      default:
        return null;
    }
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        bodyFont: {
          family: "'Poppins', sans-serif",
          size: 14
        },
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 16
        }
      }
    }
  };

  // État pour la commande vocale
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

  // Fonction pour gérer la commande vocale
  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('La reconnaissance vocale n\'est pas supportée dans ce navigateur');
      toast.error('La reconnaissance vocale n\'est pas supportée dans ce navigateur');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('🎤 Début de l\'écoute vocale');
      setIsListening(true);
      toast.info('Écoute en cours...');
    };    recognition.onresult = (event) => {      const command = event.results[0][0].transcript;
      console.log('🗣️ Commande vocale reçue:', command);
      setVoiceCommand(command);      // Détecter le type de rapport et l'employé
      const commandLower = command.toLowerCase();

      // Recherche d'un employé mentionné dans la commande
      const employeeMatch = employees.find(emp => 
        commandLower.includes(emp.user_name.toLowerCase()) || 
        commandLower.includes('pour ' + emp.user_name.toLowerCase()) ||
        commandLower.includes('de ' + emp.user_name.toLowerCase())
      );

      if (employeeMatch) {
        console.log('👤 Employé sélectionné:', employeeMatch.user_name);
        setSelectedEmployee(employeeMatch.user_id);
        toast.info(`Employé sélectionné : ${employeeMatch.user_name}`);
      } else if (commandLower.includes('tous') || commandLower.includes('all')) {
        console.log('👥 Sélection de tous les employés');
        setSelectedEmployee('');
        toast.info('Sélection : Tous les employés');
      }

      // Détecter le type de rapport
      if (commandLower.includes('solde') || commandLower.includes('balance') || commandLower.includes('disponible')) {
        console.log('📊 Changement vers le rapport de solde de congés');
        setReportType('balance');
        toast.info('Type de rapport : Solde de congés');
      } else if (commandLower.includes('demande') || commandLower.includes('request')) {
        console.log('📊 Changement vers le rapport des demandes de congés');
        setReportType('leaves');
        toast.info('Type de rapport : Demandes de congés');
      }

      // Parser la commande vocale pour les dates
      const dates = parseDateFromVoiceCommand(command);
      if (dates) {
        console.log('📅 Dates extraites:', dates);
        setDateRange({
          startDate: dates.startDate,
          endDate: dates.endDate
        });
        
        // Générer automatiquement le rapport après avoir défini les dates
        setTimeout(() => {
          console.log('📊 Génération automatique du rapport après définition des dates');
          generateReport();
        }, 500);
      }
      
      // Commande de génération explicite
      else if (commandLower.includes('générer') || commandLower.includes('rapport')) {
        console.log('📊 Commande de génération de rapport détectée');
        generateReport();
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Erreur de reconnaissance vocale:', event.error);
      toast.error(`Erreur de reconnaissance vocale: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🛑 Fin de l\'écoute vocale');
      setIsListening(false);
    };

    if (!isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('❌ Erreur lors du démarrage de la reconnaissance:', error);
        toast.error('Erreur lors du démarrage de la reconnaissance vocale');
        setIsListening(false);
      }
    } else {
      recognition.stop();
      setVoiceCommand('');
    }
  };
  // Fonction pour mettre à jour les dates
  const updateDateRange = (startDate, endDate) => {
    setDateRange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    });
  };
  // Date patterns pour le parsing vocal
  const datePatterns = {
    today: /aujourd'hui|maintenant/i,
    thisWeek: /cette semaine|semaine en cours/i,
    thisMonth: /ce mois|mois en cours/i,
    lastWeek: /semaine dernière|dernère semaine/i,
    lastMonth: /mois dernier|dernier mois/i,    specific: /(?:du |de |depuis )?(\d{1,2})(?:er)?\s*(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(?:\d{4})?\s*(?:au|jusqu'au|à|jusque?|jusqu'à)\s*(\d{1,2})(?:er)?\s*(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(?:\d{4})?/i,
    specificMultiMonth: /(?:du |de |depuis )?(\d{1,2})(?:er)?\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(?:\d{4})?\s*(?:au|jusqu'au|à|jusque?|jusqu'à)\s*(\d{1,2})(?:er)?\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*(?:\d{4})?/i,
    specificMonth: /(?:rapport|congé).*(?:de |du |pour |en )(\d{1,2}(?:er)?\s+)?(\w+)(?:\s+(\d{4}))?/i
  };
  // Parser une commande vocale pour extraire les dates
  const parseDateFromVoiceCommand = (command) => {
    console.log('🔍 Analyse de la commande vocale pour les dates:', command);
    
    const now = new Date();
    let startDate = null;
    let endDate = null;

    // Aujourd'hui
    if (datePatterns.today.test(command)) {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      console.log('📅 Période: aujourd\'hui');
    }
    // Cette semaine
    else if (datePatterns.thisWeek.test(command)) {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      console.log('📅 Période: cette semaine');
    }
    // Ce mois
    else if (datePatterns.thisMonth.test(command)) {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      console.log('📅 Période: ce mois');
    }
    // Semaine dernière
    else if (datePatterns.lastWeek.test(command)) {
      startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      console.log('📅 Période: semaine dernière');
    }
    // Mois dernier
    else if (datePatterns.lastMonth.test(command)) {
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      console.log('📅 Période: mois dernier');
    }    // Dates spécifiques multi-mois
    else if (datePatterns.specificMultiMonth.test(command)) {
      const match = command.match(datePatterns.specificMultiMonth);
      try {
        const currentYear = new Date().getFullYear();
        const startDay = parseInt(match[1]);
        const startMonth = match[2].toLowerCase();
        const endDay = parseInt(match[3]);
        const endMonth = match[4].toLowerCase();
        
        startDate = parse(`${startDay} ${startMonth} ${currentYear}`, 'd MMMM yyyy', new Date(), { locale: fr });
        endDate = parse(`${endDay} ${endMonth} ${currentYear}`, 'd MMMM yyyy', new Date(), { locale: fr });
        
        console.log('📅 Période multi-mois:', { startDate, endDate });
        toast.info(`Génération du rapport du ${format(startDate, 'd MMMM', { locale: fr })} au ${format(endDate, 'd MMMM yyyy', { locale: fr })}`);
      } catch (error) {
        console.error('❌ Erreur de parsing des dates:', error);
        return null;
      }
    }
    // Dates spécifiques même mois
    else if (datePatterns.specific.test(command)) {
      const match = command.match(datePatterns.specific);
      try {
        const currentYear = new Date().getFullYear();
        const month = command.match(/(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i)[0];
        
        const startDay = parseInt(match[1]);
        const endDay = parseInt(match[2]);
        
        startDate = parse(`${startDay} ${month} ${currentYear}`, 'd MMMM yyyy', new Date(), { locale: fr });
        endDate = parse(`${endDay} ${month} ${currentYear}`, 'd MMMM yyyy', new Date(), { locale: fr });
        
        console.log('📅 Période même mois:', { startDate, endDate });
        toast.info(`Génération du rapport du ${format(startDate, 'd MMMM', { locale: fr })} au ${format(endDate, 'd MMMM yyyy', { locale: fr })}`);
      } catch (error) {
        console.error('❌ Erreur de parsing des dates:', error);
        return null;
      }
    }
    // Mois spécifique
    else {
      const match = command.match(datePatterns.specificMonth);
      if (match) {
        try {
          const month = match[2].toLowerCase();
          const year = match[3] || new Date().getFullYear().toString();
          const date = parse(`1 ${month} ${year}`, 'd MMMM yyyy', new Date(), { locale: fr });
          startDate = startOfMonth(date);
          endDate = endOfMonth(date);
          console.log('📅 Période mois spécifique:', { month, year, startDate, endDate });
          toast.info(`Génération du rapport pour ${format(startDate, 'MMMM yyyy', { locale: fr })}`);
        } catch (error) {
          console.error('❌ Erreur de parsing du mois:', error);
          return null;
        }
      }
    }

    if (startDate && endDate) {
      return {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      };
    }

    return null;
  };

  return (
    <div className="rapports-container">
      <div className="rapports-header">
        <h2><FontAwesomeIcon icon={faChartLine} /> HR Reports Generator</h2>
        <p>Generate and export reports for leave management analysis</p>
        
        <div className="voice-commands-section">          <div className="voice-commands-header">
            <button 
              className={`voice-control-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceCommand}
            >
              <FontAwesomeIcon icon={isListening ? faCircleStop : faMicrophone} />
              {isListening ? 'Stop Listening' : 'Start Voice Command'}
            </button>
          </div>
          
          {voiceCommand && (
            <div className="voice-command-display">
              {voiceCommand}
            </div>
          )}
  
        </div>
      </div>
      
      <div className="rapports-filters">
        <div className="filter-section">
          <h3><FontAwesomeIcon icon={faFilter} /> Report Filters</h3>
          
          <div className="filter-row">
            <div className="filter-group">
              <label>
                <FontAwesomeIcon icon={faCalendarAlt} /> Date Range
              </label>
              <div className="date-inputs">
                <input 
                  type="date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
                <span>to</span>
                <input 
                  type="date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>
                <FontAwesomeIcon icon={faUserTie} /> Employee
              </label>
              <select 
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp.user_id} value={emp.user_id}>
                    {emp.user_name}
                  </option>
                ))}
              </select>            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group report-type">
              <label>Report Type</label>
              <div className="report-type-options">
                <button 
                  className={reportType === 'leaves' ? 'active' : ''} 
                  onClick={() => setReportType('leaves')}
                >
                  Leave Requests
                </button>
                <button 
                  className={reportType === 'balance' ? 'active' : ''} 
                  onClick={() => setReportType('balance')}                >
                  Leave Balance
                </button>
              </div>
            </div>
            
            <div className="filter-actions">              <button 
                className="generate-btn" 
                onClick={generateReport}
                disabled={loading}
              >
                <FontAwesomeIcon icon={loading ? faSpinner : faSearch} spin={loading} /> 
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {reportData && (
        <div className="report-content">
          <div className="report-header">
            <div className="report-title">
              <h2>{reportData.title}</h2>
              <p>Period: {reportData.period}</p>
            </div>
            
            <div className="export-actions">
              <button className="export-btn pdf" onClick={exportPDF}>
                <FontAwesomeIcon icon={faFilePdf} /> Export as PDF
              </button>
              <button className="export-btn excel" onClick={exportExcel}>
                <FontAwesomeIcon icon={faFileExcel} /> Export as Excel
              </button>
            </div>
          </div>
          
          <div className="report-summary">
            <h3>Summary</h3>
            <div className="summary-cards">
              {reportType === 'leaves' && (
                <>
                  <div className="summary-card">
                    <h4>Total Requests</h4>
                    <p>{reportData.summary.total}</p>
                  </div>
                  <div className="summary-card approved">
                    <h4>Approved</h4>
                    <p>{reportData.summary.approved}</p>
                  </div>
                  <div className="summary-card rejected">
                    <h4>Rejected</h4>
                    <p>{reportData.summary.rejected}</p>
                  </div>
                  <div className="summary-card pending">
                    <h4>Pending</h4>
                    <p>{reportData.summary.pending}</p>
                  </div>
                </>
              )}
              
              {reportType === 'balance' && (
                <>
                  <div className="summary-card">
                    <h4>Total Employees</h4>
                    <p>{reportData.summary.totalEmployees}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Avg. Annual Balance</h4>
                    <p>{reportData.summary.avgAnnualBalance} days</p>
                  </div>
                  <div className="summary-card">
                    <h4>Avg. Sick Balance</h4>
                    <p>{reportData.summary.avgSickBalance} days</p>
                  </div>
                </>
              )}
              
              
            </div>
          </div>
          
          <div className="charts-container">
            {getChartData() && getChartData().barData && (
              <div className="chart-wrapper">
                <h3>Status Distribution</h3>
                <div className="chart">
                  <Bar 
                    ref={barChartRef}
                    data={getChartData().barData} 
                    options={chartOptions} 
                  />
                </div>
              </div>
            )}
            
            {getChartData() && getChartData().pieData && (
              <div className="chart-wrapper">
                <h3>Status Distribution</h3>
                <div className="chart">
                  <Pie 
                    ref={pieChartRef}
                    data={getChartData().pieData} 
                    options={chartOptions} 
                  />
                </div>
              </div>
            )}
          </div>
          
          {renderReportDetails()}
            <div className="report-footer">
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rapports;
