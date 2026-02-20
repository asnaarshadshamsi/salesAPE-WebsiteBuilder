// AI Content Generator - Business-Type-Specific Templates
// Generates tailored content based on business type detected from scraping
// Now with Cohere AI integration for enhanced content generation

import type { ScrapedData, ProductData } from '@/types/scraper';
import { 
  generateBusinessContent as cohereGenerateContent, 
  isCohereConfigured,
  type BusinessContext,
  type GeneratedContent as CohereGeneratedContent
} from './cohere-ai';

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  aboutText: string;
  ctaText: string;
  services: string[];
  features: string[];
  alternateHeadline: string;
  sectionTitles: {
    services: string;
    products: string;
    about: string;
    contact: string;
    testimonials: string;
    gallery: string;
  };
  // Enhanced fields from Cohere AI
  tagline?: string;
  metaDescription?: string;
  valuePropositions?: string[];
  serviceDescriptions?: { name: string; description: string }[];
  emailSubjectLines?: string[];
  socialMediaBio?: string;
}

export type BusinessType = ScrapedData['businessType'];

// ==================== BUSINESS TYPE TEMPLATES ====================

const templates: Record<BusinessType, {
  headlines: string[];
  alternateHeadlines: string[];
  subheadlines: string[];
  aboutTemplates: string[];
  ctaOptions: string[];
  defaultServices: string[];
  defaultFeatures: string[];
  sectionTitles: {
    services: string;
    products: string;
    about: string;
    contact: string;
    testimonials: string;
    gallery: string;
  };
}> = {
  ecommerce: {
    headlines: [
      "Shop the Latest {name} Collection",
      "Discover Premium Products at {name}",
      "Welcome to {name} - Style Meets Quality",
      "{name} - Your One-Stop Shop",
      "Elevate Your Style with {name}",
    ],
    alternateHeadlines: [
      "New Arrivals Just Dropped",
      "Shop Now, Look Amazing",
      "Trending Products You'll Love",
      "Quality Products, Unbeatable Prices",
    ],
    subheadlines: [
      "Free shipping on orders over $50 • Easy returns • Secure checkout",
      "Curated collections for every style and occasion",
      "Premium quality products delivered to your door",
      "Shop with confidence - 100% satisfaction guaranteed",
    ],
    aboutTemplates: [
      `{name} is your destination for premium quality products. We carefully curate our collection to bring you the best in style, quality, and value. Whether you're looking for everyday essentials or something special, we've got you covered.`,
      `At {name}, we believe everyone deserves access to high-quality products. Our team works tirelessly to source the finest items and deliver them with exceptional service. Join thousands of satisfied customers who trust us for their shopping needs.`,
    ],
    ctaOptions: ["Shop Now", "Browse Collection", "Explore Products", "Start Shopping", "View All Items"],
    defaultServices: ["Fast Shipping", "Easy Returns", "Secure Payment", "24/7 Support"],
    defaultFeatures: ["Free Shipping", "30-Day Returns", "Secure Checkout", "Quality Guarantee"],
    sectionTitles: {
      services: "Why Shop With Us",
      products: "Featured Products",
      about: "Our Story",
      contact: "Get in Touch",
      testimonials: "Customer Reviews",
      gallery: "Shop the Look",
    },
  },

  restaurant: {
    headlines: [
      "Welcome to {name} - A Culinary Experience",
      "Taste the Difference at {name}",
      "{name} - Where Every Meal is a Celebration",
      "Authentic Flavors at {name}",
      "Dine with Us at {name}",
    ],
    alternateHeadlines: [
      "Fresh Ingredients, Bold Flavors",
      "A Taste You'll Never Forget",
      "From Our Kitchen to Your Table",
      "Experience Fine Dining",
    ],
    subheadlines: [
      "Fresh ingredients • Authentic recipes • Unforgettable dining",
      "Reserve your table for an exceptional culinary journey",
      "Where passion meets flavor in every dish",
      "Crafted with love, served with pride",
    ],
    aboutTemplates: [
      `{name} brings you an unforgettable dining experience with dishes crafted from the freshest ingredients. Our passionate chefs create each plate with attention to detail and love for authentic flavors. Come hungry, leave happy.`,
      `At {name}, food is more than sustenance—it's an experience. We combine traditional recipes with modern techniques to create dishes that delight the senses. Whether it's a casual lunch or a special celebration, we make every meal memorable.`,
    ],
    ctaOptions: ["Reserve a Table", "View Menu", "Order Online", "Book Now", "See Our Menu"],
    defaultServices: ["Dine-In", "Takeout", "Delivery", "Catering"],
    defaultFeatures: ["Fresh Ingredients", "Chef's Specials", "Private Dining", "Online Ordering"],
    sectionTitles: {
      services: "Our Services",
      products: "Menu Highlights",
      about: "Our Story",
      contact: "Visit Us",
      testimonials: "What Our Guests Say",
      gallery: "Food Gallery",
    },
  },

  service: {
    headlines: [
      "Professional Solutions from {name}",
      "{name} - Excellence in Every Service",
      "Trust {name} for Expert Results",
      "Your Success Starts with {name}",
      "{name} - Quality Service, Guaranteed",
    ],
    alternateHeadlines: [
      "Expert Solutions You Can Trust",
      "Results That Speak for Themselves",
      "Professional Service, Personal Touch",
      "Your Partner in Success",
    ],
    subheadlines: [
      "Professional services tailored to your unique needs",
      "Delivering excellence, one client at a time",
      "Your trusted partner for quality results",
      "Expert solutions that drive real outcomes",
    ],
    aboutTemplates: [
      `{name} is dedicated to providing exceptional services to our valued clients. With years of experience and a commitment to excellence, we've built a reputation for delivering results that exceed expectations. Let us help you achieve your goals.`,
      `At {name}, we understand that every client is unique. That's why we take a personalized approach to every project, ensuring solutions that fit your specific needs. Our team of experts is ready to help you succeed.`,
    ],
    ctaOptions: ["Get Started", "Request a Quote", "Book Consultation", "Contact Us", "Learn More"],
    defaultServices: ["Consultation", "Project Management", "Custom Solutions", "Ongoing Support"],
    defaultFeatures: ["Expert Team", "Proven Results", "Personalized Service", "Satisfaction Guaranteed"],
    sectionTitles: {
      services: "Our Services",
      products: "What We Offer",
      about: "About Us",
      contact: "Get in Touch",
      testimonials: "Client Success Stories",
      gallery: "Our Work",
    },
  },

  healthcare: {
    headlines: [
      "{name} - Caring for Your Health",
      "Quality Healthcare at {name}",
      "Your Wellness Partner - {name}",
      "{name} - Where Health Comes First",
      "Expert Care at {name}",
    ],
    alternateHeadlines: [
      "Your Health, Our Priority",
      "Compassionate Care, Expert Treatment",
      "Healthcare You Can Trust",
      "Dedicated to Your Wellbeing",
    ],
    subheadlines: [
      "Comprehensive healthcare services for you and your family",
      "Expert medical professionals dedicated to your wellbeing",
      "Quality care in a comfortable, welcoming environment",
      "Your health journey starts here",
    ],
    aboutTemplates: [
      `{name} provides comprehensive healthcare services with compassion and expertise. Our team of dedicated professionals is committed to your health and wellbeing. We offer state-of-the-art facilities and personalized care plans tailored to your needs.`,
      `At {name}, we believe in treating the whole person, not just symptoms. Our experienced healthcare team works together to provide coordinated, patient-centered care. From preventive services to specialized treatment, we're here for you.`,
    ],
    ctaOptions: ["Book Appointment", "Schedule Visit", "Contact Us", "Request Consultation", "Find a Doctor"],
    defaultServices: ["General Practice", "Preventive Care", "Specialized Treatment", "Telehealth"],
    defaultFeatures: ["Board-Certified Doctors", "Modern Facilities", "Patient-Centered Care", "Flexible Scheduling"],
    sectionTitles: {
      services: "Our Services",
      products: "Treatments & Procedures",
      about: "About Our Practice",
      contact: "Schedule Your Visit",
      testimonials: "Patient Testimonials",
      gallery: "Our Facility",
    },
  },

  fitness: {
    headlines: [
      "Transform Your Body at {name}",
      "{name} - Fitness Redefined",
      "Achieve Your Goals with {name}",
      "Get Stronger at {name}",
      "{name} - Your Fitness Journey Starts Here",
    ],
    alternateHeadlines: [
      "Push Your Limits",
      "Stronger Every Day",
      "Results That Last",
      "Your Best Self Awaits",
    ],
    subheadlines: [
      "State-of-the-art equipment • Expert trainers • Results guaranteed",
      "Join our community and transform your life",
      "Personal training, group classes, and more",
      "Where champions are made",
    ],
    aboutTemplates: [
      `{name} is more than a gym—it's a community dedicated to helping you achieve your fitness goals. With top-tier equipment, expert trainers, and a supportive environment, we provide everything you need to succeed on your fitness journey.`,
      `At {name}, we believe fitness is for everyone. Our diverse range of programs caters to all fitness levels, from beginners to athletes. Join us and discover what you're capable of achieving.`,
    ],
    ctaOptions: ["Start Free Trial", "Join Now", "Book a Class", "Get Membership", "Start Training"],
    defaultServices: ["Personal Training", "Group Classes", "Nutrition Coaching", "Recovery Services"],
    defaultFeatures: ["24/7 Access", "Expert Trainers", "Modern Equipment", "Flexible Plans"],
    sectionTitles: {
      services: "Programs & Classes",
      products: "Membership Options",
      about: "About Our Gym",
      contact: "Visit Us",
      testimonials: "Success Stories",
      gallery: "Our Facility",
    },
  },

  beauty: {
    headlines: [
      "Discover Your Beauty at {name}",
      "{name} - Where Beauty Meets Art",
      "Pamper Yourself at {name}",
      "{name} - Glow Like Never Before",
      "Experience Luxury at {name}",
    ],
    alternateHeadlines: [
      "Treat Yourself Today",
      "Your Beauty Sanctuary",
      "Relax, Refresh, Renew",
      "Look Your Best, Feel Amazing",
    ],
    subheadlines: [
      "Premium beauty services in a relaxing atmosphere",
      "Expert stylists dedicated to bringing out your best",
      "Where self-care meets luxury",
      "Transform your look with our skilled professionals",
    ],
    aboutTemplates: [
      `{name} is your destination for premium beauty services. Our talented team of professionals uses the latest techniques and highest quality products to help you look and feel your absolute best. Relax in our luxurious space and let us pamper you.`,
      `At {name}, we believe everyone deserves to feel beautiful. Our skilled stylists and aestheticians are passionate about their craft and dedicated to exceeding your expectations. Book your appointment and experience the difference.`,
    ],
    ctaOptions: ["Book Appointment", "View Services", "Schedule Now", "Book Your Visit", "Reserve Your Spot"],
    defaultServices: ["Hair Styling", "Skincare", "Nail Services", "Massage & Spa"],
    defaultFeatures: ["Expert Stylists", "Premium Products", "Relaxing Atmosphere", "Online Booking"],
    sectionTitles: {
      services: "Our Services",
      products: "Treatments",
      about: "About Our Salon",
      contact: "Book Your Appointment",
      testimonials: "Client Reviews",
      gallery: "Our Work",
    },
  },

  realestate: {
    headlines: [
      "Find Your Dream Home with {name}",
      "{name} - Your Real Estate Partner",
      "Homes That Inspire at {name}",
      "{name} - Where Dreams Find Addresses",
      "Discover Your Perfect Property",
    ],
    alternateHeadlines: [
      "Home Is Where Your Story Begins",
      "Expert Guidance, Perfect Homes",
      "Your Property Journey Starts Here",
      "Find Your Place in the World",
    ],
    subheadlines: [
      "Expert agents • Premium listings • Personalized service",
      "Helping families find their perfect home for over {years} years",
      "From first home to forever home, we're with you every step",
      "Local expertise, global reach",
    ],
    aboutTemplates: [
      `{name} is a trusted name in real estate, dedicated to helping clients find their perfect property. Our experienced agents combine local market knowledge with personalized service to make your real estate journey smooth and successful.`,
      `At {name}, we understand that buying or selling a home is one of life's biggest decisions. Our team of dedicated professionals is here to guide you every step of the way, ensuring you make informed choices with confidence.`,
    ],
    ctaOptions: ["View Listings", "Schedule Viewing", "Get Valuation", "Contact Agent", "Search Properties"],
    defaultServices: ["Buying", "Selling", "Property Management", "Market Analysis"],
    defaultFeatures: ["Expert Agents", "Premium Listings", "Virtual Tours", "Market Insights"],
    sectionTitles: {
      services: "Our Services",
      products: "Featured Listings",
      about: "About Our Agency",
      contact: "Contact an Agent",
      testimonials: "Client Success Stories",
      gallery: "Property Gallery",
    },
  },

  agency: {
    headlines: [
      "{name} - Creative Excellence",
      "Elevate Your Brand with {name}",
      "{name} - Ideas That Inspire",
      "Transform Your Vision with {name}",
      "{name} - Where Strategy Meets Creativity",
    ],
    alternateHeadlines: [
      "Creative Solutions, Real Results",
      "Ideas That Make an Impact",
      "Your Partner in Growth",
      "Design That Drives Business",
    ],
    subheadlines: [
      "Strategy • Design • Development • Results",
      "Award-winning creative agency for forward-thinking brands",
      "We turn bold ideas into remarkable realities",
      "Data-driven creativity that delivers",
    ],
    aboutTemplates: [
      `{name} is a full-service creative agency passionate about helping brands stand out. Our team of strategists, designers, and developers work together to create impactful solutions that drive real business results.`,
      `At {name}, we don't just create—we solve problems. Through strategic thinking and creative excellence, we help businesses connect with their audiences and achieve their goals. Let's build something amazing together.`,
    ],
    ctaOptions: ["Start a Project", "View Our Work", "Get in Touch", "Request Proposal", "Let's Talk"],
    defaultServices: ["Brand Strategy", "Web Design", "Digital Marketing", "Content Creation"],
    defaultFeatures: ["Award-Winning Work", "Strategic Approach", "Dedicated Team", "Proven Results"],
    sectionTitles: {
      services: "What We Do",
      products: "Our Capabilities",
      about: "About Us",
      contact: "Start a Project",
      testimonials: "Client Testimonials",
      gallery: "Our Work",
    },
  },

  portfolio: {
    headlines: [
      "Welcome to {name}'s Portfolio",
      "Creative Work by {name}",
      "{name} - Design & Development",
      "Crafted with Care by {name}",
      "The Work of {name}",
    ],
    alternateHeadlines: [
      "Design That Speaks",
      "Creative Solutions",
      "Passion Meets Profession",
      "Ideas Brought to Life",
    ],
    subheadlines: [
      "Designer • Developer • Creator",
      "Turning ideas into digital experiences",
      "Crafting beautiful, functional solutions",
      "Available for freelance projects",
    ],
    aboutTemplates: [
      `I'm {name}, a passionate creative professional dedicated to crafting beautiful and functional digital experiences. With expertise in design and development, I help businesses and individuals bring their visions to life.`,
      `Hello! I'm {name}. I specialize in creating thoughtful, user-centered designs and robust digital solutions. Every project is an opportunity to solve problems creatively and deliver exceptional results.`,
    ],
    ctaOptions: ["View Work", "Get in Touch", "Hire Me", "Let's Collaborate", "Start a Project"],
    defaultServices: ["Web Design", "Development", "Branding", "Consulting"],
    defaultFeatures: ["Custom Solutions", "Quick Turnaround", "Quality Focus", "Ongoing Support"],
    sectionTitles: {
      services: "Services",
      products: "Skills & Expertise",
      about: "About Me",
      contact: "Get in Touch",
      testimonials: "What Clients Say",
      gallery: "Selected Work",
    },
  },

  education: {
    headlines: [
      "Learn & Grow with {name}",
      "{name} - Education That Empowers",
      "Unlock Your Potential at {name}",
      "{name} - Knowledge for Tomorrow",
      "Transform Your Skills with {name}",
    ],
    alternateHeadlines: [
      "Your Learning Journey Starts Here",
      "Education That Makes a Difference",
      "Skills for the Future",
      "Learn from the Best",
    ],
    subheadlines: [
      "Expert instructors • Flexible learning • Real-world skills",
      "Join thousands of students achieving their goals",
      "Learn at your own pace, on your own terms",
      "Quality education accessible to everyone",
    ],
    aboutTemplates: [
      `{name} is committed to providing quality education that prepares students for success. Our expert instructors and comprehensive curriculum ensure you gain the knowledge and skills needed to thrive in today's world.`,
      `At {name}, we believe in the transformative power of education. Our programs are designed to be engaging, practical, and accessible, helping learners of all backgrounds achieve their goals and advance their careers.`,
    ],
    ctaOptions: ["Enroll Now", "View Courses", "Start Learning", "Get Started", "Browse Programs"],
    defaultServices: ["Online Courses", "Live Classes", "Certifications", "Career Support"],
    defaultFeatures: ["Expert Instructors", "Flexible Schedule", "Certificate Programs", "Lifetime Access"],
    sectionTitles: {
      services: "Our Programs",
      products: "Popular Courses",
      about: "About Us",
      contact: "Contact Us",
      testimonials: "Student Success Stories",
      gallery: "Campus Life",
    },
  },

  startup: {
    headlines: [
      "Welcome to {name} - Innovation Starts Here",
      "{name} - Building the Future",
      "Transform Your World with {name}",
      "{name} - The Next Big Thing",
      "Experience Innovation at {name}",
    ],
    alternateHeadlines: [
      "Join the Revolution",
      "Innovation Made Simple",
      "The Future is Now",
      "Built for Tomorrow",
    ],
    subheadlines: [
      "Cutting-edge solutions for modern challenges",
      "Join thousands embracing the future",
      "Innovation that makes a difference",
      "Where ideas become reality",
    ],
    aboutTemplates: [
      `{name} is revolutionizing the industry with innovative solutions. Our team is passionate about building products that solve real problems and make a positive impact. Join us on our journey to shape the future.`,
      `At {name}, we're not just building products - we're creating experiences. Our mission is to empower individuals and businesses with technology that truly matters. Let's build the future together.`,
    ],
    ctaOptions: ["Get Started", "Learn More", "Join Waitlist", "Try It Free", "Request Demo"],
    defaultServices: ["Innovative Solutions", "Expert Support", "Seamless Integration", "Regular Updates"],
    defaultFeatures: ["Cutting Edge", "User Friendly", "Secure & Reliable", "Scalable"],
    sectionTitles: {
      services: "What We Do",
      products: "Our Solutions",
      about: "Our Story",
      contact: "Get in Touch",
      testimonials: "User Reviews",
      gallery: "In Action",
    },
  },

  // ── Extended Business Types ────────────────────────────────────────

  perfume: {
    headlines: [
      "Scents That Define You — {name}",
      "{name} - Luxury Fragrances, Crafted for You",
      "Discover Your Signature Scent at {name}",
      "{name} - Where Art Meets Aroma",
      "Indulge Your Senses with {name}",
    ],
    alternateHeadlines: [
      "Luxury Fragrances for Every Occasion",
      "Handcrafted Artisan Scents",
      "A Journey Through Rare Ingredients",
      "Your Scent, Your Story",
    ],
    subheadlines: [
      "Rare ingredients • Master perfumers • Bespoke creations",
      "Handcrafted artisanal perfumes from the finest raw materials",
      "Experience the art of luxury fragrance",
      "Each bottle holds a unique olfactory journey",
    ],
    aboutTemplates: [
      `{name} is a luxury fragrance house${'{city}' ? ` in {city}` : ''} dedicated to the art of artisanal perfumery. We source the finest raw materials — rare florals, exotic woods, and precious resins — to craft scents that transcend the ordinary.`,
      `At {name}, fragrance is more than a product — it's an expression of identity. Our master perfumers blend tradition with innovation to create signature scents that become a part of who you are.`,
    ],
    ctaOptions: ["Explore Collection", "Book Consultation", "Shop Fragrances", "Discover Your Scent", "Custom Creation"],
    defaultServices: ["Custom Fragrance Creation", "Scent Consultation", "Luxury Collection", "Fragrance Workshops"],
    defaultFeatures: ["Rare Ingredients", "Master Perfumers", "Bespoke Packaging", "Satisfaction Guaranteed"],
    sectionTitles: {
      services: "Our Services",
      products: "The Collection",
      about: "Our Heritage",
      contact: "Visit Our Boutique",
      testimonials: "Client Reviews",
      gallery: "The Art of Fragrance",
    },
  },

  flowershop: {
    headlines: [
      "Fresh Flowers for Every Occasion — {name}",
      "{name} - Artisanal Floristry",
      "Bloom Beautifully with {name}",
      "{name} - Where Nature Meets Artistry",
      "Say It with Flowers from {name}",
    ],
    alternateHeadlines: [
      "Breathtaking Bouquets Daily",
      "Nature's Beauty, Expertly Arranged",
      "Fresh Floral Creations",
      "For Life's Most Beautiful Moments",
    ],
    subheadlines: [
      "Daily fresh deliveries • Custom arrangements • Wedding specialists",
      "Expertly arranged fresh flowers, delivered with care",
      "From weddings to everyday gifts — beauty for your most meaningful moments",
      "Hand-tied bouquets crafted with seasonal blooms",
    ],
    aboutTemplates: [
      `{name} is a boutique florist passionate about creating breathtaking floral arrangements that speak from the heart. We source the freshest seasonal blooms daily and arrange them with artistic care.`,
      `At {name}, every arrangement tells a story. From intimate bouquets to grand wedding installations, our talented florists bring beauty and emotion to life's most meaningful moments.`,
    ],
    ctaOptions: ["Order Flowers", "View Arrangements", "Wedding Consultation", "Same-Day Delivery", "Shop Bouquets"],
    defaultServices: ["Custom Bouquets", "Wedding Florals", "Event Decoration", "Same-Day Delivery"],
    defaultFeatures: ["Fresh Daily", "Custom Designs", "Same-Day Delivery", "Seasonal Blooms"],
    sectionTitles: {
      services: "Our Services",
      products: "Featured Arrangements",
      about: "About Our Shop",
      contact: "Order Now",
      testimonials: "Happy Customers",
      gallery: "Floral Gallery",
    },
  },

  cafe: {
    headlines: [
      "Your Perfect Cup Awaits at {name}",
      "{name} - Artisan Coffee & Good Vibes",
      "Where Coffee Meets Community — {name}",
      "Specialty Coffee at {name}",
      "Wake Up to {name}",
    ],
    alternateHeadlines: [
      "Brewed to Perfection",
      "The Neighbourhood Coffee Spot",
      "Great Coffee, Better Conversations",
      "Single-Origin, Expertly Roasted",
    ],
    subheadlines: [
      "Specialty coffee • Freshly baked goods • A warm space to call your own",
      "From our roastery to your cup — quality you can taste in every sip",
      "Ethically sourced single-origin beans, roasted in-house",
      "The perfect blend of great coffee and cosy atmosphere",
    ],
    aboutTemplates: [
      `{name} is more than a coffee shop — it's a community hub where great coffee and good conversations flow freely. We source single-origin beans from ethical farms worldwide and roast them to perfection.`,
      `At {name}, we believe that the best coffee experiences start with the finest beans. Our baristas are passionate about their craft, and our bakers arrive before dawn to ensure every pastry is fresh.`,
    ],
    ctaOptions: ["Order Online", "Find Us", "View Menu", "Visit Today", "Order Ahead"],
    defaultServices: ["Specialty Coffee", "Fresh Baked Goods", "Private Events", "Catering"],
    defaultFeatures: ["Single-Origin Coffee", "Fresh Daily Bakes", "Free WiFi", "Cosy Atmosphere"],
    sectionTitles: {
      services: "Our Offerings",
      products: "Menu Highlights",
      about: "Our Story",
      contact: "Visit Us",
      testimonials: "Guest Reviews",
      gallery: "Café Gallery",
    },
  },

  spa: {
    headlines: [
      "Your Sanctuary of Serenity — {name}",
      "{name} - Restore, Rejuvenate, Renew",
      "Luxury Wellness Reimagined at {name}",
      "Experience Tranquility at {name}",
      "{name} - The Art of Relaxation",
    ],
    alternateHeadlines: [
      "Where Wellness Begins",
      "A World-Class Spa Experience",
      "Holistic Healing, Total Relaxation",
      "Escape, Unwind, Restore",
    ],
    subheadlines: [
      "Holistic wellness treatments for mind, body, and soul",
      "Certified therapists • Organic products • Bespoke packages",
      "Step into tranquility — a world-class spa experience awaits",
      "Experience transformative treatments in our luxury sanctuary",
    ],
    aboutTemplates: [
      `{name} is a sanctuary crafted for complete relaxation and rejuvenation. Our expert therapists combine ancient healing traditions with modern wellness science to deliver transformative experiences.`,
      `At {name}, every treatment is thoughtfully personalised to your unique needs. Using only the finest organic products, our therapists create bespoke wellness journeys that restore balance to mind, body, and soul.`,
    ],
    ctaOptions: ["Book a Treatment", "Explore Packages", "View Services", "Reserve Now", "Gift a Session"],
    defaultServices: ["Massage Therapy", "Facial Treatments", "Aromatherapy", "Hot Stone Ritual"],
    defaultFeatures: ["Certified Therapists", "Organic Products", "Private Suites", "Loyalty Rewards"],
    sectionTitles: {
      services: "Our Treatments",
      products: "Wellness Packages",
      about: "About Our Spa",
      contact: "Book Your Escape",
      testimonials: "Guest Testimonials",
      gallery: "Spa Gallery",
    },
  },

  jewelry: {
    headlines: [
      "Exquisite Jewellery from {name}",
      "{name} - Crafted to Last a Lifetime",
      "Timeless Elegance at {name}",
      "{name} - Wear Your Story",
      "Fine Jewellery by {name}",
    ],
    alternateHeadlines: [
      "Handcrafted Masterpieces",
      "Jewellery as Unique as You",
      "Ethically Sourced, Beautifully Made",
      "Treasures for Every Occasion",
    ],
    subheadlines: [
      "Handcrafted with exceptional gemstones and precious metals",
      "Each piece is a work of art, designed to be treasured for generations",
      "Certified gemstones • Master artisans • Bespoke designs",
      "Fine jewellery that captures life's most meaningful moments",
    ],
    aboutTemplates: [
      `{name} is a distinguished jewellery studio where masterful craftsmanship meets timeless design. Our expert jewellers work with ethically sourced gemstones and precious metals to create pieces that capture life's most meaningful moments.`,
      `At {name}, every piece tells a story. From engagement rings to heirloom collections, our master artisans combine tradition with modern design to craft jewellery that is as unique as you are.`,
    ],
    ctaOptions: ["Browse Collection", "Book Consultation", "Design Custom Piece", "Shop Now", "View Catalogue"],
    defaultServices: ["Custom Design", "Engagement Rings", "Repairs & Restoration", "Jewellery Cleaning"],
    defaultFeatures: ["Certified Gemstones", "Lifetime Warranty", "Bespoke Designs", "Ethically Sourced"],
    sectionTitles: {
      services: "Our Services",
      products: "The Collection",
      about: "Our Craft",
      contact: "Visit the Studio",
      testimonials: "Client Stories",
      gallery: "Showcase",
    },
  },

  photography: {
    headlines: [
      "Moments Preserved Forever by {name}",
      "{name} - Visual Storytelling at Its Best",
      "Capture Life's Beauty with {name}",
      "{name} - Your Story, Told Beautifully",
      "Professional Photography by {name}",
    ],
    alternateHeadlines: [
      "Every Frame Tells a Story",
      "Authentic. Emotional. Timeless.",
      "Award-Winning Photography",
      "Life's Best Moments, Captured",
    ],
    subheadlines: [
      "Professional photography that captures emotion, beauty, and truth",
      "Weddings • Portraits • Events • Commercial projects",
      "Award-winning photography with fast turnaround",
      "Creating authentic, emotionally resonant images since day one",
    ],
    aboutTemplates: [
      `{name} is a professional photography studio specialising in creating authentic, emotionally resonant images. With years of experience and a passion for storytelling, we capture the moments that matter most.`,
      `At {name}, photography is about more than images — it's about preserving memories. Whether it's an intimate portrait, a grand wedding, or a high-impact campaign, we deliver stunning results every time.`,
    ],
    ctaOptions: ["Book a Session", "View Portfolio", "Get a Quote", "Schedule Shoot", "See Our Work"],
    defaultServices: ["Wedding Photography", "Portrait Sessions", "Event Coverage", "Commercial Shoots"],
    defaultFeatures: ["Professional Equipment", "Fast Delivery", "Print & Digital", "Fully Insured"],
    sectionTitles: {
      services: "Services",
      products: "Packages",
      about: "About the Photographer",
      contact: "Book a Session",
      testimonials: "Client Reviews",
      gallery: "Portfolio",
    },
  },

  barbershop: {
    headlines: [
      "Look Sharp, Feel Confident at {name}",
      "{name} - The Art of the Perfect Cut",
      "Classic Cuts, Modern Style — {name}",
      "{name} - Master Grooming",
      "Precision Cuts at {name}",
    ],
    alternateHeadlines: [
      "Where Style Meets Tradition",
      "Expert Barbers, Flawless Cuts",
      "Clean Fades, Sharp Lines",
      "Your Best Look, Guaranteed",
    ],
    subheadlines: [
      "Expert barbers • Precision cuts • Classic hot towel shaves",
      "A premium grooming experience in a classic atmosphere",
      "Master barbers delivering confidence, one cut at a time",
      "Traditional craftsmanship with modern style",
    ],
    aboutTemplates: [
      `{name} is a premium barbershop where traditional craftsmanship meets contemporary style. Our master barbers deliver precision cuts, sharp fades, and luxurious hot towel shaves in a stylish, welcoming environment.`,
      `At {name}, grooming is an art form. Our skilled barbers are dedicated to delivering the perfect cut every time, using premium products and time-honoured techniques.`,
    ],
    ctaOptions: ["Book a Cut", "View Services", "Walk In Today", "Reserve Your Chair", "Book Appointment"],
    defaultServices: ["Haircut & Fade", "Beard Trim", "Hot Towel Shave", "Hair Treatments"],
    defaultFeatures: ["Master Barbers", "Premium Products", "Walk-Ins Welcome", "Classic Atmosphere"],
    sectionTitles: {
      services: "Our Services",
      products: "Grooming Products",
      about: "About Our Shop",
      contact: "Book Your Visit",
      testimonials: "Client Reviews",
      gallery: "Gallery",
    },
  },

  cleaning: {
    headlines: [
      "Spotless Results Every Time — {name}",
      "{name} - Professional Cleaning You Can Trust",
      "A Cleaner Space with {name}",
      "{name} - Sparkling Clean, Guaranteed",
      "Expert Cleaning Services by {name}",
    ],
    alternateHeadlines: [
      "A Cleaner Space, A Clearer Mind",
      "We Clean So You Don't Have To",
      "Eco-Friendly & Thorough",
      "Leave the Cleaning to Us",
    ],
    subheadlines: [
      "Reliable, thorough cleaning for homes and businesses",
      "Fully insured • Eco-friendly products • Flexible scheduling",
      "Our professional team delivers spotless results every visit",
      "Residential & commercial cleaning you can count on",
    ],
    aboutTemplates: [
      `{name} provides professional cleaning services built on reliability, thoroughness, and quality. Our fully vetted team uses eco-friendly products and proven techniques to transform any space.`,
      `At {name}, we take pride in delivering consistently spotless results. Whether it's your home or your business, our trained professionals ensure every surface is sparkling clean.`,
    ],
    ctaOptions: ["Get a Free Quote", "Book a Clean", "View Services", "Schedule Online", "Request Estimate"],
    defaultServices: ["Residential Cleaning", "Commercial Cleaning", "Deep Cleaning", "Move-In/Out Cleaning"],
    defaultFeatures: ["Insured Staff", "Eco-Friendly Products", "Flexible Scheduling", "Satisfaction Guarantee"],
    sectionTitles: {
      services: "Our Services",
      products: "Cleaning Packages",
      about: "About Us",
      contact: "Get a Quote",
      testimonials: "Happy Customers",
      gallery: "Before & After",
    },
  },

  petcare: {
    headlines: [
      "Because Your Pet Deserves the Best — {name}",
      "{name} - Loving Care for Furry Friends",
      "Happy Pets, Happy Owners at {name}",
      "{name} - Professional Pet Care",
      "Your Trusted Pet Partner — {name}",
    ],
    alternateHeadlines: [
      "Where Pets Are Family",
      "Certified Care for Every Pet",
      "Love, Safety & Comfort for Your Pet",
      "Tail-Waggingly Good Care",
    ],
    subheadlines: [
      "Professional pet care delivered with love and expertise",
      "Certified specialists • Safe facilities • Individual attention",
      "Trusted by pet owners for grooming, boarding, and vet care",
      "Keeping your furry companions healthy, happy, and comfortable",
    ],
    aboutTemplates: [
      `{name} is a dedicated pet care facility where every animal is treated like family. Our certified specialists provide professional grooming, boarding, training, and veterinary support in a safe, nurturing environment.`,
      `At {name}, we understand your pet is your companion. Our expert team is committed to their health, happiness, and comfort, with individual attention and the highest standards of care.`,
    ],
    ctaOptions: ["Book a Visit", "Meet Our Team", "Schedule Grooming", "Reserve Boarding", "Contact Us"],
    defaultServices: ["Pet Grooming", "Veterinary Exams", "Boarding & Daycare", "Dog Training"],
    defaultFeatures: ["Certified Specialists", "Safe Facilities", "Individual Attention", "Emergency Care"],
    sectionTitles: {
      services: "Our Services",
      products: "Care Packages",
      about: "About Our Team",
      contact: "Book a Visit",
      testimonials: "Pet Parent Reviews",
      gallery: "Our Happy Clients",
    },
  },

  law: {
    headlines: [
      "Expert Legal Counsel — {name}",
      "{name} - Your Rights, Our Priority",
      "Trusted Legal Representation at {name}",
      "{name} - Fighting for Justice",
      "Strategic Legal Solutions from {name}",
    ],
    alternateHeadlines: [
      "Experienced. Trusted. Results-Driven.",
      "Your Legal Partner in Every Case",
      "Defending Your Rights with Dedication",
      "Comprehensive Legal Expertise",
    ],
    subheadlines: [
      "Experienced attorneys providing strategic counsel and representation",
      "Decades of experience • Transparent fees • Confidential consultations",
      "Trusted legal expertise to protect your rights and interests",
      "Comprehensive legal services for individuals and businesses",
    ],
    aboutTemplates: [
      `{name} is a respected law firm committed to providing exceptional legal representation across a wide range of practice areas. Our experienced attorneys combine deep legal knowledge with a personalised approach.`,
      `At {name}, we are dedicated to protecting your rights and achieving the best outcomes. Our team provides strategic, client-focused legal solutions with integrity and professionalism.`,
    ],
    ctaOptions: ["Free Consultation", "Contact Us", "Our Practice Areas", "Schedule a Call", "Get Legal Help"],
    defaultServices: ["Commercial Law", "Family Law", "Criminal Defence", "Dispute Resolution"],
    defaultFeatures: ["Decades of Experience", "Transparent Fees", "Strong Track Record", "Confidential"],
    sectionTitles: {
      services: "Practice Areas",
      products: "Legal Solutions",
      about: "About Our Firm",
      contact: "Get in Touch",
      testimonials: "Client Testimonials",
      gallery: "Our Firm",
    },
  },

  accounting: {
    headlines: [
      "Expert Accounting from {name}",
      "{name} - Your Financial Future, Secured",
      "Numbers You Can Trust at {name}",
      "{name} - Real Results in Finance",
      "Professional Accounting by {name}",
    ],
    alternateHeadlines: [
      "Financial Clarity, Real Results",
      "Your Trusted Accounting Partner",
      "Tax Optimised, Growth Focused",
      "Numbers That Tell the Right Story",
    ],
    subheadlines: [
      "Certified accountants delivering tax optimisation and growth strategy",
      "Professional accounting for businesses and individuals",
      "We handle the numbers so you can focus on growing your business",
      "Year-round financial support from certified professionals",
    ],
    aboutTemplates: [
      `{name} is a trusted accounting firm serving businesses and individuals with precision and integrity. Our CPAs deliver tailored solutions from tax planning to business strategy.`,
      `At {name}, we ensure your finances are in expert hands. Our team provides personalised accounting and advisory services designed to protect and grow your wealth.`,
    ],
    ctaOptions: ["Free Consultation", "Our Services", "Get a Quote", "Contact Us", "Schedule a Review"],
    defaultServices: ["Tax Planning", "Bookkeeping", "Financial Advisory", "Business Accounting"],
    defaultFeatures: ["Certified CPAs", "Cloud Accounting", "Tax Optimisation", "Year-Round Support"],
    sectionTitles: {
      services: "Our Services",
      products: "Financial Solutions",
      about: "About Our Firm",
      contact: "Schedule a Consultation",
      testimonials: "Client Reviews",
      gallery: "Our Office",
    },
  },

  dental: {
    headlines: [
      "Smile with Confidence at {name}",
      "{name} - Expert Dental Care",
      "Beautiful Smiles Start at {name}",
      "{name} - Your Smile Is Our Passion",
      "Comprehensive Dental Care by {name}",
    ],
    alternateHeadlines: [
      "Gentle Care, Beautiful Results",
      "Advanced Dentistry, Warm Service",
      "Your Comfort Is Our Priority",
      "Modern Dental Excellence",
    ],
    subheadlines: [
      "Comprehensive dental services in a comfortable, welcoming environment",
      "From check-ups to cosmetic dentistry — we care for your smile",
      "Gentle dentists • Latest technology • Same-day emergencies",
      "Family-friendly dental practice with flexible payment plans",
    ],
    aboutTemplates: [
      `{name} is a modern dental practice dedicated to exceptional oral health care in a comfortable, anxiety-free environment. Our experienced team uses the latest technology for comprehensive treatments.`,
      `At {name}, your smile is in expert hands. From preventive care and cosmetic dentistry to orthodontics and implants, we provide personalised, gentle care for patients of all ages.`,
    ],
    ctaOptions: ["Book Appointment", "Our Treatments", "Emergency Visit", "Call Us", "Schedule Check-Up"],
    defaultServices: ["General Dentistry", "Teeth Whitening", "Orthodontics", "Dental Implants"],
    defaultFeatures: ["Gentle Dentists", "Latest Technology", "Emergency Care", "Family Friendly"],
    sectionTitles: {
      services: "Our Treatments",
      products: "Treatment Options",
      about: "About Our Practice",
      contact: "Book Your Visit",
      testimonials: "Patient Reviews",
      gallery: "Our Clinic",
    },
  },

  hotel: {
    headlines: [
      "Welcome to {name} - Luxury Awaits",
      "{name} - Where Comfort Meets Elegance",
      "Unforgettable Stays at {name}",
      "{name} - A Home Away From Home",
      "Experience {name} Hospitality",
    ],
    alternateHeadlines: [
      "World-Class Hospitality",
      "Your Perfect Escape",
      "Luxury Comfort, Personal Service",
      "Where Memories Are Made",
    ],
    subheadlines: [
      "World-class hospitality with impeccable attention to detail",
      "Premium rooms • Fine dining • Spa & wellness facilities",
      "The perfect blend of comfort, luxury, and exceptional amenities",
      "Personalised service that exceeds every expectation",
    ],
    aboutTemplates: [
      `{name} is a distinguished hotel offering an exceptional blend of luxury, comfort, and personalised service. Our elegantly appointed rooms, award-winning dining, and comprehensive facilities create the perfect environment.`,
      `At {name}, every stay is crafted to exceed expectations. From our premium accommodations to our attentive concierge services, we ensure unforgettable experiences for every guest.`,
    ],
    ctaOptions: ["Book Your Stay", "Explore Rooms", "View Packages", "Check Availability", "Reserve Now"],
    defaultServices: ["Luxury Rooms & Suites", "Fine Dining", "Spa & Wellness", "Event Spaces"],
    defaultFeatures: ["Prime Location", "24/7 Service", "World-Class Dining", "Spa & Pool"],
    sectionTitles: {
      services: "Hotel Amenities",
      products: "Rooms & Suites",
      about: "About Our Hotel",
      contact: "Reservations",
      testimonials: "Guest Reviews",
      gallery: "Hotel Gallery",
    },
  },

  events: {
    headlines: [
      "Events That Create Memories — {name}",
      "{name} - Your Vision, Perfectly Executed",
      "Extraordinary Events by {name}",
      "{name} - Celebrations Done Right",
      "Unforgettable Events from {name}",
    ],
    alternateHeadlines: [
      "Flawlessly Planned, Beautifully Delivered",
      "Creating Magical Moments",
      "Your Event, Our Expertise",
      "From Concept to Celebration",
    ],
    subheadlines: [
      "Expert event planning for unforgettable occasions of every scale",
      "Full-service management • Creative design • Trusted vendor network",
      "From intimate gatherings to grand celebrations — we bring your vision to life",
      "Professional event planning that handles every detail flawlessly",
    ],
    aboutTemplates: [
      `{name} is a full-service event planning company dedicated to crafting unforgettable experiences. Our creative team handles every detail — concept, vendors, coordination — so your event is flawless.`,
      `At {name}, we believe every event deserves to be extraordinary. With years of experience and a vast vendor network, we turn visions into reality with precision and flair.`,
    ],
    ctaOptions: ["Plan Your Event", "View Our Work", "Get a Quote", "Book Consultation", "Contact Us"],
    defaultServices: ["Event Design", "Vendor Coordination", "Venue Management", "Day-Of Coordination"],
    defaultFeatures: ["Full-Service Management", "Creative Design", "Any Budget", "Flawless Execution"],
    sectionTitles: {
      services: "Our Services",
      products: "Event Packages",
      about: "About Us",
      contact: "Plan Your Event",
      testimonials: "Happy Clients",
      gallery: "Event Gallery",
    },
  },

  catering: {
    headlines: [
      "Exceptional Food for Every Occasion — {name}",
      "{name} - Catering Excellence",
      "Where Every Event Tastes Extraordinary — {name}",
      "{name} - Culinary Events, Delivered",
      "Premium Catering by {name}",
    ],
    alternateHeadlines: [
      "Food That Steals the Show",
      "Award-Winning Catering",
      "Custom Menus, Flawless Service",
      "Elevate Your Event with Great Food",
    ],
    subheadlines: [
      "Award-winning catering that elevates every event with exceptional cuisine",
      "Custom menus • Professional staff • Dietary needs accommodated",
      "From corporate lunches to lavish weddings — culinary excellence delivered",
      "Bespoke menus crafted with the finest seasonal ingredients",
    ],
    aboutTemplates: [
      `{name} is a premier catering company passionate about creating exceptional culinary experiences. Our executive chefs design bespoke menus using the finest ingredients, complemented by professional service.`,
      `At {name}, great food is the centrepiece of every event. Our team crafts custom menus that delight guests and make your occasion truly unforgettable.`,
    ],
    ctaOptions: ["Request a Quote", "View Menu", "Book Catering", "Plan Your Event", "Get in Touch"],
    defaultServices: ["Corporate Catering", "Wedding Catering", "Private Events", "Beverage Service"],
    defaultFeatures: ["Custom Menus", "Professional Staff", "All Dietary Needs", "Full Beverage Service"],
    sectionTitles: {
      services: "Our Services",
      products: "Sample Menu",
      about: "About Our Kitchen",
      contact: "Request a Quote",
      testimonials: "Client Reviews",
      gallery: "Culinary Gallery",
    },
  },

  tech: {
    headlines: [
      "Powering the Future of Business — {name}",
      "{name} - Technology That Transforms",
      "Innovation Delivered by {name}",
      "{name} - Building Tomorrow's Solutions",
      "Expert Tech Solutions from {name}",
    ],
    alternateHeadlines: [
      "Code, Create, Conquer",
      "Scalable Solutions, Real Impact",
      "Your Digital Transformation Partner",
      "Enterprise-Grade, Startup-Speed",
    ],
    subheadlines: [
      "Cutting-edge technology solutions that drive growth and efficiency",
      "Expert engineering • Scalable architecture • Enterprise security",
      "Software development and IT consulting to transform your business",
      "Building high-performing digital products with agile methodology",
    ],
    aboutTemplates: [
      `{name} is a leading technology company specialising in innovative software solutions that transform businesses. Our experienced engineers, designers, and strategists deliver scalable, secure products.`,
      `At {name}, technology is the foundation of our problem-solving approach. We partner with organisations to build digital products that are fast, secure, and built to scale.`,
    ],
    ctaOptions: ["Get a Demo", "View Solutions", "Start a Project", "Contact Us", "Free Consultation"],
    defaultServices: ["Web & App Development", "Cloud Architecture", "AI & ML Solutions", "Cybersecurity"],
    defaultFeatures: ["Expert Engineers", "Agile Process", "Enterprise Security", "24/7 Support"],
    sectionTitles: {
      services: "Our Solutions",
      products: "Products & Tools",
      about: "Who We Are",
      contact: "Start a Project",
      testimonials: "Client Success",
      gallery: "Our Work",
    },
  },

  consulting: {
    headlines: [
      "Strategic Growth with {name}",
      "{name} - Expert Guidance, Transformative Results",
      "Your Success Partner — {name}",
      "{name} - Strategy That Drives Growth",
      "Unlock Potential with {name}",
    ],
    alternateHeadlines: [
      "Data-Driven Strategies, Real Results",
      "Your Growth, Our Mission",
      "Senior-Level Expertise on Tap",
      "Actionable Insights, Measurable Impact",
    ],
    subheadlines: [
      "Experienced consultants delivering strategic insights and solutions",
      "Senior expertise • Data-driven strategies • Proven ROI",
      "We partner with businesses to unlock growth and accelerate performance",
      "Strategic advisory for businesses at every stage of growth",
    ],
    aboutTemplates: [
      `{name} is a strategic consulting firm that partners with businesses to unlock growth, improve operations, and navigate complex challenges. Our senior consultants bring decades of experience.`,
      `At {name}, we go beyond advice — we deliver results. Our hands-on approach ensures strategies are implemented effectively, driving measurable growth for every client.`,
    ],
    ctaOptions: ["Free Strategy Call", "Our Services", "Book Consultation", "View Case Studies", "Contact Us"],
    defaultServices: ["Growth Strategy", "Operations Optimisation", "Financial Advisory", "Change Management"],
    defaultFeatures: ["Senior Expertise", "Data-Driven", "Proven ROI", "Hands-On Support"],
    sectionTitles: {
      services: "Our Services",
      products: "Advisory Packages",
      about: "About the Firm",
      contact: "Schedule a Call",
      testimonials: "Client Results",
      gallery: "Our Team",
    },
  },

  bakery: {
    headlines: [
      "Baked with Love at {name}",
      "{name} - Artisan Breads & Pastries",
      "Fresh from Our Oven — {name}",
      "{name} - Where Every Bite is Bliss",
      "Handcrafted Bakes by {name}",
    ],
    alternateHeadlines: [
      "Traditional Recipes, Modern Flair",
      "Fresh Daily, Made from Scratch",
      "The Art of Artisan Baking",
      "Bread, Pastries & Celebration Cakes",
    ],
    subheadlines: [
      "Traditional recipes, premium ingredients, and a passion for baking",
      "Every loaf, croissant, and cake is crafted with care",
      "Baked fresh daily with all-natural, locally sourced ingredients",
      "From artisan sourdough to custom celebration cakes",
    ],
    aboutTemplates: [
      `{name} is a family-run artisan bakery with a passion for traditional baking. Every morning, our bakers craft breads, pastries, and cakes from scratch using the finest ingredients. No preservatives, no shortcuts.`,
      `At {name}, baking is more than a craft — it's a love story. Using locally milled flour, farm-fresh eggs, and real butter, we create honest, delicious bakes that bring people together.`,
    ],
    ctaOptions: ["Shop Our Bakes", "Order Custom Cake", "View Menu", "Visit the Bakery", "Order Online"],
    defaultServices: ["Artisan Breads", "Pastries & Croissants", "Custom Cakes", "Wholesale Orders"],
    defaultFeatures: ["Baked Fresh Daily", "All-Natural Ingredients", "Gluten-Free Options", "Custom Cakes"],
    sectionTitles: {
      services: "What We Bake",
      products: "Today's Selection",
      about: "Our Bakery Story",
      contact: "Visit Us",
      testimonials: "Customer Reviews",
      gallery: "From the Oven",
    },
  },

  gym: {
    headlines: [
      "Built for Champions — {name}",
      "{name} - No Limits, No Excuses",
      "Get Results at {name}",
      "{name} - Where Strength is Born",
      "Train at {name}",
    ],
    alternateHeadlines: [
      "Push Past Your Limits",
      "Professional-Grade Training",
      "Strength, Cardio, Community",
      "Your Best Self Starts Here",
    ],
    subheadlines: [
      "Professional equipment • Expert coaches • 24/7 access",
      "Push your limits in a facility designed for peak performance",
      "Expert strength coaching and cutting-edge equipment for all levels",
      "A high-performance gym for serious athletes and beginners alike",
    ],
    aboutTemplates: [
      `{name} is a high-performance gym built for those who are serious about their fitness. From Olympic platforms to functional zones, our facility has everything you need to crush your goals.`,
      `At {name}, our coaches are passionate about helping members of every level unlock their potential. With pro-grade equipment and a supportive community, every session counts.`,
    ],
    ctaOptions: ["Join Now", "Take a Tour", "Start Free Trial", "View Memberships", "Get Started"],
    defaultServices: ["Open Gym Access", "Strength Coaching", "Group Classes", "Nutrition Plans"],
    defaultFeatures: ["Pro-Grade Equipment", "Expert Coaches", "24/7 Access", "No Lock-In"],
    sectionTitles: {
      services: "Training Options",
      products: "Memberships",
      about: "About Our Gym",
      contact: "Join Us",
      testimonials: "Member Results",
      gallery: "The Gym",
    },
  },

  yoga: {
    headlines: [
      "Find Your Balance at {name}",
      "{name} - Breathe. Move. Transform.",
      "Your Yoga Journey Begins at {name}",
      "{name} - Mindful Movement, Inner Peace",
      "Discover Yoga with {name}",
    ],
    alternateHeadlines: [
      "Strength Through Stillness",
      "All Levels, All Welcome",
      "Yoga for Body, Mind & Soul",
      "Flow, Restore, Transform",
    ],
    subheadlines: [
      "Expert-led yoga classes for all levels in a peaceful studio",
      "Cultivate strength, flexibility, and inner peace through mindful practice",
      "All levels welcome • Experienced instructors • Peaceful environment",
      "From gentle restorative flows to dynamic vinyasa sessions",
    ],
    aboutTemplates: [
      `{name} is a mindful space dedicated to the transformative practice of yoga. Our experienced instructors guide students through a range of styles in a warm, inclusive environment.`,
      `At {name}, yoga is for everyone. Whether you're a beginner or a seasoned practitioner, our classes cultivate strength, flexibility, and peace of mind in a supportive community.`,
    ],
    ctaOptions: ["Book a Class", "View Schedule", "Start Free Trial", "Join a Class", "Try First Class Free"],
    defaultServices: ["Vinyasa Classes", "Yin & Restorative", "Private Sessions", "Online Classes"],
    defaultFeatures: ["All Levels Welcome", "Experienced Teachers", "Heated & Non-Heated", "Online Access"],
    sectionTitles: {
      services: "Class Offerings",
      products: "Membership Plans",
      about: "About the Studio",
      contact: "Book a Class",
      testimonials: "Student Stories",
      gallery: "Studio Gallery",
    },
  },

  other: {
    headlines: [
      "Welcome to {name}",
      "Discover {name}",
      "{name} - Excellence Delivered",
      "Experience {name}",
      "{name} - Quality You Can Trust",
    ],
    alternateHeadlines: [
      "Your Trusted Partner",
      "Excellence in Everything We Do",
      "Quality Without Compromise",
      "Here to Help You Succeed",
    ],
    subheadlines: [
      "Professional services tailored to your needs",
      "Committed to your success",
      "Quality service, every time",
      "Your satisfaction is our priority",
    ],
    aboutTemplates: [
      `{name} is dedicated to providing excellent service and value to our customers. We pride ourselves on quality, reliability, and customer satisfaction. Let us show you why so many people choose us.`,
      `At {name}, we believe in going above and beyond for every customer. Our commitment to excellence drives everything we do. Contact us today to learn how we can help you.`,
    ],
    ctaOptions: ["Get Started", "Contact Us", "Learn More", "Get in Touch", "Request Info"],
    defaultServices: ["Quality Service", "Expert Support", "Custom Solutions", "Dedicated Care"],
    defaultFeatures: ["Quality Assured", "Expert Team", "Customer Focus", "Fast Response"],
    sectionTitles: {
      services: "Our Services",
      products: "What We Offer",
      about: "About Us",
      contact: "Contact Us",
      testimonials: "What People Say",
      gallery: "Gallery",
    },
  },
};

// ==================== MAIN GENERATOR FUNCTION ====================

export interface GenerateContentInput {
  name: string;
  description?: string;
  businessType: BusinessType;
  services?: string[];
  features?: string[];
  city?: string;
  products?: ProductData[];
}

export function generateContent(input: GenerateContentInput): GeneratedContent {
  const { name, description, businessType, services, features, city } = input;
  
  const template = templates[businessType] || templates.other;

  // Use provided services/features or defaults
  const finalServices = services && services.length > 0 
    ? services 
    : template.defaultServices;
  
  const finalFeatures = features && features.length > 0 
    ? features 
    : template.defaultFeatures;

  const cityText = city || "your area";

  // Pick random templates
  const headlineTemplate = pickRandom(template.headlines);
  const alternateTemplate = pickRandom(template.alternateHeadlines);
  const subheadlineText = pickRandom(template.subheadlines);
  const aboutTemplate = pickRandom(template.aboutTemplates);
  const ctaText = pickRandom(template.ctaOptions);

  // Replace placeholders
  const replacements = { 
    name, 
    city: cityText, 
    years: String(Math.floor(Math.random() * 15) + 5) 
  };

  const headline = replacePlaceholders(headlineTemplate, replacements);
  const alternateHeadline = replacePlaceholders(alternateTemplate, replacements);
  const subheadline = replacePlaceholders(subheadlineText, replacements);
  const aboutText = description || replacePlaceholders(aboutTemplate, replacements);

  return {
    headline,
    subheadline,
    aboutText,
    ctaText,
    services: finalServices,
    features: finalFeatures,
    alternateHeadline,
    sectionTitles: template.sectionTitles,
  };
}

// ==================== A/B TESTING ====================

export function selectVariant(): "A" | "B" {
  // Simple random selection for A/B testing
  return Math.random() < 0.5 ? "A" : "B";
}

// ==================== HELPER FUNCTIONS ====================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function replacePlaceholders(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return result;
}

// ==================== PRODUCT DESCRIPTION GENERATOR ====================

export function generateProductDescription(product: ProductData, businessType: BusinessType): string {
  if (product.description) return product.description;

  const descriptions: Record<string, string[]> = {
    ecommerce: [
      `Premium quality ${product.name.toLowerCase()} crafted with attention to detail.`,
      `Elevate your style with our ${product.name.toLowerCase()}. Perfect for any occasion.`,
      `Discover the perfect ${product.name.toLowerCase()} - combining style and comfort.`,
    ],
    restaurant: [
      `Savor the delicious flavors of our ${product.name.toLowerCase()}.`,
      `A customer favorite - our ${product.name.toLowerCase()} is made fresh daily.`,
      `Experience the taste of ${product.name.toLowerCase()} prepared by our expert chefs.`,
    ],
  };

  const typeDescriptions = descriptions[businessType] || descriptions.ecommerce;
  return pickRandom(typeDescriptions);
}

// ==================== TESTIMONIAL GENERATOR ====================

export function generateDefaultTestimonials(businessType: BusinessType, businessName: string): { name: string; text: string }[] {
  const testimonialTemplates: Record<string, { name: string; text: string }[]> = {
    ecommerce: [
      { name: "Sarah M.", text: `Love shopping at ${businessName}! Great quality products and fast shipping. Will definitely order again!` },
      { name: "James R.", text: `Excellent customer service and the products exceeded my expectations. Highly recommend!` },
      { name: "Emily K.", text: `The best online shopping experience I've had. Easy checkout and beautiful packaging.` },
    ],
    restaurant: [
      { name: "Michael T.", text: `Amazing food and atmosphere! ${businessName} is now our go-to spot for date nights.` },
      { name: "Lisa P.", text: `The flavors are incredible and the service is always top-notch. A true culinary gem!` },
      { name: "David W.", text: `Every dish we tried was exceptional. Can't wait to come back and try more!` },
    ],
    service: [
      { name: "Jennifer H.", text: `${businessName} delivered exactly what they promised. Professional, reliable, and great results!` },
      { name: "Robert S.", text: `Working with their team was a pleasure. They truly understand customer needs.` },
      { name: "Amanda L.", text: `Exceeded all expectations! I recommend ${businessName} to everyone I know.` },
    ],
  };

  return testimonialTemplates[businessType] || testimonialTemplates.service;
}

// ==================== COHERE AI INTEGRATION ====================

/**
 * Generate AI-enhanced content using Cohere AI with template fallback
 * This is the main entry point for content generation with AI enhancement
 */
export async function generateEnhancedContent(
  input: GenerateContentInput
): Promise<GeneratedContent> {
  // First generate template-based content as fallback
  const templateContent = generateContent(input);
  
  // If Cohere AI is not configured, return template content only
  if (!isCohereConfigured()) {
    console.log('Cohere AI not configured, using template-based content');
    return templateContent;
  }

  // Convert input to Cohere BusinessContext
  const cohereContext: BusinessContext = {
    name: input.name,
    description: input.description,
    businessType: input.businessType,
    services: input.services,
    features: input.features,
    city: input.city,
    products: input.products,
  };

  try {
    console.log('Generating AI-enhanced content with Cohere...');
    const cohereContent = await cohereGenerateContent(cohereContext);

    // Merge Cohere AI content with template content
    // AI content takes priority, but template provides fallback
    return {
      headline: cohereContent.headline || templateContent.headline,
      subheadline: cohereContent.subheadline || templateContent.subheadline,
      aboutText: cohereContent.aboutText || templateContent.aboutText,
      ctaText: cohereContent.ctaText || templateContent.ctaText,
      services: input.services && input.services.length > 0 ? input.services : templateContent.services,
      features: input.features && input.features.length > 0 ? input.features : templateContent.features,
      alternateHeadline: templateContent.alternateHeadline,
      sectionTitles: templateContent.sectionTitles,
      // Enhanced fields from Cohere AI
      tagline: cohereContent.tagline,
      metaDescription: cohereContent.metaDescription,
      valuePropositions: cohereContent.valuePropositions,
      serviceDescriptions: cohereContent.serviceDescriptions,
      emailSubjectLines: cohereContent.emailSubjectLines,
      socialMediaBio: cohereContent.socialMediaBio,
    };
  } catch (error) {
    console.error('Cohere AI generation error, falling back to templates:', error);
    return templateContent;
  }
}

/**
 * Re-export Cohere AI utility functions
 */
export { isCohereConfigured } from './cohere-ai';
export { generateLeadFollowUpEmail, generateProductDescription as generateAIProductDescription } from './cohere-ai';
export type { BusinessContext };
