import type { EODReport, DashboardStats, WorkShift, Employee } from "../types"
import { storage } from "./storage"

export class EODService {
  private static instance: EODService

  static getInstance(): EODService {
    if (!EODService.instance) {
      EODService.instance = new EODService()
    }
    return EODService.instance
  }

  // Change from private to public
  calculateTotalHours(shifts: WorkShift[]): number {
    return shifts.reduce((total, shift) => {
      const [startHour, startMin] = shift.startTime.split(":").map(Number)
      const [endHour, endMin] = shift.endTime.split(":").map(Number)

      const startMinutes = startHour * 60 + startMin
      let endMinutes = endHour * 60 + endMin

      // Handle overnight shifts
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60
      }

      const totalMinutes = endMinutes - startMinutes - (shift.breakMinutes || 0)
      return total + Math.max(0, totalMinutes / 60)
    }, 0)
  }

  async saveDraft(
    employeeId: string,
    companyId: string,
    date: string,
    summary: string,
    shifts: WorkShift[],
  ): Promise<EODReport> {
    const reportId = `${employeeId}-${date}`
    let report = await storage.get<EODReport>(`eod:${reportId}`)
    
    // Calculate hours from shifts
    const hoursWorked = this.calculateTotalHours(shifts)

    if (report) {
      report = {
        ...report,
        summary,
        shifts,
        hoursWorked,
        totalHours: hoursWorked, // Add totalHours property with same value
        updatedAt: new Date().toISOString(),
      }
    } else {
      report = {
        id: reportId,
        employeeId,
        companyId,
        date,
        summary,
        shifts,
        hoursWorked,
        totalHours: hoursWorked, // Add totalHours property with same value
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    await storage.set(`eod:${reportId}`, report)
    return report
  }

  async submitReport(
    employeeId: string,
    companyId: string,
    date: string,
    summary: string,
    shifts: WorkShift[],
  ): Promise<EODReport> {
    const reportId = `${employeeId}-${date}`
    
    // Calculate hours from shifts
    const hoursWorked = this.calculateTotalHours(shifts)
    
    const report: EODReport = {
      id: reportId,
      employeeId,
      companyId,
      date,
      summary,
      shifts,
      hoursWorked,
      totalHours: hoursWorked, // Add totalHours property with same value
      status: "submitted",
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await storage.set(`eod:${reportId}`, report)
    return report
  }

  async getReport(employeeId: string, date: string): Promise<EODReport | null> {
    const reportId = `${employeeId}-${date}`
    return await storage.get<EODReport>(`eod:${reportId}`)
  }

  async getReports(companyId: string, employeeId?: string, startDate?: string, endDate?: string): Promise<EODReport[]> {
    const allReports = await storage.getAll<EODReport>("eod:")
    let reports = allReports.filter((report) => report.companyId === companyId)

    if (employeeId) {
      reports = reports.filter((report) => report.employeeId === employeeId)
    }

    if (startDate) {
      reports = reports.filter((report) => report.date >= startDate)
    }

    if (endDate) {
      reports = reports.filter((report) => report.date <= endDate)
    }

    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    const reports = await this.getReports(companyId)
    const employees = await storage.getAll<Employee>("employee:")
    const companyEmployees = employees.filter((emp) => emp.companyId === companyId)
    const activeEmployees = companyEmployees.filter((emp) => emp.isActive !== false).length
    
    const today = new Date().toISOString().split('T')[0]
    const todayReports = reports.filter((report) => report.date === today)
    
    // Calculate total hours using shifts data when available
    let totalHours = 0
    reports.forEach(report => {
      if (report.shifts && report.shifts.length > 0) {
        // Use the same calculation method as in the component
        totalHours += this.calculateTotalHours(report.shifts)
      } else if (report.totalHours) {
        totalHours += report.totalHours
      } else if (report.hoursWorked) {
        totalHours += report.hoursWorked
      }
    })
    
    // Calculate average
    const averageHours = reports.length > 0 ? totalHours / reports.length : 0
    
    return {
      totalSubmissions: todayReports.length,
      pendingEODs: Math.max(0, activeEmployees - todayReports.length),
      activeEmployees,
      averageHours
    }
  }

  async exportToCSV(companyId: string): Promise<string> {
    const reports = await this.getReports(companyId)
    const employees = await storage.getAll<Employee>("employee:")

    const header = "Date,Employee,Total Hours,Shifts,Summary,Status\n"
    const rows = reports
      .map((report) => {
        const employee = employees.find((emp) => emp.id === report.employeeId)
        const shiftsText = report.shifts && report.shifts.length > 0
          ? report.shifts
              .map(
                (shift) =>
                  `${shift.startTime}-${shift.endTime}${shift.breakMinutes ? ` (${shift.breakMinutes}min break)` : ""}${shift.description ? ` - ${shift.description}` : ""}`,
              )
              .join("; ")
          : "";

        // Use totalHours, fallback to hoursWorked
        const hours = (report.totalHours || report.hoursWorked || 0).toFixed(2);
        
        // Escape quotes in summary to prevent CSV issues
        const escapedSummary = report.summary.replace(/"/g, '""');

        return `${report.date},"${employee?.name || "Unknown"}",${hours},"${shiftsText}","${escapedSummary}",${report.status}`
      })
      .join("\n")

    return header + rows
  }
}

export const eodService = EODService.getInstance()
