import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, Clock, CheckCircle, GraduationCap, UserPlus, LayoutDashboard, Loader2 } from "lucide-react";
import { BookingDialog } from "@/components/mentors/BookingDialog";
import { MentorSignupDialog } from "@/components/mentors/MentorSignupDialog";
import { MentorDashboard } from "@/components/mentors/MentorDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Mentor {
  id: string;
  name: string;
  photo: string;
  title: string;
  experience: string;
  specialties: string[];
  rating: number;
  reviews: number;
  costPerSession: number;
  availability: string;
  bio: string;
  verified: boolean;
}

interface DbMentor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  photo: string | null;
  title: string;
  experience: string | null;
  specialties: string[] | null;
  bio: string | null;
  availability: string | null;
  status: string;
  verified: boolean;
  rating: number;
  reviews_count: number;
}

// Sample mentors (fallback)
const sampleMentors: Mentor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    title: "Youth Counselor & Life Coach",
    experience: "12 years",
    specialties: ["Social Anxiety", "Confidence Building", "Teen Development"],
    rating: 4.9,
    reviews: 156,
    costPerSession: 0,
    availability: "Mon-Fri",
    bio: "Specialized in helping teenagers overcome social challenges and build lasting confidence.",
    verified: true,
  },
  {
    id: "2",
    name: "Marcus Williams",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    title: "Peer Support Specialist",
    experience: "8 years",
    specialties: ["Communication Skills", "Friendship Building", "Self-Expression"],
    rating: 4.8,
    reviews: 98,
    costPerSession: 0,
    availability: "Weekends",
    bio: "Former shy teen who now helps others find their voice and build meaningful connections.",
    verified: true,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    title: "School Counselor",
    experience: "10 years",
    specialties: ["Academic Stress", "Social Skills", "Group Dynamics"],
    rating: 4.9,
    reviews: 203,
    costPerSession: 0,
    availability: "Mon-Sat",
    bio: "Dedicated to helping students thrive both academically and socially in school environments.",
    verified: true,
  },
  {
    id: "4",
    name: "James Park",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    title: "Teen Life Coach",
    experience: "6 years",
    specialties: ["Goal Setting", "Motivation", "Leadership Skills"],
    rating: 4.7,
    reviews: 67,
    costPerSession: 0,
    availability: "Flexible",
    bio: "Empowering teens to discover their potential and achieve their personal goals.",
    verified: true,
  },
  {
    id: "5",
    name: "Dr. Aisha Patel",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face",
    title: "Adolescent Psychologist",
    experience: "15 years",
    specialties: ["Mental Health", "Emotional Intelligence", "Family Dynamics"],
    rating: 5.0,
    reviews: 289,
    costPerSession: 0,
    availability: "By Appointment",
    bio: "Expert in adolescent psychology with a focus on emotional wellbeing and healthy relationships.",
    verified: true,
  },
  {
    id: "6",
    name: "Tyler Johnson",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    title: "Youth Mentor",
    experience: "5 years",
    specialties: ["Career Guidance", "Study Skills", "Time Management"],
    rating: 4.6,
    reviews: 45,
    costPerSession: 0,
    availability: "Evenings",
    bio: "Young mentor who relates to teen challenges and provides practical, real-world advice.",
    verified: true,
  },
];

const Mentors = () => {
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userMentorStatus, setUserMentorStatus] = useState<DbMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("find");
  const [approvedMentors, setApprovedMentors] = useState<Mentor[]>([]);

  // Fetch approved mentors and user's mentor status
  useEffect(() => {
    const fetchData = async () => {
      // Fetch approved mentors from database
      const { data: mentorsData, error: mentorsError } = await supabase
        .from("mentors")
        .select("*")
        .eq("status", "approved");

      if (!mentorsError && mentorsData) {
        const dbMentors: Mentor[] = mentorsData.map((m: DbMentor) => ({
          id: m.id,
          name: m.name,
          photo: m.photo || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
          title: m.title,
          experience: m.experience || "N/A",
          specialties: m.specialties || [],
          rating: Number(m.rating) || 0,
          reviews: m.reviews_count || 0,
          costPerSession: 0,
          availability: m.availability || "Flexible",
          bio: m.bio || "",
          verified: m.verified || false,
        }));
        
        // Combine database mentors with sample mentors (db mentors first)
        setApprovedMentors(dbMentors.length > 0 ? dbMentors : sampleMentors);
      } else {
        setApprovedMentors(sampleMentors);
      }

      // Fetch user's mentor status if logged in
      if (user) {
        const { data, error } = await supabase
          .from("mentors")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data) {
          setUserMentorStatus(data as DbMentor);
        }
      }
      
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const allSpecialties = [...new Set(approvedMentors.flatMap(m => m.specialties))];

  const filteredMentors = selectedSpecialty
    ? approvedMentors.filter(m => m.specialties.includes(selectedSpecialty))
    : approvedMentors;

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setBookingOpen(true);
  };

  const handleBecomeMentor = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to apply as a mentor.",
        variant: "destructive",
      });
      return;
    }
    setSignupOpen(true);
  };

  const isApprovedMentor = userMentorStatus?.status === "approved";
  const isPendingMentor = userMentorStatus?.status === "pending";

  return (
    <>
      <Helmet>
        <title>Find a Mentor | VibeCheck</title>
        <meta name="description" content="Connect with verified mentors who can help you build confidence and social skills." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Find a Mentor
                </h1>
                <p className="text-sm text-muted-foreground">Verified experts to guide you</p>
              </div>
            </div>
            
            {/* Become a Mentor Button */}
            {!loading && !isApprovedMentor && !isPendingMentor && (
              <Button onClick={handleBecomeMentor} variant="outline" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Become a Mentor
              </Button>
            )}
            {isPendingMentor && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Application Pending
              </Badge>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isApprovedMentor ? (
            // Show tabs for approved mentors
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="find" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Find Mentors
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  My Dashboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="find">
                <MentorsList
                  mentors={filteredMentors}
                  allSpecialties={allSpecialties}
                  selectedSpecialty={selectedSpecialty}
                  setSelectedSpecialty={setSelectedSpecialty}
                  handleBookSession={handleBookSession}
                />
              </TabsContent>

              <TabsContent value="dashboard">
                <MentorDashboard mentorId={userMentorStatus!.id} />
              </TabsContent>
            </Tabs>
          ) : (
            // Regular mentors list for non-mentors
            <MentorsList
              mentors={filteredMentors}
              allSpecialties={allSpecialties}
              selectedSpecialty={selectedSpecialty}
              setSelectedSpecialty={setSelectedSpecialty}
              handleBookSession={handleBookSession}
            />
          )}
        </main>

        {selectedMentor && (
          <BookingDialog
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            mentor={selectedMentor}
          />
        )}

        <MentorSignupDialog
          open={signupOpen}
          onOpenChange={setSignupOpen}
          onSuccess={() => {
            setUserMentorStatus({
              ...userMentorStatus!,
              status: "pending",
            } as DbMentor);
          }}
        />
      </div>
    </>
  );
};

// Extracted MentorsList component
interface MentorsListProps {
  mentors: Mentor[];
  allSpecialties: string[];
  selectedSpecialty: string | null;
  setSelectedSpecialty: (specialty: string | null) => void;
  handleBookSession: (mentor: Mentor) => void;
}

const MentorsList = ({
  mentors,
  allSpecialties,
  selectedSpecialty,
  setSelectedSpecialty,
  handleBookSession,
}: MentorsListProps) => {
  return (
    <>
      {/* Filter by Specialty */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Filter by specialty:</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSpecialty === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSpecialty(null)}
          >
            All
          </Button>
          {allSpecialties.map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty}
            </Button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-card rounded-2xl shadow-card overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
          >
            {/* Mentor Photo */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
              <img
                src={mentor.photo}
                alt={mentor.name}
                className="w-full h-full object-cover"
              />
              {mentor.verified && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </div>
              )}
            </div>

            {/* Mentor Info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{mentor.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{mentor.reviews} reviews</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {mentor.bio}
              </p>

              {/* Experience & Cost */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {mentor.experience} exp.
                </div>
                <div className="font-bold text-primary">
                  FREE
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1 mb-4">
                {mentor.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Available: {mentor.availability}
                </span>
                <Button size="sm" onClick={() => handleBookSession(mentor)}>Book Session</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mentors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No mentors found for this specialty.</p>
          <Button variant="outline" className="mt-4" onClick={() => setSelectedSpecialty(null)}>
            View All Mentors
          </Button>
        </div>
      )}
    </>
  );
};

export default Mentors;