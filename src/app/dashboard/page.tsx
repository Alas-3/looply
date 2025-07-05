"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/services/auth"
import { eodService } from "@/lib/services/eod"
import { companyService } from "@/lib/services/company"
import type { User, Employee, EODReport, DashboardStats } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { storage } from "@/lib/services/storage"
import { TestModeBanner } from "@/components/test-mode-banner"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [reports, setReports] = useState<EODReport[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [showReports, setShowReports] = useState(false) // For mobile collapsible reports
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", position: "" })
  const router = useRouter()

  interface Shift {
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    id?: string;
    description?: string;
  }

  const calculateTotalHours = (shifts: Shift[]) => {
    if (!shifts || shifts.length === 0) return 0
    return shifts.reduce((total, shift) => {
      const [startHour, startMin] = shift.startTime.split(":").map(Number)
      const [endHour, endMin] = shift.endTime.split(":").map(Number)

      const startMinutes = startHour * 60 + startMin
      let endMinutes = endHour * 60 + endMin

      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60
      }

      const totalMinutes = endMinutes - startMinutes - (shift.breakMinutes || 0)
      return total + Math.max(0, totalMinutes / 60)
    }, 0)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const authState = await authService.getAuthState()
        if (!authState.isAuthenticated) {
          router.push("/auth")
          return
        }

        setUser(authState.user)
        setUser(authState.user)

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.companyId || !newEmployee.name.trim()) return

    try {
      const employee = await companyService.addEmployee(
        user.companyId,
        newEmployee.name,
        newEmployee.email,
        newEmployee.position,
      )
      setEmployees([...employees, employee])
      setNewEmployee({ name: "", email: "", position: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Failed to add employee:", error)
    }
  }

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      await storage.remove(`employee:${employeeId}`)
      setEmployees(employees.filter((emp) => emp.id !== employeeId))

      const allReports = await storage.getAll<EODReport>("eod:")
      for (const report of allReports) {
        if (report.employeeId === employeeId) {
          await storage.remove(`eod:${report.id}`)
        }
      }

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
      a.download = `Looply-reports-${new Date().toISOString().split("T")[0]}.csv`
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
        window.location.reload()
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

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const displayedMembers = showAllMembers ? employees : employees.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Mode Banner */}
      {user?.id === "test-user" && <TestModeBanner userRole="employer" onSwitchMode={handleSwitchTestMode} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">Looply</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-sm text-gray-600 hidden sm:inline">{currentDate}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.name}</span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Good morning, {user?.name}</h1>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600"
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
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Reports</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.pendingEODs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="w-4 h-4 lg:w-6 lg:h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Team</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Avg Hours</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.averageHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Dashboard Content */}
          <div className="xl:col-span-3">
            {/* Reports Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Reports</CardTitle>
                    {/* Mobile Toggle Button */}
                    <button
                      onClick={() => setShowReports(!showReports)}
                      className="xl:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${showReports ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="all">All Employees</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={handleExportCSV} size="sm">
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`${!showReports ? "hidden xl:block" : ""}`}>
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
                    {filteredReports.slice(0, 10).map((report) => {
                      const employee = employees.find((emp) => emp.id === report.employeeId)
                      const totalHours = report.totalHours || calculateTotalHours(report.shifts || [])
                      return (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div>
                              <h3 className="font-medium">{employee?.name || "Unknown Employee"}</h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(report.date)} • {totalHours.toFixed(2)} hours total
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === "submitted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {report.status}
                            </span>
                          </div>

                          {report.shifts && report.shifts.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Work Shifts:</div>
                              <div className="flex flex-wrap gap-2">
                                {report.shifts.map((shift, index) => (
                                  <div 
                                    // Use this composite key instead of just shift.id
                                    key={`${report.id}-shift-${index}`} 
                                    className="bg-blue-50 px-3 py-1 rounded-full text-sm"
                                  >
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

                          <p className="text-gray-700 text-sm line-clamp-2">{report.summary}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleExportCSV}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Add Employee
                  </Button>
                </CardContent>
              </Card>

              {/* Add Employee Form */}
              {showAddForm && (
                <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Employee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                          type="text"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="john@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Position</label>
                        <input
                          type="text"
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="Developer"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={!newEmployee.name.trim()}>
                          Add
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Team Members */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Team Members ({employees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {employees.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-600 text-sm">No team members yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedMembers.map((employee) => (
                        <div key={employee.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900 truncate">{employee.name}</h4>
                              {employee.position && (
                                <p className="text-xs text-gray-600 truncate">{employee.position}</p>
                              )}
                              {employee.email && <p className="text-xs text-gray-500 truncate">{employee.email}</p>}
                            </div>
                            <button
                              onClick={() => handleRemoveEmployee(employee.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove employee"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Access Code:</span>
                            <div className="flex items-center space-x-1">
                              <code className="text-xs bg-white px-2 py-1 rounded border font-mono">
                                {employee.accessCode}
                              </code>
                              <button
                                onClick={() => copyAccessCode(employee.accessCode)}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Copy code"
                              >
                                <svg
                                  className="w-3 h-3 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {employees.length > 5 && (
                        <button
                          onClick={() => setShowAllMembers(!showAllMembers)}
                          className="w-full flex items-center justify-center py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {showAllMembers ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Show Less
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              Show {employees.length - 5} More
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
