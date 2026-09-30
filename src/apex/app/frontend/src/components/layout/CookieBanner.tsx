import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { appTexts } from "../../texts";

const COOKIE_CONSENT_KEY = "cookie-consent-dismissed";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const texts = appTexts.cookieBannerTexts;

  useEffect(() => {
    const dismissed = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary-700 text-white shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm flex-1">{texts.message}</p>
        <button
          onClick={handleDismiss}
          className="flex items-center gap-1 px-4 py-2 bg-white text-primary-700 rounded hover:bg-gray-100 transition-colors text-sm font-medium whitespace-nowrap"
          aria-label="Dismiss cookie notice"
        >
          <span>{texts.dismissButton}</span>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
