import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";

const InteractiveElement = () => {
  const { hackathon } = useContext(MyContext);
  const prizeDetails = hackathon?.prizeDetails || [];

  // Optional color mapping based on position
  const prizeColors = {
    1: "text-yellow-400",
    2: "text-gray-300",
    3: "text-amber-600",
  };

  return (
    <>
      {/* Interactive Element */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Ready to Showcase Your Skills?
          </h2>
          <div className="max-w-3xl mx-auto mb-10 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <p className="text-lg mb-6">
              Join our hackathon and get a chance to win amazing prizes worth
              10,000!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {prizeDetails.map((prize, index) => (
                <div
                  key={prize._id}
                  className="bg-white/5 p-4 rounded-lg backdrop-blur-sm"
                >
                  <h3 className="font-bold text-xl mb-2">
                    {prize.position === 1
                      ? "1st Prize"
                      : prize.position === 2
                      ? "2nd Prize"
                      : prize.position === 3
                      ? "3rd Prize"
                      : `${prize.position}th Prize`}
                  </h3>
                  <p
                    className={`text-2xl font-bold ${
                      prizeColors[prize.position] || "text-white"
                    }`}
                  >
                    ₹{prize.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/select-team" onClick={() => window.scrollTo(0, 0)}>
              <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md font-bold transition transform hover:scale-105">
                Check Your Team
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default InteractiveElement;
