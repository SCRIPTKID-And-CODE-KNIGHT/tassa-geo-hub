import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MaterialCard } from "@/components/MaterialCard";
import { SearchFilter } from "@/components/SearchFilter";
import { MaterialDialog } from "@/components/MaterialDialog";
import { AdminLogin } from "@/components/AdminLogin";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AnnouncementDialog } from "@/components/AnnouncementDialog";
import { CreateAdminDialog } from "@/components/CreateAdminDialog";
import { DashboardStats } from "@/components/DashboardStats";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { AdSenseUnit } from "@/components/AdSenseUnit";
import { VisitorCounter } from "@/components/VisitorCounter";
import heroBackground from "@/assets/hero-background.jpg";
import geographyIcon from "@/assets/geography-icon.png";
import patternBackground from "@/assets/pattern-background.png";

interface Material {
  id: string;
  title: string;
  category: string;
  google_drive_link: string;
  upload_date: string;
  view_count: number;
}

const Index = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | undefined>();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterAndSortMaterials();
  }, [materials, searchTerm, selectedCategory, sortOrder]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching materials',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setMaterials(data);
    }
  };

  const filterAndSortMaterials = () => {
    let filtered = materials;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    // Sort materials
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.upload_date).getTime();
      const dateB = new Date(b.upload_date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredMaterials(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_material',
          materialId: id,
        }
      });

      if (error) throw error;

      toast({
        title: 'Material deleted successfully',
      });
      
      fetchMaterials();
    } catch (error: any) {
      toast({
        title: 'Error deleting material',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background relative">
        {/* Background Pattern */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none"
          style={{ 
            backgroundImage: `url(${patternBackground})`,
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat'
          }}
        />
        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg relative">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3 animate-fade-in">
                  <img 
                    src={geographyIcon} 
                    alt="TASSA Geography" 
                    className="w-12 h-12 rounded-xl shadow-xl ring-2 ring-primary/20 hover:scale-110 transition-transform"
                  />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-[gradient_3s_ease_infinite]">
                      TASSA Materials Portal
                    </h1>
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">Geography Department Resources</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <VisitorCounter />
                <ThemeToggle />
                <AdminLogin isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${heroBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="text-center space-y-4 animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Explore Geography Materials
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Access comprehensive educational resources, exam materials, and study guides for geography students and educators
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* AdSense - Top of page */}
          <AdSenseUnit format="horizontal" />
          
          {/* Announcements */}
          <div className="mb-6">
            <AnnouncementBanner 
              isAdmin={isAdmin} 
              onRefresh={fetchMaterials}
            />
          </div>

          {/* Admin Dashboard */}
          {isAdmin && (
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <MaterialDialog onSuccess={fetchMaterials} />
                <AnnouncementDialog onSuccess={fetchMaterials} />
                <CreateAdminDialog />
              </div>
              <DashboardStats />
            </div>
          )}

          {/* Search and Filter */}
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          {/* AdSense - Before content */}
          <AdSenseUnit />

          {/* Materials Grid */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Available Materials
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 ml-5 font-mono text-sm">
              // Browse and download geography resources
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredMaterials.map((material, index) => (
              <div key={material.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <MaterialCard
                  material={material}
                  isAdmin={isAdmin}
                  onEdit={setEditingMaterial}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No materials found matching your criteria. Try adjusting your search terms or browse all available geography resources.</p>
            </div>
          )}
          
          {/* Additional content for language detection */}
          <footer className="mt-16 pt-8 border-t bg-gradient-to-b from-transparent to-muted/20">
            <div className="text-center space-y-6 pb-8">
              <div className="flex justify-center mb-4">
                <img 
                  src={geographyIcon} 
                  alt="TASSA Geography" 
                  className="w-16 h-16 rounded-xl shadow-lg"
                />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                About TASSA Materials Portal
              </h2>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Welcome to the TASSA Geography Department Materials Portal. This platform provides access to educational resources, study materials, and geographic information for students and educators. Browse our comprehensive collection of geography materials organized by category including lesson notes, textbooks, examination papers, and statistical data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                <div className="p-4 rounded-lg bg-card/50 border">
                  <h3 className="font-semibold mb-2">Educational Resources</h3>
                  <p className="text-sm text-muted-foreground">Access comprehensive study materials and learning resources</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border">
                  <h3 className="font-semibold mb-2">Exam Materials</h3>
                  <p className="text-sm text-muted-foreground">Browse past papers and examination resources</p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border">
                  <h3 className="font-semibold mb-2">Geography Content</h3>
                  <p className="text-sm text-muted-foreground">Explore maps, research papers, and geographic data</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                All materials are available in English for students and educators in the geography department. Access geography resources including maps, research papers, educational content, and study guides.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-4">
                © 2025 TASSA Geography Department. All rights reserved.
              </p>
            </div>
          </footer>

          {/* AdSense - After content */}
          <AdSenseUnit />
        </div>

        {/* Edit Material Dialog */}
        {editingMaterial && (
          <MaterialDialog
            material={editingMaterial}
            onSuccess={() => {
              fetchMaterials();
              setEditingMaterial(undefined);
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default Index;
