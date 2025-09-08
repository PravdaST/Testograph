import { useState } from "react";
import { Activity, Target, Shield, Sparkles } from "lucide-react";
import TForecastForm from "@/components/TForecastForm";
import ResultsDisplay from "@/components/ResultsDisplay";

const Index = () => {
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleResult = (data: any) => {
    setResult(data);
    setShowResults(true);
  };

  const resetForm = () => {
    setResult(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-accent">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Testograph
                </h1>
                <p className="text-sm text-muted-foreground">Инструмент за оценка на тестостерон</p>
              </div>
            </div>
            {showResults && (
              <button
                onClick={resetForm}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Нова оценка
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showResults ? (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gray-900 text-center mb-12 py-20">
              {/* Animated Background */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-50">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-l from-orange-500 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-t from-red-500 to-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 px-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 text-sm font-medium mb-8">
                  <Sparkles className="h-4 w-4" />
                  Усъвършенствана здравна оценка
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                  Получете вашата лична
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Testograph анализ
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Открийте вашите прогнозни нива на тестостерон въз основа на факторите от начина на живот, 
                  здравните показатели и научните изследвания. Получете персонализирани прозрения за минути.
                </p>

                <button
                  onClick={() => {
                    const formSection = document.getElementById('assessment-form');
                    formSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Activity className="h-5 w-5" />
                  Започнете анализа
                </button>
              </div>
            </section>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
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
                <h2 className="text-2xl font-bold mb-4">Попълнете вашата здравна оценка</h2>
                <p className="text-muted-foreground">
                  Моля, попълнете всички секции точно за най-прецизната оценка
                </p>
              </div>
              
              <TForecastForm onResult={handleResult} />
            </section>
          </>
        ) : (
          /* Results Section */
          <section>
            <ResultsDisplay result={result} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
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
    </div>
  );
};

export default Index;
