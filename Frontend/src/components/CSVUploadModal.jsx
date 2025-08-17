import React, { useEffect, useRef, useState } from "react";
import Papa from "papaparse"; // Make sure papaparse is installed

const CSVUploadModal = ({ isOpen, onClose, hackathonId, baseURL }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [error, setError] = useState(null);
  const modalRef = useRef();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    setError(null);
    
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError("Error parsing CSV file");
            return;
          }
          setCsvData(results.data);
        },
        error: (error) => {
          setError("Error reading CSV file");
        }
      });
    }
  };

  const handleUpload = async () => {
    if (!csvData || !hackathonId) return;

    try {
      setIsUploading(true);
      setError(null);
      
      const response = await fetch(`${baseURL}/users/upload-participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participants: csvData,
          hackathonId: hackathonId
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`CSV uploaded successfully! ${result.uploadedCount} participants created.`);
        onClose();
      } else {
        setError(result.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ["First Name", "Last Name", "Email", "Course", "Skills", "Vertical", "Phone", "Role"],
      ["John", "Doe", "john.doe@example.com", "Software Engineering", "JavaScript, React", "Tech", "123-456-7890", "Participant"],
      ["Jane", "Smith", "jane.smith@example.com", "Data Science", "Python, SQL", "Business", "987-654-3210", "Participant"]
    ];

    const csvContent = Papa.unparse(templateData);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participant_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
      >
        <h2 className="text-lg font-semibold mb-4">Upload Participants CSV</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <div className="flex items-center space-x-3">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={() => downloadTemplate()}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Download Template
            </button>
          </div>
        </div>
        
        {csvData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>{csvData.length} participants</strong> found in CSV
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Expected columns: First Name, Last Name, Email, Course, Skills, Vertical, Phone, Role
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!csvData || isUploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload Participants"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
