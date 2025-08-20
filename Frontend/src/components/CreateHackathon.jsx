import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlertCircle,
  Save,
  LogOut,
  Plus,
  Trash2,
  Download,
  Upload,
  FileText,
  Info,
  Link as LinkIcon,
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
    title: "Test Hackathon 1",
    version: "1.0",
    description:
      "A two-week interactive coding hackathon for real world grooming",
    startDate: "",
    endDate: "",
    allowedEmails: [],
    minTeamSize: 2,
    maxTeamSize: 4,
    socialLinks: {
      zoom: "",
      youtube: "",
      slack: "",
      github: "",
      instagram: "",
      twitter: "",
      linkedin: ""
    },
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
    status: "upcoming",
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

  // CSV Upload State
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Sample CSV template
  const sampleCSVData = [
    {
      "First Name": "John",
      "Last Name": "Doe",
      "Email": "john.doe@example.com",
      "Phone": "+91-9876543210",
      "Course": "Computer Science",
      "Skills": "React, Node.js, Python",
      "Vertical": "Full Stack",
      "Role": "member"
    },
    {
      "First Name": "Jane",
      "Last Name": "Smith", 
      "Email": "jane.smith@example.com",
      "Phone": "+91-9876543211",
      "Course": "Data Science",
      "Skills": "Python, Machine Learning, SQL",
      "Vertical": "Data Science",
      "Role": "leader"
    }
  ];

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const csv = Papa.unparse(sampleCSVData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "hackathon_participants_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
        setIsUploading(false);
        toast.success(`CSV uploaded successfully! ${results.data.length} participants found.`);
      },
      error: (error) => {
        setIsUploading(false);
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Validate CSV data
  const validateCSVData = () => {
    if (csvData.length === 0) {
      toast.error("Please upload a CSV file first");
      return false;
    }

    const requiredFields = ["First Name", "Last Name", "Email", "Phone", "Course", "Skills", "Vertical", "Role"];
    const firstRow = csvData[0];
    
    for (const field of requiredFields) {
      if (!firstRow[field]) {
        toast.error(`Missing required field: ${field}`);
        return false;
      }
    }

    return true;
  };

  // Upload participants to backend
  const uploadParticipants = async () => {
    if (!validateCSVData()) return;

    setIsUploading(true);
    try {
      const response = await fetch(`${baseURL}/users/upload-participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: csvData,
          hackathonId: eventData._id || 'new'
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show detailed success message
        let successMessage = result.message;
        if (result.summary) {
          successMessage += `\n\nDetailed Summary:`;
          successMessage += `\n• New users created: ${result.summary.newUsers}`;
          successMessage += `\n• Existing users added: ${result.summary.existingUsersAdded}`;
          successMessage += `\n• Already in hackathon: ${result.summary.alreadyInHackathon}`;
          if (result.summary.errors > 0) {
            successMessage += `\n• Errors: ${result.summary.errors}`;
          }
        }
        
        toast.success(successMessage, {
          autoClose: 8000, // Longer display time for detailed message
          style: { whiteSpace: 'pre-line' } // Allow line breaks
        });
        
        setCsvData([]);
        setCsvFileName("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

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

  // Removed demo data function - no longer needed

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
      // Validate required fields
      if (!eventData.title || !eventData.startDate || !eventData.endDate) {
        toast.error("Please fill in all required fields (Title, Start Date, End Date)", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      // Validate emails if any are provided
      if (eventData.allowedEmails.length > 0) {
        if (!validateEmails(eventData.allowedEmails)) {
          return; // Stop submission if emails are invalid
        }
      }

      // Format dates properly for backend
      const submissionData = {
        ...eventData,
        startDate: new Date(eventData.startDate).toISOString(),
        endDate: new Date(eventData.endDate).toISOString(),
        submissionStart: eventData.submissionStart ? new Date(eventData.submissionStart).toISOString() : undefined,
        submissionEnd: eventData.submissionEnd ? new Date(eventData.submissionEnd).toISOString() : undefined,
        schedule: eventData.schedule.map(item => ({
          ...item,
          date: item.date ? new Date(item.date).toISOString() : undefined
        }))
      };

      console.log("Submitting hackathon data:", submissionData);

      const response = await fetch(`${baseURL}/hackathons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Hackathon created successfully:", result);
        
        // Show success message
        toast.success("Hackathon Created Successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear form data
        setEventData({
          title: "Test Hackathon 1",
          version: "1.0",
          description: "A two-week interactive coding hackathon for real world grooming",
          startDate: "",
          endDate: "",
          eventType: "Team Hackathon",
          maxTeamSize: 4,
          minTeamSize: 2,
          status: "upcoming",
          submissionStart: "",
          submissionEnd: "",
          allowedEmails: [],
          schedule: [
            {
              date: "",
              activity: "Opening Ceremony",
              time: "10:00 AM",
              description: "Welcome and introduction"
            }
          ]
        });

        // Navigate back to dashboard with a flag to trigger refresh
        navigate("/", { state: { refreshHackathons: true } });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating hackathon:", error);
      toast.error(error.message || "Failed to create event", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleVersionChange = (newVersion) => {
    setEventData((prev) => ({
      ...prev,
      version: newVersion,
    }));
  };

  const handleAllowedEmailsChange = (value) => {
    // Allow typing by not filtering immediately - just split and store
    const emails = value
      .split(",")
      .map(email => email.trim())
      .filter(email => email !== ""); // Don't filter by validation here

    setEventData(prev => ({
      ...prev,
      allowedEmails: emails
    }));
  };

  // Separate validation function for form submission
  const validateEmails = (emails) => {
    const validEmails = emails.filter(email => isValidEmail(email));
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails.join(", ")}`);
      return false;
    }
    return true;
  };

  const handleEmailCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        try {
          // Handle different CSV formats
          let emails = [];
          
          if (results.data && results.data.length > 0) {
            const firstRow = results.data[0];
            
            // Check if there's an 'email' column
            if (firstRow.email) {
              emails = results.data
          .map((row) => row.email?.trim())
                .filter((email) => email && email !== "" && isValidEmail(email));
            }
            // Check if there's an 'Email' column (capitalized)
            else if (firstRow.Email) {
              emails = results.data
                .map((row) => row.Email?.trim())
                .filter((email) => email && email !== "" && isValidEmail(email));
            }
            // If no email column found, try to use the first column
            else {
              const firstColumnKey = Object.keys(firstRow)[0];
              emails = results.data
                .map((row) => row[firstColumnKey]?.trim())
                .filter((email) => email && email !== "" && isValidEmail(email));
            }
          }

          if (emails.length === 0) {
            toast.error("No valid emails found in CSV. Please check the format.");
            return;
          }

        setEventData((prev) => ({
          ...prev,
          allowedEmails: emails,
        }));

          toast.success(`Successfully loaded ${emails.length} email addresses!`);
        } catch (error) {
          console.error("CSV parsing error:", error);
          toast.error("Error parsing CSV file. Please check the format.");
        }
      },
      error: function (err) {
        console.error("CSV parsing error:", err.message);
        toast.error("Error reading CSV file: " + err.message);
      },
    });

    // Reset the file input so the same file can be re-uploaded
    e.target.value = "";
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    // Check if the date string is valid
    if (!isoDateString || isoDateString === "" || isoDateString === "Invalid Date") {
      return "";
    }
    
    const date = new Date(isoDateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    // Get the year, month, day, hour, and minutes in IST
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function convertUtcToIst(utcDateString) {
    // Check if the date string is valid
    if (!utcDateString || utcDateString === "" || utcDateString === "Invalid Date") {
      return "";
    }
    
    // Convert UTC string to Date object
    const date = new Date(utcDateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    // Convert to IST using toLocaleString
    const istDate = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    return istDate;
  }

  const downloadEmailTemplate = () => {
    const csv = Papa.unparse([{ email: "user@example.com" }]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "hackathon_participants_email_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                {hackathons?.map((hackathon) => (
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
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={eventData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                  Allowed Emails (Optional)
                </label>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>What this does:</strong> Upload a CSV with participant emails to automatically invite them to your hackathon.
                  </p>
                  <p className="text-sm text-blue-700 mb-3">
                    <strong>Expected CSV format:</strong> Single column with header "email" containing email addresses.
                  </p>
                  <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleEmailCSVUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      onClick={downloadEmailTemplate}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Template
                    </button>
                  </div>
                {eventData.allowedEmails.length > 0 && (
                    <div className="mt-3 p-2 bg-white rounded border">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>{eventData.allowedEmails.length} emails loaded:</strong>
                      </p>
                      <div className="max-h-20 overflow-y-auto">
                        {eventData.allowedEmails?.slice(0, 5).map((email, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {email}
                          </span>
                        ))}
                        {eventData.allowedEmails.length > 5 && (
                          <span className="text-xs text-gray-500">
                            ... and {eventData.allowedEmails.length - 5} more
                          </span>
                        )}
                      </div>
                  </div>
                )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    <strong>{eventData.allowedEmails.length} emails</strong> currently loaded
                  </span>
                  {eventData.allowedEmails.length > 0 && (
                    <button
                      onClick={() => setEventData(prev => ({ ...prev, allowedEmails: [] }))}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {eventData.allowedEmails.length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border max-h-24 overflow-y-auto">
                    <p className="text-xs text-gray-600 mb-2">Email preview:</p>
                    <div className="space-y-1">
                      {eventData.allowedEmails?.map((email, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isValidEmail(email) 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {email}
                          </span>
                          {!isValidEmail(email) && (
                            <span className="text-xs text-red-600">Invalid format</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <textarea
                  value={eventData.allowedEmails.join(", ")}
                  onChange={(e) => handleAllowedEmailsChange(e.target.value)}
                  rows={3}
                  placeholder="Or manually enter emails separated by commas (e.g., user1@example.com, user2@example.com)"
                  className="mt-2 block w-full rounded-lg p-2 border border-gray-200 focus:border-red-500 focus:ring-red-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Type multiple emails separated by commas, or use the CSV upload above for bulk import.
                </p>
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

          {/* Social Media Links */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
              Social Media & Connect Links
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Zoom Meeting</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={eventData.socialLinks?.zoom || ""}
                  onChange={(e) => handleInputChange("socialLinks", {...eventData.socialLinks, zoom: e.target.value})}
                  className="mt-1 block w-full rounded-lg focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">YouTube Channel</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={eventData.socialLinks?.youtube || ""}
                  onChange={(e) => handleInputChange("socialLinks", {...eventData.socialLinks, youtube: e.target.value})}
                  className="mt-1 block w-full rounded-lg focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slack Workspace</label>
                <input
                  type="url"
                  placeholder="https://workspace.slack.com"
                  value={eventData.socialLinks?.slack || ""}
                  onChange={(e) => handleInputChange("socialLinks", {...eventData.socialLinks, slack: e.target.value})}
                  className="mt-1 block w-full rounded-lg focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub Repository</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={eventData.socialLinks?.github || ""}
                  onChange={(e) => handleInputChange("socialLinks", {...eventData.socialLinks, github: e.target.value})}
                  className="mt-1 block w-full rounded-lg focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={eventData.socialLinks?.instagram || ""}
                  onChange={(e) => handleInputChange("socialLinks", {...eventData.socialLinks, instagram: e.target.value})}
                  className="mt-1 block w-full rounded-lg focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={eventData.socialLinks?.twitter || ""}
                  onChange={(e) => handleInputChange("socialLinks", {...eventData.socialLinks, twitter: e.target.value})}
                  className="mt-1 block w-full rounded-lg focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border border-gray-200"
                />
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
              {eventData.problemStatements?.map((statement, index) => (
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
              {eventData.schedule?.map((event, index) => (
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
              {(eventData.eventPlan || []).map((plan, index) => (
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
              {eventData.prizeDetails?.map((prize, index) => (
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

          {/* CSV Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Upload Participants (CSV)
              </h3>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <Info className="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">How to upload participants:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Download the sample CSV template below</li>
                      <li>Fill in participant details following the format</li>
                      <li>Upload your completed CSV file</li>
                      <li>Review the data and submit</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Download Sample Template
                  </label>
                  <button
                    onClick={downloadSampleCSV}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {csvFileName && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">File:</span> {csvFileName}
                    {csvData.length > 0 && (
                      <span className="ml-2 text-green-600">
                        • {csvData.length} participants loaded
                      </span>
                    )}
                  </p>
                </div>
              )}

              {csvData.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Preview ({csvData.length} participants)</h4>
                    <button
                      onClick={uploadParticipants}
                      disabled={isUploading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Participants
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(csvData[0] || {}).map((header) => (
                            <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(0, 3).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900 border-b">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {csvData.length > 3 && (
                          <tr>
                            <td colSpan={Object.keys(csvData[0] || {}).length} className="px-3 py-2 text-sm text-gray-500 text-center">
                              ... and {csvData.length - 3} more participants
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          {/* Submit Button */}
          <div className="flex justify-end items-center">
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
