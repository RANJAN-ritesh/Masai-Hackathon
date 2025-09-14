import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const SubmissionTimer = ({ hackathon, userRole = 'member' }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('waiting'); // waiting, open, closed

  useEffect(() => {
    if (!hackathon?.submissionStartDate || !hackathon?.submissionEndDate) {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date(hackathon.submissionStartDate);
      const endDate = new Date(hackathon.submissionEndDate);

      if (now < startDate) {
        // Submission hasn't started yet
        setSubmissionStatus('waiting');
        const difference = startDate - now;
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          message: 'Submissions open in',
          status: 'waiting'
        };
      } else if (now >= startDate && now < endDate) {
        // Submission window is open
        setSubmissionStatus('open');
        const difference = endDate - now;
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          message: 'Submissions close in',
          status: 'open'
        };
      } else {
        // Submission window has closed
        setSubmissionStatus('closed');
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          message: 'Submissions closed',
          status: 'closed'
        };
      }
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hackathon?.submissionStartDate, hackathon?.submissionEndDate]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  if (!timeLeft || !hackathon?.submissionStartDate) {
    return null;
  }

  const getStatusIcon = () => {
    switch (submissionStatus) {
      case 'waiting':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'open':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (submissionStatus) {
      case 'waiting':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'open':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'closed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon()}
        <h3 className="font-semibold text-lg">
          {timeLeft.message}
        </h3>
      </div>
      
      {submissionStatus !== 'closed' && (
        <div className="flex items-center gap-4 text-2xl font-mono">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold">{formatTime(timeLeft.days)}</div>
              <div className="text-sm opacity-75">Days</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-3xl font-bold">{formatTime(timeLeft.hours)}</div>
            <div className="text-sm opacity-75">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{formatTime(timeLeft.minutes)}</div>
            <div className="text-sm opacity-75">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{formatTime(timeLeft.seconds)}</div>
            <div className="text-sm opacity-75">Seconds</div>
          </div>
        </div>
      )}

      {submissionStatus === 'closed' && (
        <div className="text-center">
          <p className="text-lg font-medium">Submissions are no longer accepted</p>
        </div>
      )}

      {hackathon?.submissionDescription && (
        <div className="mt-4 p-3 bg-white/50 rounded-md">
          <p className="text-sm font-medium mb-1">Submission Guidelines:</p>
          <p className="text-sm opacity-90">{hackathon.submissionDescription}</p>
        </div>
      )}

      {/* Participant-specific instructions */}
      {userRole === 'member' && submissionStatus === 'open' && (
        <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: '#d97706' }} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#92400e' }}>
                Team Member Notice
              </p>
              <p className="text-sm" style={{ color: '#92400e', opacity: 0.9 }}>
                Only your team leader can submit the project. Once your team's work is complete, 
                please notify your team leader to submit the project before the deadline.
              </p>
            </div>
          </div>
        </div>
      )}

      {userRole === 'member' && submissionStatus === 'waiting' && (
        <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#dbeafe', border: '1px solid #3b82f6' }}>
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 mt-0.5" style={{ color: '#2563eb' }} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#1e40af' }}>
                Submission Period Not Started
              </p>
              <p className="text-sm" style={{ color: '#1e40af', opacity: 0.9 }}>
                The submission period hasn't started yet. Your team leader will be able to submit 
                once the submission window opens.
              </p>
            </div>
          </div>
        </div>
      )}

      {userRole === 'member' && submissionStatus === 'closed' && (
        <div className="mt-4 p-3 rounded-md" style={{ backgroundColor: '#fef2f2', border: '1px solid #ef4444' }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: '#dc2626' }} />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#991b1b' }}>
                Submission Period Closed
              </p>
              <p className="text-sm" style={{ color: '#991b1b', opacity: 0.9 }}>
                The submission period has ended. If your team leader hasn't submitted yet, 
                please contact the organizers immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionTimer;
