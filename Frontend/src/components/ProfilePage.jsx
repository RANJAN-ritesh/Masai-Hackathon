import React, { useContext, useState } from "react";
import {
  Phone,
  Mail,
  Briefcase,
  User,
  Users,
  Code,
  GraduationCap,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import { MyContext } from "../context/AuthContextProvider";

const ProfilePage = () => {
  // This would come from your context in the real implementation
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')));
  // Generic avatar URL - replace with actual avatar service if available
  const avatarUrl =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-800">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={userData.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {userData.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 px-8 pb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {userData.name}
                  {userData.isVerified && (
                    <BadgeCheck className="w-6 h-6 text-blue-500 ml-2" />
                  )}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {userData.role.charAt(0).toUpperCase() +
                    userData.role.slice(1)}
                </p>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-lg">
                <p className="text-red-700 font-medium text-sm">
                  ID: {userData.userId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{userData.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Academic Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="text-gray-900">{userData.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Vertical</p>
                      <p className="text-gray-900">{userData.vertical}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Team Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Team ID</p>
                      <p className="text-gray-900">{userData.teamId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white px-3 py-1 rounded-full border border-gray-200"
                    >
                      <Code className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-gray-800">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
