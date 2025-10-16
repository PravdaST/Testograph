"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [hasShown, setHasShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Exit intent (mouse leave)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  // Timer - показва popup след 45 секунди престой
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    }, 45000); // 45 секунди

    return () => clearTimeout(timer);
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-discount-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          discountCode: 'FIRST10',
          packageName: 'СТАРТ Пакет',
          originalPrice: 97,
          discountedPrice: 87,
          shopifyUrl: 'https://shop.testograph.eu/products/starter',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Response:', result);

        if (!result.database?.saved && result.database?.error) {
          console.error('⚠️ Email sent but database save failed:', result.database.error);
        }

        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 3000);
      } else {
        console.error('Failed to send email');
        alert('Възникна грешка. Моля опитай отново.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Възникна грешка. Моля опитай отново.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-center">
            Чакай! Преди да напуснеш...
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Вземи допълнителни 10% отстъпка за първа поръчка
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Успешно! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                Изпратихме ти промокода <strong>FIRST10</strong> на имейл.
              </p>
              <p className="text-sm text-muted-foreground">
                Провери входящите си съобщения (и SPAM папката) 📧
              </p>
            </div>
          ) : (
            <>
              {/* Offer */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-90" />
                <p className="text-4xl font-black mb-2">87 лв</p>
                <p className="text-sm opacity-90">вместо 97 лв</p>
                <p className="text-base font-semibold mt-3">
                  Получи промокода на имейл!
                </p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Остави имейл и ще ти изпратим кода за 10 лв отстъпка:
                  </label>
                  <Input
                    type="email"
                    placeholder="твоят@имейл.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Изпращам...
                    </>
                  ) : (
                    'Изпрати ми кода за 10 лв отстъпка'
                  )}
                </Button>
              </form>

              {/* Decline */}
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Не, благодаря - продължавам без отстъпката
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
