import { useEffect, useRef, useState } from "react";
import { MdWifi, MdWifiOff } from "react-icons/md";

const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  // Animation state
  const [isLeaving, setIsLeaving] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const handleOffline = () => {
      clearTimers();

      setIsOnline(false);
      setIsLeaving(false);
      setShowBanner(true);
    };

    const handleOnline = () => {
      clearTimers();

      setIsOnline(true);
      setIsLeaving(false);
      setShowBanner(true);

      timeoutRef.current = window.setTimeout(() => {
        setIsLeaving(true);

        leaveTimeoutRef.current = window.setTimeout(() => {
          setShowBanner(false);
          setIsLeaving(false);
        }, 400);
      }, 3600);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      clearTimers();

      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleDismiss = () => {
    clearTimers();

    setIsLeaving(true);

    leaveTimeoutRef.current = window.setTimeout(() => {
      setShowBanner(false);
      setIsLeaving(false);
    }, 400);
  };

  return (
    <>
      {showBanner && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 p-4 rounded-xl shadow-lg max-w-[380px]
          ${
            isOnline
              ? "bg-green-50 border border-green-300"
              : "bg-red-50 border border-red-300"
          }
          ${
            isLeaving
              ? "animate-[slideUp_0.4s_ease_forwards]"
              : "animate-[slideDown_0.35s_ease]"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${isOnline ? "bg-green-600" : "bg-red-600"}`}
          >
            {isOnline ? (
              <MdWifi className="text-white" size={20} />
            ) : (
              <MdWifiOff className="text-white" size={20} />
            )}
          </div>

          <div className="flex-1">
            <h4
              className={`text-sm font-semibold mb-0.5 ${
                isOnline ? "text-green-800" : "text-red-800"
              }`}
            >
              {isOnline ? "Connected!" : "No Internet"}
            </h4>

            <p
              className={`text-xs opacity-80 ${
                isOnline ? "text-green-700" : "text-red-700"
              }`}
            >
              {isOnline
                ? "Your internet connection is restored."
                : "Please check your network connection."}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className={`text-lg p-1 opacity-50 hover:opacity-100 transition ${
              isOnline ? "text-green-800" : "text-red-800"
            }`}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            top: -80px;
            opacity: 0;
          }
          to {
            top: 24px;
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            top: 24px;
            opacity: 1;
          }
          to {
            top: -80px;
            opacity: 0;
          }
        }
      `}</style>

      {children}
    </>
  );
};

export default NetworkProvider;
