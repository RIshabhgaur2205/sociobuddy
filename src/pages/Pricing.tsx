import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface SubscriptionPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  features: string[];
}

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("duration_months", { ascending: true });
      
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const plan = plans?.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + plan.duration_months);

      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
      toast({
        title: "Subscription activated!",
        description: "Welcome to your new plan!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSelectedPlan(planId);
    subscribeMutation.mutate(planId);
  };

  const getPlanHighlight = (name: string) => {
    if (name === "Yearly") return true;
    return false;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const getPriceLabel = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return "Free";
    if (plan.duration_months === 1) return `$${plan.price}/month`;
    if (plan.duration_months === 6) return `$${plan.price}/6 months`;
    return `$${plan.price}/year`;
  };

  return (
    <>
      <Helmet>
        <title>Pricing - TeenConnect</title>
        <meta name="description" content="Choose a subscription plan that works for you. Monthly, half-yearly, or yearly options available." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-primary">Plan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              All plans are currently free! Get started and connect with amazing friends today.
            </p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans?.map((plan) => {
                const isHighlighted = getPlanHighlight(plan.name);
                const isCurrentPlan = currentSubscription?.plan_id === plan.id;
                
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative flex flex-col ${
                      isHighlighted 
                        ? "border-primary shadow-lg shadow-primary/20 scale-105" 
                        : "border-border"
                    }`}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          Best Value
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.duration_months} {plan.duration_months === 1 ? "month" : "months"}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                        {plan.price > 0 && (
                          <span className="text-muted-foreground">
                            /{plan.duration_months === 1 ? "mo" : plan.duration_months === 6 ? "6mo" : "yr"}
                          </span>
                        )}
                      </div>
                      
                      <ul className="space-y-3">
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={isHighlighted ? "default" : "outline"}
                        disabled={isCurrentPlan || subscribeMutation.isPending}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isCurrentPlan 
                          ? "Current Plan" 
                          : subscribeMutation.isPending && selectedPlan === plan.id
                            ? "Subscribing..."
                            : "Get Started"
                        }
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {currentSubscription && (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                You're currently on the <span className="font-semibold text-foreground">{(currentSubscription as any).subscription_plans?.name}</span> plan.
                {" "}Expires on {new Date(currentSubscription.ends_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Pricing;
