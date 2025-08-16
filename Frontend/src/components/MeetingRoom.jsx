import React, { useState } from "react";
import { Users, Code2, Video, Home, ArrowRight } from "lucide-react";

function MeetingRoom() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [ZoomMtg, setZoomMtg] = useState(null);

  const config = {
    authEndpoint: "https://zoom-meeting-sdk-auth-sample-b148.onrender.com",
    sdkKey: "eFXUkNucQ5GS7vyF4wzT5Q",
    meetingNumber: "5024406023",
    passWord: "n3wffi",
    role: 0,
    userName: localStorage.getItem("userData")
      ? JSON.parse(localStorage.getItem("userData")).name
      : "Guest User",
    leaveUrl: "https://xto10x.masaischool.com/",
  };

  const generateUniqueName = (name) => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `${name} #${randomNumber}`;
  };

  const getSignature = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let ZoomMtgInstance = ZoomMtg;

      if (!ZoomMtgInstance) {
        const { ZoomMtg } = await import("@zoom/meetingsdk");
        await import("@zoom/meetingsdk/dist/css/bootstrap.css");
        await import("@zoom/meetingsdk/dist/css/react-select.css");

        ZoomMtg.setZoomJSLib("https://source.zoom.us/3.11.0/lib", "/av");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        ZoomMtgInstance = ZoomMtg;
        setZoomMtg(ZoomMtg); // For future reference
      }

      const req = await fetch(config.authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: config.meetingNumber,
          role: config.role,
        }),
      });

      if (!req.ok) throw new Error("Failed to get signature");

      const res = await req.json();
      await startMeeting(res.signature, ZoomMtgInstance); // Pass instance directly
      setIsJoined(true);
    } catch (error) {
      console.error("Failed to get signature:", error);
      setError("Failed to join meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startMeeting = (signature, ZoomMtgInstance) => {
    if (!ZoomMtgInstance) return;

    let zoomContainer = document.getElementById("zmmtg-root");
    if (!zoomContainer) {
      zoomContainer = document.createElement("div");
      zoomContainer.id = "zmmtg-root";
      document.body.appendChild(zoomContainer);
    }

    // Key visibility fixes
    zoomContainer.style.position = "fixed";
    zoomContainer.style.top = "0";
    zoomContainer.style.left = "0";
    zoomContainer.style.width = "100%";
    zoomContainer.style.height = "100vh";
    zoomContainer.style.zIndex = "9999"; // Ensure top layer
    zoomContainer.style.display = "block"; // Force visibility

    ZoomMtgInstance.init({
      leaveUrl: config.leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      success: () => {
        // console.log("Zoom SDK Initialized");

        ZoomMtgInstance.join({
          meetingNumber: config.meetingNumber,
          sdkKey: config.sdkKey,
          signature: signature,
          userName: generateUniqueName(config.userName),
          passWord: config.passWord,
          success: (success) => console.log("Meeting Joined:", success),
          error: (error) => {
            console.error("Join Error:", error);
          },
        });
      },
      error: (error) => {
        console.error("Zoom Init Error:", error);
      },
    });

    ZoomMtgInstance.inMeetingServiceListener("onUserLeave", (data) => {
      const currentUser = ZoomMtgInstance.getCurrentUser({});

      if (data.userId === currentUser.userId) {
        const zoomContainer = document.getElementById("zmmtg-root");
        if (zoomContainer) zoomContainer.remove();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      {/* Navigation Bar */}
      <nav className="bg-[#1a1f2e] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="ml-2 text-2xl font-bold text-white">
                xto<span className="text-red-500">10</span>x
              </span>
            </div>
            <a
              href="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white"
            >
              <Home className="h-5 w-5 text-white" />
              <span className="text-white">Home</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Hackathon Collaboration Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transform Ideas into Reality - Join the most exciting hackathon
            collaboration space
          </p>
        </div>

        {/* Meeting Info Card */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                Live Coding Session
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Users className="w-5 h-5 text-red-500" />
                  <span>Open Collaboration Space</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Code2 className="w-5 h-5 text-red-500" />
                  <span>Full-Stack Development</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 text-red-400 p-3 rounded-lg border border-red-800">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center items-center space-y-6">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                <Video className="w-12 h-12 text-red-500" />
              </div>

              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">
                    Connecting to session...
                  </span>
                </div>
              ) : (
                <button
                  onClick={getSignature}
                  disabled={isJoined}
                  className={`
                    group w-full md:w-auto px-8 py-4 rounded-xl font-medium text-lg
                    transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2
                    ${
                      isJoined
                        ? "bg-green-900/20 text-green-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-red-500/20"
                    }
                  `}
                >
                  <span>
                    {isJoined
                      ? "Currently in Session"
                      : "Join Collaboration Room"}
                  </span>
                  {!isJoined && (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Meeting Guidelines */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Session Guidelines
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>
                Share your screen when discussing code implementations
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>
                Use the chat for sharing quick links and code snippets
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>Maintain a collaborative and supportive environment</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>Take turns speaking to avoid audio overlap</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Zoom Meeting Root - DO NOT MODIFY */}
      <div id="zmmtg-root"></div>
    </div>
  );
}

export default MeetingRoom;
