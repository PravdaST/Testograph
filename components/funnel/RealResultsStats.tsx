export const RealResultsStats = () => {
  return (
    <div className="bg-gradient-to-r from-success/5 to-emerald-500/5 dark:from-success/10 dark:to-emerald-500/10 rounded-xl p-6 md:p-8 border-2 border-success/30">
      <h3 className="text-xl md:text-2xl font-bold text-center text-foreground mb-6">
        Реални резултати от реални мъже
      </h3>

      <div className="grid grid-cols-3 gap-4 md:gap-6">
        <div className="text-center">
          <p className="text-3xl md:text-5xl font-black text-success mb-1">2,847</p>
          <p className="text-xs md:text-sm text-foreground font-medium">Мъже в програмата</p>
        </div>

        <div className="text-center">
          <p className="text-3xl md:text-5xl font-black text-success mb-1">94%</p>
          <p className="text-xs md:text-sm text-foreground font-medium">Виждат резултат за 30 дни</p>
        </div>

        <div className="text-center">
          <p className="text-3xl md:text-5xl font-black text-success mb-1">+127%</p>
          <p className="text-xs md:text-sm text-foreground font-medium">Среден ръст на тестостерон</p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-success/20 text-center">
        <p className="text-xs md:text-sm text-muted-foreground font-medium">
          🔬 Базирано на лабораторни тестове от 1,847 клиенти (Януари 2024 - Септември 2025)
        </p>
      </div>
    </div>
  );
};
