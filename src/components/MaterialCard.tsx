import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2, FileText, BookOpen, ClipboardList, BarChart3, Trophy } from "lucide-react";
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
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 animate-fade-in border border-primary/20 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-[gradient_3s_ease_infinite]" style={{ backgroundSize: '200% 200%' }} />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Tech grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Glowing orb effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardHeader className="pb-4 relative z-10">
        {/* Tech accent line */}
        <div className="absolute top-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
        
        <div className="flex items-start gap-3 mb-3">
          <div className={`relative p-3 rounded-xl ${styles.iconBg} transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-lg`}>
            {/* Icon glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-500" />
            <CategoryIcon className={`w-6 h-6 ${styles.iconColor} relative z-10`} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold leading-tight mb-2 group-hover:text-primary transition-colors duration-300 relative">
              {material.title}
              {/* Underline effect */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
            </CardTitle>
            <Badge className={`${styles.badge} border font-medium shadow-sm hover:shadow-md transition-shadow`} variant="secondary">
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
      
      <CardContent className="pt-0 relative z-10">
        <div className="flex justify-center items-center text-sm text-muted-foreground mb-4 pb-4 border-b border-primary/10">
          <span className="flex items-center gap-2 font-mono">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            {format(new Date(material.upload_date), 'MMM dd, yyyy')}
          </span>
        </div>
        
        <Button 
          onClick={handleLinkClick}
          className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
          variant="default"
          size="lg"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          
          <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
            Access Material
          </span>
          
          {/* Corner decorations */}
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/50 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </CardContent>
    </Card>
  );
}