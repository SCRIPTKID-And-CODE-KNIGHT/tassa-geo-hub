import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MaterialCard } from "@/components/MaterialCard";
import { Button } from "@/components/ui/button";
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
import { ImageCarousel } from "@/components/ImageCarousel";
import { ScrollReveal, ParallaxSection } from "@/components/ParallaxSection";
import heroBackground from "@/assets/hero-background.jpg";
import geographyIcon from "@/assets/geography-icon.png";
import patternBackground from "@/assets/pattern-background.png";
import mountain1 from "@/assets/mountain-1.jpg";
import landscape1 from "@/assets/landscape-1.jpg";
import mountain2 from "@/assets/mountain-2.jpg";
import landscape2 from "@/assets/landscape-2.jpg";

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

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

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
      <div className="min-h-screen bg-background relative scroll-smooth">
        {/* Background Pattern */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none"
          style={{ 
            backgroundImage: `url(${patternBackground})`,
            backgroundSize: '400px 400px',
            backgroundRepeat: 'repeat'
          }}
        />
        
        {/* Fixed Navbar */}
        <header className="border-b bg-card/95 backdrop-blur-lg fixed top-0 w-full z-50 shadow-lg">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 animate-fade-in">
                <img 
                  src={geographyIcon} 
                  alt="TASSA Learning Hub" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shadow-xl ring-2 ring-primary/20 hover:scale-110 transition-transform"
                />
                <div>
                  <h1 className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    TASSA LEARNING HUB
                  </h1>
                  <span className="hidden sm:block text-xs text-muted-foreground">Geography Resources</span>
                </div>
              </div>
              
              {/* Navigation Links - Desktop only */}
              <nav className="hidden lg:flex items-center gap-1">
                <a href="#home" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10">
                  Home
                </a>
                <a href="#about" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10">
                  About
                </a>
                <a href="#materials" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10">
                  Materials
                </a>
                <a href="#gallery" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10">
                  Gallery
                </a>
                <a href="#contact" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10">
                  Contact
                </a>
              </nav>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/faq" className="hidden sm:block">
                  <Button variant="ghost" size="sm">FAQ</Button>
                </Link>
                <Link to="/request-material">
                  <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-accent text-xs sm:text-sm px-2 sm:px-3">
                    <span className="hidden sm:inline">Request</span>
                    <span className="sm:hidden">Req</span>
                  </Button>
                </Link>
                <ThemeToggle />
                <AdminLogin isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex lg:hidden items-center justify-center gap-1 mt-2 pb-1 overflow-x-auto scrollbar-hide">
              <a href="#home" className="px-3 py-1 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10 whitespace-nowrap">
                Home
              </a>
              <a href="#about" className="px-3 py-1 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10 whitespace-nowrap">
                About
              </a>
              <a href="#materials" className="px-3 py-1 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10 whitespace-nowrap">
                Materials
              </a>
              <a href="#gallery" className="px-3 py-1 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10 whitespace-nowrap">
                Gallery
              </a>
              <a href="#contact" className="px-3 py-1 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10 whitespace-nowrap">
                Contact
              </a>
              <Link to="/faq" className="sm:hidden px-3 py-1 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-accent/10 whitespace-nowrap">
                FAQ
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section with Parallax */}
        <section id="home" className="relative overflow-hidden pt-24 sm:pt-20 min-h-[80vh] sm:min-h-[90vh] flex items-center">
          {/* Parallax Background */}
          <ParallaxSection speed={0.3} className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-40 scale-110"
              style={{
                backgroundImage: `url(${heroBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }}
            />
          </ParallaxSection>
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          
          <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Text Content */}
              <ScrollReveal direction="left" className="text-center lg:text-left space-y-4 sm:space-y-6">
                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full mb-2 sm:mb-4">
                  <span className="text-xs sm:text-sm font-semibold text-primary">🌍 TASSA LEARNING HUB</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-[gradient_3s_ease_infinite] leading-tight">
                  Explore Geography Materials
                </h2>
                <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Access comprehensive educational resources, exam materials, and study guides for geography students and educators
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mt-6 sm:mt-8">
                  <a href="#materials" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all">
                      Browse Materials
                    </Button>
                  </a>
                  <a href="#about" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto hover:scale-105 transition-all">
                      Learn More
                    </Button>
                  </a>
                </div>
              </ScrollReveal>
              
              {/* Image Carousel */}
              <ScrollReveal direction="right" delay={0.2} className="hidden md:block">
                <ImageCarousel />
              </ScrollReveal>
            </div>
            
            {/* Mobile Carousel */}
            <ScrollReveal direction="up" delay={0.3} className="md:hidden mt-8">
              <ImageCarousel />
            </ScrollReveal>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 sm:py-20 bg-muted/30 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  About TASSA LEARNING HUB
                </h2>
                <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                  Your comprehensive source for geography education and research materials
                </p>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <ScrollReveal delay={0.1}>
                  <div className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group h-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-xl sm:text-2xl">📚</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Educational Resources</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Access comprehensive study materials and learning resources for all levels</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group h-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-xl sm:text-2xl">📝</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Exam Materials</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Browse past papers and examination resources to excel in your studies</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.3}>
                  <div className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group sm:col-span-2 md:col-span-1 h-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-xl sm:text-2xl">🗺️</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Geography Content</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Explore maps, research papers, and comprehensive geographic data</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Announcements */}
          <div className="mb-4">
            <AnnouncementBanner 
              isAdmin={isAdmin} 
              onRefresh={fetchMaterials}
            />
          </div>

          {/* Admin Dashboard */}
          {isAdmin && (
            <div className="mb-4 space-y-4">
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

          {/* Materials Section */}
          <section id="materials" className="mb-8 sm:mb-12">
            <ScrollReveal className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Available Materials
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Browse our comprehensive collection of geography resources
              </p>
            </ScrollReveal>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {filteredMaterials.map((material, index) => (
              <ScrollReveal key={material.id} delay={index * 0.05}>
                <MaterialCard
                  material={material}
                  isAdmin={isAdmin}
                  onEdit={setEditingMaterial}
                  onDelete={handleDelete}
                />
              </ScrollReveal>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <p className="text-sm sm:text-base text-muted-foreground">No materials found matching your criteria. Try adjusting your search terms or browse all available geography resources.</p>
            </div>
          )}
        </div>
        
        {/* Gallery Section with Parallax */}
        <section id="gallery" className="py-12 sm:py-20 bg-muted/30 relative z-10 overflow-hidden">
          <ParallaxSection speed={0.2} className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-primary via-accent to-primary" />
          </ParallaxSection>
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Geography in View
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Explore the beauty and diversity of our planet's landscapes
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
              <ScrollReveal delay={0.1}>
                <div className="group overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative overflow-hidden">
                    <img 
                      src={mountain1} 
                      alt="Snow-capped mountain peaks" 
                      className="w-full h-40 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                      <p className="text-xs sm:text-sm font-medium">Mountain Peaks</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="group overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative overflow-hidden">
                    <img 
                      src={landscape1} 
                      alt="Green valley landscape" 
                      className="w-full h-40 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                      <p className="text-xs sm:text-sm font-medium">Valley Landscape</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="group overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative overflow-hidden">
                    <img 
                      src={mountain2} 
                      alt="Mountain range at sunset" 
                      className="w-full h-40 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                      <p className="text-xs sm:text-sm font-medium">Sunset Range</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.4}>
                <div className="group overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="relative overflow-hidden">
                    <img 
                      src={landscape2} 
                      alt="Hills and natural terrain" 
                      className="w-full h-40 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                      <p className="text-xs sm:text-sm font-medium">Natural Terrain</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-12 sm:py-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Get in Touch
                </h2>
                <p className="text-sm sm:text-lg text-muted-foreground px-2">
                  Need specific geography materials? We're here to help
                </p>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 p-5 sm:p-8 md:p-12 shadow-xl">
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                      <span className="text-2xl sm:text-3xl">💬</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">Contact Us on WhatsApp</h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                      Have questions or need assistance finding specific materials? Reach out to us directly and we'll help you find what you need.
                    </p>
                    <a 
                      href="https://wa.me/255756377013" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all text-sm sm:text-base">
                      <span className="mr-2">📱</span>
                      +255 756 377 013
                    </Button>
                  </a>
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 sm:py-12 border-t bg-muted/30 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex justify-center mb-4">
                <img 
                  src={geographyIcon} 
                  alt="TASSA LEARNING HUB" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TASSA LEARNING HUB
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-2">
                Welcome to TASSA LEARNING HUB - Your comprehensive source for geography education and research materials for students and educators.
              </p>
              
              {/* Visitor Counter in Footer */}
              <div className="flex justify-center py-2">
                <VisitorCounter />
              </div>
              
              <p className="text-xs text-muted-foreground/70">
                © 2025 TASSA LEARNING HUB. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        <div className="container mx-auto px-4 relative z-10">
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
