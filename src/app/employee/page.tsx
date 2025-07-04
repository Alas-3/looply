"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestModeBanner } from "@/components/test-mode-banner"
import { ShiftTracker } from "@/components/shift-tracker"
import { authService } from "@/lib/services/auth"
import { eodService } from "@/lib/services/eod"
import type { User, EODReport, WorkShift } from "@/lib/types"
import { getTodayDate } from "@/lib/utils"

export default function EmployeePage() {
  const [user, setUser] = useState<User | null>(null)
  const [report, setReport] = useState<EODReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    summary: "",
    shifts: [] as WorkShift[],
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const authState = await authService.getAuthState()
        if (!authState.isAuthenticated || authState.user?.role !== "employee") {
          router.push("/auth")
          return
        }

        setUser(authState.user)

        // Load today's report if it exists
        const todayReport = await eodService.getReport(authState.user.id, getTodayDate())
        if (todayReport) {
          setReport(todayReport)
          setFormData({
            summary: todayReport.summary,
            shifts: todayReport.shifts || [],
          })
        }
      } catch (error) {
        console.error("Failed to load employee data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleSaveDraft = async () => {
    if (!user?.companyId) return

    setSaving(true)
    try {
      const savedReport = await eodService.saveDraft(
        user.id,
        user.companyId,
        getTodayDate(),
        formData.summary,
        formData.shifts,
      )
      setReport(savedReport)
    } catch (error) {
      console.error("Failed to save draft:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!user?.companyId || formData.shifts.length === 0) return

    setSubmitting(true)
    try {
      // Save current data first
      await eodService.saveDraft(user.id, user.companyId, getTodayDate(), formData.summary, formData.shifts)

      // Then submit
      const submittedReport = await eodService.submitReport(
        user.id,
        user.companyId,
        getTodayDate(),
        formData.summary,
        formData.shifts
      )
      setReport(submittedReport)
    } catch (error) {
      console.error("Failed to submit report:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    await authService.signOut()
    router.push("/")
  }

  // Auto-save functionality
  useEffect(() => {
    if (!user?.companyId || (!formData.summary && formData.shifts.length === 0)) return

    const timeoutId = setTimeout(() => {
      handleSaveDraft()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [formData.summary, formData.shifts])

  const handleSwitchTestMode = async (role: "employer" | "employee") => {
    try {
      await authService.testMode(role)
      if (role === "employer") {
        router.push("/dashboard")
      } else {
        window.location.reload() // Reload to show employee data
      }
    } catch (error) {
      console.error("Failed to switch test mode:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const isSubmitted = report?.status === "submitted"
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const totalHours = formData.shifts.reduce((total, shift) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Mode Banner */}
      {user?.id === "test-user" && <TestModeBanner userRole="employee" onSwitchMode={handleSwitchTestMode} />}
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">EOD Report</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>End of Day Report - {today}</span>
              {isSubmitted && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Submitted
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSubmitted ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium">Report submitted successfully!</span>
                  </div>
                </div>

                <div>
                  <ShiftTracker shifts={report?.shifts || []} onShiftsChange={() => {}} disabled={true} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Summary</label>
                  <div className="p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">{report?.summary}</div>
                </div>

                <div className="text-sm text-gray-600">
                  Submitted at{" "}
                  {report?.submittedAt ? new Date(report.submittedAt).toLocaleTimeString() : "Unknown time"}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <ShiftTracker
                    shifts={formData.shifts}
                    onShiftsChange={(shifts) => setFormData({ ...formData, shifts })}
                    disabled={false}
                  />
                  {formData.shifts.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Total hours: <span className="font-medium">{totalHours.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">What did you accomplish today?</label>
                  <textarea
                    className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    placeholder="Describe your key accomplishments, challenges faced, and any important updates..."
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-500">
                      {saving && (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving draft...
                        </span>
                      )}
                      {report?.status === "draft" && !saving && <span className="text-green-600">Draft saved</span>}
                    </div>
                    <div className="text-sm text-gray-500">{formData.summary.length} characters</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Attachments (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <svg
                      className="w-8 h-8 text-gray-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-600">Drag and drop files here, or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Coming soon - file upload functionality</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                    {saving ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !formData.summary.trim() || formData.shifts.length === 0}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>

                {formData.shifts.length === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Please add at least one work shift before submitting your report.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
