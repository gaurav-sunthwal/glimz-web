"use client"

import { useState, useEffect, useRef } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const OTPInputWithTimer = ({ 
  onOTPChange, 
  onResend, 
  loading = false, 
  resendLoading = false,
  disabled = false,
  maxLength = 4 
}) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // Start countdown when component mounts
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Reset timer when resend is clicked
  const handleResend = () => {
    if (canResend && !resendLoading) {
      setTimeLeft(30);
      setCanResend(false);
      setOtp('');
      onResend();
      
      // Start new countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleOTPChange = (value) => {
    setOtp(value);
    onOTPChange(value);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP
          maxLength={maxLength}
          value={otp}
          onChange={handleOTPChange}
          disabled={disabled || loading}
        >
          <InputOTPGroup>
            {Array.from({ length: maxLength }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Timer and Resend */}
      <div className="text-center space-y-2">
        {!canResend ? (
          <div className="text-sm text-gray-400">
            Resend OTP in{' '}
            <span className="font-mono font-bold text-purple-400">
              {formatTime(timeLeft)}
            </span>
          </div>
        ) : (
          <div className="text-sm text-green-400">
            You can now resend OTP
          </div>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || resendLoading || loading}
          className={`text-sm transition-colors duration-200 ${
            canResend && !resendLoading && !loading
              ? 'text-purple-400 hover:text-purple-300 underline cursor-pointer'
              : 'text-gray-500 cursor-not-allowed'
          }`}
        >
          {resendLoading ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default OTPInputWithTimer;
