import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Trash2, Plus, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface PremiumCode {
  id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

interface ManageCodesDialogProps {
  materialId: string;
  materialTitle: string;
}

export function ManageCodesDialog({ materialId, materialTitle }: ManageCodesDialogProps) {
  const [open, setOpen] = useState(false);
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCodes();
    }
  }, [open]);

  const loadCodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'get_material_codes',
          materialId
        }
      });

      if (error) throw error;
      setCodes(data.codes || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addCode = async () => {
    if (!newCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'set_premium_code',
          materialId,
          premiumCode: newCode.trim()
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Code added successfully',
      });

      setNewCode('');
      loadCodes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_premium_code',
          codeId
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Code deleted successfully',
      });

      loadCodes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const unusedCount = codes.filter(c => !c.used_by).length;
  const usedCount = codes.filter(c => c.used_by).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Key className="w-4 h-4 mr-2" />
          Manage Codes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Premium Codes - {materialTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex-1 p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{unusedCount}</div>
              <div className="text-sm text-muted-foreground">Available Codes</div>
            </div>
            <div className="flex-1 p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{usedCount}</div>
              <div className="text-sm text-muted-foreground">Used Codes</div>
            </div>
          </div>

          {/* Add new code */}
          <div className="space-y-2">
            <Label>Add New Code</Label>
            <div className="flex gap-2">
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter new premium code"
                onKeyPress={(e) => e.key === 'Enter' && addCode()}
              />
              <Button onClick={addCode} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Codes list */}
          <div className="space-y-2">
            <Label>All Codes ({codes.length})</Label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {codes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No codes yet. Add your first code above.
                </p>
              ) : (
                codes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {code.used_by ? (
                        <CheckCircle className="w-5 h-5 text-gray-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-green-500" />
                      )}
                      <div className="flex-1">
                        <div className="font-mono font-semibold">{code.code}</div>
                        {code.used_by && (
                          <div className="text-xs text-muted-foreground">
                            Used by: {code.used_by.substring(0, 8)}... on{' '}
                            {new Date(code.used_at!).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={code.used_by ? "secondary" : "default"}>
                        {code.used_by ? "Used" : "Available"}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCode(code.id)}
                      disabled={loading}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
