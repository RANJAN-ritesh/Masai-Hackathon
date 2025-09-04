import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { MyContext } from '../context/AuthContextProvider';
import { X, Upload, Eye, Mail, Users, Download } from 'lucide-react';

const CSVManagementModal = ({ isOpen, onClose, hackathonId }) => {
  const { userData, hackathon } = useContext(MyContext);
  const [csvData, setCsvData] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [participantsAdded, setParticipantsAdded] = useState(false);
  
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  // Resolve effective hackathon id from props, context, or localStorage
  const effectiveHackathonId = hackathonId || hackathon?._id || localStorage.getItem('currentHackathon') || '';


  if (!effectiveHackathonId) {
    console.error('❌ CSV MODAL: No valid hackathon ID found');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Hackathon ID Required</h2>
            <p className="text-gray-600 mb-4">
              No valid hackathon ID found. Please close this modal and open it from a specific hackathon card.
            </p>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Close Modal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setCsvData(results.data);
            setUploadedData(results.data);
            toast.success(`CSV uploaded successfully! ${results.data.length} participants found.`);
          } else {
            toast.error('No data found in CSV file');
          }
        },
        error: (error) => {
          toast.error('Error parsing CSV file');
          console.error('CSV parsing error:', error);
        }
      });
    }
  };

  const handleAddParticipants = async () => {
    console.log('🔍 CSV UPLOAD DEBUG:', {
      effectiveHackathonId,
      propHackathonId: hackathonId,
      contextHackathonId: hackathon?._id,
      localStorageId: localStorage.getItem('currentHackathon'),
      uploadedDataLength: uploadedData?.length
    });

    if (!effectiveHackathonId) {
      toast.error('Valid hackathon ID is required. Please open this modal from a specific hackathon card or select a hackathon first.');
      return;
    }
    if (!uploadedData || uploadedData.length === 0) {
      toast.error('No data to add');
      return;
    }

    setIsProcessing(true);
    try {
      // Map uploaded rows to backend-expected schema with robust key handling
      const participantsData = uploadedData.map(row => ({
        "First Name": row["First Name"] || row["first name"] || row["FirstName"] || row["firstname"] || (row.name || row.Name || "").split(" ")[0] || "",
        "Last Name": row["Last Name"] || row["last name"] || row["LastName"] || row["lastname"] || (() => {
          const n = (row.name || row.Name || "").trim();
          const parts = n.split(" ");
          return parts.length > 1 ? parts.slice(1).join(" ") : "";
        })(),
        "Email": row["Email"] || row["email"] || row["EMAIL"] || "",
        "Phone": row["Phone"] || row["phone"] || row["PHONE"] || row["Contact"] || "",
        "Course": row["Course"] || row["course"] || row["COURSE"] || "Not Specified",
        "Skills": row["Skills"] || row["skills"] || row["SKILLS"] || "",
        "Vertical": row["Vertical"] || row["vertical"] || row["VERTICAL"] || "Not Specified",
        "Role": row["Role"] || row["role"] || row["ROLE"] || 'member'
      }));

      console.log('🔍 CSV PAYLOAD:', {
        hackathonId: effectiveHackathonId,
        participantsCount: participantsData.length,
        firstParticipant: participantsData[0]
      });

      const response = await fetch(`${baseURL}/users/upload-participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: participantsData,
          hackathonId: effectiveHackathonId
        }),
      });

      console.log('🔍 CSV UPLOAD RESPONSE:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 CSV UPLOAD SUCCESS:', result);
        toast.success(result.message || 'Participants added successfully!');
        
        // Display notifications if any
        if (result.notifications && result.notifications.length > 0) {
          result.notifications.forEach(notification => {
            if (notification.type === 'info') {
              toast.info(
                <div>
                  <div className="font-semibold">{notification.title}</div>
                  <div className="text-sm">{notification.message}</div>
                  {notification.details && notification.details.length > 0 && (
                    <div className="text-xs mt-1">
                      {notification.details.slice(0, 3).map((detail, idx) => (
                        <div key={idx}>• {detail.email} → {detail.currentHackathon}</div>
                      ))}
                      {notification.details.length > 3 && (
                        <div className="text-xs">... and {notification.details.length - 3} more</div>
                      )}
                    </div>
                  )}
                </div>,
                { autoClose: 8000 }
              );
            }
          });
        }
        
        setParticipantsAdded(true);
        // Store the uploaded data in localStorage for persistence
        localStorage.setItem(`csvData_${effectiveHackathonId}`, JSON.stringify(uploadedData));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add participants');
      }
    } catch (error) {
      console.error('Error adding participants:', error);
      toast.error('Error adding participants');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendEmails = () => {
    // Placeholder for future email functionality
    toast.info('Email functionality coming soon! This will send welcome emails to all participants.');
  };

  const handleDownloadTemplate = () => {
    const template = [
      { name: 'John Doe', email: 'john@example.com', role: 'member' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'leader' }
    ];
    
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Load persisted data when component mounts
  React.useEffect(() => {
    if (effectiveHackathonId && isOpen) {
      const persistedData = localStorage.getItem(`csvData_${effectiveHackathonId}`);
      if (persistedData) {
        try {
          const parsedData = JSON.parse(persistedData);
          setUploadedData(parsedData);
          setCsvData(parsedData);
        } catch (error) {
          console.error('Error parsing persisted data:', error);
        }
      }
    }
  }, [effectiveHackathonId, isOpen]);

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">CSV Participant Management</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600 mb-4">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">
              CSV files only. Download template below.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {uploadedData && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide' : 'View'} Data
              </button>
              
              <button
                onClick={handleAddParticipants}
                disabled={isProcessing || participantsAdded}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="h-4 w-4 mr-2" />
                {isProcessing ? 'Adding...' : participantsAdded ? 'Added ✓' : 'Add Participants'}
              </button>
              
              {participantsAdded && (
                <button
                  onClick={handleSendEmails}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Welcome Emails
                </button>
              )}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {showPreview && uploadedData && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Uploaded Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(uploadedData[0] || {}).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {value || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadedData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing first 10 rows of {uploadedData.length} total rows
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status Information */}
        {uploadedData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
            <div className="text-sm text-gray-600">
              <p>• CSV uploaded: {uploadedData.length} participants</p>
              <p>• Participants added: {participantsAdded ? 'Yes' : 'No'}</p>
              <p>• Data persists across browser sessions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVManagementModal; 