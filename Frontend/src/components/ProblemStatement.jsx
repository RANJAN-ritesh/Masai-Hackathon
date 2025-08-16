// import React, { useContext } from "react";
// import { Code, Database, TestTube, ChevronRight } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MyContext } from "../context/AuthContextProvider";

// const ProblemStatement = () => {
//   const {hackathon} = useContext(MyContext)
//   return (
//     <>
//       {/* Problem Statements */}
//       <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
//         <h2 className="text-2xl font-bold mb-6 text-gray-800">
//           Problem Statements
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer">
//             <div className="bg-blue-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
//               <Code size={24} />
//             </div>
//             <h3 className="text-lg font-semibold text-blue-800 mb-2">
//               Frontend
//             </h3>
//             <p className="text-blue-700 text-sm mb-4">
//               Build innovative UI/UX solutions with modern frameworks
//             </p>
//             <button className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-800">
//               View Challenges <ChevronRight size={16} />
//             </button>
//           </div>

//           <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer">
//             <div className="bg-purple-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
//               <Database size={24} />
//             </div>
//             <h3 className="text-lg font-semibold text-purple-800 mb-2">
//               Data Analytics
//             </h3>
//             <p className="text-purple-700 text-sm mb-4">
//               Extract insights from complex datasets
//             </p>
//             <button className="flex items-center text-purple-600 font-medium text-sm hover:text-purple-800">
//               View Challenges <ChevronRight size={16} />
//             </button>
//           </div>

//           <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer">
//             <div className="bg-green-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
//               <TestTube size={24} />
//             </div>
//             <h3 className="text-lg font-semibold text-green-800 mb-2">SDET</h3>
//             <p className="text-green-700 text-sm mb-4">
//               Create robust testing frameworks and automation
//             </p>
//             <button className="flex items-center text-green-600 font-medium text-sm hover:text-green-800">
//               View Challenges <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProblemStatement;

import React, { useContext, useState, useEffect } from "react";
import { Code, Database, TestTube, ChevronRight, X } from "lucide-react";
import { MyContext } from "../context/AuthContextProvider";

const ProblemStatement = () => {
  const { hackathon, role } = useContext(MyContext);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(null);

  // Helper to calculate time left for 2-hour window
  useEffect(() => {
    if (!showModal || !hackathon?.startDate) return;
    const interval = setInterval(() => {
      const start = new Date(hackathon.startDate);
      const now = new Date();
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
      const diff = end - now;
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          expired: false,
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showModal, hackathon?.startDate]);

  const openModal = (track) => {
    setSelectedTrack(track);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTrack(null);
    setShowModal(false);
  };

  const getFilteredProblems = (track) => {
    return hackathon?.problemStatements?.filter(
      (problem) => problem.track.toLowerCase() === track.toLowerCase()
    );
  };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-2xl">
            <div
              className={`absolute -top-4 -left-4 p-3 rounded-full ${
                selectedTrack === "Software Development"
                  ? "bg-blue-500"
                  : selectedTrack === "DA"
                  ? "bg-purple-500"
                  : "bg-green-500"
              } text-white`}
            >
              {selectedTrack === "Software Development" ? (
                <Code size={24} />
              ) : selectedTrack === "DA" ? (
                <Database size={24} />
              ) : (
                <TestTube size={24} />
              )}
            </div>

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-2 pl-1 text-gray-800">
              {selectedTrack} Challenges
            </h3>

            {/* Countdown Timer for all users */}
            {hackathon?.startDate && (
              <div className="mb-4 pl-1">
                {timeLeft && !timeLeft.expired ? (
                  <div className="flex items-center space-x-2 text-red-600 font-semibold">
                    <span>Time left to pick your problem statement:</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-lg tracking-wider">
                      {`${timeLeft.hours.toString().padStart(2, "0")}:${timeLeft.minutes
                        .toString()
                        .padStart(2, "0")}:${timeLeft.seconds
                        .toString()
                        .padStart(2, "0")}`}
                    </span>
                  </div>
                ) : timeLeft && timeLeft.expired ? (
                  <div className="text-red-500 font-semibold">
                    Problem selection window has closed.
                  </div>
                ) : null}
              </div>
            )}

            <p className="text-gray-500 mb-6 pl-1">
              Select a challenge to view details
            </p>

            <div className="max-h-72 overflow-y-auto pr-2 rounded-lg">
              {getFilteredProblems(selectedTrack)?.length > 0 ? (
                getFilteredProblems(selectedTrack).map((item, index) => (
                  <div
                    key={item._id}
                    className="mb-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-100 "
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mr-3">
                          {index + 1}
                        </span>
                        <a
                          href={item.description}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 font-medium hover:text-indigo-600 transition-colors flex-1"
                        >
                          Problem {index + 1}
                        </a>
                      </div>
                      <a
                        href={item.description}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-700 p-2 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        <ChevronRight size={18} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No challenges available for this track yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Section */}
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Problem Statements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Software Development */}
          <div
            onClick={() => openModal("Software Development")}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Code size={24} />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Software Development
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Build innovative UI/UX solutions with modern frameworks
            </p>
            <span className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-800">
              View Challenges <ChevronRight size={16} />
            </span>
          </div>

          {/* DA */}
          <div
            onClick={() => openModal("DA")}
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="bg-purple-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Data Analytics
            </h3>
            <p className="text-purple-700 text-sm mb-4">
              Extract insights from complex datasets
            </p>
            <span className="flex items-center text-purple-600 font-medium text-sm hover:text-purple-800">
              View Challenges <ChevronRight size={16} />
            </span>
          </div>

          {/* SDET */}
          <div
            onClick={() => openModal("SDET")}
            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="bg-green-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TestTube size={24} />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">SDET</h3>
            <p className="text-green-700 text-sm mb-4">
              Create robust testing frameworks and automation
            </p>
            <span className="flex items-center text-green-600 font-medium text-sm hover:text-green-800">
              View Challenges <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProblemStatement;
