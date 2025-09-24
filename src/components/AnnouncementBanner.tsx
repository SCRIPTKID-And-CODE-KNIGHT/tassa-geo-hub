import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
}

interface AnnouncementBannerProps {
  isAdmin?: boolean;
  onRefresh?: () => void;
}

export function AnnouncementBanner({ isAdmin, onRefresh }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });

    if (data) {
      setAnnouncements(data);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_announcement',
          announcementId: id,
        }
      });

      if (error) throw error;

      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2">
      {announcements.map((announcement) => (
        <Alert key={announcement.id} className="border-primary bg-primary/5">
          <Megaphone className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{announcement.message}</span>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteAnnouncement(announcement.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}