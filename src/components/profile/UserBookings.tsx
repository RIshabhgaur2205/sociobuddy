import { useState, useEffect } from "react";
import { format, parseISO, isPast } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Video, ExternalLink, User } from "lucide-react";

interface Booking {
  id: string;
  mentor_id: string;
  mentor_name: string;
  booking_date: string;
  booking_time: string;
  notes: string | null;
  status: string;
  created_at: string;
  gmeet_link?: string;
}

export const UserBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      // Fetch user's bookings
      const { data: bookingsData, error } = await supabase
        .from("mentor_bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: true });

      if (!error && bookingsData) {
        // Fetch gmeet links for each booking's mentor
        const mentorIds = [...new Set(bookingsData.map((b) => b.mentor_id))];
        
        const { data: mentorsData } = await supabase
          .from("mentors")
          .select("id, gmeet_link")
          .in("id", mentorIds);

        const mentorLinksMap = new Map(
          mentorsData?.map((m) => [m.id, m.gmeet_link]) || []
        );

        const bookingsWithLinks = bookingsData.map((booking) => ({
          ...booking,
          gmeet_link: mentorLinksMap.get(booking.mentor_id) || undefined,
        }));

        setBookings(bookingsWithLinks);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  const upcomingBookings = bookings.filter(
    (b) => !isPast(parseISO(b.booking_date)) || b.booking_date === format(new Date(), "yyyy-MM-dd")
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Booked Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No upcoming mentor sessions booked.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">My Booked Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingBookings.map((booking) => {
          const bookingDate = parseISO(booking.booking_date);
          const isToday = booking.booking_date === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={booking.id}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.mentor_name}</p>
                    <p className="text-sm text-muted-foreground">Mentor</p>
                  </div>
                </div>
                <Badge variant={isToday ? "default" : "secondary"}>
                  {isToday ? "Today" : "Upcoming"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(bookingDate, "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {booking.booking_time}
                </span>
              </div>

              {booking.gmeet_link ? (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => window.open(booking.gmeet_link, "_blank")}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Session
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Meeting link will be provided by your mentor
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default UserBookings;
