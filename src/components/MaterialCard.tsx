import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Edit, Trash2, FileText, BookOpen, ClipboardList, BarChart3, Trophy } from "lucide-react";
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lesson Notes': return FileText;
      case 'Geography Books': return BookOpen;
      case 'Exams': return ClipboardList;
      case 'Results': return Trophy;
      case 'Statistics': return BarChart3;
      default: return FileText;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Lesson Notes': 
        return {
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          iconBg: 'bg-blue-50 dark:bg-blue-950/50',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'Geography Books': 
        return {
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
          iconColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'Exams': 
        return {
          badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900',
          iconBg: 'bg-red-50 dark:bg-red-950/50',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'Results': 
        return {
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900',
          iconBg: 'bg-purple-50 dark:bg-purple-950/50',
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'Statistics': 
        return {
          badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-900',
          iconBg: 'bg-orange-50 dark:bg-orange-950/50',
          iconColor: 'text-orange-600 dark:text-orange-400'
        };
      default: 
        return {
          badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          iconBg: 'bg-gray-50 dark:bg-gray-800/50',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const CategoryIcon = getCategoryIcon(material.category);
  const styles = getCategoryStyles(material.category);

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in border-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-4 relative">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-3 rounded-xl ${styles.iconBg} transition-transform group-hover:scale-110 duration-300`}>
            <CategoryIcon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
              {material.title}
            </CardTitle>
            <Badge className={`${styles.badge} border font-medium`} variant="secondary">
              {material.category}
            </Badge>
          </div>
          {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(material)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete?.(material.id)}
                className="h-8 w-8 p-0 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4 pb-4 border-b">
          <span className="flex items-center gap-1">
            📅 {format(new Date(material.upload_date), 'MMM dd, yyyy')}
          </span>
          <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
            <Eye className="w-4 h-4" />
            <span className="font-medium">{viewCount}</span>
          </div>
        </div>
        <Button 
          onClick={handleLinkClick}
          className="w-full group/btn relative overflow-hidden"
          variant="default"
          size="lg"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            View Material
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}