import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, ClipboardCheck, BarChart3, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  'Lesson Notes': number;
  'Geography Books': number;
  'Exams': number;
  'Results': number;
  'Statistics': number;
  total: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    'Lesson Notes': 0,
    'Geography Books': 0,
    'Exams': 0,
    'Results': 0,
    'Statistics': 0,
    total: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('materials')
      .select('category');

    if (data) {
      const counts = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      }, {} as Stats);

      setStats({
        'Lesson Notes': counts['Lesson Notes'] || 0,
        'Geography Books': counts['Geography Books'] || 0,
        'Exams': counts['Exams'] || 0,
        'Results': counts['Results'] || 0,
        'Statistics': counts['Statistics'] || 0,
        total: counts.total || 0,
      });
    }
  };

  const statItems = [
    { label: 'Total Materials', value: stats.total, icon: FileText, color: 'text-blue-600' },
    { label: 'Lesson Notes', value: stats['Lesson Notes'], icon: BookOpen, color: 'text-green-600' },
    { label: 'Geography Books', value: stats['Geography Books'], icon: BookOpen, color: 'text-purple-600' },
    { label: 'Exams', value: stats['Exams'], icon: ClipboardCheck, color: 'text-red-600' },
    { label: 'Results', value: stats['Results'], icon: Award, color: 'text-orange-600' },
    { label: 'Statistics', value: stats['Statistics'], icon: BarChart3, color: 'text-indigo-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{item.value}</span>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}