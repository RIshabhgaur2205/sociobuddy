import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Users, Search, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  avatar_url: string | null;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
}

const Communities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCommunities();
  }, [user, navigate]);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const fetchCommunities = async () => {
    try {
      // Fetch all communities
      const { data: allCommunities, error: communitiesError } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (communitiesError) throw communitiesError;

      // Fetch user's memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user?.id);

      if (membershipsError) throw membershipsError;

      const membershipIds = new Set(memberships?.map(m => m.community_id) || []);

      // Separate into my communities and others
      const myComms: Community[] = [];
      const otherComms: Community[] = [];

      allCommunities?.forEach(comm => {
        const communityWithMembership = { ...comm, is_member: membershipIds.has(comm.id) };
        if (membershipIds.has(comm.id)) {
          myComms.push(communityWithMembership);
        } else {
          otherComms.push(communityWithMembership);
        }
      });

      setMyCommunities(myComms);
      setCommunities(otherComms);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim()) {
      toast.error("Please enter a community name");
      return;
    }

    try {
      const inviteCode = generateInviteCode();
      
      const { data: community, error: createError } = await supabase
        .from("communities")
        .insert({
          name: newCommunity.name,
          description: newCommunity.description || null,
          invite_code: inviteCode,
          creator_id: user?.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Auto-join creator as admin
      const { error: joinError } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user?.id,
          role: "admin",
        });

      if (joinError) throw joinError;

      toast.success(`Community created! Invite code: ${inviteCode}`);
      setCreateDialogOpen(false);
      setNewCommunity({ name: "", description: "" });
      fetchCommunities();
    } catch (error: any) {
      console.error("Error creating community:", error);
      toast.error(error.message || "Failed to create community");
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    try {
      const { data: community, error: findError } = await supabase
        .from("communities")
        .select("*")
        .eq("invite_code", joinCode.toUpperCase())
        .single();

      if (findError || !community) {
        toast.error("Invalid invite code");
        return;
      }

      const { error: joinError } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user?.id,
          role: "member",
        });

      if (joinError) {
        if (joinError.code === "23505") {
          toast.error("You're already a member of this community");
        } else {
          throw joinError;
        }
        return;
      }

      toast.success(`Joined ${community.name}!`);
      setJoinDialogOpen(false);
      setJoinCode("");
      fetchCommunities();
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error(error.message || "Failed to join community");
    }
  };

  const handleJoinCommunity = async (communityId: string, communityName: string) => {
    try {
      const { error } = await supabase
        .from("community_members")
        .insert({
          community_id: communityId,
          user_id: user?.id,
          role: "member",
        });

      if (error) throw error;

      toast.success(`Joined ${communityName}!`);
      fetchCommunities();
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error(error.message || "Failed to join community");
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Invite code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Communities</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Join with Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Invite Code</Label>
                    <Input
                      placeholder="Enter invite code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="text-center text-lg tracking-widest"
                      maxLength={8}
                    />
                  </div>
                  <Button onClick={handleJoinByCode} className="w-full">
                    Join Community
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Community Name</Label>
                    <Input
                      placeholder="e.g., Class 10A Memes"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      placeholder="What's this community about?"
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateCommunity} className="w-full">
                    Create Community
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* My Communities */}
        {myCommunities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">My Communities</h2>
            <div className="grid gap-3">
              {myCommunities.map((community) => (
                <Card 
                  key={community.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/community/${community.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={community.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-lg">
                          {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{community.name}</h3>
                        {community.description && (
                          <p className="text-sm text-muted-foreground truncate">{community.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyInviteCode(community.invite_code);
                        }}
                        className="shrink-0"
                      >
                        {copiedCode === community.invite_code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Discover Communities */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Discover Communities</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredCommunities.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No communities found" : "No communities to discover"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredCommunities.map((community) => (
                <Card key={community.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={community.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/60 text-secondary-foreground text-lg">
                          {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{community.name}</h3>
                        {community.description && (
                          <p className="text-sm text-muted-foreground truncate">{community.description}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinCommunity(community.id, community.name)}
                      >
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communities;
