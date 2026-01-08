import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, Image, Users, Copy, Check, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  sender_username: string;
  content: string;
  content_type: string;
  media_url: string | null;
  created_at: string;
}

interface Community {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  creator_id: string;
  avatar_url: string | null;
}

interface Member {
  user_id: string;
  role: string;
  username?: string;
  avatar_url?: string;
}

const CommunityChat = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCommunity();
    fetchMessages();
    fetchMembers();
    fetchUserProfile();

    // Set up realtime subscription
    const channel = supabase
      .channel(`community-${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `community_id=eq.${communityId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, communityId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user?.id)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const fetchCommunity = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("id", communityId)
      .single();

    if (error) {
      console.error("Error fetching community:", error);
      toast.error("Community not found");
      navigate("/communities");
      return;
    }

    setCommunity(data);
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data: memberData, error } = await supabase
        .from("community_members")
        .select("user_id, role")
        .eq("community_id", communityId);

      if (error) throw error;

      // Fetch profiles for members
      if (memberData && memberData.length > 0) {
        const userIds = memberData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds);

        const membersWithProfiles = memberData.map(m => ({
          ...m,
          username: profiles?.find(p => p.id === m.user_id)?.username || "Unknown",
          avatar_url: profiles?.find(p => p.id === m.user_id)?.avatar_url,
        }));

        setMembers(membersWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;

    setSending(true);
    try {
      const { error } = await supabase.from("community_messages").insert({
        community_id: communityId,
        sender_id: user?.id,
        sender_username: userProfile.username,
        content: newMessage,
        content_type: "text",
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${communityId}/${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("community_messages").insert({
        community_id: communityId,
        sender_id: user?.id,
        sender_username: userProfile.username,
        content: "Shared an image",
        content_type: "image",
        media_url: publicUrl,
      });

      if (insertError) throw insertError;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Left community");
      navigate("/communities");
    } catch (error: any) {
      console.error("Error leaving community:", error);
      toast.error("Failed to leave community");
    }
  };

  const copyInviteCode = () => {
    if (community) {
      navigator.clipboard.writeText(community.invite_code);
      setCopiedCode(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to="/communities">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={community?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                  {community?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold">{community?.name}</h1>
                <p className="text-xs text-muted-foreground">{members.length} members</p>
              </div>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Users className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Community Info</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto">
                    <AvatarImage src={community?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl">
                      {community?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 font-semibold text-lg">{community?.name}</h2>
                  {community?.description && (
                    <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded-md text-center tracking-widest font-mono">
                      {community?.invite_code}
                    </code>
                    <Button variant="outline" size="icon" onClick={copyInviteCode}>
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Members ({members.length})</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {members.map((member) => (
                      <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.username}</p>
                          {member.role === "admin" && (
                            <span className="text-xs text-primary">Admin</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <LogOut className="h-4 w-4" />
                      Leave Community
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Community?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave {community?.name}? You can rejoin later using the invite code.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLeaveCommunity}>
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : ""}`}>
                  {!isOwn && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {message.sender_username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {!isOwn && (
                      <p className="text-xs text-muted-foreground mb-1 ml-1">
                        {message.sender_username}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {message.content_type === "image" && message.media_url ? (
                        <img
                          src={message.media_url}
                          alt="Shared image"
                          className="rounded-lg max-w-full max-h-60 object-cover"
                        />
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right" : ""}`}>
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CommunityChat;
