import { useState } from "react";
import Papa from "papaparse";
import { Upload, File, CheckCircle, XCircle } from "lucide-react";

const CreateUser = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [users, setUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [fileName, setFileName] = useState(""); // Add this
  const [file, setFile] = useState(null); // replaces `users`

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setFileName(uploadedFile.name);
    setFile(uploadedFile); // just store the File object
  };

  const handleUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    setUploading(true);
    setProgress(0);
    setSuccessCount(0);
    setErrorCount(0);

    const formData = new FormData();
    formData.append("file", file); // field name "file"

    try {
      const response = await fetch(`${baseURL}/users/upload-users`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessCount(result.successCount || 1);
        setErrorCount(result.errorCount || 0);
        alert("CSV uploaded successfully!");
      } else {
        alert(result.message || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong.");
    }

    setProgress(100);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            User CSV Uploader
          </h2>
          <p className="text-gray-600">
            Upload a CSV file to create multiple users
          </p>
        </div>

        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-12 h-12 text-indigo-600 mb-4" />
            <p className="text-gray-600 mb-2">
              {fileName
                ? `Selected: ${fileName}`
                : "Drag and drop or click to upload CSV"}
            </p>
            <span className="text-xs text-gray-500">
              CSV files only (Supports user creation)
            </span>
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`w-full flex items-center justify-center py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
            uploading || !file
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
          }`}
        >
          {uploading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </div>
          ) : (
            "Start Upload"
          )}
        </button>

        {(fileName || uploading) && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>{successCount} Successfully Created</span>
              </div>
              <div className="flex items-center">
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
                <span>{errorCount} Failed</span>
              </div>
              <span>{progress.toFixed(0)}% Complete</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUser;

// import { useState } from "react";
// import Papa from "papaparse";
// import { Upload, File, CheckCircle, XCircle } from "lucide-react";

// const CreateUser = () => {
//   const baseURL = import.meta.env.VITE_BASE_URL;
//   const [users, setUsers] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [successCount, setSuccessCount] = useState(0);
//   const [errorCount, setErrorCount] = useState(0);
//   const [fileName, setFileName] = useState("");

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setFileName(file.name);

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: function (results) {
//         setUsers(results.data);
//       },
//     });
//   };

//   const createUser = async (userData) => {
//     // console.log(userData);
//     // console.log(JSON.stringify(userData));
//     try {
//       const response = await fetch(`${baseURL}/users/upload-users`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: userData.userId,
//           name: userData.name,
//           email: userData.email,
//           password: userData.password,
//           course: userData.course,
//           skills: userData.skills,
//           vertical: userData.vertical,
//           phoneNumber: userData.phoneNumber,
//           code: userData.code,
//           track: userData.track,
//           isVerified: userData.isVerified, // Convert to boolean
//           role: userData.role,
//           // teamId: "asdsaw34wrtedrger",
//         }),
//       });

//       if (response.ok) {
//         setSuccessCount((prev) => prev + 1);
//       } else {
//         setErrorCount((prev) => prev + 1);
//       }
//     } catch (error) {
//       setErrorCount((prev) => prev + 1);
//     }
//   };

//   const handleUpload = async () => {
//     if (users.length === 0) {
//       alert("No users to upload!");
//       return;
//     }

//     setUploading(true);
//     setProgress(0);
//     setSuccessCount(0);
//     setErrorCount(0);

//     for (let i = 0; i < users.length; i++) {
//       await createUser(users[i]);
//       setProgress(((i + 1) / users.length) * 100);
//     }

//     setUploading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-md space-y-8 bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
//         <div className="text-center">
//           <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
//             User CSV Uploader
//           </h2>
//           <p className="text-gray-600">
//             Upload a CSV file to create multiple users
//           </p>
//         </div>

//         <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
//           <input
//             type="file"
//             accept=".csv"
//             onChange={handleFileUpload}
//             className="hidden"
//             id="file-upload"
//           />
//           <label
//             htmlFor="file-upload"
//             className="cursor-pointer flex flex-col items-center"
//           >
//             <Upload className="w-12 h-12 text-indigo-600 mb-4" />
//             <p className="text-gray-600 mb-2">
//               {fileName
//                 ? `Selected: ${fileName}`
//                 : "Drag and drop or click to upload CSV"}
//             </p>
//             <span className="text-xs text-gray-500">
//               CSV files only (Supports user creation)
//             </span>
//           </label>
//         </div>

//         <button
//           onClick={handleUpload}
//           disabled={uploading || users.length === 0}
//           className={`w-full flex items-center justify-center py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
//             uploading || users.length === 0
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
//           }`}
//         >
//           {uploading ? (
//             <div className="flex items-center">
//               <svg
//                 className="animate-spin h-5 w-5 mr-3"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Uploading...
//             </div>
//           ) : (
//             "Start Upload"
//           )}
//         </button>

//         {(fileName || uploading) && (
//           <div className="mt-6">
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
//               <div
//                 className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//             <div className="flex justify-between items-center text-sm text-gray-600">
//               <div className="flex items-center">
//                 <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                 <span>{successCount} Successfully Created</span>
//               </div>
//               <div className="flex items-center">
//                 <XCircle className="w-4 h-4 text-red-500 mr-2" />
//                 <span>{errorCount} Failed</span>
//               </div>
//               <span>{progress.toFixed(0)}% Complete</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateUser;
