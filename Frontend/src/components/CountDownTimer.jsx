import React, { useState, useEffect, useContext } from "react";
import { Clock, Timer } from "lucide-react";
import { MyContext } from "../context/AuthContextProvider";

const CountDownTimer = () => {
  const { hackathon } = useContext(MyContext);

  const calculateTimeLeft = () => {
    if (!hackathon?.startDate) return null;

    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000)); // 4 hours after start

    let targetDate;

    if (now < startDate) {
      targetDate = startDate;
    } else if (now >= startDate && now < endDate) {
      targetDate = endDate;
    } else {
      return "ended";
    }

    const difference = targetDate - now;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isOngoing: now >= startDate && now < endDate,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [hackathon]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  if (!timeLeft) return null;

  if (timeLeft === "ended") {
    return (
      <div className="bg-gray-900 text-white py-6">
        <div className="container mx-auto flex items-center justify-center space-x-2">
          <span role="img" aria-label="alert" className="text-red-400 text-2xl">
            ⚠️
          </span>
          <p className="text-xl font-semibold text-red-400">
            Problem Selection Window Has Closed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white py-4">
      <div className="container mx-auto flex justify-center items-center">
        <Clock className="mr-2" size={24} />
        <div className="flex space-x-4">
          <div className="text-center">
            <span className="text-2xl font-mono">
              {formatTime(timeLeft.days)}
            </span>
            <span className="text-xs block">DAYS</span>
          </div>
          <span className="text-2xl">:</span>
          <div className="text-center">
            <span className="text-2xl font-mono">
              {formatTime(timeLeft.hours)}
            </span>
            <span className="text-xs block">HOURS</span>
          </div>
          <span className="text-2xl">:</span>
          <div className="text-center">
            <span className="text-2xl font-mono">
              {formatTime(timeLeft.minutes)}
            </span>
            <span className="text-xs block">MINUTES</span>
          </div>
          <span className="text-2xl">:</span>
          <div className="text-center">
            <span className="text-2xl font-mono">
              {formatTime(timeLeft.seconds)}
            </span>
            <span className="text-xs block">SECONDS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountDownTimer;
