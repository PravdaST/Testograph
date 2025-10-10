import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";

interface UserData {
  firstName?: string;
}

interface ExitPopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData?: UserData;
}

export const ExitPopupDialog = ({ open, onOpenChange, userData }: ExitPopupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6 bg-background">
        <DialogHeader className="space-y-3">
          <div className="flex justify-center">
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>
          <DialogTitle className="text-2xl text-center leading-tight text-foreground font-bold">
            {userData?.firstName ? `${userData.firstName}, ` : ""}⚠️ ИЗЧАКАЙ!
          </DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p className="text-lg font-bold text-foreground">
              ПОСЛЕДНА ВЪЗМОЖНОСТ!
            </p>
            <p className="text-base text-foreground font-medium">
              Вземи Smart App за Планиране на Хранителен Режим само за 19 лв вместо 28 лв!
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Downsell Offer - Compact */}
          <div className="bg-card rounded-xl p-5 space-y-4 border-2 border-primary/50 shadow-lg">
            <div className="flex items-center justify-center w-full max-w-[200px] mx-auto py-8">
              <span className="text-[120px]">🍴</span>
            </div>

            <h3 className="font-bold text-lg text-center text-foreground">
              Smart App за Планиране на Хранителен Режим
            </h3>

            <ul className="space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Точно какво да ядеш и кога</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Оптимизиран за тестостерон</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Лесни рецепти</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Shopping списък включен</span>
              </li>
            </ul>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-lg line-through text-muted-foreground font-semibold">28 лв</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium">Само днес:</p>
                <p className="text-2xl font-black text-primary">19 лв</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-6"
              size="lg"
              asChild
            >
              <a href="https://shop.testograph.eu/products/meal-planner" target="_blank" rel="noopener noreferrer">
                🎁 ВЗЕМИ ОФЕРТАТА - 19 ЛВ
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Затвори
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground leading-tight">
            * Офертата е валидна само сега. След затваряне на този прозорец я губиш завинаги.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
