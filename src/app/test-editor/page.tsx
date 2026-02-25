"use client";

import React, { useState } from 'react';
import { EnhancedVisualEditor } from '@/components/editor/EnhancedVisualEditor';

// Sample site data for testing
const sampleSiteData = {
  id: 'test-site-1',
  slug: 'test-site',
  headline: 'Welcome to Our Amazing Business',
  subheadline: 'We provide exceptional services that help your business grow and thrive in today\'s competitive market. Join thousands of satisfied customers.',
  ctaText: 'Get Started Today',
  aboutText: 'Our company has been providing innovative solutions for over 10 years. We specialize in creating custom solutions that meet the unique needs of each client.',
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
  ],
  testimonials: [
    {
      quote: 'Outstanding service and exceptional results. They transformed our business and exceeded all expectations.',
      author: 'Sarah Johnson',
      position: 'CEO',
      company: 'Tech Innovations Inc.',
      rating: 5
    },
    {
      quote: 'Professional, reliable, and delivered exactly what we needed on time and within budget.',
      author: 'Mike Chen',
      position: 'Marketing Director', 
      company: 'Growth Co',
      rating: 5
    }
  ],
  business: {
    id: 'test-business-1',
    name: 'TechSolutions Pro',
    description: 'Leading provider of innovative technology solutions for modern businesses.',
    email: 'contact@techsolutions.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Drive',
    city: 'San Francisco',
    state: 'CA',
    logo: 'https://via.placeholder.com/150x60/3B82F6/FFFFFF?text=TechSolutions',
    heroImage: 'https://via.placeholder.com/800x600/F3F4F6/374151?text=Hero+Image',
    primaryColor: '#3B82F6',
    services: [
      {
        id: 'service-1',
        name: 'Web Development',
        title: 'Custom Web Development',
        description: 'Build stunning, responsive websites tailored to your business needs.',
        price: 'Starting at $2,999',
        features: ['Responsive Design', 'SEO Optimized', 'Fast Loading']
      },
      {
        id: 'service-2', 
        name: 'Mobile Apps',
        title: 'Mobile App Development',
        description: 'Create powerful mobile applications for iOS and Android platforms.',
        price: 'Starting at $4,999',
        features: ['Cross-Platform', 'Native Performance', 'App Store Optimization']
      },
      {
        id: 'service-3',
        name: 'Digital Marketing',
        title: 'Digital Marketing Strategy',
        description: 'Comprehensive marketing solutions to grow your online presence.',
        price: 'Starting at $1,499/mo',
        features: ['SEO/SEM', 'Social Media', 'Content Marketing']
      }
    ]
  }
};

export default function TestEditorPage() {
  const [currentSiteData, setCurrentSiteData] = useState(sampleSiteData);
  const [showPreview, setShowPreview] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = (data: any) => {
    console.log('Saving site data:', data);
    setCurrentSiteData({ ...currentSiteData, ...data });
    setSaveCount(prev => prev + 1);
    setLastSaved(new Date());
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-300 rounded-full"></div>
        <span class="font-semibold">✓ Changes saved!</span>
        <small class="text-green-100">#${saveCount + 1}</small>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visual Editor Test</h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">Testing the EnhancedVisualEditor with live preview</p>
              {lastSaved && (
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Saved {saveCount} time{saveCount !== 1 ? 's' : ''}</span>
                  <span className="text-gray-500 ml-2">
                    {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showPreview 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showPreview ? 'Hide Preview' : 'Show Live Preview'}
            </button>
            <a
              href="/sites/test-site"
              target="_blank"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Open Live Site ↗
            </a>
          </div>
        </div>
      </div>
      
      {showPreview ? (
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-80px)]">
          <div className="border-r border-gray-300">
            <EnhancedVisualEditor 
              siteData={currentSiteData}
              onSave={handleSave}
            />
          </div>
          <div className="bg-white overflow-auto">
            <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Live Preview</h3>
                  <p className="text-sm text-gray-600">See your changes in real-time</p>
                </div>
                {lastSaved && (
                  <div className="text-xs text-gray-500">
                    Last updated: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            <SitePreview key={saveCount} siteData={currentSiteData} />
          </div>
        </div>
      ) : (
        <EnhancedVisualEditor 
          siteData={currentSiteData}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Simple site preview component
function SitePreview({ siteData }: { siteData: any }) {
  const { business } = siteData;
  
  return (
    <div className="min-h-full">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {business?.logo && <img src={business.logo} alt="Logo" className="h-8 w-auto" />}
            <h1 className="text-xl font-bold">{business?.name || 'Your Business'}</h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-50 px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">{siteData.headline || 'Welcome to Our Business'}</h2>
          <p className="text-xl text-gray-600 mb-8">{siteData.subheadline || 'We provide amazing services'}</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg">
            {siteData.ctaText || 'Get Started'}
          </button>
        </div>
      </section>

      {/* About Section */}
      {siteData.aboutText && (
        <section className="px-6 py-16 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6">About Us</h3>
            <p className="text-lg text-gray-600">{siteData.aboutText}</p>
          </div>
        </section>
      )}

      {/* Services */}
      {business?.services && business.services.length > 0 && (
        <section className="px-6 py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {business.services.map((service: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-xl font-semibold mb-3">{service.name || service.title}</h4>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {service.price && (
                    <p className="text-lg font-bold text-blue-600">{service.price}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {siteData.testimonials && siteData.testimonials.length > 0 && (
        <section className="px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {siteData.testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.position}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="px-6 py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">Contact Us</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <span>📧</span>
                <span>{business?.email || 'contact@yourbusiness.com'}</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <span>📞</span>
                <span>{business?.phone || '+1 (555) 123-4567'}</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <form className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded" />
                <input type="email" placeholder="Your Email" className="w-full p-3 border border-gray-300 rounded" />
                <textarea placeholder="Your Message" rows={3} className="w-full p-3 border border-gray-300 rounded resize-none" />
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h4 className="text-xl font-bold mb-2">{business?.name || 'Your Business'}</h4>
          <p className="text-gray-300 mb-4">{business?.description || 'Building the future, one project at a time.'}</p>
          <p className="text-gray-400">© 2024 {business?.name || 'Your Business'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
