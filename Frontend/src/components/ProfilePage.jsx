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
import { useTheme } from "../context/ThemeContextProvider";

const ProfilePage = () => {
  const { themeConfig } = useTheme();
  // This would come from your context in the real implementation
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')));
  // Generic avatar URL - replace with actual avatar service if available
  const avatarUrl =
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=80";

  return (
    <>
      {/* Global theme styles */}
      <style>{`
        .theme-card {
          background-color: ${themeConfig.cardBg} !important;
          border: 1px solid ${themeConfig.borderColor} !important;
          color: ${themeConfig.textColor} !important;
          transition: all 0.3s ease;
        }
        
        .theme-gradient-header {
          background: ${themeConfig.heroBg} !important;
        }
        
        .theme-badge {
          background-color: ${themeConfig.successColor} !important;
          color: white !important;
        }
        
        .theme-icon {
          color: ${themeConfig.accentColor} !important;
        }
        
        .theme-skill-tag {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
        }
      `}</style>

      <div 
        className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
        style={{ 
          backgroundColor: themeConfig.backgroundColor,
          color: themeConfig.textColor
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="theme-card rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div 
              className="relative h-48 theme-gradient-header"
              style={{ background: themeConfig.heroBg }}
            >
              <div className="absolute -bottom-12 left-8">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={userData.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  {userData.isVerified && (
                    <div 
                      className="absolute bottom-0 right-0 rounded-full p-1.5 border-2 border-white theme-badge"
                    >
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
                  <h1 
                    className="text-2xl font-bold flex items-center"
                    style={{ color: themeConfig.textColor }}
                  >
                    {userData.name}
                    {userData.isVerified && (
                      <BadgeCheck 
                        className="ml-2 w-6 h-6"
                        style={{ color: themeConfig.successColor }}
                      />
                    )}
                  </h1>
                  <p 
                    className="text-lg capitalize"
                    style={{ color: themeConfig.accentColor }}
                  >
                    {userData.role}
                  </p>
                </div>
                <div 
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: themeConfig.accentColor,
                    color: 'white'
                  }}
                >
                  {userData.isVerified ? "Verified" : "Pending"}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 
                    className="text-lg font-semibold mb-4 flex items-center"
                    style={{ color: themeConfig.textColor }}
                  >
                    <Mail className="mr-2 w-5 h-5 theme-icon" />
                    Contact Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 theme-icon" />
                      <span style={{ color: themeConfig.textColor }}>
                        {userData.email}
                      </span>
                    </div>
                    {userData.phoneNumber && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 theme-icon" />
                        <span style={{ color: themeConfig.textColor }}>
                          {userData.phoneNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-3 theme-icon" />
                      <span style={{ color: themeConfig.textColor }}>
                        ID: {userData.userId}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 
                    className="text-lg font-semibold mb-4 flex items-center"
                    style={{ color: themeConfig.textColor }}
                  >
                    <Briefcase className="mr-2 w-5 h-5 theme-icon" />
                    Professional Details
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-3 theme-icon" />
                      <span style={{ color: themeConfig.textColor }}>
                        {userData.course}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Code className="w-4 h-4 mr-3 theme-icon" />
                      <span style={{ color: themeConfig.textColor }}>
                        {userData.vertical}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-3 theme-icon" />
                      <span style={{ color: themeConfig.textColor }}>
                        Code: {userData.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h2 
                  className="text-lg font-semibold mb-4 flex items-center"
                  style={{ color: themeConfig.textColor }}
                >
                  <Code className="mr-2 w-5 h-5 theme-icon" />
                  Skills & Technologies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {userData.skills && userData.skills.length > 0 ? (
                    userData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium theme-skill-tag"
                        style={{
                          backgroundColor: themeConfig.accentColor,
                          color: 'white'
                        }}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span 
                      className="text-sm"
                      style={{ color: themeConfig.textColor, opacity: 0.7 }}
                    >
                      No skills listed
                    </span>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div className="border-t pt-6" style={{ borderColor: themeConfig.borderColor }}>
                <h2 
                  className="text-lg font-semibold mb-4 flex items-center"
                  style={{ color: themeConfig.textColor }}
                >
                  <CheckCircle className="mr-2 w-5 h-5 theme-icon" />
                  Account Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: themeConfig.cardBg,
                      borderColor: themeConfig.borderColor
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: themeConfig.textColor }}>
                        Email Verified
                      </span>
                      <CheckCircle 
                        className="w-5 h-5"
                        style={{ color: userData.isVerified ? themeConfig.successColor : themeConfig.warningColor }}
                      />
                    </div>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: themeConfig.cardBg,
                      borderColor: themeConfig.borderColor
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: themeConfig.textColor }}>
                        Profile Complete
                      </span>
                      <CheckCircle 
                        className="w-5 h-5"
                        style={{ color: themeConfig.successColor }}
                      />
                    </div>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: themeConfig.cardBg,
                      borderColor: themeConfig.borderColor
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: themeConfig.textColor }}>
                        Team Member
                      </span>
                      <CheckCircle 
                        className="w-5 h-5"
                        style={{ color: userData.teamId ? themeConfig.successColor : themeConfig.warningColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
