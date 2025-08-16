// import React, { useContext, useState } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MyContext } from "../context/AuthContextProvider";

// const EventSchedule = () => {
//   const { hackathon } = useContext(MyContext);
//   console.log("Hackathon Data", hackathon)
//   const [activeTab, setActiveTab] = useState("fri");
//   const scheduleData = {
//     fri: [
//       { time: "9:00 AM", event: "Opening Ceremony" },
//       { time: "10:00 AM", event: "Team Formation" },
//       { time: "11:00 AM", event: "Workshop 1: Introduction to React" },
//       { time: "1:00 PM", event: "Lunch Break" },
//       { time: "2:00 PM", event: "Coding Session Begins" },
//       { time: "6:00 PM", event: "Progress Check-in" },
//       { time: "8:00 PM", event: "Dinner" },
//     ],
//     sat: [
//       { time: "9:00 AM", event: "Morning Stand-up" },
//       { time: "10:00 AM", event: "Workshop 2: API Integration" },
//       { time: "12:00 PM", event: "Lunch Break" },
//       { time: "1:00 PM", event: "Mentoring Sessions" },
//       { time: "4:00 PM", event: "Progress Presentations" },
//       { time: "7:00 PM", event: "Dinner & Networking" },
//     ],
//     sun: [
//       { time: "9:00 AM", event: "Final Coding Sprint" },
//       { time: "12:00 PM", event: "Lunch Break" },
//       { time: "1:00 PM", event: "Project Submission Deadline" },
//       { time: "2:00 PM", event: "Project Presentations" },
//       { time: "5:00 PM", event: "Judging" },
//       { time: "6:30 PM", event: "Awards Ceremony & Closing" },
//     ],
//   };
//   return (
//     <>
//       {/* Event Schedule */}
//       <div className="bg-white rounded-xl p-6 shadow-md">
//         <h2 className="text-2xl font-bold mb-4 text-gray-800">
//           Event Schedule
//         </h2>
//         <div className="flex border-b mb-4">
//           <button
//             className={`px-4 py-2 ${
//               activeTab === "fri"
//                 ? "border-b-2 border-red-500 text-red-500 font-medium"
//                 : "text-gray-500"
//             }`}
//             onClick={() => setActiveTab("fri")}
//           >
//             Fri
//           </button>
//           <button
//             className={`px-4 py-2 ${
//               activeTab === "sat"
//                 ? "border-b-2 border-red-500 text-red-500 font-medium"
//                 : "text-gray-500"
//             }`}
//             onClick={() => setActiveTab("sat")}
//           >
//             Sat
//           </button>
//           <button
//             className={`px-4 py-2 ${
//               activeTab === "sun"
//                 ? "border-b-2 border-red-500 text-red-500 font-medium"
//                 : "text-gray-500"
//             }`}
//             onClick={() => setActiveTab("sun")}
//           >
//             Sun
//           </button>
//         </div>
//         <div className="space-y-3">
//           {scheduleData[activeTab].map((item, index) => (
//             <div
//               key={index}
//               className="flex justify-between items-center border-b border-gray-100 pb-2"
//             >
//               <div className="text-gray-700 font-medium">{item.time}</div>
//               <div className="text-gray-900">{item.event}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EventSchedule;



import React, { useContext, useState, useMemo } from "react";
import { MyContext } from "../context/AuthContextProvider";

const EventSchedule = () => {
  const { hackathon } = useContext(MyContext);

  const { tabs, scheduleData } = useMemo(() => {
    const tempData = {};
    const tabList = [];

    if (!hackathon?.schedule) return { tabs: [], scheduleData: {} };

    hackathon.schedule.forEach((item) => {
      const dateObj = new Date(item.date);
      const dayKey = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }); // e.g., "Fri, Apr 8"

      const time = dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (!tempData[dayKey]) {
        tempData[dayKey] = [];
        tabList.push(dayKey);
      }

      tempData[dayKey].push({ time, event: item.activity });
    });

    // Sort events for each day
    Object.keys(tempData).forEach((day) => {
      tempData[day].sort((a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`));
    });

    return { tabs: tabList, scheduleData: tempData };
  }, [hackathon]);

  const [activeTab, setActiveTab] = useState(null);

  // Set default tab on first render
  React.useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  return (
    <>
      {/* Event Schedule */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Event Schedule
        </h2>
        <div className="flex border-b mb-4">
          {tabs.map((day) => (
            <button
              key={day}
              className={`px-4 py-2 ${
                activeTab === day
                  ? "border-b-2 border-red-500 text-red-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(day)}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {scheduleData[activeTab]?.length > 0 ? (
            scheduleData[activeTab].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-100 pb-2"
              >
                <div className="text-gray-700 font-medium">{item.time}</div>
                <div className="text-gray-900">{item.event}</div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No events scheduled for this day.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventSchedule;
