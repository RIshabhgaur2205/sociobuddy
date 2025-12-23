import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, User } from "lucide-react";
import { toast } from "sonner";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  username: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onUploadComplete?: (url: string) => void;
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-xl",
  lg: "w-20 h-20 text-2xl",
  xl: "w-28 h-28 text-4xl",
};

const AvatarUpload = ({
  userId,
  avatarUrl,
  username,
  size = "lg",
  editable = false,
  onUploadComplete,
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onUploadComplete?.(publicUrl);
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={!editable || isUploading}
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-coral-light to-teal flex items-center justify-center text-primary-foreground font-bold ${
          editable ? "cursor-pointer hover:opacity-90 transition-opacity" : "cursor-default"
        } ${isUploading ? "opacity-50" : ""}`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${username}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{username.charAt(0).toUpperCase()}</span>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center rounded-full">
            <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md cursor-pointer hover:bg-coral-dark transition-colors"
            onClick={handleClick}
          >
            <Camera className="h-4 w-4" />
          </div>
        </>
      )}
    </div>
  );
};

export default AvatarUpload;
