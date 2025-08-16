// // CSVUploadModal.jsx
// import React, { useState } from "react";

// const CSVUploadModal = ({ isOpen, onClose, hackathonId, baseURL }) => {
//   const [csvFile, setCsvFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const handleFileChange = (e) => {
//     setCsvFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!csvFile || !hackathonId) return;

//     const formData = new FormData();
//     formData.append("file", csvFile);

//     try {
//       setIsUploading(true);
//       const response = await fetch(`${baseURL}/users/upload-team/${hackathonId}`, {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();
//       if (response.ok) {
//         alert("CSV uploaded successfully!");
//         onClose();
//       } else {
//         alert(result.message || "Upload failed.");
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//       alert("Something went wrong during upload.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
//       <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
//         <h2 className="text-lg font-semibold mb-4">Upload CSV</h2>
//         <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
//         <div className="flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleUpload}
//             disabled={!csvFile || isUploading}
//             className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
//           >
//             {isUploading ? "Uploading..." : "Upload"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CSVUploadModal;


import React, { useEffect, useRef, useState } from "react";

const CSVUploadModal = ({ isOpen, onClose, hackathonId, baseURL }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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
    setCsvFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!csvFile || !hackathonId) return;

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      setIsUploading(true);
      const response = await fetch(`${baseURL}/users/upload-team/${hackathonId}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("CSV uploaded successfully!");
        onClose();
      } else {
        alert(result.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Upload CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!csvFile || isUploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
