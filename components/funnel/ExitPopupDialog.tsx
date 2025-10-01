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

interface ExitPopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExitPopupDialog = ({ open, onOpenChange }: ExitPopupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-16 h-16 text-orange-500" />
          </div>
          <DialogTitle className="text-2xl text-center">
            ⚠️ ИЗЧАКАЙТЕ!
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-4 pt-4">
            <p className="text-lg font-semibold text-foreground">
              ПОСЛЕДНА ВЪЗМОЖНОСТ!
            </p>
            <p>
              Разбираме - може би пълният пакет е твърде много за момента.
            </p>
            <p className="text-foreground">
              Но какво ако започнете само с 30-дневния Web Протокол?
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Downsell Offer */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-6 space-y-3 border-2 border-primary">
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <ProtocolAppMockup />
            </div>
            
            <h3 className="font-bold text-lg text-foreground">
              📱 30-Дневен Web Протокол
            </h3>
            
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Ден-по-ден план за хранене</li>
              <li>✓ Персонализирани тренировки</li>
              <li>✓ График за добавки</li>
              <li>✓ Progress tracker</li>
            </ul>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-lg line-through text-muted-foreground">27 лв</span>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Само днес:</p>
                <p className="text-2xl font-bold text-primary">17 лв</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
              asChild
            >
              <a href="https://www.shop.testograph.eu" target="_blank" rel="noopener noreferrer">
                🎁 ВЗЕМИ ОФЕРТАТА - 17 ЛВ
              </a>
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Затвори
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            * Офертата е валидна само сега. След затваряне на този прозорец цената се връща на нормална.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
