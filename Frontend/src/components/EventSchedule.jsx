import React, { useState, useMemo } from "react";

const EventSchedule = ({ hackathonData }) => {
  if (!hackathonData) return null;

  const { tabs, scheduleData } = useMemo(() => {
    const tempData = {};
    const tabList = [];

    console.log("🔍 EventSchedule - hackathonData:", hackathonData);
    console.log("🔍 EventSchedule - schedule:", hackathonData?.schedule);

    if (!hackathonData?.schedule || !Array.isArray(hackathonData.schedule)) {
      console.log("❌ EventSchedule - No schedule data or not an array");
      return { tabs: [], scheduleData: {} };
    }

    hackathonData.schedule.forEach((item, index) => {
      console.log(`🔍 Processing schedule item ${index}:`, item);
      
      if (!item.date) {
        console.log(`❌ Item ${index} has no date:`, item);
        return; // Skip items without dates
      }

      try {
        const dateObj = new Date(item.date);
        
        if (isNaN(dateObj.getTime())) {
          console.log(`❌ Item ${index} has invalid date:`, item.date);
          return; // Skip items with invalid dates
        }

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
        console.log(`✅ Added item ${index} to day ${dayKey}:`, { time, event: item.activity });
      } catch (error) {
        console.error(`❌ Error processing schedule item ${index}:`, error, item);
      }
    });

    // Sort events for each day
    Object.keys(tempData).forEach((day) => {
      tempData[day].sort((a, b) => new Date(`1970/01/01 ${a.time}`) - new Date(`1970/01/01 ${b.time}`));
    });

    console.log("🔍 Final tabs:", tabList);
    console.log("🔍 Final scheduleData:", tempData);

    return { tabs: tabList, scheduleData: tempData };
  }, [hackathonData]);

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
