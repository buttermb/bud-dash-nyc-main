import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SafetyInfoProps {
  borough?: string;
  neighborhood?: string;
}

const neighborhoodSafety: Record<string, { risk: number; tips: string[] }> = {
  // Manhattan
  "upper east side": { risk: 2, tips: ["Standard delivery procedures", "Maintain situational awareness"] },
  "upper west side": { risk: 2, tips: ["Standard delivery procedures", "Maintain situational awareness"] },
  "midtown": { risk: 4, tips: ["Stay in well-lit areas", "Keep phone charged", "Avoid alleys and shortcuts"] },
  "harlem": { risk: 7, tips: ["HIGH ALERT: Consider declining after 10 PM", "Never enter buildings alone", "Park in visible locations"] },
  "washington heights": { risk: 6, tips: ["Travel in pairs if possible", "Call customer upon arrival", "Keep vehicle locked"] },
  
  // Brooklyn
  "williamsburg": { risk: 3, tips: ["Stay in well-lit areas", "Keep phone charged", "Avoid alleys and shortcuts"] },
  "bushwick": { risk: 6, tips: ["Travel in pairs if possible", "Call customer upon arrival", "Keep vehicle locked"] },
  "bedford-stuyvesant": { risk: 7, tips: ["HIGH ALERT: Consider declining after 10 PM", "Never enter buildings alone", "Park in visible locations"] },
  "park slope": { risk: 2, tips: ["Standard delivery procedures", "Maintain situational awareness"] },
  "brooklyn heights": { risk: 2, tips: ["Standard delivery procedures", "Maintain situational awareness"] },
  "brownsville": { risk: 9, tips: ["CRITICAL: Daytime delivery only recommended", "Require customer to meet outside", "Two-person delivery team required"] },
  "east new york": { risk: 9, tips: ["CRITICAL: Daytime delivery only recommended", "Require customer to meet outside", "Two-person delivery team required"] },
  
  // Queens
  "astoria": { risk: 3, tips: ["Stay in well-lit areas", "Keep phone charged", "Avoid alleys and shortcuts"] },
  "long island city": { risk: 3, tips: ["Stay in well-lit areas", "Keep phone charged", "Avoid alleys and shortcuts"] },
  "jamaica": { risk: 8, tips: ["HIGH ALERT: Consider declining after 10 PM", "Never enter buildings alone", "Share live location with dispatch"] },
  "far rockaway": { risk: 8, tips: ["HIGH ALERT: Consider declining after 10 PM", "Never enter buildings alone", "Share live location with dispatch"] },
  "forest hills": { risk: 2, tips: ["Standard delivery procedures", "Maintain situational awareness"] },
};

const getRiskColor = (risk: number) => {
  if (risk <= 2) return 'bg-green-500';
  if (risk <= 4) return 'bg-yellow-500';
  if (risk <= 6) return 'bg-orange-500';
  if (risk <= 8) return 'bg-red-500';
  return 'bg-red-700';
};

const getRiskLabel = (risk: number) => {
  if (risk <= 2) return 'Low Risk';
  if (risk <= 4) return 'Moderate';
  if (risk <= 6) return 'Elevated';
  if (risk <= 8) return 'High Risk';
  return 'Critical';
};

export default function CourierSafetyInfo({ borough, neighborhood }: SafetyInfoProps) {
  // Try to find safety info for the specific neighborhood
  const neighborhoodKey = neighborhood?.toLowerCase() || '';
  const safetyInfo = neighborhoodSafety[neighborhoodKey];
  
  // Default safety tips if no specific neighborhood data
  const defaultTips = {
    brooklyn: { risk: 4, tips: ["Stay aware of surroundings", "Call customer before delivery", "Park in well-lit areas"] },
    manhattan: { risk: 3, tips: ["Watch for traffic", "Use designated parking spots", "Keep vehicle locked"] },
    queens: { risk: 4, tips: ["Plan route in advance", "Keep phone charged", "Avoid isolated areas"] },
  };

  const info = safetyInfo || (borough ? defaultTips[borough.toLowerCase() as keyof typeof defaultTips] : null);

  if (!info) return null;

  return (
    <Card className="border-2 border-orange-500/30 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Delivery Safety Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 ${getRiskColor(info.risk)} rounded-lg flex flex-col items-center justify-center text-white`}>
            <div className="text-xl font-bold">{info.risk}</div>
            <div className="text-xs">/10</div>
          </div>
          <div>
            <div className="font-semibold text-sm">
              {neighborhood || borough || 'Area'} Risk Level
            </div>
            <Badge variant="outline" className="mt-1">
              {getRiskLabel(info.risk)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="w-4 h-4" />
            Safety Guidelines:
          </div>
          <ul className="text-sm space-y-1.5 text-muted-foreground">
            {info.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {info.risk >= 7 && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-semibold">
                {info.risk >= 9 
                  ? "Consider declining deliveries after dark in this area"
                  : "Exercise extreme caution, especially during late hours"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
