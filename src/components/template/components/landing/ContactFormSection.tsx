"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

interface ContactFormSectionProps {
  email?: string;
  phone?: string;
  address?: string;
  businessName: string;
  businessType?: string;
  siteId?: string;
}

// Context-aware contact form intro text
const getContactIntro = (businessType?: string, businessName?: string) => {
  const intros: Record<string, { title: string; description: string }> = {
    ecommerce: {
      title: "Want a Custom-Made Piece?",
      description: `Looking for something unique? Get in touch with ${businessName || 'us'} to discuss custom orders, personalized recommendations, or any questions about our products.`,
    },
    restaurant: {
      title: "Ready to Dine With Us?",
      description: `Have questions about our menu, dietary options, or catering services? Contact ${businessName || 'us'} and we'll be happy to help make your dining experience perfect.`,
    },
    fitness: {
      title: "Start Your Fitness Journey",
      description: `Ready to transform your life? Get in touch with ${businessName || 'us'} to learn about our programs, membership options, and how we can help you reach your goals.`,
    },
    healthcare: {
      title: "Your Health Is Our Priority",
      description: `Need to schedule an appointment or have questions about our services? Contact ${businessName || 'us'} and our team will assist you with all your healthcare needs.`,
    },
    beauty: {
      title: "Treat Yourself Today",
      description: `Ready for a transformation? Get in touch with ${businessName || 'us'} to book your beauty treatment or ask about our services and special packages.`,
    },
    service: {
      title: "Let's Work Together",
      description: `Have a project in mind? Contact ${businessName || 'us'} to discuss how we can help bring your vision to life with our professional services.`,
    },
    agency: {
      title: "Let's Create Something Amazing",
      description: `Ready to elevate your brand? Get in touch with ${businessName || 'us'} to discuss your project, goals, and how we can deliver outstanding results.`,
    },
    portfolio: {
      title: "Let's Build Together",
      description: `Interested in working together? Contact ${businessName || 'us'} to discuss your project and see how we can create something exceptional.`,
    },
    realestate: {
      title: "Find Your Dream Property",
      description: `Looking to buy, sell, or invest? Get in touch with ${businessName || 'us'} and let our experienced team guide you through your real estate journey.`,
    },
    education: {
      title: "Begin Your Learning Journey",
      description: `Interested in our programs? Contact ${businessName || 'us'} to learn more about our courses, enrollment process, and how we can help you succeed.`,
    },
  };

  return intros[businessType || 'service'] || {
    title: "Get In Touch",
    description: `Have questions or want to work with ${businessName || 'us'}? Send us a message and we'll get back to you as soon as possible.`,
  };
};

const ContactFormSection = ({
  email,
  phone,
  address,
  businessName,
  businessType,
  siteId,
}: ContactFormSectionProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { title, description } = getContactIntro(businessType, businessName);

  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formData.message || undefined,
          source: 'contact_form',
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitSuccess(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSubmitSuccess(false);
      }, 4000);
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
                Contact Information
              </h3>
              <p className="text-muted-foreground mb-8">
                Reach out to us through any of the following methods:
              </p>
            </div>

            <div className="space-y-6">
              {email && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <a
                      href={`mailto:${email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <a
                      href={`tel:${phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Address</h4>
                    <p className="text-muted-foreground">{address}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-xl p-8 shadow-lg"
            >
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="Tell us about your project or inquiry..."
                  />
                </div>

                {submitSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-600">
                    <p className="text-sm font-medium">
                      ✓ Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                )}
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600">
                    <p className="text-sm font-medium">
                      Something went wrong. Please try again or contact us directly.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !siteId}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
