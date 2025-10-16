import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ExternalLink, Target } from 'lucide-react';

interface UTMBreakdownProps {
  utmBreakdown: {
    sources: Record<string, number>;
    mediums: Record<string, number>;
    campaigns: Record<string, number>;
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export function UTMBreakdown({ utmBreakdown }: UTMBreakdownProps) {
  // Convert objects to arrays for charts
  const sourcesData = Object.entries(utmBreakdown.sources)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10

  const mediumsData = Object.entries(utmBreakdown.mediums)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const campaignsData = Object.entries(utmBreakdown.campaigns)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10

  const hasData = sourcesData.length > 0 || mediumsData.length > 0 || campaignsData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            UTM Проследяване
          </CardTitle>
          <CardDescription>Разбивка на източниците на трафик</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>Няма UTM данни. Добавете UTM параметри към вашите маркетинг линкове.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Traffic Sources */}
      {sourcesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Източници на Трафик
            </CardTitle>
            <CardDescription>Откъде идват вашите посетители (utm_source)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourcesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p className="text-sm">{payload[0].payload.value} сесии</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mediums */}
        {mediumsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Медия на Трафика</CardTitle>
              <CardDescription>Как посетителите са ви достигнали (utm_medium)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mediumsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mediumsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Campaigns */}
        {campaignsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Кампании</CardTitle>
              <CardDescription>Най-добре представящи се кампании (utm_campaign)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {campaignsData.map((campaign, index) => {
                  const total = campaignsData.reduce((sum, c) => sum + c.value, 0);
                  const percentage = Math.round((campaign.value / total) * 100);
                  return (
                    <div key={campaign.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate" title={campaign.name}>
                          {campaign.name}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {campaign.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
