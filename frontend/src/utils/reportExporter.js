// Report Export Utility Functions
export const exportToPDF = (data) => {
  // This would integrate with a PDF generation library like jsPDF
  console.log('Exporting to PDF:', data)
  // For now, we'll create a simple text-based report
  const reportContent = generateReportContent(data)
  downloadTextFile(reportContent, 'analytics-report.txt')
}

export const exportToExcel = (data) => {
  // This would integrate with a library like xlsx
  console.log('Exporting to Excel:', data)
  const reportContent = generateReportContent(data)
  downloadTextFile(reportContent, 'analytics-report.csv')
}

const generateReportContent = (data) => {
  const { dateRange, metrics, applications, jobs } = data
  
  let content = `ANALYTICS REPORT\n`
  content += `Generated: ${new Date().toLocaleDateString()}\n`
  content += `Date Range: ${dateRange}\n`
  content += `\n${'='.repeat(50)}\n\n`
  
  // Key Metrics
  content += `KEY METRICS\n`
  content += `-`.repeat(20) + `\n`
  content += `Total Applications: ${metrics.totalApplications}\n`
  content += `Acceptance Rate: ${metrics.acceptanceRate}%\n`
  content += `Rejection Rate: ${metrics.rejectionRate}%\n`
  content += `Application Rate: ${metrics.applicationRate}%\n`
  content += `Average Response Time: ${metrics.avgResponseTime} days\n`
  content += `Time to Hire: ${metrics.timeToHire} days\n`
  content += `Active Jobs: ${metrics.activeJobs}\n`
  content += `Pending Applications: ${metrics.pendingApplications}\n`
  content += `Accepted Applications: ${metrics.acceptedApplications}\n`
  content += `Rejected Applications: ${metrics.rejectedApplications}\n\n`
  
  // Applications Data
  content += `APPLICATIONS DATA\n`
  content += `-`.repeat(20) + `\n`
  applications.forEach((app, index) => {
    content += `${index + 1}. ${app.candidate_name} - ${app.job?.title || 'Unknown Job'}\n`
    content += `   Status: ${app.status}\n`
    content += `   Applied: ${new Date(app.created_at).toLocaleDateString()}\n`
    if (app.cover_letter) {
      content += `   Cover Letter: ${app.cover_letter.substring(0, 100)}...\n`
    }
    content += `\n`
  })
  
  // Jobs Data
  content += `JOBS DATA\n`
  content += `-`.repeat(20) + `\n`
  jobs.forEach((job, index) => {
    content += `${index + 1}. ${job.title}\n`
    content += `   Company: ${job.company?.name || 'Unknown'}\n`
    content += `   Location: ${job.location || 'Not specified'}\n`
    content += `   Status: ${job.status}\n`
    content += `   Posted: ${new Date(job.created_at).toLocaleDateString()}\n`
    content += `   Applications: ${applications.filter(app => app.job_id === job.id).length}\n`
    content += `\n`
  })
  
  return content
}

const downloadTextFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Future: Integration with actual PDF/Excel libraries
export const generatePDFReport = async (data) => {
  // This would use jsPDF or similar library
  // const doc = new jsPDF()
  // doc.text('Analytics Report', 20, 20)
  // ... more PDF generation code
  // doc.save('analytics-report.pdf')
  
  // For now, fallback to text export
  exportToPDF(data)
}

export const generateExcelReport = async (data) => {
  // This would use xlsx or similar library
  // const wb = XLSX.utils.book_new()
  // const ws = XLSX.utils.json_to_sheet(data.applications)
  // XLSX.utils.book_append_sheet(wb, ws, 'Applications')
  // XLSX.writeFile(wb, 'analytics-report.xlsx')
  
  // For now, fallback to CSV export
  exportToExcel(data)
}
