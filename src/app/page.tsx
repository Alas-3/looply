"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeaturesSection } from "@/components/features-section";
import { DashboardPreview } from "@/components/dashboard-preview";

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 h-1 bg-blue-600 z-50" style={{ width: `${scrollProgress}%` }}></div>
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">Looply</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#solutions"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Solutions
              </a>
              <a
                href="#resources"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Resources
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Get demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Floating Elements */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Floating Sticky Note - Left */}
          <div className="absolute -left-4 top-8 transform -rotate-6 hidden lg:block">
            <div
              className="bg-yellow-200 p-4 rounded-lg shadow-lg"
              style={{ width: "200px", height: "160px" }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
              <div className="pt-2 font-handwriting text-gray-800 text-sm leading-relaxed">
                <div className="handwriting-text">
                  Track daily progress,
                  <br />
                  monitor team performance,
                  <br />
                  and streamline EOD
                  <br />
                  reports with ease.
                </div>
              </div>
            </div>
          </div>

          {/* Floating Checkmark Icon - Left */}
          <div className="absolute left-12 top-64 hidden lg:block">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Central App Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight relative z-10">
            Monitor, track, and report
            <br />
            <span className="text-gray-500">all in one place</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Efficiently manage employee performance and streamline daily
            reporting.
          </p>

          <Link href="/auth">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
            >
              Stay in the loop now
            </Button>
          </Link>

          {/* Floating Reports Widget - Right */}
          <div className="absolute -right-4 top-12 hidden lg:block z-0">
            <div
              className="bg-white rounded-2xl shadow-lg p-4"
              style={{ width: "240px" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Reports</h3>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600"
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
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Today&apos;s EOD</div>
                <div className="text-xs text-blue-500">⏰ 15:00 - 18:45</div>
              </div>
            </div>
          </div>

          {/* Floating Today's Team Widget - Bottom Left */}
          <div className="absolute left-0 bottom-0 top-85 hidden lg:block">
            <div
              className="bg-white rounded-2xl shadow-lg p-4"
              style={{ width: "280px" }}
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                Today&apos;s Team
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Sarah - Frontend Dev
                    </span>
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full border border-white"></div>
                      <div className="w-5 h-5 bg-green-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">8.5h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Mike - Backend Dev
                    </span>
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-purple-500 rounded-full border border-white"></div>
                      <div className="w-5 h-5 bg-orange-500 rounded-full border border-white"></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">7.2h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-green-500 h-1 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Integrations Widget - Bottom Right */}
          <div className="absolute right-0 bottom-0 hidden lg:block">
            <div
              className="bg-white rounded-2xl shadow-lg p-4"
              style={{ width: "200px" }}
            >
              <h3 className="font-semibold text-gray-900 mb-3">
                50+ Integrations
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {/* Slack-style icon */}
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <div
                    className="w-6 h-6 bg-purple-600 rounded"
                    style={{
                      clipPath:
                        "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                    }}
                  ></div>
                </div>
                {/* Teams-style icon */}
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                </div>
                {/* Calendar-style icon */}
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-600 rounded flex flex-col items-center justify-center">
                    <div className="w-4 h-1 bg-white rounded-full mb-1"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                {/* Email-style icon */}
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
                {/* Analytics-style icon */}
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
                {/* Plus icon for more */}
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section - Product Showcase */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4">
              Solutions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Solve your team&apos;s
              <br />
              biggest challenges
            </h2>

            {/* Three benefit points */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  Keep your team aligned
                </h3>
                <p className="text-gray-600 text-sm">
                  Ensure your team is always on the same page with transparent
                  reporting and real-time updates.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Prioritize and manage tasks
                </h3>
                <p className="text-gray-600 text-sm">
                  Effectively track daily activities so your team can focus on
                  what matters most.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Hold everyone accountable
                </h3>
                <p className="text-gray-600 text-sm">
                  Monitor performance without the need for constant check-ins
                  and micromanagement.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <DashboardPreview />
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to streamline your team monitoring?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join teams who&apos;ve transformed their employee performance
            tracking with Looply
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg rounded-xl border-2 bg-transparent"
              >
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-xl text-gray-900">Looply</span>
          </div>
          <p className="text-gray-600 mb-4">
            Streamline employee performance monitoring with Looply
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Looply. Built for modern teams who value efficiency.
          </p>
        </div>
      </footer>
    </div>
  );
}
