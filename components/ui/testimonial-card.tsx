import { Star, CheckCircle2 } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  age: number;
  city: string;
  avatarUrl?: string;
  quote: string;
  beforeStat: string;
  afterStat: string;
  statLabel: string;
  verified?: boolean;
}

export const TestimonialCard = ({
  name,
  age,
  city,
  avatarUrl,
  quote,
  beforeStat,
  afterStat,
  statLabel,
  verified = true
}: TestimonialCardProps) => {
  return (
    <div className="group bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Header with Avatar & Info */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl border-2 border-primary/30">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
              ) : (
                name.charAt(0)
              )}
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-card">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Name & Location */}
          <div className="flex-1">
            <h4 className="font-bold text-lg text-foreground">
              {name}, {age}
            </h4>
            <p className="text-sm text-muted-foreground">{city}</p>

            {/* Star Rating */}
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="px-6 pb-4">
        <p className="text-foreground/90 leading-relaxed italic">
          "{quote}"
        </p>
      </div>

      {/* Before/After Stats */}
      <div className="bg-gradient-to-r from-destructive/10 via-primary/10 to-success/10 px-6 py-4 border-t border-border/30">
        <div className="grid grid-cols-3 gap-2 items-center">
          {/* Before */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Преди
            </p>
            <p className="text-2xl font-bold text-destructive">
              {beforeStat}
            </p>
          </div>

          {/* Arrow */}
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* After */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              След
            </p>
            <p className="text-2xl font-bold text-success">
              {afterStat}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          {statLabel}
        </p>
      </div>

      {/* Verified Badge */}
      {verified && (
        <div className="bg-success/10 px-6 py-2 text-center border-t border-success/20">
          <p className="text-xs text-success font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Проверен клиент
          </p>
        </div>
      )}
    </div>
  );
};