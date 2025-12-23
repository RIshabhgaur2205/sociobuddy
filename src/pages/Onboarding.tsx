import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const INTERESTS = [
  "Gaming", "Music", "Sports", "Art", "Reading", "Movies", "Anime",
  "Coding", "Photography", "Fashion", "Cooking", "Dancing", "Writing",
  "Science", "Nature", "Volunteering", "Travel", "Pets", "Fitness"
];

const LOOKING_FOR = [
  "Someone to chat with",
  "Study buddy",
  "Gaming partner",
  "Creative collaborator",
  "Workout buddy",
  "Just making new friends"
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [age, setAge] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < 6) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      toast.error("You can select up to 6 interests");
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio,
          school,
          age: parseInt(age),
          interests: selectedInterests,
          looking_for: lookingFor,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile complete! Let's find your matches.");
      navigate("/discover");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return bio.length >= 10 && school.length >= 2 && age;
    if (step === 2) return selectedInterests.length >= 2;
    if (step === 3) return lookingFor;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Complete Your Profile - SocioBuddy</title>
        <meta name="description" content="Tell us about yourself to find the best matches on SocioBuddy." />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full gradient-hero mx-auto flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Let's Get to Know You</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="I'm a high school student who loves..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">Your School</Label>
                <Input
                  id="school"
                  placeholder="e.g., Lincoln High School"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Your Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="13-19"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={13}
                  max={19}
                />
                <p className="text-xs text-muted-foreground">SocioBuddy is for teens 13-19 only</p>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label className="mb-4 block">Pick your interests (2-6)</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedInterests.includes(interest)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {selectedInterests.includes(interest) && (
                        <Check className="inline h-4 w-4 mr-1" />
                      )}
                      {interest}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Selected: {selectedInterests.length}/6
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Looking For */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label className="mb-4 block">What are you looking for?</Label>
                <div className="space-y-3">
                  {LOOKING_FOR.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLookingFor(option)}
                      className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
                        lookingFor === option
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {lookingFor === option && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Find My Matches"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Onboarding;
