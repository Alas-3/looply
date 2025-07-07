"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestModeBanner } from "@/components/test-mode-banner";
import { ShiftTracker } from "@/components/shift-tracker";
import { authService } from "@/lib/services/auth";
import { eodService } from "@/lib/services/eod";
import type { User, EODReport, WorkShift } from "@/lib/types";
import { getTodayDate, formatDate } from "@/lib/utils";

export default function EmployeePage() {
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<EODReport | null>(null);
  const [previousReports, setPreviousReports] = useState<EODReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    summary: "",
    shifts: [] as WorkShift[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const authState = await authService.getAuthState();
        if (!authState.isAuthenticated || authState.user?.role !== "employee") {
          router.push("/auth");
          return;
        }

        setUser(authState.user);

        // Load today's report if it exists
        const todayReport = await eodService.getReport(
          authState.user.id,
          getTodayDate()
        );
        if (todayReport) {
          setReport(todayReport);
          setFormData({
            summary: todayReport.summary,
            shifts: todayReport.shifts || [],
          });
        }

        // Load previous reports
        if (authState.user.companyId) {
          const allReports = await eodService.getReports(
            authState.user.companyId,
            authState.user.id
          );
          const previousReports = allReports.filter(
            (r) => r.date !== getTodayDate()
          );
          setPreviousReports(previousReports);
        }
      } catch (error) {
        console.error("Failed to load employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleSaveDraft = useCallback(async () => {
    if (!user?.companyId) return;

    setSaving(true);
    try {
      const savedReport = await eodService.saveDraft(
        user.id,
        user.companyId,
        getTodayDate(),
        formData.summary,
        formData.shifts
      );
      setReport(savedReport);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setSaving(false);
    }
  }, [user?.id, user?.companyId, formData.summary, formData.shifts]);

  const handleSubmit = async () => {
    if (!user?.companyId || formData.shifts.length === 0) return;

    setSubmitting(true);
    try {
      await eodService.saveDraft(
        user.id,
        user.companyId,
        getTodayDate(),
        formData.summary,
        formData.shifts
      );
      const submittedReport = await eodService.submitReport(
        user.id,
        getTodayDate()
      );
      setReport(submittedReport);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  const handleSwitchTestMode = async (role: "employer" | "employee") => {
    try {
      await authService.testMode(role);
      if (role === "employer") {
        router.push("/dashboard");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to switch test mode:", error);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!user?.companyId || (!formData.summary && formData.shifts.length === 0))
      return;

    const timeoutId = setTimeout(() => {
      handleSaveDraft();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData.summary, formData.shifts, user?.companyId, handleSaveDraft]);

  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(":");
    const hourNum = Number.parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const calculateTotalHours = (shifts: WorkShift[]) => {
    return shifts.reduce((total, shift) => {
      const [startHour, startMin] = shift.startTime.split(":").map(Number);
      const [endHour, endMin] = shift.endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;

      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const totalMinutes =
        endMinutes - startMinutes - (shift.breakMinutes || 0);
      return total + Math.max(0, totalMinutes / 60);
    }, 0);
  };

  const formatHoursToHrsMins = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
      return `${wholeHours}hrs`;
    } else {
      return `${wholeHours}hrs ${minutes}mins`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isSubmitted = report?.status === "submitted";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Mode Banner */}
      {user?.id === "test-user" && (
        <TestModeBanner
          userRole="employee"
          onSwitchMode={handleSwitchTestMode}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">
                Looply
              </span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {today}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user?.name}
                </span>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Good morning, {user?.name}
          </h1>
        </div>

        {/* Mobile-First Layout: Right sidebar first on mobile, then previous reports */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Right Sidebar - Shows first on mobile, right side on desktop */}
          <div className="xl:col-span-1 xl:order-2">
            <div className="sticky top-24 space-y-6">
              {/* Employee Info Card */}
              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{user?.name}</h3>
                    {user?.position && (
                      <p className="text-sm text-gray-600">{user.position}</p>
                    )}
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-xs text-gray-500 mb-1">Access Code</p>
                      <code className="text-sm font-mono font-bold text-blue-600">
                        {user?.accessCode}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Report Form */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Today&apos;s Report
                    </CardTitle>
                    {isSubmitted && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Submitted
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isSubmitted ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-green-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-green-800 text-sm font-medium">
                            Report submitted!
                          </span>
                        </div>
                      </div>

                      <div>
                        <ShiftTracker
                          shifts={report?.shifts || []}
                          onShiftsChange={() => {}}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Summary
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                          {report?.summary}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        Submitted at{" "}
                        {report?.submittedAt
                          ? new Date(report.submittedAt).toLocaleTimeString()
                          : "Unknown time"}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <ShiftTracker
                          shifts={formData.shifts}
                          onShiftsChange={(shifts) =>
                            setFormData({ ...formData, shifts })
                          }
                          disabled={false}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Summary
                        </label>
                        <textarea
                          className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          placeholder="What did you accomplish today?"
                          value={formData.summary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              summary: e.target.value,
                            })
                          }
                        />
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-500">
                            {saving && (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-600"
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
                                Saving...
                              </span>
                            )}
                            {report?.status === "draft" && !saving && (
                              <span className="text-green-600">
                                Draft saved
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formData.summary.length} chars
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          onClick={handleSaveDraft}
                          disabled={saving}
                          size="sm"
                        >
                          {saving ? "Saving..." : "Save Draft"}
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            submitting ||
                            !formData.summary.trim() ||
                            formData.shifts.length === 0
                          }
                          size="sm"
                        >
                          {submitting ? "Submitting..." : "Submit Report"}
                        </Button>
                      </div>

                      {formData.shifts.length === 0 && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs">
                            ⚠️ Add at least one work shift to submit.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Previous Reports - Shows second on mobile, left side on desktop */}
          <div className="xl:col-span-3 xl:order-1">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>My Previous Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {previousReports.length === 0 ? (
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
                    <p className="text-gray-600">No previous reports found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previousReports.slice(0, 10).map((prevReport) => (
                      <div
                        key={prevReport.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                          <div>
                            <h3 className="font-medium">
                              {formatDate(prevReport.date)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatHoursToHrsMins(
                                prevReport.totalHours ||
                                  calculateTotalHours(prevReport.shifts || [])
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              prevReport.status === "submitted"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {prevReport.status}
                          </span>
                        </div>

                        {prevReport.shifts && prevReport.shifts.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Work Shifts:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {prevReport.shifts.map((shift, index) => (
                                <div
                                  key={`shift-${index}-${shift.startTime}-${shift.endTime}`}
                                  className="bg-blue-50 px-3 py-1 rounded-full text-sm"
                                >
                                  {formatTime(shift.startTime)} -{" "}
                                  {formatTime(shift.endTime)}
                                  {shift.breakMinutes &&
                                    shift.breakMinutes > 0 && (
                                      <span className="text-gray-600">
                                        {" "}
                                        ({shift.breakMinutes}min break)
                                      </span>
                                    )}
                                  {shift.description && (
                                    <span className="text-gray-600">
                                      {" "}
                                      - {shift.description}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-gray-700 text-sm line-clamp-3">
                          {prevReport.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
