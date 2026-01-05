import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Image, Mic, Square, X, Play, Pause, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  content: string;
  content_type: string;
  media_url: string | null;
  sender_id: string;
  created_at: string;
}

interface MatchedProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

const Conversation = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user || !matchId) return;

    const fetchMatchAndMessages = async () => {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .eq("id", matchId)
        .eq("status", "accepted")
        .maybeSingle();

      if (matchError || !match) {
        showToast({ title: "Match not found", variant: "destructive" });
        navigate("/matches");
        return;
      }

      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", otherUserId)
        .maybeSingle();

      if (profile) {
        setMatchedProfile(profile);
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select("id, content, content_type, media_url, sender_id, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (messagesData) {
        setMessages(messagesData as Message[]);
      }

      setLoading(false);
    };

    fetchMatchAndMessages();

    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
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
  }, [user, matchId, navigate, showToast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const uploadMedia = async (file: Blob, type: 'image' | 'voice'): Promise<string | null> => {
    if (!user) return null;

    const ext = type === 'image' ? 'jpg' : 'webm';
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file, {
        contentType: type === 'image' ? 'image/jpeg' : 'audio/webm',
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSend = async () => {
    if (!user || !matchId || sending) return;
    if (!newMessage.trim() && !selectedImage) return;

    setSending(true);

    try {
      let contentType = 'text';
      let mediaUrl: string | null = null;
      let content = newMessage.trim();

      if (selectedImage) {
        contentType = 'image';
        mediaUrl = await uploadMedia(selectedImage, 'image');
        if (!mediaUrl) {
          toast.error("Failed to upload image");
          setSending(false);
          return;
        }
        content = content || "📷 Image";
      }

      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        content,
        content_type: contentType,
        media_url: mediaUrl,
      });

      if (error) {
        showToast({ title: "Failed to send message", variant: "destructive" });
      } else {
        setNewMessage("");
        setSelectedImage(null);
        setImagePreview(null);

        if (matchedProfile) {
          supabase.functions.invoke("send-push-notification", {
            body: {
              userId: matchedProfile.id,
              title: "New message",
              body: contentType === 'image' ? "📷 Sent an image" : content.substring(0, 100),
              url: `/conversation/${matchId}`,
            },
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }

    setSending(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceNote(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendVoiceNote = async (audioBlob: Blob) => {
    if (!user || !matchId) return;

    setSending(true);

    const mediaUrl = await uploadMedia(audioBlob, 'voice');
    if (!mediaUrl) {
      toast.error("Failed to upload voice note");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content: "🎤 Voice note",
      content_type: 'voice',
      media_url: mediaUrl,
    });

    if (error) {
      showToast({ title: "Failed to send voice note", variant: "destructive" });
    } else if (matchedProfile) {
      supabase.functions.invoke("send-push-notification", {
        body: {
          userId: matchedProfile.id,
          title: "New message",
          body: "🎤 Sent a voice note",
          url: `/conversation/${matchId}`,
        },
      }).catch(console.error);
    }

    setSending(false);
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageToDelete.id);

    if (error) {
      toast.error("Failed to delete message");
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      toast.success("Message deleted");
    }
    setMessageToDelete(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chat with {matchedProfile?.username || "Match"} | SocioBuddy</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/matches")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={matchedProfile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {matchedProfile?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">{matchedProfile?.username}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No messages yet.</p>
              <p className="text-sm mt-1">Say hi to start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
                >
                  {isOwn && (
                    <button
                      onClick={() => setMessageToDelete(msg)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity self-center mr-2 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content_type === 'image' && msg.media_url && (
                      <img
                        src={msg.media_url}
                        alt="Shared image"
                        className="rounded-lg max-w-full max-h-64 mb-2 cursor-pointer"
                        onClick={() => window.open(msg.media_url!, '_blank')}
                      />
                    )}
                    {msg.content_type === 'voice' && msg.media_url && (
                      <VoicePlayer src={msg.media_url} isOwn={isOwn} />
                    )}
                    {msg.content_type === 'text' && (
                      <p className="break-words">{msg.content}</p>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="p-4 border-t border-border bg-card">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Recording UI */}
        {isRecording && (
          <div className="p-4 border-t border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Recording... {formatRecordingTime(recordingTime)}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={stopRecording}>
              <Square className="h-4 w-4 mr-2" />
              Stop & Send
            </Button>
          </div>
        )}

        {/* Input */}
        {!isRecording && (
          <div className="sticky bottom-0 bg-card border-t border-border p-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 items-center"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={startRecording}
                disabled={sending}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" size="icon" disabled={(!newMessage.trim() && !selectedImage) || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This message will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Voice Player Component
const VoicePlayer = ({ src, isOwn }: { src: string; isOwn: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isOwn ? 'bg-primary-foreground/20' : 'bg-primary/20'
        }`}
      >
        {isPlaying ? (
          <Pause className={`h-4 w-4 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} />
        ) : (
          <Play className={`h-4 w-4 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} />
        )}
      </button>
      <div className="flex-1">
        <div className={`h-1 rounded-full ${isOwn ? 'bg-primary-foreground/30' : 'bg-primary/30'}`}>
          <div
            className={`h-1 rounded-full ${isOwn ? 'bg-primary-foreground' : 'bg-primary'}`}
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
        <span className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
};

export default Conversation;
