"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Phone, Mail, CheckCircle } from "lucide-react";

interface BookingSectionProps {
  calendlyUrl: string;
  phone?: string;
  email?: string;
  businessType?: string;
  businessName: string;
}

// Context-aware booking titles and descriptions
const getBookingContent = (businessType?: string) => {
  const content: Record<string, { title: string; subtitle: string }> = {
    ecommerce: {
      title: "Book a Personal Consultation",
      subtitle: "Get personalized recommendations and expert advice. Schedule a consultation to find the perfect products for your needs.",
    },
    restaurant: {
      title: "Reserve Your Table",
      subtitle: "Secure your spot for an unforgettable dining experience. Book your table now and let us prepare something special for you.",
    },
    fitness: {
      title: "Schedule Your First Session",
      subtitle: "Start your fitness journey today. Book a complimentary consultation with our expert trainers to create your personalized plan.",
    },
    healthcare: {
      title: "Book Your Appointment",
      subtitle: "Access quality healthcare when you need it. Schedule your appointment with our experienced medical professionals today.",
    },
    beauty: {
      title: "Book Your Beauty Treatment",
      subtitle: "Treat yourself to professional beauty services. Reserve your appointment and experience luxury and relaxation.",
    },
    service: {
      title: "Schedule a Consultation",
      subtitle: "Let's discuss your project. Book a free consultation with our experts to explore how we can help achieve your goals.",
    },
    agency: {
      title: "Book a Strategy Session",
      subtitle: "Transform your brand with our expert team. Schedule a strategy session to discuss your goals and explore creative solutions.",
    },
    portfolio: {
      title: "Schedule a Discovery Call",
      subtitle: "Ready to start your project? Book a consultation to discuss your vision and how we can bring it to life.",
    },
    realestate: {
      title: "Schedule a Property Viewing",
      subtitle: "Find your dream property. Book a viewing or consultation with our experienced real estate professionals today.",
    },
    education: {
      title: "Schedule a Campus Tour",
      subtitle: "Discover our programs and facilities. Book a campus tour or consultation to learn how we can help you achieve your educational goals.",
    },
  };

  return content[businessType || "service"] || {
    title: "Book an Appointment",
    subtitle: "Schedule a time to connect with us and discuss your specific needs.",
  };
};

const BookingSection = ({
  calendlyUrl,
  phone,
  email,
  businessType,
  businessName,
}: BookingSectionProps) => {
  const { title, subtitle } = getBookingContent(businessType);

  const handleBookingClick = () => {
    if (calendlyUrl) {
      window.open(calendlyUrl, "_blank", "width=800,height=800");
    }
  };

  return (
    <section id="booking" className="py-24 md:py-32 bg-muted/50">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-6">
            <Calendar className="w-8 h-8" />
          </div>

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <span>Quick & Easy</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Choose Your Time</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Instant Confirmation</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary Booking Button */}
            <button
              onClick={handleBookingClick}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>

            {/* Alternative Contact Options */}
            <div className="flex gap-3">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border hover:bg-muted text-card-foreground rounded-lg transition-all duration-200 hover:scale-105"
                  title="Call us"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Call Us</span>
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border hover:bg-muted text-card-foreground rounded-lg transition-all duration-200 hover:scale-105"
                  title="Email us"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email Us</span>
                </a>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <p className="mt-8 text-sm text-muted-foreground">
            Select a time that works best for you. We'll send a confirmation right away.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingSection;
