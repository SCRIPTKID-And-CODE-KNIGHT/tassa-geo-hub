import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
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

interface MaterialCardProps {
  material: Material;
  isAdmin?: boolean;
  onEdit?: (material: Material) => void;
  onDelete?: (id: string) => void;
}

export function MaterialCard({ material, isAdmin, onEdit, onDelete }: MaterialCardProps) {
  const [viewCount, setViewCount] = useState(material.view_count);

  const handleLinkClick = async () => {
    // Increment view count
    const { error } = await supabase
      .from('materials')
      .update({ view_count: viewCount + 1 })
      .eq('id', material.id);

    if (!error) {
      setViewCount(prev => prev + 1);
    }

    // Open link in new tab
    window.open(material.google_drive_link, '_blank');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Lesson Notes': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Geography Books': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Exams': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Results': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Statistics': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{material.title}</CardTitle>
          {isAdmin && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(material)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(material.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <Badge className={getCategoryColor(material.category)} variant="secondary">
          {material.category}
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
          <span>Uploaded: {format(new Date(material.upload_date), 'MMM dd, yyyy')}</span>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{viewCount}</span>
          </div>
        </div>
        <Button 
          onClick={handleLinkClick}
          className="w-full"
          variant="default"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Material
        </Button>
      </CardContent>
    </Card>
  );
}