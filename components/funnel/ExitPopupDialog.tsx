import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ProtocolAppMockup } from "./ProtocolAppMockup";

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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="space-y-2">
          <div className="flex justify-center">
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>
          <DialogTitle className="text-xl text-center leading-tight">
            {userData?.firstName ? `${userData.firstName}, ` : ""}⚠️ ИЗЧАКАЙ!
          </DialogTitle>
          <DialogDescription className="text-center text-sm space-y-2">
            <p className="text-base font-semibold text-foreground">
              ПОСЛЕДНА ВЪЗМОЖНОСТ!
            </p>
            <p className="text-sm">
              Започни само с 30-дневния Web Протокол - 17 лв.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Downsell Offer - Compact */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-4 space-y-3 border-2 border-primary">
            <div className="w-full h-40 rounded-lg overflow-hidden">
              <ProtocolAppMockup />
            </div>

            <h3 className="font-bold text-base text-foreground">
              📱 30-Дневен Web Протокол
            </h3>

            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>✓ Ден-по-ден план за хранене</li>
              <li>✓ Персонализирани тренировки</li>
              <li>✓ График за добавки</li>
              <li>✓ Progress tracker</li>
            </ul>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-base line-through text-muted-foreground">27 лв</span>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Само днес:</p>
                <p className="text-xl font-bold text-primary">17 лв</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm"
              size="default"
              asChild
            >
              <a href="https://www.shop.testograph.eu" target="_blank" rel="noopener noreferrer">
                🎁 ВЗЕМИ ОФЕРТАТА - 19 ЛВ
              </a>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onOpenChange(false)}
            >
              Затвори
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground leading-tight">
            * Офертата е валидна само сега. След затваряне на този прозорец я губиш завинаги.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
