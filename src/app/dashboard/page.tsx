"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/services/auth"
import { eodService } from "@/lib/services/eod"
import { companyService } from "@/lib/services/company"
import type { User, Company, Employee, EODReport, DashboardStats } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { EmployeeManagement } from "@/components/employee-management"
import { storage } from "@/lib/services/storage"
import { TestModeBanner } from "@/components/test-mode-banner"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [reports, setReports] = useState<EODReport[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const authState = await authService.getAuthState()
        if (!authState.isAuthenticated) {
          router.push("/auth")
          return
        }

        setUser(authState.user)
        setCompany(authState.company || null)

        if (authState.user?.companyId) {
          const [employeeList, reportList, dashboardStats] = await Promise.all([
            companyService.getEmployees(authState.user.companyId),
            eodService.getReports(authState.user.companyId),
            eodService.getDashboardStats(authState.user.companyId),
          ])

          setEmployees(employeeList)
          setReports(reportList)
          setStats(dashboardStats)
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleAddEmployee = async (name: string, email: string, position: string) => {
    if (!user?.companyId) return

    try {
      const employee = await companyService.addEmployee(user.companyId, name, email, position)
      setEmployees([...employees, employee])
    } catch (error) {
      console.error("Failed to add employee:", error)
    }
  }

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      await storage.remove(`employee:${employeeId}`)
      setEmployees(employees.filter((emp) => emp.id !== employeeId))

      // Also remove any reports from this employee
      const allReports = await storage.getAll<EODReport>("eod:")
      for (const report of allReports) {
        if (report.employeeId === employeeId) {
          await storage.remove(`eod:${report.id}`)
        }
      }

      // Refresh reports
      if (user?.companyId) {
        const updatedReports = await eodService.getReports(user.companyId)
        setReports(updatedReports)
      }
    } catch (error) {
      console.error("Failed to remove employee:", error)
    }
  }

  const handleSignOut = async () => {
    await authService.signOut()
    router.push("/")
  }

  const handleExportCSV = async () => {
    if (!user?.companyId) return

    try {
      const csvData = await eodService.exportToCSV(user.companyId)
      const blob = new Blob([csvData], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `eod-reports-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export CSV:", error)
    }
  }

  const filteredReports =
    selectedEmployee === "all" ? reports : reports.filter((report) => report.employeeId === selectedEmployee)

  const handleSwitchTestMode = async (role: "employer" | "employee") => {
    try {
      await authService.testMode(role)
      if (role === "employee") {
        router.push("/employee")
      } else {
        window.location.reload() // Reload to show employer data
      }
    } catch (error) {
      console.error("Failed to switch test mode:", error)
    }
  }

  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour)
    const ampm = hourNum >= 12 ? "PM" : "AM"
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    return `${displayHour}:${minute} ${ampm}`
  }

  interface Shift {
    id: string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    description?: string;
  }

  const calculateHoursFromShifts = (shifts: Shift[]): number => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Mode Banner */}
      {user?.id === "test-user" && <TestModeBanner userRole="employer" onSwitchMode={handleSwitchTestMode} />}
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">{company?.name || "Dashboard"}</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today&apos;s Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingEODs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Team</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageHours && !isNaN(stats.averageHours)
                        ? stats.averageHours.toFixed(1)
                        : "0.0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Management */}
        <div className="mb-8">
          <EmployeeManagement
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onRemoveEmployee={handleRemoveEmployee}
          />
        </div>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Reports</CardTitle>
              <div className="flex space-x-2">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                <Button variant="outline" onClick={handleExportCSV}>
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600">No reports found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => {
                  const employee = employees.find((emp) => emp.id === report.employeeId)
                  return (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{employee?.name || "Unknown Employee"}</h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(report.date)} •{" "}
                            {report.shifts && report.shifts.length > 0
                              ? calculateHoursFromShifts(report.shifts).toFixed(2)
                              : report.hoursWorked
                              ? report.hoursWorked.toFixed(2)
                              : "0.00"}{" "}
                            hours total
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === "submitted"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      {/* Shifts Display */}
                      {report.shifts && report.shifts.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">Work Shifts:</div>
                          <div className="flex flex-wrap gap-2">
                            {report.shifts.map((shift) => (
                              <div key={shift.id} className="bg-blue-50 px-3 py-1 rounded-full text-sm">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                {shift.breakMinutes && shift.breakMinutes > 0 && (
                                  <span className="text-gray-600"> ({shift.breakMinutes}min break)</span>
                                )}
                                {shift.description && <span className="text-gray-600"> - {shift.description}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-700">{report.summary}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
