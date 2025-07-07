"use client"

import { useState, useEffect } from "react";

export function DashboardPreview() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Format time as hh:MM:SS AM/PM
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl p-4 sm:p-8 relative overflow-hidden">
        {/* Calendar number floating element */}
        <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-lg p-4 w-16 h-20 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">
            {currentTime.getDate()}
          </span>
        </div>

        {/* Main Dashboard Screenshot */}
        <div className="bg-white rounded-2xl shadow-2xl mx-auto max-w-5xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="font-semibold text-gray-900">Looply</span>
                <span className="text-gray-500 hidden sm:inline">•</span>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    A
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  Amanda
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="w-full lg:w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Overview</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                    />
                  </svg>
                  <span className="text-sm">Home</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
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
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="text-sm">My Reports</span>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    23
                  </span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm">Team</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Good morning, Amanda
                </h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* EOD Reports Section */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        📝 EOD Reports
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Time tracker
                        </span>
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* Time Display - Now using real-time */}
                    <div className="text-center mb-6">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        {formattedTime}
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 9v6l4 2"
                            />
                          </svg>
                        </button>
                        <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                        </button>
                      </div>
                    </div>

                    {/* Report List */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 flex-1">
                          Finish the sales presentation for the new client
                          meeting at 2:00 PM
                        </span>
                        <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 flex-1">
                          Send follow-up emails to prospective clients
                        </span>
                        <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 flex-1">
                          Review the marketing team&apos;s campaign
                          proposal
                        </span>
                        <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity & Stats */}
                <div className="space-y-6">
                  {/* Activity Chart */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Activity
                      </h3>
                      <span className="text-xs text-gray-500">
                        weekly view
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <svg
                          className="w-20 h-20 transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray="220"
                            strokeDashoffset="66"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="28"
                            stroke="#10b981"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="176"
                            strokeDashoffset="88"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="21"
                            stroke="#f59e0b"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="132"
                            strokeDashoffset="53"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>29/40</div>
                        <div>8/12</div>
                        <div>4/7</div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Assigned */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Tasks I&apos;ve assigned
                    </h3>
                    <div className="space-y-4">
                      {/* Orange task */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-700">
                            Campaign idea
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            60%
                          </span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Yellow task */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-700">
                            Change button
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            30%
                          </span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full"
                              style={{ width: "30%" }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Green task */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-700">
                            Buy the office
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            90%
                          </span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full"
                              style={{ width: "90%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Email Widget */}
        <div className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 bg-white rounded-2xl shadow-lg p-4 w-16 h-16 flex items-center justify-center">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}