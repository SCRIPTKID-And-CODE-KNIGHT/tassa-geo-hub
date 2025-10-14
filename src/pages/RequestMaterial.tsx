import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import { z } from "zod";
import emailjs from '@emailjs/browser';
import geographyIcon from "@/assets/geography-icon.png";

const requestSchema = z.object({
  phone_number: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[0-9+\s()-]+$/, { message: "Invalid phone number format" }),
  material_description: z.string()
    .trim()
    .min(10, { message: "Please provide at least 10 characters describing the material" })
    .max(1000, { message: "Description must be less than 1000 characters" })
});

const RequestMaterial = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ phone_number?: string; material_description?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const result = requestSchema.safeParse({
      phone_number: phoneNumber,
      material_description: materialDescription
    });

    if (!result.success) {
      const fieldErrors: { phone_number?: string; material_description?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "phone_number") {
          fieldErrors.phone_number = err.message;
        } else if (err.path[0] === "material_description") {
          fieldErrors.material_description = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('material_requests')
        .insert({
          phone_number: result.data.phone_number,
          material_description: result.data.material_description,
        });

      if (error) throw error;

      // Send email via EmailJS
      try {
        await emailjs.send(
          'YOUR_SERVICE_ID',
          'YOUR_TEMPLATE_ID',
          {
            to_email: 'technociphernet@gmail.com',
            phone_number: result.data.phone_number,
            material_description: result.data.material_description,
            from_name: 'TASSA Materials Portal'
          },
          'YOUR_PUBLIC_KEY'
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      toast({
        title: "Request submitted successfully!",
        description: "We'll contact you soon on WhatsApp.",
      });

      setPhoneNumber("");
      setMaterialDescription("");
      
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Materials
        </Button>

        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={geographyIcon} 
                alt="TASSA Geography" 
                className="w-16 h-16 rounded-xl shadow-lg"
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Request Geography Material
            </CardTitle>
            <CardDescription className="text-base">
              Can't find what you're looking for? Fill out this form and our admin will contact you via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (WhatsApp)</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+255 756 377 013"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={errors.phone_number ? "border-destructive" : ""}
                  maxLength={20}
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="material_description">Material Description</Label>
                <Textarea
                  id="material_description"
                  placeholder="Describe the geography material you need (e.g., Grade 11 Physical Geography notes, World Map resources, etc.)"
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  className={`min-h-32 ${errors.material_description ? "border-destructive" : ""}`}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  {errors.material_description ? (
                    <p className="text-sm text-destructive">{errors.material_description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {materialDescription.length}/1000 characters
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestMaterial;
