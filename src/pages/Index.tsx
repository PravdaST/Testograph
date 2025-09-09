import { useState } from "react";
import { Activity, Target, Shield, Sparkles, ChevronDown } from "lucide-react";
import TForecastFormMultiStep from "@/components/TForecastFormMultiStep";
import ResultsDisplay from "@/components/ResultsDisplay";
const Index = () => {
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const handleResult = (data: any) => {
    setResult(data);
    setShowResults(true);
    // Scroll to top when results are shown
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const resetForm = () => {
    setResult(null);
    setShowResults(false);
  };
  return <div className="min-h-screen transition-none relative bg-gray-900">
      {/* Animated Purple Wave Background - Full Page */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/40 to-purple-800/40 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/30 to-indigo-700/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-2"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-700/35 to-violet-600/35 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-4"></div>
          <div className="absolute top-1/4 left-1/2 w-64 h-64 bg-gradient-to-tl from-purple-400/25 to-indigo-600/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-delay-1"></div>
        </div>
        
        {/* Wave Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-800/10"></div>
      </div>
      {/* Floating Sticky Header */}
      <header className="sticky top-4 z-50 transition-none relative">
        <div className="container mx-auto px-4">
          <div className="bg-background/30 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 px-3 py-3 rounded-full backdrop-saturate-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-xl">
                  <img src="/lovable-uploads/7f610a27-06bc-4bf8-9951-7f52e40688ba.png" alt="Testograph Logo" className="h-11 w-11 rounded-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-clash bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Testograph
                  </h1>
                  <p className="text-sm text-muted-foreground">Инструмент за оценка на тестостерон</p>
                </div>
              </div>
              {showResults && <button onClick={resetForm} className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Нова оценка
                </button>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width */}
      {!showResults && (
        <section className="relative mb-8 -mt-4 min-h-[80vh] flex items-center">
          {/* Content Grid */}
          <div className="relative z-10 container mx-auto px-4 md:px-6 max-w-[1200px] py-14 md:py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 xl:gap-10">
              {/* Left Content */}
              <div className="lg:col-span-7 xl:col-span-7">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-8">
                  <Sparkles className="h-4 w-4" />
                  Усъвършенствана здравна оценка
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                  Получи своят персонализиран
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent font-clash font-black">
                    Testograph
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                  Открийте вашите прогнозни нива на тестостерон въз основа на факторите от начина на живот, 
                  здравните показатели и научните изследвания. Получете персонализирани прозрения за минути.
                </p>

                <button onClick={() => {
                const formSection = document.getElementById('assessment-form');
                formSection?.scrollIntoView({
                  behavior: 'smooth'
                });
              }} className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <Activity className="h-5 w-5" />
                  Започнете анализа
                </button>
              </div>
              
              {/* Right Content - Square Image Placeholder */}
              <div className="hidden lg:block lg:col-span-5 xl:col-span-5 lg:justify-self-end w-full max-w-[420px] xl:max-w-[480px]">
                <div className="w-full aspect-square rounded-3xl overflow-hidden">
                  <img 
                    src="/lovable-uploads/2bcd22a3-0894-400b-950c-c10f8b23bb76.png" 
                    alt="Testosterone analysis visualization" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-4 max-w-4xl relative z-20">
        {!showResults ? <>
            {/* Scroll Down Arrow */}
            <div className="flex justify-center mb-4 -mt-8 animate-bounce-slow">
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => {
                const featureSection = document.querySelector('#feature-cards');
                featureSection?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <div className="p-3 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 group-hover:bg-purple-500/30 transition-all duration-300 group-hover:scale-110">
                  <ChevronDown className="h-6 w-6 text-purple-300 group-hover:text-purple-200" />
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div id="feature-cards" className="grid md:grid-cols-3 gap-6 mb-16 mt-32">
              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Персонализиран анализ</h3>
                <p className="text-sm text-muted-foreground">
                  Усъвършенстван алгоритъм отчита вашите уникални фактори от начина на живот и здравето
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Моментални резултати</h3>
                <p className="text-sm text-muted-foreground">
                  Получете вашата оценка на тестостерона и препоръките незабавно
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Научно обоснован</h3>
                <p className="text-sm text-muted-foreground">
                  Основан на рецензирани изследвания и клинични доказателства
                </p>
              </div>
            </div>

            {/* Assessment Form */}
            <section id="assessment-form">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Попълнете бланката за{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                    анализ
                  </span>
                </h2>
                <p className="text-muted-foreground">
                  Моля, попълнете всички секции точно за най-прецизната оценка
                </p>
              </div>
              
              <TForecastFormMultiStep onResult={handleResult} />
            </section>
          </> : (/* Results Section */
      <section>
            <ResultsDisplay result={result} />
          </section>)}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 relative z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Testograph © 2024. Образователен инструмент за оценка на тестостерон.
            </p>
            <p>
              Не е предназначен като медицински съвет. Консултирайте се с медицински специалисти за медицинско ръководство.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;