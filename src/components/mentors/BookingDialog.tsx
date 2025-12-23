import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  photo: string;
  title: string;
}

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentor: Mentor;
}

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export const BookingDialog = ({ open, onOpenChange, mentor }: BookingDialogProps) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to book a session.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select date and time",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("mentor_bookings").insert({
      user_id: user.id,
      mentor_id: mentor.id,
      mentor_name: mentor.name,
      booking_date: format(selectedDate, "yyyy-MM-dd"),
      booking_time: selectedTime,
      notes: notes || null,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Booking failed",
        description: "There was an error booking your session. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsBooked(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setSelectedDate(undefined);
      setSelectedTime("");
      setNotes("");
      setIsBooked(false);
    }, 300);
  };

  if (isBooked) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Session Booked!</h2>
            <p className="text-muted-foreground mb-4">
              Your session with {mentor.name} has been confirmed for{" "}
              {selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedTime}.
            </p>
            <p className="text-sm text-primary font-medium mb-6">
              This session is FREE!
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={mentor.photo}
              alt={mentor.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <span>Book Session with {mentor.name}</span>
              <p className="text-sm font-normal text-muted-foreground">{mentor.title}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Select a date and time for your mentoring session. All sessions are currently free!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              Select Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-lg border"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              Select Time
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Notes (optional)
            </label>
            <Textarea
              placeholder="What would you like to discuss?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price Info */}
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">FREE</p>
            <p className="text-sm text-muted-foreground">All sessions are currently free!</p>
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBookSession}
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
