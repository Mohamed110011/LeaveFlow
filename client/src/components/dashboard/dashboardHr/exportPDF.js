// Export as PDF
const exportPDF = (reportData, reportType, formatDate, formatNumber, toast) => {
  if (!reportData) {
    toast.warning('Please generate a report first');
    return;
  }
  
  toast.info('Exporting as PDF...');
  
  // Import both modules and then use them
  return Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]).then(([jsPDFModule]) => {
    // Initialize jsPDF
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF();
    
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
    
    // Use the autoTable function from the plugin
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid'
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
    
    doc.autoTable({
      startY: finalY + 15,
      head: [columns],
      body: data,
      theme: 'grid'
    });
    
    // Save the PDF
    doc.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success('PDF exported successfully');  });
};

export default exportPDF;
