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

  private calculateTotalHours(shifts: WorkShift[]): number {
    if (!shifts || shifts.length === 0) return 0
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

    const totalHours = this.calculateTotalHours(shifts)

    if (report) {
      report.summary = summary
      report.shifts = shifts
      report.totalHours = totalHours
      report.updatedAt = new Date().toISOString()
    } else {
      report = {
        id: reportId,
        employeeId,
        companyId,
        date,
        summary,
        shifts,
        totalHours,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    await storage.set(`eod:${reportId}`, report)
    return report
  }

  async submitReport(employeeId: string, date: string): Promise<EODReport> {
    const reportId = `${employeeId}-${date}`
    const report = await storage.get<EODReport>(`eod:${reportId}`)

    if (!report) {
      throw new Error("Report not found")
    }

    report.status = "submitted"
    report.submittedAt = new Date().toISOString()
    report.updatedAt = new Date().toISOString()

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
    const today = new Date().toISOString().split("T")[0]
    const reports = await this.getReports(companyId)
    const todayReports = reports.filter((r) => r.date === today && r.status === "submitted")

    const employees = await storage.getAll<Employee>("employee:")
    const companyEmployees = employees.filter((emp) => emp.companyId === companyId && emp.isActive)

    // Calculate total hours properly
    const totalHours = todayReports.reduce((sum, report) => {
      const hours = report.totalHours || this.calculateTotalHours(report.shifts || [])
      return sum + hours
    }, 0)

    const averageHours = todayReports.length > 0 ? totalHours / todayReports.length : 0

    return {
      totalSubmissions: todayReports.length,
      pendingEODs: Math.max(0, companyEmployees.length - todayReports.length),
      activeEmployees: companyEmployees.length,
      averageHours,
    }
  }

  async exportToCSV(companyId: string): Promise<string> {
    const reports = await this.getReports(companyId)
    const employees = await storage.getAll<Employee>("employee:")

    const header = "Date,Employee,Total Hours,Shifts,Summary,Status\n"
    const rows = reports
      .map((report) => {
        const employee = employees.find((emp) => emp.id === report.employeeId)
        const totalHours = report.totalHours || this.calculateTotalHours(report.shifts || [])
        const shiftsText = (report.shifts || [])
          .map(
            (shift) =>
              `${shift.startTime}-${shift.endTime}${shift.breakMinutes ? ` (${shift.breakMinutes}min break)` : ""}${shift.description ? ` - ${shift.description}` : ""}`,
          )
          .join("; ")

        return `${report.date},"${employee?.name || "Unknown"}",${totalHours.toFixed(2)},"${shiftsText}","${report.summary}",${report.status}`
      })
      .join("\n")

    return header + rows
  }
}

export const eodService = EODService.getInstance()
