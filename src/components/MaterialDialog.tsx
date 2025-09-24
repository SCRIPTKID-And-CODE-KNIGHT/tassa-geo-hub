import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Material {
  id: string;
  title: string;
  category: string;
  google_drive_link: string;
  upload_date: string;
  view_count: number;
}

interface MaterialDialogProps {
  material?: Material;
  onSuccess: () => void;
}

const categories = [
  'Lesson Notes',
  'Geography Books',
  'Exams',
  'Results',
  'Statistics'
];

export function MaterialDialog({ material, onSuccess }: MaterialDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!material;

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setCategory(material.category);
      setLink(material.google_drive_link);
    } else {
      setTitle('');
      setCategory('');
      setLink('');
    }
  }, [material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: isEdit ? 'update_material' : 'create_material',
          materialData: {
            title,
            category,
            google_drive_link: link,
          },
          materialId: material?.id
        }
      });

      if (error) throw error;

      toast({
        title: `Material ${isEdit ? 'updated' : 'created'} successfully`,
      });

      setOpen(false);
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
        {isEdit ? (
          <Button size="sm" variant="ghost">
            <Edit className="w-4 h-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Material' : 'Add New Material'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="link">Google Drive Link</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : (isEdit ? 'Update Material' : 'Add Material')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}