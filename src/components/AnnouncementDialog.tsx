import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
}

interface AnnouncementDialogProps {
  onSuccess: () => void;
  announcement?: Announcement;
  triggerButton?: React.ReactNode;
}

export function AnnouncementDialog({ onSuccess, announcement, triggerButton }: AnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(announcement?.message || '');
  const [loading, setLoading] = useState(false);
  
  const isEditing = !!announcement;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: isEditing ? 'update_announcement' : 'create_announcement',
          announcementData: {
            message,
            is_pinned: true,
          },
          announcementId: announcement?.id
        }
      });

      if (error) throw error;

      toast({
        title: isEditing ? 'Announcement updated successfully' : 'Announcement posted successfully',
      });

      setOpen(false);
      if (!isEditing) setMessage('');
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Megaphone className="w-4 h-4 mr-2" />
            Post Announcement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Announcement' : 'Post New Announcement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Announcement Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message..."
              required
              className="min-h-20"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Announcement' : 'Post Announcement')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}