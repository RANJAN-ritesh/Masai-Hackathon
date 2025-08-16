import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertCircle,
  Save,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";

const CreateHackathon = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [eventData, setEventData] = useState({
    name: "Test Hackathon 1",
    version: "1.0",
    description:
      "A two-week interactive coding hackathon for real world grooming",
    startDate: "",
    endDate: "",
    allowedEmails: [],
    minTeamSize: 2,
    maxTeamSize: 4,
    problemStatements: [
      {
        track: "ML",
        description: "Sample ML Problem Statement",
        difficulty: "Hard",
      },
      {
        track: "DA",
        description: "Analyze large datasets for insights.",
        difficulty: "Medium",
      },
    ],
    schedule: [
      {
        date: "",
        activity: "Hackathon Kick-off",
      },
      {
        date: "",
        activity: "Winner Announcement",
      },
    ],
    eventPlan: [
      {
        week: 1,
        phase: "Interaction",
        description: "Full week of Interaction",
      },
      {
        week: 2,
        phase: "Hackathon",
        description: "Full week of Interaction",
      },
    ],
    submissionStart: "",
    submissionEnd: "",
    status: "Upcoming",
    eventType: "Interactive Hackathon",
    prizeDetails: [
      {
        position: 1,
        amount: "5000",
        description: "Winner",
      },
      {
        position: 2,
        amount: "3000",
        description: "Runner-up",
      },
      {
        position: 3,
        amount: "2000",
        description: "Runner-up",
      },
    ],

    createdBy: userId,
  });
  const [notification, setNotification] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  // Fetch Hackathon List
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch(`${baseURL}/hackathons`);
        if (!response.ok) throw new Error("Failed to fetch hackathons");
        const data = await response.json();
        setHackathons(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchHackathons();
  }, []);

  // Handle Selection and Fetch Hackathon Data by ID
  const handleSelectChange = async (e) => {
    const hackathonId = e.target.value;
    setSelectedHackathon(hackathonId);

    if (hackathonId) {
      try {
        const response = await fetch(`${baseURL}/hackathons/${hackathonId}`);
        if (!response.ok) throw new Error("Failed to fetch hackathon details");
        const data = await response.json();
        // console.log("Selected Hackathon ID", data);
        // Remove _id before setting state
        // const { _id, ...cleanData } = data;
        // Convert startDate, endDate, and schedule dates to IST
        const {
          _id,
          startDate,
          endDate,
          submissionStart,
          submissionEnd,
          schedule = [],
          ...rest
        } = data;
        const cleanData = {
          ...rest,
          startDate: convertUtcToIst(startDate),
          endDate: convertUtcToIst(endDate),
          submissionStart: convertUtcToIst(submissionStart),
          submissionEnd: convertUtcToIst(submissionEnd),
          schedule: schedule.map((item) => ({
            ...item,
            date: convertUtcToIst(item.date),
          })),
        };
        setEventData(cleanData);
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const handleLogout = () => {
    // Implement logout logic here
  };

  const handleInputChange = (field, value) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProblemStatementChange = (index, field, value) => {
    setEventData((prev) => ({
      ...prev,
      problemStatements: prev.problemStatements.map((statement, i) =>
        i === index ? { ...statement, [field]: value } : statement
      ),
    }));
  };

  const handleAddProblemStatement = () => {
    setEventData((prev) => ({
      ...prev,
      problemStatements: [
        ...prev.problemStatements,
        { track: "", description: "", difficulty: "Medium" },
      ],
    }));
  };

  const handleRemoveProblemStatement = (index) => {
    setEventData((prev) => ({
      ...prev,
      problemStatements: prev.problemStatements.filter((_, i) => i !== index),
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setEventData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((event, i) =>
        i === index ? { ...event, [field]: value } : event
      ),
    }));
  };

  const handleAddScheduleEvent = () => {
    setEventData((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { date: new Date().toISOString(), activity: "" },
      ],
    }));
  };

  const handleRemoveScheduleEvent = (index) => {
    setEventData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const handlePrizeDetailsChange = (index, field, value) => {
    setEventData((prev) => ({
      ...prev,
      prizeDetails: prev.prizeDetails.map((prize, i) =>
        i === index ? { ...prize, [field]: value } : prize
      ),
    }));
  };

  const handleSubmit = async () => {
    // console.log(eventData);
    try {
      const response = await fetch(`${baseURL}/hackathons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
      if (response.ok) {
        toast.success("Hackathon Created Sucessfully", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/");
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleVersionChange = (newVersion) => {
    setEventData((prev) => ({
      ...prev,
      version: newVersion,
    }));
  };

  const handleAllowedEmailsChange = (input) => {
    // Split by comma, space, or both, and remove any extra spaces
    const emails = input.split(/[\s,]+/).filter((email) => email.trim() !== ""); // Remove empty values

    setEventData((prev) => ({
      ...prev,
      allowedEmails: emails,
    }));
  };

  const handleEmailCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const emails = results.data
          .map((row) => row.email?.trim())
          .filter((email) => email && email !== "");

        setEventData((prev) => ({
          ...prev,
          allowedEmails: emails,
        }));
      },
      error: function (err) {
        console.error("CSV parsing error:", err.message);
      },
    });

    // Optional: Reset the file input so the same file can be re-uploaded
    e.target.value = "";
  };

  const handleMinTeamSizeChange = (min) => {
    if (min > eventData.maxTeamSize) {
      alert("Minimum team size cannot be greater than maximum team size.");
      return;
    }

    setEventData((prev) => ({
      ...prev,
      minTeamSize: min,
    }));
  };

  const handleMaxTeamSizeChange = (max) => {
    if (max < eventData.minTeamSize) {
      alert("Maximum team size cannot be less than minimum team size.");
      return;
    }

    setEventData((prev) => ({
      ...prev,
      maxTeamSize: max,
    }));
  };

  // Handle changes in a specific event plan
  const handleEventPlanChange = (index, field, value) => {
    setEventData((prev) => ({
      ...prev,
      eventPlan: prev.eventPlan.map((plan, i) =>
        i === index ? { ...plan, [field]: value } : plan
      ),
    }));
  };

  // Add a new event plan
  const handleAddEventPlan = () => {
    setEventData((prev) => ({
      ...prev,
      eventPlan: [
        ...prev.eventPlan,
        { week: prev.eventPlan.length + 1, phase: "", description: "" },
      ],
    }));
  };

  // Remove an event plan
  const handleRemoveEventPlan = (index) => {
    setEventData((prev) => ({
      ...prev,
      eventPlan: prev.eventPlan.filter((_, i) => i !== index),
    }));
  };

  function toIst(isoDateString) {
    const date = new Date(isoDateString);

    // Get the year, month, day, hour, and minutes in IST
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function convertUtcToIst(utcDateString) {
    // Convert UTC string to Date object
    const date = new Date(utcDateString);

    // Convert to IST using toLocaleString
    const istDate = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    return istDate;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Create Hackathon Event
            </h1>
            {/* <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button> */}
          </div>
        </div>
      </div>

      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`rounded-lg p-4 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            {/* <div>
              <h1 className="text-lg font-semibold mb-2">Select a Hackathon</h1>
              <select
                onChange={handleSelectChange}
                className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
              >
                <option value="">Select Hackathon</option>
                {hackathons.map((hackathon) => (
                  <option key={hackathon._id} value={hackathon._id}>
                    {hackathon.name}
                  </option>
                ))}
              </select>
            </div> */}
            <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Type
                </label>
                <select
                  value={eventData.eventType}
                  required
                  onChange={(e) =>
                    handleInputChange("eventType", e.target.value)
                  }
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                >
                  <option value="Interactive Hackathon">
                    Interactive Hackathon
                  </option>
                  <option value="Regular Hackathon">Regular Hackathon</option>
                </select>
              </div>
              {/* Event Tilte */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={eventData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1 block w-full rounded-lg focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              {/* Event Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Version
                </label>
                <input
                  type="text"
                  value={eventData.version}
                  required
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="mt-1 block w-full rounded-lg focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={eventData.description}
                  required
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                />
              </div>
              {/* Event Start and End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.startDate)}
                    required
                    onChange={(e) =>
                      handleInputChange(
                        "startDate",
                        new Date(e.target.value).toISOString()
                      )
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.endDate)}
                    required
                    onChange={(e) =>
                      handleInputChange(
                        "endDate",
                        new Date(e.target.value).toISOString()
                      )
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>
              {/* Event Team Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Team Size
                  </label>
                  <input
                    type="number"
                    value={eventData.minTeamSize}
                    required
                    onChange={(e) => handleMinTeamSizeChange(e.target.value)}
                    className="mt-1 block w-full rounded-lg focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Team Size
                  </label>
                  <input
                    type="number"
                    value={eventData.maxTeamSize}
                    required
                    onChange={(e) => handleMaxTeamSizeChange(e.target.value)}
                    className="mt-1 block w-full rounded-lg focus:border-red-500 focus:ring-red-500 sm:text-sm p-2 border border-gray-200"
                  />
                </div>
              </div>
              {/* Allowed Emails */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Allowed Emails
                </label>
                <textarea
                  value={eventData.allowedEmails}
                  onChange={(e) => handleAllowedEmailsChange(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                />
              </div>
              {/* <textarea
                value={eventData.allowedEmails.join(", ")}
                readOnly
                rows={3}
                className="mt-2 block w-full rounded-lg p-2 border border-gray-200 bg-gray-100 text-sm"
              ></textarea> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Allowed Emails CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleEmailCSVUpload}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0 file:text-sm file:font-semibold
               file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />

                {eventData.allowedEmails.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {eventData.allowedEmails.length} emails added.
                  </div>
                )}
              </div>

              {/* Submission Start and End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Submission Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.submissionStart)}
                    required
                    onChange={(e) =>
                      handleInputChange(
                        "submissionStart",
                        new Date(e.target.value).toISOString()
                      )
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Submission End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.submissionEnd)}
                    required
                    onChange={(e) =>
                      handleInputChange(
                        "submissionEnd",
                        new Date(e.target.value).toISOString()
                      )
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Problem Statements */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Problem Statements
            </h2>
            <div className="space-y-4">
              {eventData.problemStatements.map((statement, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Track
                      </label>
                      <input
                        type="text"
                        value={statement.track}
                        required
                        onChange={(e) =>
                          handleProblemStatementChange(
                            index,
                            "track",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      />
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                      Track
                      </label>
                      <select
                        value={statement.track}
                        required
                        onChange={(e) =>
                          handleProblemStatementChange(
                            index,
                            "track",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      >
                        <option value="Software Development">Software Development</option>
                        <option value="SDET">SDET</option>
                        <option value="DA">DA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Difficulty
                      </label>
                      <select
                        value={statement.difficulty}
                        required
                        onChange={(e) =>
                          handleProblemStatementChange(
                            index,
                            "difficulty",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={statement.description}
                      required
                      onChange={(e) =>
                        handleProblemStatementChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveProblemStatement(index)}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-500 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddProblemStatement}
                className="inline-flex items-center px-4 py-2 border border-red-500 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Problem Statement
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <Calendar className="h-5 w-5 mr-2 text-red-500" />
              Schedule
            </h2>
            <div className="space-y-4">
              {eventData.schedule.map((event, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="datetime-local"
                    required
                    value={toIst(event.date)}
                    onChange={(e) =>
                      handleScheduleChange(
                        index,
                        "date",
                        new Date(e.target.value).toISOString()
                      )
                    }
                    className="block w-1/3 rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={event.activity}
                    onChange={(e) =>
                      handleScheduleChange(index, "activity", e.target.value)
                    }
                    className="block w-2/3 rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="Activity"
                  />
                  <button
                    onClick={() => handleRemoveScheduleEvent(index)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddScheduleEvent}
                className="inline-flex items-center px-4 py-2 border border-red-500 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Schedule Event
              </button>
            </div>
          </div>

          {/* Event Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Event Plan
            </h2>
            <div className="space-y-4">
              {eventData.eventPlan.map((plan, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Week
                      </label>
                      <input
                        type="number"
                        required
                        value={plan.week}
                        onChange={(e) =>
                          handleEventPlanChange(
                            index,
                            "week",
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phase
                      </label>
                      <input
                        type="text"
                        required
                        value={plan.phase}
                        onChange={(e) =>
                          handleEventPlanChange(index, "phase", e.target.value)
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={plan.description}
                        required
                        onChange={(e) =>
                          handleEventPlanChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={2}
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEventPlan(index)}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-500 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddEventPlan}
                className="inline-flex items-center px-4 py-2 border border-red-500 rounded-lg text-sm text-red-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Event Plan
              </button>
            </div>
          </div>

          {/* Prize Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Prize Details
            </h2>
            <div className="space-y-4">
              {eventData.prizeDetails.map((prize, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4 items-center"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="number"
                      required
                      value={prize.position}
                      onChange={(e) =>
                        handlePrizeDetailsChange(
                          index,
                          "position",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="text"
                      required
                      value={prize.amount}
                      onChange={(e) =>
                        handlePrizeDetailsChange(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="e.g., Rs. 5,000 or $5,000"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      value={prize.description}
                      onChange={(e) =>
                        handlePrizeDetailsChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <Save className="h-5 w-5 mr-2" />
              Create Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHackathon;
