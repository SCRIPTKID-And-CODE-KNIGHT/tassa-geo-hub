import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How can I download resources?",
      answer: "You can browse through our materials library and click on any material card to view details. Each material has a download button that allows you to save the resource to your device."
    },
    {
      question: "Are the notes free?",
      answer: "Yes! All our geography notes, maps, and study materials are completely free to download and use for educational purposes."
    },
    {
      question: "Can I request a specific map or topic?",
      answer: "Absolutely! You can use our 'Request Material' page to submit requests for specific geography topics, maps, or study materials. Just provide your WhatsApp number and describe what you need, and we'll do our best to create and upload it."
    },
    {
      question: "What subjects/topics are covered?",
      answer: "We cover a wide range of geography topics including physical geography, human geography, maps, climate studies, economic geography, and more. Our library is constantly growing with new materials."
    },
    {
      question: "How often are new materials added?",
      answer: "We regularly update our library with new materials based on curriculum requirements and user requests. Check back frequently or request specific materials you need."
    },
    {
      question: "Can I share these materials with others?",
      answer: "Yes, you can share our materials with fellow students and teachers. We encourage sharing knowledge! However, please don't redistribute them for commercial purposes."
    },
    {
      question: "What format are the materials in?",
      answer: "Our materials are available in various formats including PDF documents, images (PNG/JPG), and other common educational file formats for easy access and printing."
    },
    {
      question: "Do I need to create an account?",
      answer: "No account is required to browse and download most materials. However, some features may require basic information like a WhatsApp number for material requests."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/src/assets/geography-icon.png" 
                alt="Geography Icon" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Geography Hub
              </h1>
            </Link>
            <div className="flex gap-4">
              <Link to="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link to="/request-material">
                <Button variant="outline">Request Material</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about our geography resources and platform.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-primary/10 rounded-lg border border-primary/20">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Feel free to request materials or reach out to us.
          </p>
          <Link to="/request-material">
            <Button>Request Material</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
