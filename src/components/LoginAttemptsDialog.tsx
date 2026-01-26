import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Footprints, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface LoginAttempt {
  id: string;
  username: string;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  attempted_at: string;
  failure_reason: string | null;
}

export function LoginAttemptsDialog() {
  const [open, setOpen] = useState(false);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'get_login_attempts', page: 1, limit: 100 }
      });

      if (error) throw error;
      setAttempts(data.attempts || []);
      setTotal(data.total || 0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch login attempts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearOldAttempts = async () => {
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'clear_login_attempts' }
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Cleared login attempts older than 30 days',
      });
      
      fetchAttempts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear old attempts',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchAttempts();
    }
  }, [open]);

  const parseUserAgent = (ua: string | null): string => {
    if (!ua) return 'Unknown';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  const successCount = attempts.filter(a => a.success).length;
  const failCount = attempts.filter(a => !a.success).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Footprints className="w-4 h-4 mr-2" />
          Login Footprints
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Footprints className="w-5 h-5" />
            Login Attempts Tracker
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{successCount} successful</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm">{failCount} failed</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Total: {total} records
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAttempts} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearOldAttempts}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear 30+ days
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No login attempts recorded</div>
            ) : (
              attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className={`p-3 rounded-lg border ${
                    attempt.success 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {attempt.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="font-medium">{attempt.username}</span>
                      <Badge variant={attempt.success ? "default" : "destructive"} className="text-xs">
                        {attempt.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(attempt.attempted_at), 'MMM d, yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">IP:</span> {attempt.ip_address || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Browser:</span> {parseUserAgent(attempt.user_agent)}
                    </div>
                    {attempt.failure_reason && (
                      <div className="col-span-2">
                        <span className="font-medium">Reason:</span> {attempt.failure_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
