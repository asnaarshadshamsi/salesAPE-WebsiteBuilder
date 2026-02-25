"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Edit, Save, Undo, Redo, Plus, Trash2, Move, Type, 
  Image as ImageIcon, Palette, Layout, Settings,
  Eye, EyeOff, MousePointer, Hand, Copy, Scissors,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  FileText, Star, Users, Phone, Mail, ShoppingCart, Calendar, 
  MessageCircle, Target, Grid, Square, Circle, ChevronDown, 
  ChevronUp, Layers, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InlineTextEditor } from "./InlineTextEditor";
import { ServiceCardEditor } from "./ServiceCardEditor";
import { TestimonialCardEditor } from "./TestimonialCardEditor";
import { FontManager } from "./FontManager";

interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'section' | 'card' | 'container' | 'navbar' | 'hero' | 'features' | 'about' | 'services' | 'testimonials' | 'contact' | 'footer' | 'cta';
  content: any;
  styles: Record<string, string>;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  parent?: string;
  children?: string[];
  sectionData?: any; // For complex sections
  order?: number; // For section ordering
}

interface EnhancedVisualEditorProps {
  siteData: any;
  onSave: (data: any) => void;
}

export function EnhancedVisualEditor({ siteData, onSave }: EnhancedVisualEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<Record<string, EditorElement>>({});
  const [history, setHistory] = useState<Record<string, EditorElement>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'section' | 'move'>('select');
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [editMode, setEditMode] = useState<'visual' | 'section' | 'layers'>('visual');
  const [activeFonts, setActiveFonts] = useState<string[]>(['Inter', 'Playfair Display']);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Google Fonts list for font picker
  const availableFonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Oswald', 'Source Sans Pro',
    'Raleway', 'PT Sans', 'Lora', 'Nunito', 'Ubuntu'
  ];

  // Initialize editor elements from site data
  useEffect(() => {
    if (siteData) {
      const parsedElements = parseSiteDataToElements(siteData);
      setElements(parsedElements);
      addToHistory(parsedElements);
    }
  }, [siteData]);

  // Load Google Fonts
  useEffect(() => {
    activeFonts.forEach(font => {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}&display=swap`;
      link.rel = 'stylesheet';
      if (!document.head.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    });
  }, [activeFonts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Parse site data into editable elements with comprehensive section support
  const parseSiteDataToElements = (data: any): Record<string, EditorElement> => {
    const elements: Record<string, EditorElement> = {};
    let order = 0;

    console.log('Parsing site data:', data); // Debug log

    // Extract business and site data
    const business = data.business || {};
    const site = data;

    // Navbar
    elements['navbar'] = {
      id: 'navbar',
      type: 'navbar',
      content: business.name || 'Your Business',
      styles: { 
        backgroundColor: business.primaryColor || '#ffffff',
        color: '#000000',
        padding: '1rem 2rem',
        position: 'sticky',
        top: '0',
        zIndex: '50'
      },
      sectionData: {
        logo: business.logo,
        name: business.name,
        navigation: []
      },
      order: order++
    };

    // Hero Section
    elements['hero'] = {
      id: 'hero',
      type: 'hero',
      content: site.headline || 'Welcome to Our Business',
      styles: {
        minHeight: '90vh',
        padding: '6rem 2rem',
        backgroundColor: business.primaryColor || '#f8fafc',
        color: '#1a1a1a',
        textAlign: 'center'
      },
      sectionData: {
        headline: site.headline || 'Transform Your Business Today',
        subheadline: site.subheadline || 'We provide exceptional services that help your business grow and succeed.',
        image: business.heroImage,
        cta: { text: site.ctaText || 'Get Started', url: '#contact' },
        secondaryCta: { text: 'Learn More', url: '#about' }
      },
      order: order++
    };

    // About Section
    if (site.aboutText || business.description) {
      elements['about'] = {
        id: 'about',
        type: 'about',
        content: 'About Us',
        styles: {
          padding: '6rem 2rem',
          backgroundColor: '#ffffff'
        },
        sectionData: {
          title: 'About Our Company',
          content: site.aboutText || business.description || 'Tell your story here...'
        },
        order: order++
      };
    }

    // Services Section
    if (business.services && business.services.length > 0) {
      elements['services'] = {
        id: 'services',
        type: 'services',
        content: 'Our Services',
        styles: {
          padding: '6rem 2rem',
          backgroundColor: '#f8fafc'
        },
        sectionData: {
          title: 'Our Services',
          services: business.services.map((service: any) => ({
            title: service.name || service.title,
            description: service.description,
            icon: 'star',
            price: service.price || undefined
          }))
        },
        order: order++
      };
    }

    // Features Section (if features exist)
    if (site.features && site.features.length > 0) {
      elements['features'] = {
        id: 'features',
        type: 'features',
        content: 'Features',
        styles: {
          padding: '6rem 2rem',
          backgroundColor: '#ffffff'
        },
        sectionData: {
          title: 'Why Choose Us',
          features: site.features
        },
        order: order++
      };
    }

    // Testimonials Section
    if (site.testimonials && site.testimonials.length > 0) {
      elements['testimonials'] = {
        id: 'testimonials',
        type: 'testimonials',
        content: 'Testimonials',
        styles: {
          padding: '6rem 2rem',
          backgroundColor: '#f8fafc'
        },
        sectionData: {
          title: 'What Our Clients Say',
          testimonials: site.testimonials
        },
        order: order++
      };
    }

    // Contact Section
    elements['contact'] = {
      id: 'contact',
      type: 'contact',
      content: 'Contact Us',
      styles: {
        padding: '6rem 2rem',
        backgroundColor: '#ffffff'
      },
      sectionData: {
        title: 'Get In Touch',
        email: business.email || 'contact@yourbusiness.com',
        phone: business.phone || '+1 (555) 123-4567',
        address: business.address ? `${business.address}, ${business.city}` : undefined
      },
      order: order++
    };

    // Footer
    elements['footer'] = {
      id: 'footer',
      type: 'footer',
      content: business.name || 'Your Business',
      styles: {
        padding: '4rem 2rem 2rem',
        backgroundColor: '#1e293b',
        color: '#ffffff'
      },
      sectionData: {
        companyName: business.name || 'Your Business',
        description: business.description || 'Building the future, one project at a time.',
        email: business.email,
        phone: business.phone,
        address: business.address ? `${business.address}, ${business.city}` : undefined
      },
      order: order++
    };

    console.log('Parsed elements:', elements); // Debug log
    return elements;
  };

  // Add state to history for undo/redo
  const addToHistory = (newElements: Record<string, EditorElement>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...newElements });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // Update element
  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    const newElements = {
      ...elements,
      [id]: { ...elements[id], ...updates }
    };
    setElements(newElements);
    addToHistory(newElements);
  };

  // Update section data specifically with real-time updates
  const updateSectionData = (id: string, sectionData: any) => {
    updateElement(id, { sectionData: { ...elements[id].sectionData, ...sectionData } });
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new debounced save
    const timeout = setTimeout(() => {
      const updatedData = convertElementsToSiteData();
      onSave(updatedData);
    }, 500); // 500ms debounce
    
    setSaveTimeout(timeout);
  };

  // Delete element/section
  const deleteElement = (id: string) => {
    const newElements = { ...elements };
    delete newElements[id];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
  };

  // Add new section with comprehensive templates
  const addSection = (type: EditorElement['type']) => {
    const id = `section_${Date.now()}`;
    const sectionTypes: Record<string, any> = {
      'hero': {
        title: 'Hero Section',
        content: 'Transform Your Business Today',
        sectionData: {
          headline: 'Transform Your Business Today',
          subheadline: 'We provide exceptional services that help your business grow and succeed in the digital world. Join thousands of satisfied customers.',
          image: '',
          cta: { text: 'Get Started', url: '#contact' },
          secondaryCta: { text: 'Learn More', url: '#about' }
        }
      },
      'about': {
        title: 'About Section',
        content: 'About Our Company',
        sectionData: {
          title: 'About Our Company',
          content: 'We are passionate about delivering exceptional results for our clients. With years of experience and a dedicated team, we provide innovative solutions that drive success and create lasting value.',
          image: '',
          features: ['Expert Team', 'Proven Results', 'Customer-Focused']
        }
      },
      'features': {
        title: 'Features Section',
        content: 'Why Choose Us',
        sectionData: {
          title: 'Why Choose Us',
          subtitle: 'Discover what makes us different',
          features: [
            {
              title: 'Fast & Reliable',
              description: 'Lightning-fast performance you can depend on 24/7.',
              icon: 'zap'
            },
            {
              title: 'Expert Support',
              description: '24/7 customer support from our expert team.',
              icon: 'users'
            },
            {
              title: 'Secure Platform',
              description: 'Enterprise-grade security for your peace of mind.',
              icon: 'shield'
            }
          ]
        }
      },
      'services': {
        title: 'Services Section',
        content: 'Our Services',
        sectionData: {
          title: 'What We Offer',
          subtitle: 'Comprehensive solutions for your business needs',
          services: [
            {
              title: 'Consulting Services',
              description: 'Strategic guidance to help your business thrive in today\'s competitive market.',
              icon: 'briefcase',
              price: 'Starting at $99',
              features: ['Strategy Planning', 'Market Analysis', 'Growth Roadmap']
            },
            {
              title: 'Development',
              description: 'Custom solutions built specifically for your unique business requirements.',
              icon: 'code',
              price: 'Starting at $199',
              features: ['Custom Development', 'API Integration', 'Quality Testing']
            },
            {
              title: 'Support & Maintenance',
              description: 'Ongoing support to keep everything running smoothly and efficiently.',
              icon: 'wrench',
              price: 'Starting at $49/mo',
              features: ['24/7 Monitoring', 'Regular Updates', 'Technical Support']
            }
          ]
        }
      },
      'testimonials': {
        title: 'Testimonials Section',
        content: 'What Our Clients Say',
        sectionData: {
          title: 'Client Success Stories',
          subtitle: 'Don\'t just take our word for it',
          testimonials: [
            {
              quote: 'Outstanding service and exceptional results. They transformed our business and exceeded all expectations. Highly recommend!',
              author: 'Sarah Johnson',
              position: 'CEO, Tech Innovations',
              company: 'Tech Innovations Inc.',
              image: '',
              rating: 5
            },
            {
              quote: 'Professional, reliable, and delivered exactly what we needed on time and within budget. Amazing team to work with!',
              author: 'Mike Chen',
              position: 'Marketing Director',
              company: 'Growth Co',
              image: '',
              rating: 5
            },
            {
              quote: 'The results speak for themselves. Our revenue increased by 300% after implementing their solutions. Incredible!',
              author: 'Emily Rodriguez',
              position: 'Founder',
              company: 'StartupXYZ',
              image: '',
              rating: 5
            }
          ]
        }
      },
      'contact': {
        title: 'Contact Section',
        content: 'Get In Touch',
        sectionData: {
          title: 'Ready to Get Started?',
          subtitle: 'Contact us today and let\'s discuss how we can help your business grow.',
          email: 'contact@yourbusiness.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Avenue, Suite 100, City, State 12345',
          hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
          form: {
            enabled: true,
            title: 'Send us a message',
            fields: ['name', 'email', 'phone', 'message']
          },
          social: [
            { platform: 'LinkedIn', url: '#linkedin' },
            { platform: 'Twitter', url: '#twitter' }
          ]
        }
      },
      'cta': {
        title: 'Call to Action Section',
        content: 'Ready to Transform Your Business?',
        sectionData: {
          headline: 'Ready to Transform Your Business?',
          subheadline: 'Join thousands of satisfied customers who have already made the switch to our platform.',
          primaryCta: { text: 'Start Free Trial', url: '#signup' },
          secondaryCta: { text: 'Schedule Demo', url: '#demo' },
          features: ['No setup fees', '30-day free trial', 'Cancel anytime', 'Expert support'],
          urgency: 'Limited time offer - Get 50% off your first month!'
        }
      },
      'footer': {
        title: 'Footer Section',
        content: 'Footer',
        sectionData: {
          companyName: 'Your Business',
          description: 'Building the future, one project at a time. We\'re committed to delivering excellence.',
          columns: [
            {
              title: 'Company',
              links: [
                { title: 'About Us', url: '#about' },
                { title: 'Our Team', url: '#team' },
                { title: 'Careers', url: '#careers' },
                { title: 'News', url: '#news' }
              ]
            },
            {
              title: 'Services',
              links: [
                { title: 'Consulting', url: '#consulting' },
                { title: 'Development', url: '#development' },
                { title: 'Support', url: '#support' },
                { title: 'Training', url: '#training' }
              ]
            },
            {
              title: 'Resources',
              links: [
                { title: 'Documentation', url: '#docs' },
                { title: 'Blog', url: '#blog' },
                { title: 'FAQ', url: '#faq' },
                { title: 'Contact', url: '#contact' }
              ]
            }
          ],
          socialMedia: [
            { platform: 'Facebook', url: '#facebook', icon: 'facebook' },
            { platform: 'Twitter', url: '#twitter', icon: 'twitter' },
            { platform: 'LinkedIn', url: '#linkedin', icon: 'linkedin' },
            { platform: 'Instagram', url: '#instagram', icon: 'instagram' }
          ],
          newsletter: {
            enabled: true,
            title: 'Stay Updated',
            description: 'Subscribe to our newsletter for the latest updates and offers.'
          },
          copyright: '© 2024 Your Business. All rights reserved.',
          legal: [
            { title: 'Privacy Policy', url: '#privacy' },
            { title: 'Terms of Service', url: '#terms' },
            { title: 'Cookie Policy', url: '#cookies' }
          ]
        }
      }
    };

    const template = sectionTypes[type as keyof typeof sectionTypes] || sectionTypes.about;
    const maxOrder = Math.max(...Object.values(elements).map(e => e.order || 0), -1);
    
    const newElement: EditorElement = {
      id,
      type,
      content: template.content,
      styles: {
        padding: type === 'hero' ? '8rem 2rem' : type === 'footer' ? '4rem 2rem 2rem' : '6rem 2rem',
        backgroundColor: type === 'hero' ? '#f8fafc' : type === 'footer' ? '#1e293b' : type === 'cta' ? '#3b82f6' : '#ffffff',
        color: type === 'footer' || type === 'cta' ? '#ffffff' : '#1a1a1a',
        textAlign: type === 'hero' || type === 'cta' ? 'center' : 'left',
        minHeight: type === 'hero' ? '90vh' : 'auto'
      },
      sectionData: template.sectionData,
      order: maxOrder + 1
    };

    const newElements = { ...elements, [id]: newElement };
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(id);
  };

  // Duplicate section
  const duplicateElement = (id: string) => {
    const element = elements[id];
    if (!element) return;

    const newId = `section_${Date.now()}`;
    const maxOrder = Math.max(...Object.values(elements).map(e => e.order || 0), -1);
    
    const newElement: EditorElement = {
      ...element,
      id: newId,
      order: maxOrder + 1
    };

    const newElements = { ...elements, [newId]: newElement };
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newId);
  };

  // Reorder sections
  const reorderSection = (id: string, direction: 'up' | 'down') => {
    const element = elements[id];
    if (!element) return;

    const sortedElements = Object.values(elements).sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedElements.findIndex(e => e.id === id);
    
    if (direction === 'up' && currentIndex > 0) {
      const temp = sortedElements[currentIndex].order;
      sortedElements[currentIndex].order = sortedElements[currentIndex - 1].order;
      sortedElements[currentIndex - 1].order = temp;
    } else if (direction === 'down' && currentIndex < sortedElements.length - 1) {
      const temp = sortedElements[currentIndex].order;
      sortedElements[currentIndex].order = sortedElements[currentIndex + 1].order;
      sortedElements[currentIndex + 1].order = temp;
    }

    const newElements = { ...elements };
    sortedElements.forEach(e => {
      newElements[e.id] = { ...newElements[e.id], order: e.order };
    });
    
    setElements(newElements);
    addToHistory(newElements);
  };

  // Add font to active fonts
  const addFont = (font: string) => {
    if (!activeFonts.includes(font)) {
      setActiveFonts([...activeFonts, font]);
    }
  };

  // Handle preview site
  const handlePreviewSite = () => {
    // Open site in new tab for preview
    if (siteData.slug) {
      window.open(`/sites/${siteData.slug}`, '_blank');
    } else {
      alert('Site preview will be available after saving');
    }
  };

  // Convert elements back to site data format
  const convertElementsToSiteData = () => {
    // Create a clean, minimal data structure
    const updatedSiteData: any = {
      // Keep essential site metadata
      id: siteData.id,
      slug: siteData.slug,
      // Initialize with existing data to preserve structure
      ...siteData,
    };

    // Extract data from elements efficiently
    Object.values(elements).forEach((element) => {
      // Only include essential section data, not the entire element
      const essentialData = element.sectionData ? { ...element.sectionData } : {};
      
      switch (element.type) {
        case 'navbar':
          if (essentialData.name || essentialData.logo) {
            // Update business name if navbar name changed
            if (updatedSiteData.business) {
              updatedSiteData.business.name = essentialData.name || updatedSiteData.business.name;
              if (essentialData.logo) {
                updatedSiteData.business.logo = essentialData.logo;
              }
            }
          }
          break;
        case 'hero':
          if (essentialData.headline) {
            updatedSiteData.headline = essentialData.headline;
          }
          if (essentialData.subheadline) {
            updatedSiteData.subheadline = essentialData.subheadline;
          }
          if (essentialData.cta?.text) {
            updatedSiteData.ctaText = essentialData.cta.text;
          }
          if (essentialData.image) {
            updatedSiteData.heroImage = essentialData.image;
            if (updatedSiteData.business) {
              updatedSiteData.business.heroImage = essentialData.image;
            }
          }
          break;
        case 'about':
          if (essentialData.content) {
            updatedSiteData.aboutText = essentialData.content;
          }
          break;
        case 'services':
          if (essentialData.services && essentialData.services.length > 0) {
            const services = essentialData.services.map((s: any) => ({
              id: s.id || `service_${Date.now()}`,
              name: s.title || s.name,
              title: s.title,
              description: s.description,
              price: s.price,
              features: s.features || []
            }));
            updatedSiteData.services = services;
            // Also update business services
            if (updatedSiteData.business) {
              updatedSiteData.business.services = services;
            }
          }
          break;
        case 'testimonials':
          if (essentialData.testimonials && essentialData.testimonials.length > 0) {
            updatedSiteData.testimonials = essentialData.testimonials.map((t: any) => ({
              quote: t.quote,
              author: t.author,
              position: t.position,
              company: t.company,
              rating: t.rating,
              image: t.image
            }));
          }
          break;
        case 'contact':
          if (essentialData.email || essentialData.phone || essentialData.address) {
            // Update top-level contact info
            if (essentialData.email) updatedSiteData.contactEmail = essentialData.email;
            if (essentialData.phone) updatedSiteData.contactPhone = essentialData.phone;
            if (essentialData.address) updatedSiteData.contactAddress = essentialData.address;
            
            // Also update business contact info
            if (updatedSiteData.business) {
              if (essentialData.email) updatedSiteData.business.email = essentialData.email;
              if (essentialData.phone) updatedSiteData.business.phone = essentialData.phone;
              if (essentialData.address) updatedSiteData.business.address = essentialData.address;
            }
          }
          break;
        case 'footer':
          if (essentialData.companyName) {
            // Update business name if footer company name changed
            if (updatedSiteData.business) {
              updatedSiteData.business.name = essentialData.companyName;
            }
          }
          if (essentialData.description) {
            // Update business description if footer description changed
            if (updatedSiteData.business) {
              updatedSiteData.business.description = essentialData.description;
            }
          }
          break;
      }
    });

    console.log('Converted site data:', updatedSiteData); // Debug log
    return updatedSiteData;
  };

  return (
    <div className="h-screen flex bg-linear-to-br from-slate-50 to-slate-100">
      {/* Left Toolbar */}
      <div className="w-20 bg-linear-to-b from-slate-800 to-slate-900 border-r-2 border-slate-700 flex flex-col items-center py-6 space-y-3 shadow-2xl">
        {/* Mode Switcher */}
        <div className="space-y-3">
          <Button
            variant={editMode === 'visual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setEditMode('visual')}
            className={`w-16 h-16 p-0 flex flex-col text-xs transition-all duration-300 rounded-xl ${
              editMode === 'visual' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <Layout size={20} className="mb-1" />
            <span className="font-bold text-xs">Visual</span>
          </Button>
          
          <Button
            variant={editMode === 'section' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setEditMode('section')}
            className={`w-16 h-16 p-0 flex flex-col text-xs transition-all duration-300 rounded-xl ${
              editMode === 'section' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <Square size={20} className="mb-1" />
            <span className="font-bold text-xs">Sections</span>
          </Button>
          
          <Button
            variant={editMode === 'layers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setEditMode('layers')}
            className={`w-16 h-16 p-0 flex flex-col text-xs transition-all duration-300 rounded-xl ${
              editMode === 'layers' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
          >
            <Layers size={20} className="mb-1" />
            <span className="font-bold text-xs">Layers</span>
          </Button>
        </div>

        <div className="w-12 h-0.5 bg-slate-600 my-6 rounded-full"></div>

        {/* Tools */}
        <div className="space-y-3">
          <Button
            variant={tool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('select')}
            className={`w-14 h-14 p-0 transition-all duration-300 rounded-xl ${
              tool === 'select' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
            title="Select Tool"
          >
            <MousePointer size={22} />
          </Button>
          
          <Button
            variant={tool === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('text')}
            className={`w-14 h-14 p-0 transition-all duration-300 rounded-xl ${
              tool === 'text' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
            title="Text Tool"
          >
            <Type size={22} />
          </Button>

          <Button
            variant={tool === 'image' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('image')}
            className={`w-14 h-14 p-0 transition-all duration-300 rounded-xl ${
              tool === 'image' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
            title="Image Tool"
          >
            <ImageIcon size={22} />
          </Button>

          <Button
            variant={tool === 'section' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('section')}
            className={`w-14 h-14 p-0 transition-all duration-300 rounded-xl ${
              tool === 'section' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-110' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
            title="Section Tool"
          >
            <Grid size={22} />
          </Button>
        </div>

        <div className="w-12 h-0.5 bg-slate-600 my-6 rounded-full"></div>

        {/* History Controls */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`w-14 h-14 p-0 transition-all duration-300 rounded-xl ${
              historyIndex <= 0 
                ? 'text-slate-500 cursor-not-allowed opacity-40' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
            title="Undo"
          >
            <Undo size={22} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`w-14 h-14 p-0 transition-all duration-300 rounded-xl ${
              historyIndex >= history.length - 1 
                ? 'text-slate-500 cursor-not-allowed opacity-40' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:shadow-lg hover:scale-105'
            }`}
            title="Redo"
          >
            <Redo size={22} />
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-20 bg-linear-to-r from-slate-50 to-white border-b-2 border-slate-200 flex items-center justify-between px-8 py-4 shadow-lg">
          <div className="flex items-center space-x-6">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
              className={`px-8 py-3 font-semibold text-sm transition-all duration-300 ${
                isEditing 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 border-red-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 border-blue-600'
              }`}
            >
              <Edit size={18} className="mr-3" />
              {isEditing ? 'Exit Edit Mode' : 'Start Editing'}
            </Button>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowGrid(!showGrid)}
                className={`px-6 py-3 border-2 transition-all duration-300 font-medium ${
                  showGrid 
                    ? 'bg-purple-100 border-purple-400 text-purple-700 shadow-md shadow-purple-200/50' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                <Layout size={16} className="mr-2" />
                <span className="text-sm font-semibold">{showGrid ? 'Hide Grid' : 'Show Grid'}</span>
              </Button>

              <div className="flex items-center space-x-4 bg-linear-to-r from-slate-100 to-slate-50 rounded-xl px-6 py-3 border border-slate-200 shadow-sm">
                <span className="text-sm font-bold text-slate-800">Zoom:</span>
                <select 
                  className="bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold min-w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                >
                  <option value={0.25}>25%</option>
                  <option value={0.5}>50%</option>
                  <option value={0.75}>75%</option>
                  <option value={1}>100%</option>
                  <option value={1.25}>125%</option>
                  <option value={1.5}>150%</option>
                  <option value={2}>200%</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handlePreviewSite}
              className="px-8 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white border-amber-500 hover:from-amber-600 hover:to-orange-600 hover:border-amber-600 font-bold text-sm shadow-xl shadow-amber-500/30 transition-all duration-300"
            >
              <Eye size={18} className="mr-3" />
              Preview Site
            </Button>

            <Button 
              onClick={() => onSave(convertElementsToSiteData())}
              className="px-8 py-3 bg-linear-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all duration-300"
            >
              <Save size={18} className="mr-3" />
              Save Changes
            </Button>

            {saveTimeout && (
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                Auto-saving...
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-auto bg-linear-to-br from-slate-50 to-slate-100">
          {editMode === 'visual' ? (
            <div
              ref={canvasRef}
              className="relative bg-white min-h-full mx-auto shadow-2xl border-2 border-slate-200 rounded-lg m-4"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                maxWidth: '1200px',
                backgroundImage: showGrid ? 
                  'radial-gradient(circle, #e2e8f0 2px, transparent 2px)' : 'none',
                backgroundSize: showGrid ? '32px 32px' : 'auto',
              }}
            >
              {/* Render sections in order */}
              {Object.values(elements)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(element => (
                  <EditableSection
                    key={element.id}
                    element={element}
                    isSelected={selectedElement === element.id}
                    isEditing={isEditing}
                    onSelect={setSelectedElement}
                    onUpdate={updateElement}
                    onUpdateSectionData={updateSectionData}
                    onDelete={deleteElement}
                    onDuplicate={duplicateElement}
                    onReorder={reorderSection}
                    availableFonts={availableFonts}
                    activeFonts={activeFonts}
                    onAddFont={addFont}
                  />
                ))}
            </div>
          ) : editMode === 'section' ? (
            <SectionManager 
              elements={elements}
              selectedElement={selectedElement}
              onSelect={setSelectedElement}
              onUpdate={updateElement}
              onDelete={deleteElement}
              onDuplicate={duplicateElement}
              onReorder={reorderSection}
              onAddSection={addSection}
            />
          ) : (
            <LayersPanel
              elements={elements}
              selectedElement={selectedElement}
              onSelect={setSelectedElement}
              onReorder={reorderSection}
              onDelete={deleteElement}
            />
          )}
        </div>
      </div>

      {/* Right Properties Panel */}
      {selectedElement && elements[selectedElement] && editMode === 'visual' && (
        <div className="w-96 bg-linear-to-b from-white to-slate-50 border-l-2 border-slate-200 shadow-2xl flex flex-col h-screen">
          <SectionPropertiesPanel
            element={elements[selectedElement]}
            onUpdate={(updates: Partial<EditorElement>) => updateElement(selectedElement, updates)}
            onUpdateSectionData={(data: any) => updateSectionData(selectedElement, data)}
            onDelete={() => deleteElement(selectedElement)}
            onDuplicate={() => duplicateElement(selectedElement)}
            availableFonts={availableFonts}
            activeFonts={activeFonts}
            onAddFont={addFont}
          />
        </div>
      )}

      {/* Enhanced Add Section Menu */}
      {isEditing && editMode === 'visual' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white shadow-2xl rounded-3xl p-6 border-2 border-slate-200 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center">
                <Plus size={16} className="mr-2" />
                Add New Section
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('hero')}
                className="h-16 w-20 p-2 bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center rounded-xl"
              >
                <Layout size={20} className="mb-1" />
                <span className="text-xs">Hero</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('about')}
                className="h-16 w-20 p-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center rounded-xl"
              >
                <FileText size={20} className="mb-1" />
                <span className="text-xs">About</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('services')}
                className="h-16 w-20 p-2 bg-purple-50 border-2 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center rounded-xl"
              >
                <Star size={20} className="mb-1" />
                <span className="text-xs">Services</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('testimonials')}
                className="h-16 w-20 p-2 bg-amber-50 border-2 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center rounded-xl"
              >
                <Users size={20} className="mb-1" />
                <span className="text-xs">Reviews</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('contact')}
                className="h-16 w-20 p-2 bg-pink-50 border-2 border-pink-200 text-pink-700 hover:bg-pink-100 hover:border-pink-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center rounded-xl"
              >
                <Phone size={20} className="mb-1" />
                <span className="text-xs">Contact</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('cta')}
                className="h-16 w-20 p-2 bg-orange-50 border-2 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex flex-col items-center justify-center rounded-xl"
              >
                <Target size={20} className="mb-1" />
                <span className="text-xs">CTA</span>
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('features')}
                  className="h-12 px-4 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg rounded-xl"
                >
                  <Grid size={16} className="mr-2" />
                  <span className="text-sm">Features</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('features')}
                  className="h-12 px-4 bg-teal-50 border-2 border-teal-200 text-teal-700 hover:bg-teal-100 hover:border-teal-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg rounded-xl"
                >
                  <ImageIcon size={16} className="mr-2" />
                  <span className="text-sm">Images</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('footer')}
                  className="h-12 px-4 bg-slate-50 border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-400 font-semibold transition-all duration-200 shadow-md hover:shadow-lg rounded-xl"
                >
                  <Square size={16} className="mr-2" />
                  <span className="text-sm">Footer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual section component will go here...
// [Components for EditableSection, SectionManager, LayersPanel, SectionPropertiesPanel would be included]

// For now, let's create a basic EditableSection component
interface EditableSectionProps {
  element: EditorElement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onUpdateSectionData: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  availableFonts: string[];
  activeFonts: string[];
  onAddFont: (font: string) => void;
}

function EditableSection({
  element,
  isSelected,
  isEditing,
  onSelect,
  onUpdate,
  onUpdateSectionData,
  onDelete,
  onDuplicate,
  onReorder,
  availableFonts,
  activeFonts,
  onAddFont
}: EditableSectionProps) {
  const [isEditingText, setIsEditingText] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) {
      onSelect(element.id);
    }
  };

  const handleTextEdit = (field: string, value: string) => {
    onUpdateSectionData(element.id, { [field]: value });
    setIsEditingText(null);
  };

  const sectionStyle = {
    ...element.styles,
    position: 'relative' as const,
    minHeight: element.styles.minHeight || 'auto',
    border: isSelected ? '3px solid #3b82f6' : isEditing ? '2px dashed #e2e8f0' : 'none',
    borderRadius: isSelected || isEditing ? '12px' : '0',
    cursor: isEditing ? 'pointer' : 'default',
    transition: 'all 0.3s ease-in-out',
    boxShadow: isSelected ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none'
  };

  return (
    <section
      style={sectionStyle}
      onClick={handleClick}
      className={`group relative ${isSelected ? 'ring-2 ring-blue-300 bg-blue-50/20' : ''} ${
        isEditing ? 'hover:bg-blue-50/10 hover:border-blue-300 hover:shadow-lg' : ''
      }`}
    >
      {/* Enhanced Section Controls */}
      {isSelected && isEditing && (
        <div className="absolute -top-4 -right-4 flex space-x-1 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onReorder(element.id, 'up'); }}
            className="w-9 h-9 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center hover:scale-110"
            title="Move Section Up"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReorder(element.id, 'down'); }}
            className="w-9 h-9 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center hover:scale-110"
            title="Move Section Down"
          >
            <ChevronDown size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
            className="w-9 h-9 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center hover:scale-110"
            title="Duplicate Section"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
            className="w-9 h-9 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center hover:scale-110"
            title="Delete Section"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {/* Enhanced Section Label */}
      {isEditing && (
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${
            isSelected 
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
              : 'bg-white text-slate-700 border-slate-300 shadow-md'
          } transition-all duration-200`}>
            {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Section
          </span>
        </div>
      )}

      {/* Section Content */}
      <div className="max-w-7xl mx-auto">
        {renderSectionContent(element, isEditingText, setIsEditingText, handleTextEdit, isEditing, onUpdateSectionData)}
      </div>
    </section>
  );
}

// Helper function to render different section types
function renderSectionContent(
  element: EditorElement,
  isEditingText: string | null,
  setIsEditingText: (field: string | null) => void,
  handleTextEdit: (field: string, value: string) => void,
  isEditing: boolean,
  onUpdateSectionData?: (id: string, data: any) => void
) {
  const { type, sectionData } = element;

  switch (type) {
    case 'navbar':
      return (
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            {sectionData?.logo && (
              <img 
                src={sectionData.logo} 
                alt="Logo" 
                className="h-8 w-auto" 
              />
            )}
            {isEditingText === 'name' ? (
              <input
                type="text"
                defaultValue={sectionData?.name || ''}
                onBlur={(e) => handleTextEdit('name', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextEdit('name', (e.target as HTMLInputElement).value);
                  }
                }}
                className="text-xl font-bold bg-transparent border-none outline-none"
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-bold cursor-pointer"
                onClick={() => isEditing && setIsEditingText('name')}
              >
                {sectionData?.name || 'Your Business'}
              </h1>
            )}
          </div>
        </nav>
      );

    case 'hero':
      return (
        <div className={`grid ${sectionData?.image ? 'md:grid-cols-2' : 'grid-cols-1'} gap-12 items-center py-24`}>
          <div className={sectionData?.image ? '' : 'text-center max-w-4xl mx-auto'}>
            {isEditingText === 'headline' ? (
              <input
                type="text"
                defaultValue={sectionData?.headline || ''}
                onBlur={(e) => handleTextEdit('headline', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextEdit('headline', (e.target as HTMLInputElement).value);
                  }
                }}
                className="text-4xl md:text-6xl font-bold bg-transparent border-none outline-none w-full"
                autoFocus
              />
            ) : (
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6 cursor-pointer"
                onClick={() => isEditing && setIsEditingText('headline')}
              >
                {sectionData?.headline || 'Welcome to Our Business'}
              </h1>
            )}
            
            {isEditingText === 'subheadline' ? (
              <textarea
                defaultValue={sectionData?.subheadline || ''}
                onBlur={(e) => handleTextEdit('subheadline', e.target.value)}
                className="text-xl text-gray-600 mb-8 bg-transparent border-none outline-none w-full resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <p 
                className="text-xl text-gray-600 mb-8 cursor-pointer"
                onClick={() => isEditing && setIsEditingText('subheadline')}
              >
                {sectionData?.subheadline || 'We provide amazing services to help your business grow'}
              </p>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              {sectionData?.cta && (
                <a
                  href={sectionData.cta.href || '#'}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {sectionData.cta.label || 'Get Started'}
                </a>
              )}
              {sectionData?.secondaryCta && (
                <a
                  href={sectionData.secondaryCta.href || '#'}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sectionData.secondaryCta.label || 'Learn More'}
                </a>
              )}
            </div>
          </div>
          
          {sectionData?.image && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={sectionData.image}
                alt="Hero"
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      );

    case 'about':
      return (
        <div className="text-center max-w-4xl mx-auto">
          {isEditingText === 'title' ? (
            <input
              type="text"
              defaultValue={sectionData?.title || ''}
              onBlur={(e) => handleTextEdit('title', e.target.value)}
              className="text-3xl font-bold mb-6 bg-transparent border-none outline-none text-center w-full"
              autoFocus
            />
          ) : (
            <h2 
              className="text-3xl font-bold mb-6 cursor-pointer"
              onClick={() => isEditing && setIsEditingText('title')}
            >
              {sectionData?.title || 'About Us'}
            </h2>
          )}
          
          {isEditingText === 'content' ? (
            <textarea
              defaultValue={sectionData?.content || ''}
              onBlur={(e) => handleTextEdit('content', e.target.value)}
              className="text-lg text-gray-600 bg-transparent border-none outline-none w-full resize-none"
              rows={5}
              autoFocus
            />
          ) : (
            <p 
              className="text-lg text-gray-600 cursor-pointer"
              onClick={() => isEditing && setIsEditingText('content')}
            >
              {sectionData?.content || 'Tell your story here...'}
            </p>
          )}
        </div>
      );

    case 'services':
      return (
        <div className="text-center">
          {isEditingText === 'title' ? (
            <input
              type="text"
              defaultValue={sectionData?.title || ''}
              onBlur={(e) => handleTextEdit('title', e.target.value)}
              className="text-3xl font-bold mb-12 bg-transparent border-none outline-none text-center w-full"
              autoFocus
            />
          ) : (
            <h2 
              className="text-3xl font-bold mb-12 cursor-pointer"
              onClick={() => isEditing && setIsEditingText('title')}
            >
              {sectionData?.title || 'Our Services'}
            </h2>
          )}
          
          <ServiceCardEditor
            services={sectionData?.services || sectionData?.items || []}
            onUpdate={(services) => {
              const key = sectionData?.services ? 'services' : 'items';
              onUpdateSectionData?.(element.id, { [key]: services });
            }}
            isEditing={isEditing}
          />
        </div>
      );

    case 'testimonials':
      return (
        <div className="text-center">
          {isEditingText === 'title' ? (
            <input
              type="text"
              defaultValue={sectionData?.title || ''}
              onBlur={(e) => handleTextEdit('title', e.target.value)}
              className="text-3xl font-bold mb-12 bg-transparent border-none outline-none text-center w-full"
              autoFocus
            />
          ) : (
            <h2 
              className="text-3xl font-bold mb-12 cursor-pointer"
              onClick={() => isEditing && setIsEditingText('title')}
            >
              {sectionData?.title || 'What Our Clients Say'}
            </h2>
          )}
          
          <TestimonialCardEditor
            testimonials={sectionData?.testimonials || []}
            onUpdate={(testimonials) => {
              onUpdateSectionData?.(element.id, { testimonials });
            }}
            isEditing={isEditing}
          />
        </div>
      );

    case 'contact':
      return (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {isEditingText === 'title' ? (
              <input
                type="text"
                defaultValue={sectionData?.title || 'Contact Us'}
                onBlur={(e) => handleTextEdit('title', e.target.value)}
                className="text-3xl font-bold mb-4 bg-transparent border-none outline-none text-center w-full"
                autoFocus
              />
            ) : (
              <h2 
                className="text-3xl font-bold mb-4 cursor-pointer"
                onClick={() => isEditing && setIsEditingText('title')}
              >
                {sectionData?.title || 'Contact Us'}
              </h2>
            )}
            {isEditingText === 'subtitle' ? (
              <input
                type="text"
                defaultValue={sectionData?.subtitle || 'Get in touch with our team'}
                onBlur={(e) => handleTextEdit('subtitle', e.target.value)}
                className="text-lg text-gray-600 bg-transparent border-none outline-none text-center w-full"
                autoFocus
              />
            ) : (
              <p 
                className="text-lg text-gray-600 cursor-pointer"
                onClick={() => isEditing && setIsEditingText('subtitle')}
              >
                {sectionData?.subtitle || 'Get in touch with our team'}
              </p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="w-6 h-6 text-blue-600" />
                {isEditingText === 'email' ? (
                  <input
                    type="email"
                    defaultValue={sectionData?.email || 'info@yourbusiness.com'}
                    onBlur={(e) => handleTextEdit('email', e.target.value)}
                    className="text-lg bg-transparent border-none outline-none flex-1"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-lg cursor-pointer"
                    onClick={() => isEditing && setIsEditingText('email')}
                  >
                    {sectionData?.email || 'info@yourbusiness.com'}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="w-6 h-6 text-blue-600" />
                {isEditingText === 'phone' ? (
                  <input
                    type="tel"
                    defaultValue={sectionData?.phone || '+1 (555) 123-4567'}
                    onBlur={(e) => handleTextEdit('phone', e.target.value)}
                    className="text-lg bg-transparent border-none outline-none flex-1"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-lg cursor-pointer"
                    onClick={() => isEditing && setIsEditingText('phone')}
                  >
                    {sectionData?.phone || '+1 (555) 123-4567'}
                  </span>
                )}
              </div>
              {sectionData?.address && (
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  {isEditingText === 'address' ? (
                    <textarea
                      defaultValue={sectionData.address}
                      onBlur={(e) => handleTextEdit('address', e.target.value)}
                      className="text-lg bg-transparent border-none outline-none flex-1 resize-none"
                      rows={2}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-lg cursor-pointer"
                      onClick={() => isEditing && setIsEditingText('address')}
                    >
                      {sectionData.address}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                <textarea 
                  placeholder="Your Message" 
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      );

    case 'footer':
      return (
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              {isEditingText === 'companyName' ? (
                <input
                  type="text"
                  defaultValue={sectionData?.companyName || 'Your Business'}
                  onBlur={(e) => handleTextEdit('companyName', e.target.value)}
                  className="text-2xl font-bold mb-4 bg-transparent border-none outline-none text-white"
                  autoFocus
                />
              ) : (
                <h3 
                  className="text-2xl font-bold mb-4 cursor-pointer"
                  onClick={() => isEditing && setIsEditingText('companyName')}
                >
                  {sectionData?.companyName || 'Your Business'}
                </h3>
              )}
              {isEditingText === 'description' ? (
                <textarea
                  defaultValue={sectionData?.description || 'Building the future, one project at a time.'}
                  onBlur={(e) => handleTextEdit('description', e.target.value)}
                  className="text-gray-300 mb-6 bg-transparent border-none outline-none w-full resize-none"
                  rows={3}
                  autoFocus
                />
              ) : (
                <p 
                  className="text-gray-300 mb-6 cursor-pointer"
                  onClick={() => isEditing && setIsEditingText('description')}
                >
                  {sectionData?.description || 'Building the future, one project at a time.'}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                {sectionData?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail size={16} />
                    <span>{sectionData.email}</span>
                  </div>
                )}
                {sectionData?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} />
                    <span>{sectionData.phone}</span>
                  </div>
                )}
                {sectionData?.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>{sectionData.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-600 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {isEditingText === 'copyright' ? (
                <input
                  type="text"
                  defaultValue={sectionData?.copyright || '© 2024 Your Business. All rights reserved.'}
                  onBlur={(e) => handleTextEdit('copyright', e.target.value)}
                  className="text-gray-400 bg-transparent border-none outline-none"
                  autoFocus
                />
              ) : (
                <p 
                  className="text-gray-400 cursor-pointer"
                  onClick={() => isEditing && setIsEditingText('copyright')}
                >
                  {sectionData?.copyright || '© 2024 Your Business. All rights reserved.'}
                </p>
              )}
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">
            {element.content}
          </h2>
        </div>
      );
  }
}

// Placeholder components for the other editor modes
function SectionManager({ elements, selectedElement, onSelect, onUpdate, onDelete, onDuplicate, onReorder, onAddSection }: any) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Section Manager</h2>
      <div className="grid gap-4">
        {Object.values(elements).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((element: any) => (
          <div
            key={element.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(element.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold capitalize">{element.type} Section</h3>
                <p className="text-sm text-gray-600">{element.content}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => onDuplicate(element.id)}>
                  <Copy size={16} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(element.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LayersPanel({ elements, selectedElement, onSelect, onReorder, onDelete }: any) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Layers</h2>
      <div className="space-y-2">
        {Object.values(elements).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((element: any) => (
          <div
            key={element.id}
            className={`p-3 border rounded cursor-pointer ${
              selectedElement === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(element.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{element.type}</span>
              <div className="flex space-x-1">
                <button onClick={() => onReorder(element.id, 'up')}>
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => onReorder(element.id, 'down')}>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionPropertiesPanel({ 
  element, 
  onUpdate, 
  onUpdateSectionData, 
  onDelete, 
  onDuplicate,
  availableFonts,
  activeFonts,
  onAddFont
}: any) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'fonts'>('content');
  
  const updateStyle = (property: string, value: string) => {
    onUpdate({
      styles: { ...element.styles, [property]: value }
    });
  };

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-white to-slate-50">
      <div className="p-6 border-b-2 border-slate-200 bg-white shrink-0">
        <h3 className="font-bold text-xl text-slate-800">Properties</h3>
        <p className="text-sm text-slate-600 capitalize font-medium mt-1">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            {element.type} Section
          </span>
        </p>
        
        {/* Enhanced Tabs */}
        <div className="flex mt-4 bg-slate-100 rounded-xl p-1">
          <button
            className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'content' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'style' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
            onClick={() => setActiveTab('style')}
          >
            Style
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'fonts' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
            }`}
            onClick={() => setActiveTab('fonts')}
          >
            Fonts
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'content' && (
          <>
            {/* Section-specific properties */}
            {element.type === 'hero' && (
              <>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Headline</label>
                  <textarea
                    value={element.sectionData?.headline || ''}
                    onChange={(e) => onUpdateSectionData({ headline: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    rows={2}
                    placeholder="Enter your main headline..."
                  />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Subheadline</label>
                  <textarea
                    value={element.sectionData?.subheadline || ''}
                    onChange={(e) => onUpdateSectionData({ subheadline: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    rows={3}
                    placeholder="Enter supporting text..."
                  />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Hero Image URL</label>
                  <input
                    type="url"
                    value={element.sectionData?.image || ''}
                    onChange={(e) => onUpdateSectionData({ image: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </>
            )}

            {element.type === 'about' && (
              <>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Title</label>
                  <input
                    type="text"
                    value={element.sectionData?.title || ''}
                    onChange={(e) => onUpdateSectionData({ title: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="Section title..."
                  />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Content</label>
                  <textarea
                    value={element.sectionData?.content || ''}
                    onChange={(e) => onUpdateSectionData({ content: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    rows={5}
                    placeholder="Tell your story here..."
                  />
                </div>
              </>
            )}

            {(element.type === 'services' || element.type === 'products') && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold mb-3 text-slate-700">Section Title</label>
                <input
                  type="text"
                  value={element.sectionData?.title || ''}
                  onChange={(e) => onUpdateSectionData({ title: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="Section title..."
                />
                <p className="text-xs text-slate-500 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                  💡 Use the visual editor above to manage individual cards
                </p>
              </div>
            )}

            {element.type === 'testimonials' && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold mb-3 text-slate-700">Section Title</label>
                <input
                  type="text"
                  value={element.sectionData?.title || ''}
                  onChange={(e) => onUpdateSectionData({ title: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="Section title..."
                />
                <p className="text-xs text-slate-500 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                  💡 Use the visual editor above to manage testimonials
                </p>
              </div>
            )}

            {element.type === 'contact' && (
              <>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Email</label>
                  <input
                    type="email"
                    value={element.sectionData?.email || ''}
                    onChange={(e) => onUpdateSectionData({ email: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="contact@yourcompany.com"
                  />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={element.sectionData?.phone || ''}
                    onChange={(e) => onUpdateSectionData({ phone: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-bold mb-3 text-slate-700">Address</label>
                  <textarea
                    value={element.sectionData?.address || ''}
                    onChange={(e) => onUpdateSectionData({ address: e.target.value })}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    rows={3}
                    placeholder="123 Business Ave, Suite 100, City, State 12345"
                  />
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'style' && (
          <>
            {/* Style Properties */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-slate-700">Background Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={element.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-12 h-12 border-2 border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={element.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="flex-1 p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-slate-700">Text Color</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={element.styles.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-12 h-12 border-2 border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={element.styles.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="flex-1 p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-slate-700">Padding</label>
              <input
                type="text"
                value={element.styles.padding || '6rem 2rem'}
                onChange={(e) => updateStyle('padding', e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                placeholder="e.g. 4rem 2rem"
              />
              <p className="text-xs text-slate-500 mt-2">Top Right Bottom Left spacing</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-slate-700">Font Size</label>
              <input
                type="text"
                value={element.styles.fontSize || ''}
                onChange={(e) => updateStyle('fontSize', e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                placeholder="e.g. 16px, 1.2rem"
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-slate-700">Text Alignment</label>
              <div className="grid grid-cols-2 gap-2">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle('textAlign', align)}
                    className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      element.styles.textAlign === align 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-3 text-slate-700">Min Height</label>
              <input
                type="text"
                value={element.styles.minHeight || ''}
                onChange={(e) => updateStyle('minHeight', e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                placeholder="e.g. 400px, 50vh"
              />
            </div>
          </>
        )}

        {activeTab === 'fonts' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <FontManager
              availableFonts={availableFonts}
              activeFonts={activeFonts}
              onAddFont={onAddFont}
              selectedFont={element.styles.fontFamily}
              onSelectFont={(font) => updateStyle('fontFamily', font)}
            />
          </div>
        )}
      </div>

      {/* Enhanced Actions */}
      <div className="shrink-0 p-6 border-t-2 border-slate-200 space-y-3 bg-white">
        <Button
          variant="outline"
          onClick={onDuplicate}
          className="w-full h-12 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 font-bold transition-all duration-200"
        >
          <Copy size={18} className="mr-3" />
          Duplicate Section
        </Button>
        
        <Button
          variant="destructive"
          onClick={onDelete}
          className="w-full h-12 bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 font-bold transition-all duration-200"
        >
          <Trash2 size={18} className="mr-3" />
          Delete Section
        </Button>
      </div>
    </div>
  );
}
