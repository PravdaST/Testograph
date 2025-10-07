interface OfferProgressBarProps {
  price: string;
  discount: string;
  tier: 'premium' | 'single' | 'digital';
  scrollProgress: number; // 0-100
}

export const OfferProgressBar = ({ price, discount, tier, scrollProgress }: OfferProgressBarProps) => {
  const tierColors = {
    premium: 'from-orange-500 to-red-600',
    single: 'from-primary to-violet-600',
    digital: 'from-primary to-violet-600'
  };

  const tierLabels = {
    premium: 'Пълна Трансформация',
    single: 'Есенциално',
    digital: 'Протокол'
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <div
          className={`h-full bg-gradient-to-r ${tierColors[tier]} transition-all duration-300`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Content */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{tierLabels[tier]}</p>
          <p className="text-sm font-bold text-foreground">{price} <span className="text-xs text-green-600">({discount} отстъпка)</span></p>
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.round(scrollProgress)}%
        </div>
      </div>
    </div>
  );
};
