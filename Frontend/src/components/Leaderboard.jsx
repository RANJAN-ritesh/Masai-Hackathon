import React from "react";
import { Trophy, Users, Flame } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LeaderBoard = () => {
  const leaderboardData = [
    { rank: 1, team: "The Dev Dominators", streak: 15 },
    { rank: 2, team: "Inova Ro-verge", streak: 15 },
    { rank: 3, team: "Team ADRENØ", streak: 13 },
    { rank: 4, team: "The Dev Dynamo's Solo", streak: 12 },
    { rank: 5, team: "R-Coder", streak: 9 },
    { rank: 6, team: "Let's learn actively.", streak: 6 },
    { rank: 7, team: "Vigyan Astra", streak: 6 },
    { rank: 8, team: "FlexFlow", streak: 4 },
    { rank: 9, team: "Future_Learner", streak: 3 },
    { rank: 10, team: "Rudra's Warriors", streak: 2 },
  ];
  return (
    <>
      {/* Leaderboard */}
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Leaderboard</h2>
        <div className="tflex-1 text-2xl text-center flex items-center justify-center rounded-md">Coming Soon</div>
        
        {/* <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between">
          <div className="flex items-center">
            <Trophy size={18} className="text-yellow-500 mr-2" />
            <span className="font-medium text-gray-700">Rank</span>
          </div>
          <div className="flex items-center">
            <Users size={18} className="text-blue-500 mr-2" />
            <span className="font-medium text-gray-700">Team</span>
          </div>
          <div className="flex items-center">
            <Flame size={18} className="text-red-500 mr-2" />
            <span className="font-medium text-gray-700">Streak</span>
          </div>
        </div>
        <div className="space-y-2">
          {leaderboardData.map((item) => (
            <div
              key={item.rank}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="w-16 text-center">
                {item.rank === 1 && (
                  <span className="text-yellow-500 font-bold">{item.rank}</span>
                )}
                {item.rank === 2 && (
                  <span className="text-gray-400 font-bold">{item.rank}</span>
                )}
                {item.rank === 3 && (
                  <span className="text-amber-600 font-bold">{item.rank}</span>
                )}
                {item.rank > 3 && (
                  <span className="text-gray-700">{item.rank}</span>
                )}
              </div>
              <div className="flex-1 text-center font-medium text-gray-800">
                {item.team}
              </div>
              <div className="w-16 text-center text-red-500 font-medium">
                {item.streak}
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </>
  );
};

export default LeaderBoard;
