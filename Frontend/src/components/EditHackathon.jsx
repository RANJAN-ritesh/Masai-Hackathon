import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertCircle,
  Save,
  LogOut,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import { useParams, useNavigate } from "react-router-dom";

const EditHackathon = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const userId = localStorage.getItem("userId");
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  async function fetchHackathon() {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/hackathons/${id}`);
      if (!response.ok) throw new Error("Failed to fetch hackathon details");
      const data = await response.json();

      // Convert dates to local format
      const {
        startDate,
        endDate,
        submissionStart,
        submissionEnd,
        schedule = [],
        ...rest
      } = data;

      const cleanData = {
        ...rest,
        startDate,
        endDate,
        submissionStart,
        submissionEnd,
        schedule: schedule.map((item) => ({
          ...item,
          date: item.date,
        })),
      };

      setEventData(cleanData);
    } catch (error) {
      toast.error("Error loading hackathon: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHackathon();
  }, [id]);

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
    try {
      setSaving(true);

      // Prepare the data for submission
      const submissionData = {
        ...eventData,
        startDate: new Date(eventData.startDate).toISOString(),
        endDate: new Date(eventData.endDate).toISOString(),
        submissionStart: new Date(eventData.submissionStart).toISOString(),
        submissionEnd: new Date(eventData.submissionEnd).toISOString(),
        schedule: eventData.schedule.map((item) => ({
          ...item,
          date: new Date(item.date).toISOString(),
        })),
      };

      const response = await fetch(`${baseURL}/hackathons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to update hackathon");
      }

      toast.success("Hackathon updated successfully!");
      navigate("/"); // Redirect to dashboard after successful update
    } catch (error) {
      toast.error("Error updating hackathon: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVersionChange = (newVersion) => {
    setEventData((prev) => ({
      ...prev,
      version: newVersion,
    }));
  };

  const handleAllowedEmailsChange = (input) => {
    const emails = input.split(/[\s,]+/).filter((email) => email.trim() !== "");
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
        toast.error("CSV parsing error: " + err.message);
      },
    });

    e.target.value = "";
  };

  const handleMinTeamSizeChange = (min) => {
    const minValue = parseInt(min);
    if (minValue > eventData.maxTeamSize) {
      toast.warning(
        "Minimum team size cannot be greater than maximum team size."
      );
      return;
    }

    setEventData((prev) => ({
      ...prev,
      minTeamSize: minValue,
    }));
  };

  const handleMaxTeamSizeChange = (max) => {
    const maxValue = parseInt(max);
    if (maxValue < eventData.minTeamSize) {
      toast.warning("Maximum team size cannot be less than minimum team size.");
      return;
    }

    setEventData((prev) => ({
      ...prev,
      maxTeamSize: maxValue,
    }));
  };

  const handleEventPlanChange = (index, field, value) => {
    setEventData((prev) => ({
      ...prev,
      eventPlan: prev.eventPlan.map((plan, i) =>
        i === index ? { ...plan, [field]: value } : plan
      ),
    }));
  };

  const handleAddEventPlan = () => {
    setEventData((prev) => ({
      ...prev,
      eventPlan: [
        ...prev.eventPlan,
        { week: prev.eventPlan.length + 1, phase: "", description: "" },
      ],
    }));
  };

  const handleRemoveEventPlan = (index) => {
    setEventData((prev) => ({
      ...prev,
      eventPlan: prev.eventPlan.filter((_, i) => i !== index),
    }));
  };

  function toIst(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const istOffset = 330 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);

    return istDate.toISOString().slice(0, 16);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Loading hackathon details...</span>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Hackathon Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The hackathon you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Edit Hackathon</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                  //   onChange={(e) => handleInputChange("eventType", e.target.value)}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm bg-gray-100"
                >
                  <option value="Interactive Hackathon">
                    Interactive Hackathon
                  </option>
                  <option value="Regular Hackathon">Regular Hackathon</option>
                </select>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
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
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={eventData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.startDate)}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.endDate)}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                  />
                </div>
              </div>

              {/* Team Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Team Size
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={eventData.minTeamSize}
                    onChange={(e) => handleMinTeamSizeChange(e.target.value)}
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Team Size
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={eventData.maxTeamSize}
                    onChange={(e) => handleMaxTeamSizeChange(e.target.value)}
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm bg-gray-100"
                  />
                </div>
              </div>

              {/* Allowed Emails */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Allowed Emails
                </label>
                <textarea
                  value={eventData.allowedEmails.join(", ")}
                  onChange={(e) => handleAllowedEmailsChange(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                />
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleEmailCSVUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>
              </div>

              {/* Submission Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Submission Start
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.submissionStart)}
                    onChange={(e) =>
                      handleInputChange("submissionStart", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Submission End
                  </label>
                  <input
                    type="datetime-local"
                    value={toIst(eventData.submissionEnd)}
                    onChange={(e) =>
                      handleInputChange("submissionEnd", e.target.value)
                    }
                    className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
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
                        onChange={(e) =>
                          handleProblemStatementChange(
                            index,
                            "track",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
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
                        <option value="" disabled>
                          Select a track
                        </option>
                        <option value="Software Development">
                          Software Development
                        </option>
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
                        onChange={(e) =>
                          handleProblemStatementChange(
                            index,
                            "difficulty",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
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
                      onChange={(e) =>
                        handleProblemStatementChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveProblemStatement(index)}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddProblemStatement}
                className="inline-flex items-center px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
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
                    value={event.activity}
                    onChange={(e) =>
                      handleScheduleChange(index, "activity", e.target.value)
                    }
                    className="block w-2/3 rounded-lg p-2 border border-gray-200 sm:text-sm"
                    placeholder="Activity"
                  />
                  <button
                    onClick={() => handleRemoveScheduleEvent(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddScheduleEvent}
                className="inline-flex items-center px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
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
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Week
                      </label>
                      <input
                        type="number"
                        value={plan.week}
                        onChange={(e) =>
                          handleEventPlanChange(
                            index,
                            "week",
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phase
                      </label>
                      <input
                        type="text"
                        value={plan.phase}
                        onChange={(e) =>
                          handleEventPlanChange(index, "phase", e.target.value)
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={plan.description}
                        onChange={(e) =>
                          handleEventPlanChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEventPlan(index)}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddEventPlan}
                className="inline-flex items-center px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
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
                <div key={index} className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="number"
                      value={prize.position}
                      onChange={(e) =>
                        handlePrizeDetailsChange(
                          index,
                          "position",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={prize.amount}
                      onChange={(e) =>
                        handlePrizeDetailsChange(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                      placeholder="e.g., Rs. 5,000 or $5,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) =>
                        handlePrizeDetailsChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-lg p-2 border border-gray-200 sm:text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHackathon;
