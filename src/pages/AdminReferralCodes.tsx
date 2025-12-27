import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Gift,
  Copy,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReferralCode {
  id: string;
  code: string;
  role: "admin" | "moderator" | "user";
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

const AdminReferralCodes = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ReferralCode | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "moderator" | "user">("admin");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCodes();
    }
  }, [isAdmin]);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error("Error fetching codes:", error);
      toast.error("Failed to load referral codes");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCode(null);
    setFormCode("");
    setFormRole("admin");
    setFormMaxUses("");
    setFormExpiresAt("");
    setDialogOpen(true);
  };

  const openEditDialog = (code: ReferralCode) => {
    setEditingCode(code);
    setFormCode(code.code);
    setFormRole(code.role);
    setFormMaxUses(code.max_uses?.toString() || "");
    setFormExpiresAt(code.expires_at ? code.expires_at.split("T")[0] : "");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formCode.trim()) {
      toast.error("Code is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formCode.toUpperCase().trim(),
        role: formRole,
        max_uses: formMaxUses ? parseInt(formMaxUses) : null,
        expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
      };

      if (editingCode) {
        const { error } = await supabase
          .from("referral_codes")
          .update(payload)
          .eq("id", editingCode.id);

        if (error) throw error;
        toast.success("Referral code updated");
      } else {
        const { error } = await supabase
          .from("referral_codes")
          .insert({ ...payload, is_active: true, current_uses: 0 });

        if (error) {
          if (error.code === "23505") {
            toast.error("This code already exists");
            return;
          }
          throw error;
        }
        toast.success("Referral code created");
      }

      setDialogOpen(false);
      fetchCodes();
    } catch (error) {
      console.error("Error saving code:", error);
      toast.error("Failed to save referral code");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (code: ReferralCode) => {
    try {
      const { error } = await supabase
        .from("referral_codes")
        .update({ is_active: !code.is_active })
        .eq("id", code.id);

      if (error) throw error;
      toast.success(code.is_active ? "Code deactivated" : "Code activated");
      fetchCodes();
    } catch (error) {
      console.error("Error toggling code:", error);
      toast.error("Failed to update code");
    }
  };

  const deleteCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from("referral_codes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Referral code deleted");
      fetchCodes();
    } catch (error) {
      console.error("Error deleting code:", error);
      toast.error("Failed to delete code");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Referral Codes - Admin - SocioBuddy</title>
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Referral Codes</h1>
                <p className="text-muted-foreground">Manage codes that grant special roles</p>
              </div>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Referral Codes ({codes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : codes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No referral codes yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="font-mono bg-muted px-2 py-1 rounded text-sm">
                              {code.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(code.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={code.role === "admin" ? "default" : "secondary"}
                          >
                            {code.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {code.current_uses}
                          {code.max_uses && ` / ${code.max_uses}`}
                        </TableCell>
                        <TableCell>
                          {code.expires_at
                            ? new Date(code.expires_at).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.is_active ? "default" : "outline"}>
                            {code.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleActive(code)}
                              title={code.is_active ? "Deactivate" : "Activate"}
                            >
                              {code.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-500" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(code)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Referral Code?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the code "{code.code}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCode(code.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCode ? "Edit Referral Code" : "Create Referral Code"}
            </DialogTitle>
            <DialogDescription>
              {editingCode
                ? "Update the referral code settings"
                : "Create a new code that grants special roles to users who sign up with it"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g., ADMIN2024"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                disabled={!!editingCode}
              />
              {editingCode && (
                <p className="text-xs text-muted-foreground">Code cannot be changed after creation</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role to Grant</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as typeof formRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (optional)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires On (optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingCode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminReferralCodes;
