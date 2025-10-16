import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PremiumCodeDialogProps {
  materialId: string;
  materialTitle: string;
  onSuccess: () => void;
}

export function PremiumCodeDialog({ materialId, materialTitle, onSuccess }: PremiumCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);

    try {
      // Generate a unique user ID based on browser fingerprint
      const userId = localStorage.getItem('user_id') || crypto.randomUUID();
      if (!localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', userId);
      }

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'validate_premium_code',
          materialId,
          premiumCode: code,
          userId
        }
      });

      if (error) throw error;

      if (data.valid) {
        toast({
          title: "Success!",
          description: "Premium access granted. You can now view this material.",
        });
        setOpen(false);
        setCode("");
        onSuccess();
      } else {
        toast({
          title: "Invalid Code",
          description: "The code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error validating code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to validate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="default">
          <Lock className="mr-2 h-4 w-4" />
          Enter Premium Code
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Premium Material: {materialTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This is a premium material. Please enter the access code provided by the admin to view this content.
            </p>
            <Input
              type="text"
              placeholder="Enter premium code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={loading || !code.trim()} className="w-full">
            {loading ? "Verifying..." : "Unlock Material"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}