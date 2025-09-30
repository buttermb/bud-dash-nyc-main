import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Star } from "lucide-react";

const LoyaltyPoints = () => {
  const { user } = useAuth();

  const { data: points } = useQuery({
    queryKey: ["loyalty-points", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (!data) {
        const { data: newPoints, error: insertError } = await supabase
          .from("loyalty_points")
          .insert({ user_id: user.id, points: 0, lifetime_points: 0 })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newPoints;
      }

      return data;
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["loyalty-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user || !points) {
    return null;
  }

  const getTier = (lifetimePoints: number) => {
    if (lifetimePoints >= 1000) return { name: "Diamond", icon: Trophy, color: "text-blue-600" };
    if (lifetimePoints >= 500) return { name: "Gold", icon: Trophy, color: "text-yellow-600" };
    if (lifetimePoints >= 250) return { name: "Silver", icon: Star, color: "text-gray-500" };
    return { name: "Bronze", icon: Gift, color: "text-orange-600" };
  };

  const tier = getTier(points.lifetime_points);
  const TierIcon = tier.icon;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Rewards</span>
            <Badge variant="outline" className={tier.color}>
              <TierIcon className="h-4 w-4 mr-1" />
              {tier.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{points.points}</p>
              <p className="text-sm text-muted-foreground">Available Points</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-semibold">{points.lifetime_points}</p>
                <p className="text-xs text-muted-foreground">Lifetime Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">${(points.points * 0.01).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Rewards Value</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">How it Works</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Earn 1 point for every $1 spent</li>
                <li>• 100 points = $1 discount</li>
                <li>• Points never expire</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{transaction.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-semibold ${transaction.points > 0 ? "text-green-600" : "text-red-600"}`}>
                    {transaction.points > 0 ? "+" : ""}
                    {transaction.points}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LoyaltyPoints;
