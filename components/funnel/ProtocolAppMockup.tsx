export const ProtocolAppMockup = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-300 dark:border-slate-700">
      {/* Phone Notch */}
      <div className="h-6 bg-black flex items-center justify-center">
        <div className="w-24 h-4 bg-black rounded-full" />
      </div>

      {/* App Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Meal Planner</h3>
            <p className="text-xs text-slate-500">Вторник, 12 Ден</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
            MK
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Today's Macros */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Дневни макроси</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">185г</div>
              <div className="text-xs text-slate-500">Протеин</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">120г</div>
              <div className="text-xs text-slate-500">Мазнини</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">80г</div>
              <div className="text-xs text-slate-500">Въглехидрати</div>
            </div>
          </div>
        </div>

        {/* Meal Cards */}
        <div className="space-y-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm flex items-center gap-3 border-l-4 border-green-500">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl">
              🍳
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Закуска</h5>
              <p className="text-xs text-slate-500">4 яйца + авокадо + спанак</p>
            </div>
            <div className="text-green-500 font-bold">✓</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm flex items-center gap-3 border-l-4 border-blue-500">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl">
              🥗
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Обяд</h5>
              <p className="text-xs text-slate-500">Пилешки гърди + броколи + зехтин</p>
            </div>
            <div className="text-slate-300 font-bold">○</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm flex items-center gap-3 border-l-4 border-purple-500">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
              🥩
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Вечеря</h5>
              <p className="text-xs text-slate-500">Стек + салата + орехи</p>
            </div>
            <div className="text-slate-300 font-bold">○</div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-primary to-violet-600 rounded-xl p-3 text-center">
          <p className="text-white text-sm font-semibold">+ Добави рецепта</p>
        </div>
      </div>
    </div>
  );
};
