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
import { X } from "lucide-react";

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [hasShown, setHasShown] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add email to mailing list
    console.log("Email submitted:", email);
    setIsOpen(false);
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
          {/* Offer */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
            <p className="text-4xl font-black mb-2">87 лв</p>
            <p className="text-sm opacity-90">вместо 97 лв с кода:</p>
            <p className="text-2xl font-bold mt-2 bg-white text-green-600 rounded-lg py-2 px-4 inline-block">
              FIRST10
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Остави имейл и ще ти изпратим кода за отстъпка:
              </label>
              <Input
                type="email"
                placeholder="твоят@имейл.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold"
            >
              Изпрати ми кода за 10% отстъпка
            </Button>
          </form>

          {/* Decline */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Не, благодаря - продължавам без отстъпката
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
