"use client";

import { Shield, CheckCircle, Undo2 } from "lucide-react";

export function GuaranteeSection() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              30-дневна гаранция
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Нулев риск. Ако не видиш резултати, връщаме ти парите.
          </p>
        </div>

        {/* How It Works - Compact */}
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="bg-card/90 backdrop-blur-xl rounded-lg p-3 text-center border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xs font-semibold mb-1 text-foreground">Следвай протокола 30 дни</p>
          </div>

          <div className="bg-card/90 backdrop-blur-xl rounded-lg p-3 text-center border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xs font-semibold mb-1 text-foreground">Ако не усетиш подобрение</p>
          </div>

          <div className="bg-card/90 backdrop-blur-xl rounded-lg p-3 text-center border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <Undo2 className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-semibold mb-1 text-foreground">Изпрати имейл - парите са ти</p>
          </div>
        </div>

        {/* Social Proof - Compact */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Досега само 3% от клиентите са поискали връщане на пари
          </p>
        </div>
      </div>
    </section>
  );
}
