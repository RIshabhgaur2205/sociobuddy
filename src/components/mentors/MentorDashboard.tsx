import { useState, useEffect } from "react";
import { format, isPast, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Users, History, MessageSquare, Video, Save, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Booking {
  id: string;
  user_id: string;
  booking_date: string;
  booking_time: string;
  notes: string | null;
  status: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface MentorDashboardProps {
  mentorId: string;
}

export const MentorDashboard = ({ mentorId }: MentorDashboardProps) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [gmeetLink, setGmeetLink] = useState("");
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("mentor_bookings")
        .select(`
          *,
          profile:profiles!mentor_bookings_user_id_fkey(username, avatar_url)
        `)
        .eq("mentor_id", mentorId)
        .order("booking_date", { ascending: true });

      if (!bookingsError && bookingsData) {
        setBookings(bookingsData as unknown as Booking[]);
      }

      // Fetch mentor's gmeet link
      const { data: mentorData } = await supabase
        .from("mentors")
        .select("gmeet_link")
        .eq("id", mentorId)
        .single();

      if (mentorData?.gmeet_link) {
        setGmeetLink(mentorData.gmeet_link);
      }

      setLoading(false);
    };

    fetchData();
  }, [mentorId, user]);

  const handleSaveGmeetLink = async () => {
    setSavingLink(true);
    const { error } = await supabase
      .from("mentors")
      .update({ gmeet_link: gmeetLink })
      .eq("id", mentorId);

    if (error) {
      toast.error("Failed to save Google Meet link");
    } else {
      toast.success("Google Meet link saved successfully");
    }
    setSavingLink(false);
  };

  const upcomingBookings = bookings.filter(
    (b) => !isPast(parseISO(b.booking_date)) || b.booking_date === format(new Date(), "yyyy-MM-dd")
  );
  
  const pastBookings = bookings.filter(
    (b) => isPast(parseISO(b.booking_date)) && b.booking_date !== format(new Date(), "yyyy-MM-dd")
  );

  const stats = [
    {
      label: "Total Sessions",
      value: bookings.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Upcoming",
      value: upcomingBookings.length,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      label: "Completed",
      value: pastBookings.length,
      icon: History,
      color: "text-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Google Meet Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Google Meet Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Provide your Google Meet link for sessions. This link will be shared with students who book sessions with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="gmeet-link" className="sr-only">Google Meet Link</Label>
              <Input
                id="gmeet-link"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={gmeetLink}
                onChange={(e) => setGmeetLink(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveGmeetLink} disabled={savingLink}>
              <Save className="h-4 w-4 mr-2" />
              {savingLink ? "Saving..." : "Save Link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Past Sessions ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground">
                  You don't have any upcoming sessions scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isUpcoming />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No past sessions</h3>
                <p className="text-muted-foreground">
                  Your completed sessions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isUpcoming={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BookingCard = ({ booking, isUpcoming }: { booking: Booking; isUpcoming: boolean }) => {
  const bookingDate = parseISO(booking.booking_date);
  
  return (
    <Card className={!isUpcoming ? "opacity-75" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {booking.profile?.username || "Anonymous User"}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(bookingDate, "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {booking.booking_time}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? "Upcoming" : "Completed"}
          </Badge>
        </div>
        
        {booking.notes && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};