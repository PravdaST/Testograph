"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Cookie, Settings } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply consent settings (can be extended to actually disable/enable tracking)
    if (prefs.analytics) {
      // Enable Google Analytics
      console.log("Analytics enabled");
    } else {
      // Disable Google Analytics
      console.log("Analytics disabled");
    }

    if (prefs.marketing) {
      // Enable marketing pixels
      console.log("Marketing enabled");
    } else {
      // Disable marketing pixels
      console.log("Marketing disabled");
    }
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t-2 border-primary shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">
                🍪 Ние използваме бисквитки
              </h3>
              <p className="text-sm text-muted-foreground">
                Използваме бисквитки за подобряване на потребителското изживяване, анализ на трафика
                и персонализиране на съдържанието. Можете да управлявате предпочитанията си по всяко време.{" "}
                <Link href="/cookies" className="text-primary hover:underline font-medium">
                  Научете повече
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Настройки
            </Button>
            <Button
              onClick={acceptNecessary}
              variant="outline"
              size="sm"
            >
              Само необходими
            </Button>
            <Button
              onClick={acceptAll}
              size="sm"
              className="bg-primary hover:bg-primary/90 font-semibold"
            >
              Приеми всички
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Настройки за бисквитки
            </DialogTitle>
            <DialogDescription>
              Управлявайте Вашите предпочитания за бисквитки. Можете да включите или изключите различни типове бисквитки по-долу.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Necessary Cookies */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    ✅ Абсолютно необходими бисквитки
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Тези бисквитки са задължителни за функционирането на сайта.
                    Без тях сайтът няма да работи правилно.
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">Винаги активни</span>
                </div>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    ⚙️ Функционални бисквитки
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Позволяват на сайта да запомня Вашите избори (език, тема, запазени данни).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences({ ...preferences, functional: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    📊 Аналитични бисквитки
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Помагат ни да разберем как посетителите използват сайта (Google Analytics, Vercel Analytics).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    🎯 Маркетингови бисквитки
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Използват се за персонализирани реклами и проследяване на рекламни кампании (Facebook Pixel, Google Ads).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <Link href="/cookies" className="text-primary hover:underline">
                Политика за бисквитки
              </Link>
              {" | "}
              <Link href="/privacy" className="text-primary hover:underline">
                Поверителност
              </Link>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
              >
                Затвори
              </Button>
              <Button
                onClick={saveCustomPreferences}
                className="bg-primary hover:bg-primary/90"
              >
                Запази предпочитания
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
