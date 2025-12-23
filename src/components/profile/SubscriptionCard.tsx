import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  features: string[];
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  subscription_plans: SubscriptionPlan;
}

const SubscriptionCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });

  const isExpired = subscription ? new Date(subscription.ends_at) < new Date() : false;
  const daysRemaining = subscription 
    ? Math.ceil((new Date(subscription.ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">My Subscription</CardTitle>
          </div>
          <CardDescription>You don't have an active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to unlock premium features and connect with more friends!
          </p>
          <Button onClick={() => navigate("/pricing")} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription.subscription_plans;

  return (
    <Card className={isExpired ? "border-destructive/50" : "border-primary/30"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">My Subscription</CardTitle>
          </div>
          <Badge variant={isExpired ? "destructive" : "default"}>
            {isExpired ? "Expired" : subscription.status}
          </Badge>
        </div>
        <CardDescription>
          {plan?.name} Plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Started</span>
          </div>
          <span className="font-medium">
            {new Date(subscription.starts_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{isExpired ? "Expired" : "Expires"}</span>
          </div>
          <span className={`font-medium ${isExpired ? "text-destructive" : ""}`}>
            {new Date(subscription.ends_at).toLocaleDateString()}
          </span>
        </div>

        {!isExpired && daysRemaining <= 30 && (
          <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-sm">
            ⚠️ Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
          </div>
        )}

        {plan?.features && plan.features.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Plan features:</p>
            <ul className="text-sm space-y-1">
              {plan.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-muted-foreground text-xs">
                  +{plan.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        <Button 
          variant={isExpired ? "default" : "outline"} 
          onClick={() => navigate("/pricing")} 
          className="w-full"
        >
          {isExpired ? "Renew Subscription" : "Change Plan"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
