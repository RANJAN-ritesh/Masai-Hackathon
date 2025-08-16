import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";
import {
  ArrowRight,
  CalendarRange,
  MapPin,
  Trophy,
  Users,
  Frown,
  Sparkles,
  Delete,
  DeleteIcon,
  Trash2,
  Pencil,
  UserPlus,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "./ConfirmationModal";
import CSVUploadModal from "./CSVUploadModal";

const EligibleHackathons = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const { setCurrentHackathonId, userData, role } = useContext(MyContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);

  const handleCSVUploadClick = (hackathonId) => {
    setSelectedHackathonId(hackathonId);
    setCsvModalOpen(true);
  };

  const fetchHackathons = async (user) => {
    setLoading(true);
    if (role === "admin") {
      // console.log("Going here");
      try {
        const response = await fetch(`${baseURL}/hackathons`);
        const data = await response.json();
        // console.log("Hackathons Data: ", data);
        if (data?.message === "No Hackathons Found") {
          setHackathons([]);
        } else {
          setHackathons(data);
        }
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await fetch(`${baseURL}/registrations/user/${userId}`);
        const data = await response.json();
        console.log("Hackathons Data for member: ", data);
        if (data?.message === "No registrations found for this user") {
          setHackathons([]);
        } else {
          setHackathons(data);
        }
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (userData) {
      // console.log("This is parsed data", userData);
      fetchHackathons(userData); // pass parsed data directly
    } else {
      setLoading(false); // fallback if no user is found
    }
  }, [userData]);

  const handleDelete = async (id) => {
    const response = await fetch(`${baseURL}/hackathons/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Hackathon Deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      toast.warning("Failed to delete hackathon. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    fetchHackathons(userData);
  };

  const handleCreateTeam = async (hackathon) => {
    try {
      const response = await fetch(`${baseURL}/team/auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          minSize: hackathon.minTeamSize,
          maxSize: hackathon.maxTeamSize,
          hackathonId: `${hackathon._id}`,
        }),
      });
      if (response.ok) {
        toast.success("Teams created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.warning("Failed to create teams. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("An error occurred while creating the teams.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCardClick = (hackathonId) => {
    setCurrentHackathonId(hackathonId);
    // console.log("Current Hackathon ID: ", hackathonId);
    localStorage.setItem("currentHackathon", hackathonId);
    navigate(`/hackathon`);
  };

  // Format date with options
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate status based on dates
  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return {
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
        icon: <Sparkles className="w-4 h-4 mr-1" />,
      };
    } else if (now > end) {
      return {
        label: "Completed",
        color: "bg-gray-100 text-gray-800",
        icon: <Trophy className="w-4 h-4 mr-1" />,
      };
    } else {
      return {
        label: "Active",
        color: "bg-green-100 text-green-800",
        icon: <Users className="w-4 h-4 mr-1" />,
      };
    }
  };

  // Configure Modal based on Action and Pass Arguments
  const openModal = (actionType, hackathon) => {
    if (actionType === "create") {
      setModalConfig({
        title: "Confirm Create Teams",
        message: `Are you sure you want to create the teams for ${hackathon.name}.`,
        onConfirm: () => {
          handleCreateTeam(hackathon);
          setIsModalOpen(false);
        },
      });
    } else if (actionType === "delete") {
      setModalConfig({
        title: "Confirm Deleting Team",
        message:
          "Are you sure you want to delete the Hackathon? This action is irreversible.",
        onConfirm: () => {
          handleDelete(hackathon._id);
          setIsModalOpen(false);
        },
      });
    }
    setIsModalOpen(true);
  };

  return (
    hackathons && (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header with background effect */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-indigo-600 opacity-5 rounded-xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Hackathons</h1>
                <p className="text-gray-500 max-w-xl">
                  {role === "admin" 
                    ? "Manage your hackathon events and participant teams" 
                    : "View your registered hackathons and team details"}
                </p>
              </div>
              {role === "admin" && (
                <Link to="/create-hackathon">
                  <button className="mt-6 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center shadow-md">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create New Hackathon
                  </button>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="bg-indigo-50 p-5 rounded-full inline-block mb-6">
                <Frown className="w-16 h-16 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Hackathons Found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                {role === "admin" 
                  ? "You haven't created any hackathons yet. Start by creating your first event!"
                  : "You haven't registered for any hackathons yet. Join an event to see it here."}
              </p>
              {role === "admin" && (
                <Link to="/create-hackathon">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    Create Your First Hackathon
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {role === "admin"
                ? hackathons.map((registration) => {
                    const status = getEventStatus(
                      registration.startDate,
                      registration.endDate
                    );

                    return (
                      <div
                        key={registration._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100 group"
                      >
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-6">
                          <div
                            className="flex justify-between items-start mb-4 cursor-pointer"
                            onClick={() => handleCardClick(registration._id)}
                          >
                            <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                              {registration.name}
                            </h3>
                            <span
                              className={`flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div
                            className="space-y-3 mb-6 cursor-pointer"
                            onClick={() => handleCardClick(registration._id)}
                          >
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarRange className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="font-medium">{formatDate(registration.startDate)} - {formatDate(registration.endDate)}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                              <span>{registration.eventType}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                              <button
                                onClick={() => openModal("create", registration)}
                                className="bg-gradient-to-r from-purple-300 to-indigo-400 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Create Teams
                              </button>

                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCSVUploadClick(registration._id)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all duration-300"
                                  title="Upload Participants"
                                >
                                  <UserPlus className="w-5 h-5" />
                                </button>

                                <Link to={`/edithackathon/${registration._id}`}>
                                  <button 
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-all duration-300"
                                    title="Edit Hackathon"
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                </Link>

                                <button
                                  onClick={() => openModal("delete", registration)}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-all duration-300"
                                  title="Delete Hackathon"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>

                                <div
                                  className="bg-indigo-100 hover:bg-indigo-200 p-2 rounded-lg cursor-pointer transition-all duration-300"
                                  onClick={() => handleCardClick(registration._id)}
                                  title="View Details"
                                >
                                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                                </div>
                              </div>

                              {/* Reusable Confirmation Modal */}
                              <ConfirmationModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onConfirm={modalConfig.onConfirm}
                                title={modalConfig.title}
                                message={modalConfig.message}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : hackathons.map((registration) => {
                    const status = getEventStatus(
                      registration.hackathonId.startDate,
                      registration.hackathonId.endDate
                    );

                    return (
                      <div
                        key={registration._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
                        onClick={() => handleCardClick(registration?.hackathonId?._id)}
                      >
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                              {registration?.hackathonId?.name}
                            </h3>
                            <span
                              className={`flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarRange className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="font-medium">
                                {formatDate(registration?.hackathonId?.startDate)} - {formatDate(registration?.hackathonId?.endDate)}
                              </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                              <span>{registration?.hackathonId?.eventType}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <div className="bg-indigo-50 px-4 py-3 rounded-lg">
                                <p className="text-md font-semibold text-indigo-900">
                                  {registration.teamId?.teamName || "No Team"}
                                </p>
                                <p className="text-xs text-indigo-600 mt-1">
                                  {console.log(registration)}
                                  Role: <span className="font-medium">{registration?.role}</span>
                                </p>
                              </div>
                              <div className="bg-indigo-100 hover:bg-indigo-200 p-3 rounded-lg transition-all duration-300">
                                <ArrowRight className="w-5 h-5 text-indigo-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}
        </div>
        <CSVUploadModal
          isOpen={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          hackathonId={selectedHackathonId}
          baseURL={baseURL}
        />
      </div>
    )
  );
};

export default EligibleHackathons;

// import React, { useContext, useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { MyContext } from "../context/AuthContextProvider";
// import {
//   ArrowRight,
//   CalendarRange,
//   MapPin,
//   Trophy,
//   Users,
//   Frown,
//   Sparkles,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ConfirmationModal from "./ConfirmationModal";

// const EligibleHackathons = () => {
//   const baseURL = import.meta.env.VITE_BASE_URL;
//   const [hackathons, setHackathons] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const userId = localStorage.getItem("userId");
//   const { setCurrentHackathonId, userData } = useContext(MyContext);
//   const navigate = useNavigate();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalConfig, setModalConfig] = useState({});

//   // Configure Modal based on Action and Pass Arguments
//   const openModal = (actionType, hackathon, e) => {
//     if (actionType === "create") {
//       setModalConfig({
//         title: "Confirm Create Teams",
//         message: `Are you sure you want to create the teams for ${hackathon.name}.`,
//         onConfirm: () => {
//           handleCreateTeam(hackathon._id, e);
//           setIsModalOpen(false);
//         },
//       });
//     } else if (actionType === "delete") {
//       setModalConfig({
//         title: "Confirm Deleting Team",
//         message:
//           "Are you sure you want to delete the Hackathon? This action is irreversible.",
//         onConfirm: () => {
//           handleDelete(hackathon._id, e);
//           setIsModalOpen(false);
//         },
//       });
//     }
//     setIsModalOpen(true);
//   };

//   const fetchHackathons = async (user) => {
//     setLoading(true);
//     const role = user?.role;
//     if (role === "admin") {
//       try {
//         const response = await fetch(`${baseURL}/hackathons`);
//         const data = await response.json();
//         if (data?.message === "No Hackathons Found") {
//           setHackathons([]);
//         } else {
//           setHackathons(data);
//         }
//       } catch (error) {
//         console.error("Error fetching hackathons:", error);
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       try {
//         const response = await fetch(`${baseURL}/registrations/user/${userId}`);
//         const data = await response.json();
//         if (data?.message === "No registrations found for this user") {
//           setHackathons([]);
//         } else {
//           setHackathons(data.registrations);
//         }
//       } catch (error) {
//         console.error("Error fetching hackathons:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     if (userData) {
//       fetchHackathons(userData);
//     } else {
//       setLoading(false);
//     }
//   }, [userData]);

//   const handleDelete = async (id) => {
//     const response = await fetch(`${baseURL}/hackathons/${id}`, {
//       method: "DELETE",
//     });
//     fetchHackathons();
//   };

//   const handleCreateTeam = async (id) => {
//     try {
//       const response = await fetch(`${baseURL}/team/auto`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           minSize: 3,
//           maxSize: 5,
//           hackathonId: `${id}`,
//         }),
//       });
//       if (response.ok) {
//         toast.success("Team created successfully!", {
//           position: "top-right",
//         });
//       } else {
//         toast.warning("Failed to create team. Please try again.", {
//           position: "top-right",
//         });
//       }
//     } catch (error) {
//       console.error("Error creating team:", error);
//       toast.error("An error occurred while creating the team.", {
//         position: "top-right",
//       });
//     }
//   };

//   const handleCardClick = (hackathonId) => {
//     setCurrentHackathonId(hackathonId);
//     localStorage.setItem("currentHackathon", hackathonId);
//     navigate(`/hackathon`);
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const getEventStatus = (startDate, endDate) => {
//     const now = new Date();
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (now < start) {
//       return {
//         label: "Upcoming",
//         color: "bg-blue-100 text-blue-800",
//         icon: <Sparkles className="w-4 h-4 mr-1" />,
//       };
//     } else if (now > end) {
//       return {
//         label: "Completed",
//         color: "bg-gray-100 text-gray-800",
//         icon: <Trophy className="w-4 h-4 mr-1" />,
//       };
//     } else {
//       return {
//         label: "Active",
//         color: "bg-green-100 text-green-800",
//         icon: <Users className="w-4 h-4 mr-1" />,
//       };
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
//       <div className="p-6 max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-8">
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">
//               Your Hackathons
//             </h2>
//             <p className="text-gray-600">
//               Manage and track your hackathon journey
//             </p>
//           </div>
//           {userData?.role === "admin" && (
//             <Link to="/create-hackathon">
//               <button className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center">
//                 <Sparkles className="w-5 h-5 mr-2" />
//                 Create New Hackathon
//               </button>
//             </Link>
//           )}
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : hackathons.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-lg mx-auto border border-gray-100">
//             <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
//               <Frown className="w-10 h-10 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">
//               No Hackathons Found
//             </h3>
//             <p className="text-gray-600 mb-6">
//               You haven't registered for any hackathons yet.
//             </p>
//             <Link to="/browse-hackathons">
//               <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
//                 Browse Hackathons
//               </button>
//             </Link>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {userData?.role === "admin"
//               ? hackathons.map((registration) => {
//                   console.log(registration);
//                   const status = getEventStatus(
//                     registration.startDate,
//                     registration.endDate
//                   );

//                   return (
//                     <div
//                       key={registration._id}
//                       className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
//                     >
//                       <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
//                       <div className="p-6">
//                         <div className="flex justify-between items-start mb-3">
//                           <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
//                             {registration.name}
//                           </h3>
//                           <span
//                             className={`flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
//                           >
//                             {status.icon}
//                             {status.label}
//                           </span>
//                         </div>

//                         <div className="space-y-2 mb-4">
//                           <div className="flex items-center text-sm text-gray-600">
//                             <CalendarRange className="w-4 h-4 mr-2" />
//                             {formatDate(registration.startDate)} -{" "}
//                             {formatDate(registration.endDate)}
//                           </div>

//                           <div className="flex items-center text-sm text-gray-600">
//                             <MapPin className="w-4 h-4 mr-2" />
//                             {registration.eventType}
//                           </div>
//                         </div>

//                         <div className="pt-4 border-t border-gray-100">
//                           <div className="flex justify-between items-center ">
//                             <div>
//                               <button
//                                 onClick={() =>
//                                   handleCreateTeam(registration._id)
//                                 }
//                                 className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-2 rounded-md font-bold transition transform hover:scale-105"
//                               >
//                                 Create Team
//                               </button>
//                             </div>

//                             <div>
//                               <Link to={`/edithackathon/${registration._id}`}>
//                                 <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded-md font-bold transition transform hover:scale-105">
//                                   Edit
//                                 </button>
//                               </Link>
//                             </div>

//                             <div>
//                               <button
//                                 onClick={() => handleDelete(registration._id)}
//                                 className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md font-bold transition transform hover:scale-105"
//                               >
//                                 Delete
//                               </button>
//                             </div>

//                             <div
//                               className="bg-indigo-50 p-2 rounded-md"
//                               onClick={() => handleCardClick(registration._id)}
//                             >
//                               <ArrowRight className="w-5 h-5 text-indigo-600" />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               : hackathons.map((registration) => {
//                   console.log(registration);
//                   const status = getEventStatus(
//                     registration.hackathonId.startDate,
//                     registration.hackathonId.endDate
//                   );

//                   return (
//                     <div
//                       key={registration._id}
//                       className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
//                       onClick={() =>
//                         handleCardClick(registration.hackathonId._id)
//                       }
//                     >
//                       <div className="h-3 bg-indigo-600"></div>
//                       <div className="p-6">
//                         <div className="flex justify-between items-start mb-3">
//                           <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
//                             {registration.hackathonId.name}
//                           </h3>
//                           <span
//                             className={`flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
//                           >
//                             {status.icon}
//                             {status.label}
//                           </span>
//                         </div>

//                         <div className="space-y-2 mb-4">
//                           <div className="flex items-center text-sm text-gray-600">
//                             <CalendarRange className="w-4 h-4 mr-2" />
//                             {formatDate(
//                               registration.hackathonId.startDate
//                             )} - {formatDate(registration.hackathonId.endDate)}
//                           </div>

//                           <div className="flex items-center text-sm text-gray-600">
//                             <MapPin className="w-4 h-4 mr-2" />
//                             {registration.hackathonId.eventType}
//                           </div>
//                         </div>

//                         <div className="pt-4 border-t border-gray-100">
//                           <div className="flex justify-between items-center">
//                             <div>
//                               <p className="text-sm font-medium text-gray-900">
//                                 {registration.teamId?.teamName || "No Team"}
//                               </p>
//                               <p className="text-xs text-gray-500">
//                                 {registration.role}
//                               </p>
//                             </div>
//                             <div className="bg-indigo-50 p-2 rounded-md">
//                               <ArrowRight className="w-5 h-5 text-indigo-600" />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//           </div>
//         )}
//       </div>
//       {/* Reusable Confirmation Modal */}
//       <ConfirmationModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onConfirm={modalConfig.onConfirm}
//         title={modalConfig.title}
//         message={modalConfig.message}
//       />
//     </div>
//   );
// };

// export default EligibleHackathons;
