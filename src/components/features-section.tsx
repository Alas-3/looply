"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function FeaturesSection() {
  const [progress, setProgress] = useState(0)
  const [currentTeam, setCurrentTeam] = useState(0)
  const [currentWorkspace, setCurrentWorkspace] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)

  // Team member data for cycling
  const teamData = [
    [
      { name: "Sarah Johnson", status: "Active", color: "green", bgColor: "blue" },
      { name: "Mike Chen", status: "Break", color: "orange", bgColor: "orange" },
    ],
    [
      { name: "Alex Rivera", status: "On Vacation", color: "purple", bgColor: "purple" },
      { name: "Emma Davis", status: "Offline", color: "gray", bgColor: "gray" },
    ],
    [
      { name: "James Wilson", status: "In Meeting", color: "red", bgColor: "red" },
      { name: "Lisa Park", status: "Available", color: "green", bgColor: "green" },
    ],
    [
      { name: "David Kim", status: "Focused", color: "blue", bgColor: "blue" },
      { name: "Maria Garcia", status: "Lunch Break", color: "yellow", bgColor: "yellow" },
    ],
  ]

  // Workspace layouts with actual different structures
  const workspaceLayouts = [
    {
      // Layout 1: Card + Grid
      bgColor: "bg-yellow-400",
      textColor: "text-black",
      time: "04:21",
      dots: ["bg-red-500", "bg-black"],
      layout: "card-grid",
      stats: ["85", "09", "—"],
      statsColor: "bg-gray-100",
    },
    {
      // Layout 2: Vertical Stack
      bgColor: "bg-purple-500",
      textColor: "text-white",
      time: "12:45",
      dots: ["bg-green-400", "bg-blue-400"],
      layout: "vertical-stack",
      stats: ["92", "15", "✓"],
      statsColor: "bg-purple-100",
    },
    {
      // Layout 3: Horizontal Bar
      bgColor: "bg-emerald-500",
      textColor: "text-white",
      time: "08:30",
      dots: ["bg-orange-400", "bg-pink-400"],
      layout: "horizontal-bar",
      stats: ["76", "23", "★"],
      statsColor: "bg-emerald-100",
    },
    {
      // Layout 4: Circle Layout
      bgColor: "bg-blue-600",
      textColor: "text-white",
      time: "16:15",
      dots: ["bg-yellow-400", "bg-red-400"],
      layout: "circle-layout",
      stats: ["94", "07", "◆"],
      statsColor: "bg-blue-100",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1

        // Trigger team flip at specific progress points
        if (newProgress % 25 === 0 && newProgress <= 100) {
          setIsFlipping(true)
          setTimeout(() => {
            setCurrentTeam(Math.floor(newProgress / 25) % teamData.length)
            setIsFlipping(false)
          }, 300)
        }

        // Change workspace theme at specific intervals (sync with team changes)
        if (newProgress % 25 === 0) {
          setCurrentWorkspace(Math.floor(newProgress / 25) % workspaceLayouts.length)
        }

        // Reset when reaching 100%
        if (newProgress > 100) {
          setTimeout(() => {
            setCurrentTeam(0)
            setCurrentWorkspace(0)
          }, 500)
          return 0
        }

        return newProgress
      })
    }, 120) // Smooth 120ms intervals for buttery animation

    return () => clearInterval(interval)
  }, [])

  // Fix the math to properly reach 100% and fill all 7 bars
  const filledDays = Math.min(Math.ceil((progress / 100) * 7), 7)
  const displayProgress = Math.min(Math.round(progress), 100)
  const currentLayout = workspaceLayouts[currentWorkspace]
  const currentTeamMembers = teamData[currentTeam % teamData.length]

  // Render different workspace layouts
  const renderWorkspaceLayout = () => {
    const layout = currentLayout.layout

    switch (layout) {
      case "card-grid":
        return (
          <>
            <div
              className={`${currentLayout.bgColor} rounded-lg p-3 mb-2 relative transition-all duration-700 ease-in-out`}
            >
              <div className={`text-xs font-bold ${currentLayout.textColor} transition-colors duration-500`}>
                {currentLayout.time}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {currentLayout.dots.map((dotColor, index) => (
                  <div key={index} className={`w-2 h-2 ${dotColor} rounded-full transition-all duration-700`}></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {currentLayout.stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${currentLayout.statsColor} rounded p-2 text-xs transition-all duration-700`}
                >
                  {stat}
                </div>
              ))}
            </div>
          </>
        )

      case "vertical-stack":
        return (
          <div className="space-y-2">
            <div className={`${currentLayout.bgColor} rounded-lg p-2 transition-all duration-700 ease-in-out`}>
              <div className={`text-xs font-bold ${currentLayout.textColor}`}>{currentLayout.time}</div>
            </div>
            <div className="flex justify-center space-x-1">
              {currentLayout.dots.map((dotColor, index) => (
                <div key={index} className={`w-3 h-3 ${dotColor} rounded-full transition-all duration-700`}></div>
              ))}
            </div>
            <div className="flex justify-between">
              {currentLayout.stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${currentLayout.statsColor} rounded-full w-8 h-8 flex items-center justify-center text-xs transition-all duration-700`}
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        )

      case "horizontal-bar":
        return (
          <div className="space-y-3">
            <div
              className={`${currentLayout.bgColor} rounded-full px-4 py-2 flex items-center justify-between transition-all duration-700 ease-in-out`}
            >
              <div className={`text-xs font-bold ${currentLayout.textColor}`}>{currentLayout.time}</div>
              <div className="flex space-x-1">
                {currentLayout.dots.map((dotColor, index) => (
                  <div key={index} className={`w-2 h-2 ${dotColor} rounded-full transition-all duration-700`}></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {currentLayout.stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${currentLayout.statsColor} rounded-full p-1 text-xs text-center transition-all duration-700`}
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        )

      case "circle-layout":
        return (
          <div className="relative">
            <div
              className={`${currentLayout.bgColor} rounded-full w-20 h-20 mx-auto flex flex-col items-center justify-center transition-all duration-700 ease-in-out`}
            >
              <div className={`text-xs font-bold ${currentLayout.textColor}`}>{currentLayout.time}</div>
              <div className="flex space-x-1 mt-1">
                {currentLayout.dots.map((dotColor, index) => (
                  <div key={index} className={`w-1.5 h-1.5 ${dotColor} rounded-full transition-all duration-700`}></div>
                ))}
              </div>
            </div>
            <div className="flex justify-center space-x-2 mt-2">
              {currentLayout.stats.map((stat, index) => (
                <div
                  key={index}
                  className={`${currentLayout.statsColor} rounded p-1 text-xs transition-all duration-700`}
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Keep everything in one place</h2>
          <p className="text-xl text-gray-600">Forget complex employee management tools.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Real-time Collaboration - Animated */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 h-64 flex items-center justify-center overflow-hidden">
              <div className="w-full">
                <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Team Workspace</div>
                      <div className="text-xs text-gray-500">5 members</div>
                    </div>
                  </div>
                  <div
                    className={`space-y-2 transition-all duration-300 ease-in-out ${
                      isFlipping ? "transform -translate-y-2 opacity-0" : "transform translate-y-0 opacity-100"
                    }`}
                    style={{
                      transform: isFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {currentTeamMembers.map((member, index) => (
                      <div key={`${currentTeam}-${index}`} className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 bg-${member.color}-500 rounded-full transition-colors duration-500`}
                        ></div>
                        <span className="text-xs text-gray-700 transition-all duration-300">{member.name}</span>
                        <span
                          className={`text-xs text-${member.color}-500 bg-${member.color}-100 px-2 py-1 rounded transition-all duration-500`}
                        >
                          {member.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Collaboration</h3>
            <p className="text-gray-600">
              Work together with your team effortlessly, share tasks, and update progress in real-time.
            </p>
          </div>

          {/* Time Management Tools - Fixed Progress Animation */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 h-64 flex items-center justify-center">
              <div className="w-full">
                <div className="text-sm font-medium text-gray-900 mb-4">Weekly Schedule</div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="text-xs text-gray-500 text-center">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded transition-all duration-500 ease-out ${
                        i < filledDays ? "bg-blue-500 transform scale-105" : "bg-gray-200"
                      }`}
                      style={{
                        transitionDelay: `${i * 50}ms`,
                      }}
                    ></div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <span className="text-orange-600 font-bold text-sm transition-all duration-300">
                        {displayProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Management Tools</h3>
            <p className="text-gray-600">
              Optimize your time with integrated tools like timers, reminders, and schedules.
            </p>
          </div>

          {/* Customizable Workspaces - Fixed Layout Changes */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 h-64 flex items-center justify-center">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-900 transition-all duration-300">Themes</span>
                  <span className="text-sm font-medium text-gray-900 transition-all duration-300">Widgets</span>
                  <span className="text-sm font-medium text-gray-900 transition-all duration-300">Layout</span>
                </div>
                <div className="transition-all duration-700 ease-in-out">{renderWorkspaceLayout()}</div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Customizable Workspaces</h3>
            <p className="text-gray-600">
              Personalize your dashboard with themes, widgets, and layouts that work for you.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-8">and a lot more features...</p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl apple-button hover-lift"
            >
              Explore all features
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
