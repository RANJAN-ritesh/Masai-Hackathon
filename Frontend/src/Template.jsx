import React, { useState, useContext } from "react";
import {
  Clock,
  Trophy,
  Users,
  Flame,
  Video,
  Youtube,
  Slack,
  Code,
  Database,
  TestTube,
  ChevronRight,
  Github,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { MyContext } from "../context/AuthContextProvider";
import CountDownTimer from "./CountDownTimer";

function App() {
  const { hackathon } = useContext(MyContext);
  const [activeTab, setActiveTab] = useState("fri");

  const leaderboardData = [
    { rank: 1, team: "Team 6", streak: 15 },
    { rank: 2, team: "Team 8", streak: 15 },
    { rank: 3, team: "Team 1", streak: 13 },
    { rank: 4, team: "Team 3", streak: 12 },
    { rank: 5, team: "Team 4", streak: 9 },
    { rank: 6, team: "Team 5", streak: 6 },
    { rank: 7, team: "Team 7", streak: 6 },
    { rank: 8, team: "Team 9", streak: 4 },
    { rank: 9, team: "Team 10", streak: 3 },
    { rank: 10, team: "Team 2", streak: 2 },
  ];

  const scheduleData = {
    fri: [
      { time: "9:00 AM", event: "Opening Ceremony" },
      { time: "10:00 AM", event: "Team Formation" },
      { time: "11:00 AM", event: "Workshop 1: Introduction to React" },
      { time: "1:00 PM", event: "Lunch Break" },
      { time: "2:00 PM", event: "Coding Session Begins" },
      { time: "6:00 PM", event: "Progress Check-in" },
      { time: "8:00 PM", event: "Dinner" },
    ],
    sat: [
      { time: "9:00 AM", event: "Morning Stand-up" },
      { time: "10:00 AM", event: "Workshop 2: API Integration" },
      { time: "12:00 PM", event: "Lunch Break" },
      { time: "1:00 PM", event: "Mentoring Sessions" },
      { time: "4:00 PM", event: "Progress Presentations" },
      { time: "7:00 PM", event: "Dinner & Networking" },
    ],
    sun: [
      { time: "9:00 AM", event: "Final Coding Sprint" },
      { time: "12:00 PM", event: "Lunch Break" },
      { time: "1:00 PM", event: "Project Submission Deadline" },
      { time: "2:00 PM", event: "Project Presentations" },
      { time: "5:00 PM", event: "Judging" },
      { time: "6:30 PM", event: "Awards Ceremony & Closing" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">
              <span className="text-black">xto</span>
              <span className="text-red-500">10x</span>
            </h1>
            <span className="text-gray-500 text-sm ml-2">by masai</span>
          </div>
          <div>
            <div className="text-xl font-semibold">
              Hackathon <span className="text-red-500">Feb 2025</span>
            </div>
            <div className="text-gray-600 text-sm">
              Code, Collaborate, Conquer!
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition">
              Select Team
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
              Register Team
            </button>
          </div>
        </div>
      </header>

      {/* Countdown Timer */}
      <CountDownTimer />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hero Section */}
        <div className="lg:col-span-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl p-8 shadow-lg">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold mb-4">
              Transform Ideas into Reality
            </h2>
            <p className="text-xl mb-6">
              Join the most exciting hackathon of 2025 and showcase your skills,
              creativity, and innovation.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-red-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition transform hover:scale-105">
                Register Now
              </button>
              <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Problem Statements */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Problem Statements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer">
              <div className="bg-blue-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Code size={24} />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Frontend
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Build innovative UI/UX solutions with modern frameworks
              </p>
              <button className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-800">
                View Challenges <ChevronRight size={16} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer">
              <div className="bg-purple-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Data Analytics
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                Extract insights from complex datasets
              </p>
              <button className="flex items-center text-purple-600 font-medium text-sm hover:text-purple-800">
                View Challenges <ChevronRight size={16} />
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer">
              <div className="bg-green-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TestTube size={24} />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                SDET
              </h3>
              <p className="text-green-700 text-sm mb-4">
                Create robust testing frameworks and automation
              </p>
              <button className="flex items-center text-green-600 font-medium text-sm hover:text-green-800">
                View Challenges <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Event Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Event Schedule
          </h2>
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${
                activeTab === "fri"
                  ? "border-b-2 border-red-500 text-red-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("fri")}
            >
              Fri
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "sat"
                  ? "border-b-2 border-red-500 text-red-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("sat")}
            >
              Sat
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "sun"
                  ? "border-b-2 border-red-500 text-red-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("sun")}
            >
              Sun
            </button>
          </div>
          <div className="space-y-3">
            {scheduleData[activeTab].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-100 pb-2"
              >
                <div className="text-gray-700 font-medium">{item.time}</div>
                <div className="text-gray-900">{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between">
            <div className="flex items-center">
              <Trophy size={18} className="text-yellow-500 mr-2" />
              <span className="font-medium text-gray-700">Rank</span>
            </div>
            <div className="flex items-center">
              <Users size={18} className="text-blue-500 mr-2" />
              <span className="font-medium text-gray-700">Team</span>
            </div>
            <div className="flex items-center">
              <Flame size={18} className="text-red-500 mr-2" />
              <span className="font-medium text-gray-700">Streak</span>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <div className="w-16 text-center">
                  {item.rank === 1 && (
                    <span className="text-yellow-500 font-bold">
                      {item.rank}
                    </span>
                  )}
                  {item.rank === 2 && (
                    <span className="text-gray-400 font-bold">{item.rank}</span>
                  )}
                  {item.rank === 3 && (
                    <span className="text-amber-600 font-bold">
                      {item.rank}
                    </span>
                  )}
                  {item.rank > 3 && (
                    <span className="text-gray-700">{item.rank}</span>
                  )}
                </div>
                <div className="flex-1 text-center font-medium text-gray-800">
                  {item.team}
                </div>
                <div className="w-16 text-center text-red-500 font-medium">
                  {item.streak}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media & Connect */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Connect With Us
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <a
              href="https://us06web.zoom.us/j/82747654356"
              className="flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
            >
              <Video size={20} />
              <span>Zoom</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-center gap-2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
            >
              <Youtube size={20} />
              <span>YouTube</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-center gap-2 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition"
            >
              <Slack size={20} />
              <span>Slack</span>
            </a>
            <a
              href="#"
              className="flex items-center justify-center gap-2 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>
          </div>

          <h3 className="font-medium text-gray-700 mb-3">Follow Us</h3>
          <div className="flex justify-between">
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </main>

      {/* Interactive Element */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Ready to Showcase Your Skills?
          </h2>
          <div className="max-w-3xl mx-auto mb-10 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <p className="text-lg mb-6">
              Join our hackathon and get a chance to win amazing prizes worth
              $10,000!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold text-xl mb-2">1st Prize</h3>
                <p className="text-2xl font-bold text-yellow-400">$5,000</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold text-xl mb-2">2nd Prize</h3>
                <p className="text-2xl font-bold text-gray-300">$3,000</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold text-xl mb-2">3rd Prize</h3>
                <p className="text-2xl font-bold text-amber-600">$2,000</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md font-bold transition transform hover:scale-105">
              Register Your Team
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-8 py-3 rounded-md font-bold transition transform hover:scale-105">
              Download Brochure
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold">
                <span className="text-white">xto</span>
                <span className="text-red-500">10x</span>
              </h1>
              <p className="text-gray-400 text-sm">
                © 2025 Masai School. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Rules
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                FAQ
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
