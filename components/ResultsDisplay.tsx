import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { WaitingRoomFunnel } from "./funnel/WaitingRoomFunnel";

interface ResultsDisplayProps {
  result: any;
}

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  // Check if this is a thank you message - show waiting room funnel
  if (result?.type === 'thank-you') {
    return <WaitingRoomFunnel />;
  }

  // Parse the result to extract relevant information
  const parseTestosteroneLevel = (result: any) => {
    if (!result) return null;
    
    // Try to extract testosterone estimate from various possible response formats
    const estimate = result.estimate || result.testosterone || result.level || result.prediction;
    const tips = result.tips || result.recommendations || result.advice || [];
    const confidence = result.confidence || result.accuracy || "moderate";
    
    return {
      estimate,
      tips: Array.isArray(tips) ? tips : [tips].filter(Boolean),
      confidence,
      rawResult: result
    };
  };

  const data = parseTestosteroneLevel(result);

  if (!data) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <p className="text-muted-foreground">
              Не може да обработи резултатите от анализа. Моля, опитайте отново.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceBadge = (confidence: string) => {
    const confidenceLevel = confidence.toLowerCase();
    if (confidenceLevel.includes('high')) {
      return <Badge className="bg-health-good text-white">Висока увереност</Badge>;
    } else if (confidenceLevel.includes('low')) {
      return <Badge className="bg-health-warning text-black">Ниска увереност</Badge>;
    }
    return <Badge className="bg-health-normal text-white">Умерена увереност</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Вашият Testograph анализ</h2>
            <p className="text-muted-foreground mb-4">
              Вашата персонализирана оценка на тестостерона е готова
            </p>
            {data.confidence && getConfidenceBadge(data.confidence)}
          </div>
        </CardContent>
      </Card>

      {/* Main Results */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Оценка на тестостерон</CardTitle>
              <CardDescription>
                Въз основа на вашите фактори от начина на живот и здравните показатели
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data.estimate ? (
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {typeof data.estimate === 'number' ? 
                  `${data.estimate} ng/dL` : 
                  data.estimate
                }
              </div>
              <p className="text-muted-foreground">
                Прогнозно ниво на тестостерон
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Анализът приключи - проверете препоръките по-долу
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips and Recommendations */}
      {data.tips.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-accent" />
              <div>
                <CardTitle>Персонализирани препоръки</CardTitle>
                <CardDescription>
                  Съвети за естественото оптимизиране на вашите нива на тестостерон
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.tips.map((tip: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-warning/10 border-warning/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-2">Важно предупреждение</p>
              <p className="text-muted-foreground leading-relaxed">
                Този Testograph е само за образователни цели и не трябва да замества професионален медицински съвет. 
                За точни изследвания на тестостерона и медицинско ръководство, моля консултирайте се с медицински специалист.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Response (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">Дебъг: Необработен отговор</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground overflow-auto">
              {JSON.stringify(data.rawResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsDisplay;