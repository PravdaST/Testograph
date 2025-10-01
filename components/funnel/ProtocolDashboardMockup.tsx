export const ProtocolDashboardMockup = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-violet-600 rounded-lg" />
            <span className="text-white font-bold">TestoGraph Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
            <span className="text-white text-sm">Мартин К.</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-3">
        {/* Progress Bar */}
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-semibold">Ден 12 от 30</span>
            <span className="text-emerald-400 text-sm font-bold">40%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 rounded-lg p-2 border border-white/10">
            <div className="text-emerald-400 text-xl font-bold">↗ 18%</div>
            <div className="text-white/60 text-xs">Тестостерон</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-white/10">
            <div className="text-blue-400 text-xl font-bold">7.2ч</div>
            <div className="text-white/60 text-xs">Сън</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-white/10">
            <div className="text-orange-400 text-xl font-bold">89%</div>
            <div className="text-white/60 text-xs">Compliance</div>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="bg-black/30 rounded-lg p-3 border border-white/10">
          <h4 className="text-white text-sm font-semibold mb-2">Днешни задачи</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-white/80 text-sm">Закуска: 4 яйца + авокадо</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-white/80 text-sm">Добавки: TestoUP + Витамин D</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs"> </span>
              </div>
              <span className="text-white/60 text-sm">Тренировка: Deadlifts 5x5</span>
            </div>
          </div>
        </div>

        {/* Meal Plan Preview */}
        <div className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 rounded-lg p-3 border border-purple-500/30">
          <h4 className="text-white text-sm font-semibold mb-2">🍽️ Хранителен план</h4>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="bg-black/30 rounded p-1">
              <div className="text-white text-xs font-bold">8:00</div>
              <div className="text-white/60 text-[10px]">Закуска</div>
            </div>
            <div className="bg-black/30 rounded p-1">
              <div className="text-white text-xs font-bold">13:00</div>
              <div className="text-white/60 text-[10px]">Обяд</div>
            </div>
            <div className="bg-black/30 rounded p-1">
              <div className="text-white text-xs font-bold">16:00</div>
              <div className="text-white/60 text-[10px]">Снак</div>
            </div>
            <div className="bg-black/30 rounded p-1">
              <div className="text-white text-xs font-bold">20:00</div>
              <div className="text-white/60 text-[10px]">Вечеря</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
