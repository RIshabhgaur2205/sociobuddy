import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Briefcase,
  Loader2,
  Eye,
} from "lucide-react";

interface MentorApplication {
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
  created_at: string;
}

const AdminMentors = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [mentors, setMentors] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<MentorApplication | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchMentors();
    }
  }, [isAdmin]);

  const fetchMentors = async () => {
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMentors(data as MentorApplication[]);
    }
    setLoading(false);
  };

  const handleApprove = async (mentor: MentorApplication) => {
    setProcessing(true);
    const { error } = await supabase
      .from("mentors")
      .update({ status: "approved", verified: true })
      .eq("id", mentor.id);

    setProcessing(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve mentor application.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mentor Approved",
      description: `${mentor.name} has been approved as a mentor.`,
    });

    fetchMentors();
    setViewDialogOpen(false);
  };

  const handleReject = async () => {
    if (!selectedMentor) return;

    setProcessing(true);
    const { error } = await supabase
      .from("mentors")
      .update({ status: "rejected" })
      .eq("id", selectedMentor.id);

    setProcessing(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject mentor application.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Application Rejected",
      description: `${selectedMentor.name}'s application has been rejected.`,
    });

    setRejectDialogOpen(false);
    setRejectReason("");
    fetchMentors();
  };

  const openViewDialog = (mentor: MentorApplication) => {
    setSelectedMentor(mentor);
    setViewDialogOpen(true);
  };

  const openRejectDialog = (mentor: MentorApplication) => {
    setSelectedMentor(mentor);
    setRejectDialogOpen(true);
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect non-admins
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingMentors = mentors.filter((m) => m.status === "pending");
  const approvedMentors = mentors.filter((m) => m.status === "approved");
  const rejectedMentors = mentors.filter((m) => m.status === "rejected");

  const stats = [
    { label: "Total Applications", value: mentors.length, icon: Users, color: "text-primary" },
    { label: "Pending", value: pendingMentors.length, icon: Clock, color: "text-yellow-500" },
    { label: "Approved", value: approvedMentors.length, icon: CheckCircle, color: "text-green-500" },
    { label: "Rejected", value: rejectedMentors.length, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <>
      <Helmet>
        <title>Admin - Mentor Applications | VibeCheck</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-40">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Manage mentor applications</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingMentors.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approved ({approvedMentors.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected ({rejectedMentors.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <MentorList
                  mentors={pendingMentors}
                  onView={openViewDialog}
                  onApprove={handleApprove}
                  onReject={openRejectDialog}
                  showActions
                  emptyMessage="No pending applications"
                />
              </TabsContent>

              <TabsContent value="approved">
                <MentorList
                  mentors={approvedMentors}
                  onView={openViewDialog}
                  emptyMessage="No approved mentors yet"
                />
              </TabsContent>

              <TabsContent value="rejected">
                <MentorList
                  mentors={rejectedMentors}
                  onView={openViewDialog}
                  emptyMessage="No rejected applications"
                />
              </TabsContent>
            </Tabs>
          )}
        </main>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedMentor && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {selectedMentor.photo ? (
                        <img
                          src={selectedMentor.photo}
                          alt={selectedMentor.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <span>{selectedMentor.name}</span>
                      <Badge
                        variant={
                          selectedMentor.status === "approved"
                            ? "default"
                            : selectedMentor.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="ml-2"
                      >
                        {selectedMentor.status}
                      </Badge>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMentor.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMentor.title}</span>
                  </div>

                  {selectedMentor.experience && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedMentor.experience} experience</span>
                    </div>
                  )}

                  {selectedMentor.availability && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Availability:</span>{" "}
                      {selectedMentor.availability}
                    </div>
                  )}

                  {selectedMentor.bio && (
                    <div>
                      <p className="text-sm font-medium mb-1">Bio</p>
                      <p className="text-sm text-muted-foreground">{selectedMentor.bio}</p>
                    </div>
                  )}

                  {selectedMentor.specialties && selectedMentor.specialties.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedMentor.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedMentor.status === "pending" && (
                  <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setViewDialogOpen(false);
                        openRejectDialog(selectedMentor);
                      }}
                      disabled={processing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(selectedMentor)} disabled={processing}>
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject {selectedMentor?.name}'s mentor application?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Reason (optional)</label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={processing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

interface MentorListProps {
  mentors: MentorApplication[];
  onView: (mentor: MentorApplication) => void;
  onApprove?: (mentor: MentorApplication) => void;
  onReject?: (mentor: MentorApplication) => void;
  showActions?: boolean;
  emptyMessage: string;
}

const MentorList = ({
  mentors,
  onView,
  onApprove,
  onReject,
  showActions,
  emptyMessage,
}: MentorListProps) => {
  if (mentors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mentors.map((mentor) => (
        <Card key={mentor.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {mentor.photo ? (
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{mentor.name}</p>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                  <p className="text-xs text-muted-foreground">{mentor.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(mentor)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {showActions && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReject?.(mentor)}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => onApprove?.(mentor)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminMentors;