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
                  T-Forecast
                </h1>
                <p className="text-sm text-muted-foreground">Testosterone Estimation Tool</p>
              </div>
            </div>
            {showResults && (
              <button
                onClick={resetForm}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                New Assessment
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showResults ? (
          <>
            {/* Hero Section */}
            <section className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Advanced Health Assessment
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Get Your Personal
                <br />
                T-Forecast
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Discover your estimated testosterone levels based on lifestyle factors, 
                health indicators, and scientific research. Get personalized insights in minutes.
              </p>

              {/* Feature Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Personalized Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced algorithm considers your unique lifestyle and health factors
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your testosterone estimate and recommendations immediately
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 text-center">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Science-Based</h3>
                  <p className="text-sm text-muted-foreground">
                    Built on peer-reviewed research and clinical evidence
                  </p>
                </div>
              </div>
            </section>

            {/* Assessment Form */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Complete Your Health Assessment</h2>
                <p className="text-muted-foreground">
                  Please fill out all sections accurately for the most precise estimation
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
              T-Forecast © 2024. Educational tool for testosterone estimation.
            </p>
            <p>
              Not intended as medical advice. Consult healthcare professionals for medical guidance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
