import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilePdf, 
  faFileExcel, 
  faCalendarAlt, 
  faUserTie, 
  faBuildingUser, 
  faSearch, 
  faDownload,
  faChartLine,
  faFilter,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
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

const Rapports = () => {
  // State for filters
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('leaves'); // 'leaves', 'balance', 'departments'
  
  // Charts references
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  // Fetch employees and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const employeesRes = await fetch('http://localhost:5001/dashboard/users', {
          method: 'GET',
          headers: { token: localStorage.token }
        });
        
        if (!employeesRes.ok) throw new Error('Failed to fetch employees');
        const employeesData = await employeesRes.json();
        setEmployees(employeesData);
        
        // Fetch departments
        const deptsRes = await fetch('http://localhost:5001/dashboard/departements', {
          method: 'GET',
          headers: { token: localStorage.token }
        });
        
        if (!deptsRes.ok) throw new Error('Failed to fetch departments');        const deptsData = await deptsRes.json();
        setDepartments(deptsData);
        
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
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      if (selectedEmployee) params.append('employeeId', selectedEmployee);
      if (selectedDepartment) params.append('departmentId', selectedDepartment);
      params.append('reportType', reportType);
      
      console.log('Generating report with params:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        employeeId: selectedEmployee || 'all',
        departmentId: selectedDepartment || 'all',
        reportType
      });
      
      // Fetch report data
      const res = await fetch(`http://localhost:5001/dashboard/reports?${params.toString()}`, {
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
      if ((reportType === 'leaves' && (!data.details || data.details.length === 0)) ||
          (reportType === 'balance' && (!data.details || data.details.length === 0)) ||
          (reportType === 'departments' && (!data.departments || data.departments.length === 0))) {
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
  
  // Generate mock data for demonstration
  const generateMockData = () => {
    // Mock data based on report type
    let mockData;
    
    switch (reportType) {
      case 'leaves':
        mockData = {
          title: 'Leave Requests Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            total: 24,
            approved: 18,
            rejected: 3,
            pending: 3
          },
          byDepartment: [
            { name: 'IT', count: 8, approved: 7, rejected: 1, pending: 0 },
            { name: 'HR', count: 5, approved: 4, rejected: 0, pending: 1 },
            { name: 'Finance', count: 6, approved: 4, rejected: 1, pending: 1 },
            { name: 'Marketing', count: 5, approved: 3, rejected: 1, pending: 1 }
          ],
          details: [
            { id: 1, employee: 'John Doe', department: 'IT', startDate: '2025-05-15', endDate: '2025-05-18', type: 'Annual Leave', status: 'Approved' },
            { id: 2, employee: 'Jane Smith', department: 'HR', startDate: '2025-05-20', endDate: '2025-05-25', type: 'Sick Leave', status: 'Approved' },
            { id: 3, employee: 'Michael Brown', department: 'Finance', startDate: '2025-05-22', endDate: '2025-05-23', type: 'Personal Leave', status: 'Rejected' },
            { id: 4, employee: 'Lisa Johnson', department: 'Marketing', startDate: '2025-06-01', endDate: '2025-06-05', type: 'Annual Leave', status: 'Pending' }
          ]
        };
        break;
      
      case 'balance':
        mockData = {
          title: 'Leave Balance Report',
          period: `As of ${new Date().toISOString().split('T')[0]}`,
          summary: {
            totalEmployees: 15,
            avgAnnualBalance: 18.5,
            avgSickBalance: 12.2
          },
          byDepartment: [
            { name: 'IT', avgAnnual: 17.2, avgSick: 14.5 },
            { name: 'HR', avgAnnual: 19.5, avgSick: 11.8 },
            { name: 'Finance', avgAnnual: 18.3, avgSick: 10.5 },
            { name: 'Marketing', avgAnnual: 19.0, avgSick: 12.0 }
          ],
          details: [
            { id: 1, employee: 'John Doe', department: 'IT', annualBalance: 18, sickBalance: 15, totalTaken: 12 },
            { id: 2, employee: 'Jane Smith', department: 'HR', annualBalance: 20, sickBalance: 12, totalTaken: 10 },
            { id: 3, employee: 'Michael Brown', department: 'Finance', annualBalance: 15, sickBalance: 10, totalTaken: 15 },
            { id: 4, employee: 'Lisa Johnson', department: 'Marketing', annualBalance: 22, sickBalance: 12, totalTaken: 8 }
          ]
        };
        break;
      
      case 'departments':
        mockData = {
          title: 'Department Leave Analysis',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalDepartments: 4,
            highestLeaves: 'IT (25 days)',
            lowestLeaves: 'Finance (18 days)'
          },
          departments: [
            { name: 'IT', totalDays: 25, employeeCount: 8, avgPerEmployee: 3.1 },
            { name: 'HR', totalDays: 20, employeeCount: 5, avgPerEmployee: 4.0 },
            { name: 'Finance', totalDays: 18, employeeCount: 6, avgPerEmployee: 3.0 },
            { name: 'Marketing', totalDays: 22, employeeCount: 6, avgPerEmployee: 3.7 }
          ]
        };
        break;
      
      default:
        mockData = { error: 'Invalid report type' };
    }
    
    setReportData(mockData);
  };  
  
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
      } else if (reportType === 'departments') {
        summaryData = [
          ['Total Departments', reportData.summary.totalDepartments],
          ['Highest Leave Usage', reportData.summary.highestLeaves],
          ['Lowest Leave Usage', reportData.summary.lowestLeaves]
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
      } else if (reportType === 'departments') {
        columns = ['Department', 'Total Days', 'Employee Count', 'Avg per Employee'];
        data = reportData.departments.map(dept => [
          dept.name,
          formatNumber(dept.totaldays) + ' days',
          formatNumber(dept.employeecount),
          formatNumber(parseFloat(dept.avgperemployee), 1) + ' days'
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
        } else if (reportType === 'departments') {
          detailsData.push(['Department', 'Total Days', 'Employee Count', 'Avg per Employee']);
          reportData.departments.forEach(dept => {
            detailsData.push([
              dept.name,
              formatNumber(dept.totaldays) + ' days',
              formatNumber(dept.employeecount),
              formatNumber(parseFloat(dept.avgperemployee), 1) + ' days'
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
    
    // Bar chart data
    const barData = {
      labels: reportData.byDepartment.map(dept => dept.name),
      datasets: [
        {
          label: 'Approved',
          data: reportData.byDepartment.map(dept => parseInt(dept.approved) || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Rejected',
          data: reportData.byDepartment.map(dept => parseInt(dept.rejected) || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Pending',
          data: reportData.byDepartment.map(dept => parseInt(dept.pending) || 0),
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
          borderColor: 'rgba(255, 206, 86, 1)',
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
  };
  // Prepare chart data for balance report
  const prepareBalanceChartData = () => {
    if (!reportData || reportType !== 'balance') return null;
    
    // Bar chart data
    const barData = {
      labels: reportData.byDepartment.map(dept => dept.name),
      datasets: [
        {
          label: 'Annual Leave Balance',
          data: reportData.byDepartment.map(dept => parseFloat(dept.avgannual || 0)),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Sick Leave Balance',
          data: reportData.byDepartment.map(dept => parseFloat(dept.avgsick || 0)),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return { barData };
  };
  // Prepare chart data for departments report
  const prepareDepartmentChartData = () => {
    if (!reportData || reportType !== 'departments') return null;
    
    // Bar chart data
    const barData = {
      labels: reportData.departments.map(dept => dept.name),
      datasets: [
        {
          label: 'Total Leave Days',
          data: reportData.departments.map(dept => parseInt(dept.totaldays || 0)),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
    
    // Pie chart data
    const pieData = {
      labels: reportData.departments.map(dept => dept.name),
      datasets: [
        {
          data: reportData.departments.map(dept => parseInt(dept.totaldays || 0)),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    return { barData, pieData };
  };
  
  // Get the appropriate chart data based on report type
  const getChartData = () => {
    switch (reportType) {
      case 'leaves':
        return prepareLeaveChartData();
      case 'balance':
        return prepareBalanceChartData();
      case 'departments':
        return prepareDepartmentChartData();
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
      
      case 'departments':
        return (
          <div className="report-details">
            <h3>Department Analysis Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Leave Days</th>
                  <th>Employee Count</th>
                  <th>Average per Employee</th>
                </tr>
              </thead>
              <tbody>                
                {reportData.departments.map((dept, index) => (
                  <tr key={index}>
                    <td>{dept.name}</td>
                    <td>{formatNumber(dept.totaldays)} days</td>
                    <td>{formatNumber(dept.employeecount)}</td>
                    <td>{formatNumber(parseFloat(dept.avgperemployee), 1)} days</td>
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

  return (
    <div className="rapports-container">
      <div className="rapports-header">
        <h2><FontAwesomeIcon icon={faChartLine} /> HR Reports Generator</h2>
        <p>Generate and export reports for leave management analysis</p>
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
              
              {reportType === 'departments' && (
                <>
                  <div className="summary-card">
                    <h4>Total Departments</h4>
                    <p>{reportData.summary.totalDepartments}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Highest Leave Usage</h4>
                    <p>{reportData.summary.highestLeaves}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Lowest Leave Usage</h4>
                    <p>{reportData.summary.lowestLeaves}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="charts-container">
            {getChartData() && getChartData().barData && (
              <div className="chart-wrapper">
                <h3>Distribution by Department</h3>
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
                <h3>{reportType === 'leaves' ? 'Status Distribution' : 'Department Distribution'}</h3>
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
