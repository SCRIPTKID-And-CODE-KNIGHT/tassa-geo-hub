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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                    T
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      TASSA Materials Portal
                    </h1>
                    <span className="text-sm text-muted-foreground">Geography Department</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <AdminLogin isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
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
              <p className="text-muted-foreground">No materials found matching your criteria.</p>
            </div>
          )}

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
