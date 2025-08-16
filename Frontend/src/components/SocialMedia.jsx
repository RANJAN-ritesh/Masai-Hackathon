import React from "react";
import {
  Video,
  Youtube,
  Slack,
  Github,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

const SocialMedia = () => {
  return (
    <>
      {/* Social Media & Connect */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Connect With Us
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <a
            href="https://us06web.zoom.us/j/82747654356"
            target="_blank"
            className="flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            <Video size={20}  className="text-white"/>
            <span className="text-white">Zoom</span>
          </a>
          <a
            href="https://www.youtube.com/channel/UCENOACKQiqejXP-bb9sCnMg?view_as=subscriber"
            target="_blank"
            className="flex items-center justify-center gap-2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition"
          >
            <Youtube size={20}  className="text-white"/>
            <span className="text-white">YouTube</span>
          </a>
          <a
            href="https://bit.ly/Xto10X_Hackathon_4"
            target="_blank"
            className="flex items-center justify-center gap-2 bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition"
          >
            <Slack size={20}  className="text-white"/>
            <span className="text-white">Slack</span>
          </a>
          <a
            href="https://github.com/masai-course"
            target="_blank"
            className="flex items-center justify-center gap-2 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition"
          >
            <Github size={20}  className="text-white"/>
            <span className="text-white">GitHub</span>
          </a>
        </div>

        <h3 className="font-medium text-gray-700 mb-3">Follow Us</h3>
        <div className="flex justify-between">
          <a
            href="https://x.com/masaischool"
            target="_blank"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
          >
            <Twitter size={20} className="text-blue-800"/>
          </a>
          <a
            href="https://www.instagram.com/masaischool/"
            target="_blank"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition"
          >
            <Instagram size={20} className="text-pink-800"/>
          </a>
          <a
            href="https://www.linkedin.com/school/masaischool/posts/?feedView=all"
            target="_blank"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
          >
            <Linkedin size={20} className="text-blue-800"/>
          </a>
          <a
            href="https://github.com/masai-course"
            target="_blank"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          >
            <Github size={20} className="text-gray-800"/>
          </a>
        </div>
      </div>
    </>
  );
};

export default SocialMedia;
