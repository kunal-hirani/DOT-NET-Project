import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ targetDate, label = 'Ends in', onExpire }) {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem', justifyContent: 'center' }}>
        <Clock size={14} /> <span>Voting Time Concluded</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 600, justifyContent: 'center', marginBottom: 4 }}>
        <Clock size={13} /> <span>{label}</span>
      </div>
      <div className="countdown-box">
        <div className="countdown-unit">
          <div className="countdown-val">{timeLeft.days}</div>
          <div className="countdown-lbl">Days</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-val">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="countdown-lbl">Hours</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-val">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="countdown-lbl">Mins</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-val">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="countdown-lbl">Secs</div>
        </div>
      </div>
    </div>
  );
}
