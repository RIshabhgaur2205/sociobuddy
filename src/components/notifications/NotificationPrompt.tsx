import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

export const NotificationPrompt = () => {
  const { isSupported, permission, isSubscribed, subscribe } = usePushNotifications();
  const { toast } = useToast();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPermission, setCurrentPermission] = useState(permission);

  // Track permission changes
  if (permission !== currentPermission) {
    setCurrentPermission(permission);
  }

  if (!isSupported || isDismissed || currentPermission === "denied" || currentPermission === null) {
    return null;
  }

  if (isSubscribed) {
    return null;
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    const success = await subscribe();
    setIsLoading(false);

    if (success) {
      toast({
        title: "Notifications enabled!",
        description: "You'll be notified about new messages and matches.",
      });
    } else {
      // Check current permission state to show appropriate message
      const currentPerm = Notification.permission;
      if (currentPerm === "denied") {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      } else if (currentPerm === "default") {
        // User dismissed the prompt, don't show error
        toast({
          title: "Permission needed",
          description: "Click enable again to allow notifications.",
        });
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border border-border rounded-2xl p-4 shadow-lg z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Stay in the loop</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Get notified when you receive new messages or match requests.
          </p>
          <Button
            size="sm"
            className="mt-3 w-full"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </Button>
        </div>
      </div>
    </div>
  );
};
