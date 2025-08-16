import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Video,
  BookOpen,
  Code,
  Lightbulb,
  ArrowRight,
  BookMarked,
} from "lucide-react";
import { MyContext } from "../context/AuthContextProvider";

function VideoConference() {
  const navigate = useNavigate();
  const [isHelpHovered, setIsHelpHovered] = useState(false);
  const [isResourceHovered, setIsResourceHovered] = useState(false);
  const { hackathon } = useContext(MyContext);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Transform Learning into Reality
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our collaborative learning platform where students help each
          other debug, innovate, and grow together. Be part of the most exciting
          student community!
        </p>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl p-8 mb-12 text-white">
        <div className="max-w-3xl">
          <h3 className="text-2xl font-bold mb-4">Student Community Hub</h3>
          <p className="text-lg mb-6">
            Dive into a 24/7 live hub where students can connect, exchange
            ideas, solve problems together, and collaborate beyond team
            boundaries.
          </p>
          <div className="flex gap-4">
            <a
              href={`https://meet.jit.si/${hackathon.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button
                // onClick={() => navigate("/meeting-room")}
                className="bg-white text-[#DD3C3C] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Join Now
              </button>
            </a>
            <button
              onClick={() => navigate("/resource-hub")}
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-[#C53030] transition-colors"
            >
              Resource Hub
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Peer Debug Sessions
          </h3>
          <p className="text-gray-600">
            Got a bug you can't solve? Join our peer-to-peer help rooms to get
            assistance or help others while improving your skills!
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
            <Code className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Code Together
          </h3>
          <p className="text-gray-600">
            Share your screen, explain solutions, and learn from others. The
            best way to learn is through collaboration!
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
            <BookMarked className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Resource Hub
          </h3>
          <p className="text-gray-600">
            Access our curated collection of coding resources, optimization
            tips, and component libraries.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-6 h-6 text-[#DD3C3C]" />
            <h3 className="text-xl font-semibold text-gray-900">
              Ready to Help?
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Share your knowledge and improve your teaching skills by helping
            other students. Join our help room and make a difference!
          </p>
          <a
            href={`https://meet.jit.si/${hackathon.name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              onMouseEnter={() => setIsHelpHovered(true)}
              onMouseLeave={() => setIsHelpHovered(false)}
              className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent font-medium hover:from-red-600 hover:to-red-800 transition-colors cursor-pointer"
            >
              Enter Help Room
              <ArrowRight
                className={`ml-2  text-red-500 group-hover:text-red-700 transform transition-transform duration-200 ${
                  isHelpHovered ? "translate-x-1" : ""
                }`}
              />
            </button>
          </a>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#DD3C3C]" />
            <h3 className="text-xl font-semibold text-gray-900">
              Learning Resources
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            Explore our comprehensive collection of tutorials, best practices,
            and coding resources to enhance your skills.
          </p>
          <Link to="/resource-hub">
            <button
              className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent font-medium hover:from-red-600 hover:to-red-800 transition-colors cursor-pointer"
              onMouseEnter={() => setIsResourceHovered(true)}
              onMouseLeave={() => setIsResourceHovered(false)}
            >
              Browse Resources
              <ArrowRight
                className={`ml-2  text-red-500 group-hover:text-red-700 transform transition-transform duration-200 ${
                  isResourceHovered ? "translate-x-1" : ""
                }`}
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VideoConference;
