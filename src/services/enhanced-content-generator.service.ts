/**
 * Enhanced Content Generator Service
 * Produces compelling copy for every supported business type
 */

import type { BusinessType } from '@/types/business';

interface ServiceDescription {
  name: string;
  description: string;
}

interface ContentConfig {
  headlines: string[];
  subheadlines: string[];
  ctas: { primary: string; secondary: string };
  valueProps: string[];
  seoSuffix: string;
  aboutTemplate: (name: string, city?: string) => string;
}

const configs: Record<string, ContentConfig> = {
  perfume: {
    headlines: ['Scents That Tell Your Story', 'Luxury Fragrances, Crafted for You', 'Discover Your Signature Scent'],
    subheadlines: ['Handcrafted artisanal perfumes blending rare ingredients from around the world.', 'Each bottle holds a unique olfactory journey, designed to leave a lasting impression.'],
    ctas: { primary: 'Explore Collection', secondary: 'Book a Consultation' },
    valueProps: ['Rare Artisan Ingredients', 'Personalized Scent Profiling', 'Luxury Bespoke Packaging', 'Expert Master Perfumers', 'Satisfaction Guaranteed'],
    seoSuffix: 'luxury fragrance',
    aboutTemplate: (name, city) => `${name} is a luxury fragrance house${city ? ` in ${city}` : ''} dedicated to the art of artisanal perfumery. We source only the finest raw materials from across the globe — rare florals, exotic woods, and precious resins — to craft scents that transcend the ordinary. Our master perfumers blend tradition with innovation to create signature fragrances that become a part of who you are.`,
  },
  restaurant: {
    headlines: ['An Unforgettable Dining Experience', 'Where Every Dish Tells a Story', 'Farm-to-Table Excellence'],
    subheadlines: ['Locally sourced, masterfully crafted cuisine in a warm, inviting atmosphere.', 'Every plate is a celebration of seasonal flavours and artisan techniques.'],
    ctas: { primary: 'Reserve a Table', secondary: 'View Our Menu' },
    valueProps: ['Locally Sourced Ingredients', 'Award-Winning Chefs', 'Seasonal Rotating Menu', 'Private Dining Available', 'Exceptional Wine Selection'],
    seoSuffix: 'fine dining restaurant',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a celebration of culinary artistry and seasonal ingredients. Our passionate team of chefs works directly with local farmers and suppliers to bring the freshest ingredients to your table. From intimate dinners to celebratory banquets, we create memorable dining experiences that nourish both body and soul.`,
  },
  cafe: {
    headlines: ['Your Perfect Cup, Every Time', 'Where Coffee Meets Community', 'Artisan Coffee & Good Vibes'],
    subheadlines: ['Specialty coffee, freshly baked goods, and a warm space to call your own.', 'From our roastery to your cup — quality you can taste in every sip.'],
    ctas: { primary: 'Order Now', secondary: 'Find Us' },
    valueProps: ['Single-Origin Specialty Coffee', 'Freshly Baked Daily', 'Cozy Welcoming Atmosphere', 'Free High-Speed WiFi', 'Plant-Based Options Available'],
    seoSuffix: 'specialty coffee café',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is more than a coffee shop — it's a community hub where great coffee and good conversations flow freely. We source single-origin beans from ethical farms worldwide and roast them to perfection. Our bakers arrive before dawn to ensure every pastry and loaf is fresh when you walk through the door.`,
  },
  bakery: {
    headlines: ['Baked with Love, Every Day', 'Artisan Breads & Pastries', 'Fresh from Our Oven to You'],
    subheadlines: ['Traditional recipes, premium ingredients, and a passion for baking excellence.', 'Every loaf, croissant, and cake is crafted with care and the finest ingredients.'],
    ctas: { primary: 'Shop Our Bakes', secondary: 'Order Custom Cake' },
    valueProps: ['Baked Fresh Daily', 'All-Natural Ingredients', 'Custom Celebration Cakes', 'Gluten-Free Options', 'Wholesale Available'],
    seoSuffix: 'artisan bakery',
    aboutTemplate: (name, city) => `${name}${city ? `, located in ${city},` : ''} is a family-run artisan bakery with a passion for traditional baking techniques and the finest ingredients. Every morning, our bakers craft breads, pastries, and cakes from scratch using locally milled flour, farm-fresh eggs, and real butter. No preservatives, no shortcuts — just honest, delicious baking.`,
  },
  beauty: {
    headlines: ['Reveal Your Best Self', 'Beauty Redefined, Confidence Restored', 'Where Beauty Meets Artistry'],
    subheadlines: ['Premium beauty services tailored to enhance your natural radiance.', 'Our expert stylists and beauticians bring out the best in every client.'],
    ctas: { primary: 'Book Appointment', secondary: 'View Services' },
    valueProps: ['Certified Beauty Professionals', 'Premium Product Lines', 'Personalized Beauty Plans', 'Relaxing Luxury Environment', 'Satisfaction Guaranteed'],
    seoSuffix: 'beauty salon',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a premier beauty destination where skilled artisans transform and enhance your natural beauty. Our team of certified professionals specialise in the latest techniques, from precision hair styling to advanced skincare treatments. We use only the highest quality, skin-safe products to ensure stunning, long-lasting results.`,
  },
  spa: {
    headlines: ['Your Sanctuary of Serenity', 'Restore, Rejuvenate, Renew', 'Luxury Wellness Reimagined'],
    subheadlines: ['Holistic wellness treatments designed to soothe your body, mind, and soul.', 'Step into tranquility — a world-class spa experience awaits you.'],
    ctas: { primary: 'Book a Treatment', secondary: 'Explore Packages' },
    valueProps: ['Certified Wellness Therapists', 'Organic Luxury Products', 'Bespoke Treatment Packages', 'Private Relaxation Suites', 'Member Loyalty Benefits'],
    seoSuffix: 'luxury wellness spa',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a sanctuary crafted for complete relaxation and rejuvenation. Our expert therapists combine ancient healing traditions with modern wellness science to deliver transformative experiences. Using only the finest organic products, every treatment is thoughtfully personalised to your unique needs.`,
  },
  fitness: {
    headlines: ['Transform Your Body, Elevate Your Life', 'Train Harder, Achieve More', 'Your Fitness Journey Starts Here'],
    subheadlines: ['State-of-the-art equipment, expert coaches, and a community that pushes you forward.', 'Personalised training programmes designed to achieve real, lasting results.'],
    ctas: { primary: 'Start Free Trial', secondary: 'View Memberships' },
    valueProps: ['Expert Certified Coaches', 'Cutting-Edge Equipment', 'Personalised Training Plans', 'Group & Solo Sessions', 'Nutrition Guidance Included'],
    seoSuffix: 'fitness center',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a premier fitness facility designed for people serious about achieving their health goals. Our certified personal trainers create customised programmes that blend strength, cardio, and mobility training for sustainable results. With state-of-the-art equipment and a supportive community, every visit brings you closer to your best self.`,
  },
  gym: {
    headlines: ['Built for Champions', 'No Limits, No Excuses', 'The Gym That Gets Results'],
    subheadlines: ['Professional-grade equipment and expert coaching for serious athletes and beginners alike.', 'Push your limits in a facility designed for peak performance.'],
    ctas: { primary: 'Join Now', secondary: 'Take a Tour' },
    valueProps: ['Professional-Grade Equipment', 'Expert Strength Coaches', '24/7 Access Available', 'Competitive Pricing', 'No Lock-In Contracts'],
    seoSuffix: 'gym & fitness center',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a high-performance gym built for those who are serious about their fitness. From Olympic lifting platforms to functional training zones, our facility has everything you need to hit your goals. Our coaches are passionate about helping members of every level unlock their potential.`,
  },
  yoga: {
    headlines: ['Find Your Balance, Find Yourself', 'Breathe. Move. Transform.', 'Your Yoga Journey Begins Here'],
    subheadlines: ['Expert-led yoga classes for all levels in a peaceful, welcoming studio.', 'Cultivate strength, flexibility, and inner peace through mindful practice.'],
    ctas: { primary: 'Book a Class', secondary: 'View Schedule' },
    valueProps: ['All Levels Welcome', 'Experienced Instructors', 'Heated & Non-Heated Studios', 'Meditation & Breathwork', 'Online Classes Available'],
    seoSuffix: 'yoga studio',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a mindful space dedicated to the transformative practice of yoga. Our experienced instructors guide students through a range of styles — from gentle restorative flows to dynamic vinyasa sessions — in a warm, inclusive environment. Whether you're a beginner or a seasoned practitioner, you'll find your community here.`,
  },
  flowershop: {
    headlines: ['Every Occasion, A Perfect Bloom', 'Fresh Flowers, Heartfelt Moments', 'Where Nature Meets Artistry'],
    subheadlines: ['Expertly arranged fresh flowers for every occasion, delivered with care.', 'From weddings to everyday gifts — we bring beauty to your most meaningful moments.'],
    ctas: { primary: 'Order Flowers', secondary: 'View Arrangements' },
    valueProps: ['Daily Fresh Deliveries', 'Custom Bespoke Arrangements', 'Wedding Floral Specialists', 'Same-Day Delivery Available', 'Seasonal Blooms Year-Round'],
    seoSuffix: 'florist & flower shop',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a boutique florist passionate about creating breathtaking floral arrangements that speak from the heart. We source the freshest seasonal blooms daily and arrange them with artistic care. From intimate bouquets to grand wedding installations, every arrangement is made with love and attention to detail.`,
  },
  jewelry: {
    headlines: ['Wear Your Story', 'Exquisite Jewellery, Timeless Elegance', 'Crafted to Last a Lifetime'],
    subheadlines: ['Fine jewellery handcrafted with exceptional gemstones and precious metals.', 'Each piece is a work of art, designed to be treasured for generations.'],
    ctas: { primary: 'Browse Collection', secondary: 'Book Consultation' },
    valueProps: ['Certified Gemstones', 'Handcrafted by Master Artisans', 'Custom & Bespoke Designs', 'Lifetime Warranty', 'Ethically Sourced Materials'],
    seoSuffix: 'fine jewellery',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a distinguished jewellery studio where masterful craftsmanship meets timeless design. Our expert jewellers work with ethically sourced gemstones and precious metals to create pieces that capture life's most meaningful moments. From engagement rings to heirloom collections, we craft jewellery that tells your unique story.`,
  },
  photography: {
    headlines: ['Moments Preserved Forever', 'Capturing Life\'s Most Beautiful Moments', 'Your Story, Told Beautifully'],
    subheadlines: ['Professional photography that captures the emotion, beauty, and truth of every moment.', 'Award-winning photography for weddings, portraits, events, and commercial projects.'],
    ctas: { primary: 'Book a Session', secondary: 'View Portfolio' },
    valueProps: ['Award-Winning Photography', 'Professional-Grade Equipment', 'Fast Turnaround Delivery', 'Print & Digital Packages', 'Fully Licensed & Insured'],
    seoSuffix: 'professional photography',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a professional photography studio specialising in creating authentic, emotionally resonant images. With years of experience and a passion for storytelling, we capture the moments that matter most — from intimate portraits to grand wedding celebrations and high-impact commercial campaigns.`,
  },
  barbershop: {
    headlines: ['Look Sharp, Feel Confident', 'Classic Cuts, Modern Style', 'The Art of the Perfect Cut'],
    subheadlines: ['Expert barbers delivering precise cuts, clean fades, and flawless grooming.', 'A premium grooming experience in a classic, welcoming barbershop atmosphere.'],
    ctas: { primary: 'Book a Cut', secondary: 'View Services' },
    valueProps: ['Master Barbers', 'Classic & Modern Styles', 'Hot Towel Shaves', 'Premium Grooming Products', 'Walk-Ins Welcome'],
    seoSuffix: 'barbershop',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a premium barbershop where traditional craftsmanship meets contemporary style. Our master barbers are dedicated to the art of grooming, delivering precision cuts, sharp fades, and luxurious hot towel shaves in a stylish, welcoming environment. Every visit is an experience in confidence.`,
  },
  cleaning: {
    headlines: ['A Cleaner Space, A Clearer Mind', 'Professional Cleaning You Can Trust', 'Spotless Results, Every Time'],
    subheadlines: ['Reliable, thorough cleaning services for homes and businesses.', 'Our professional team delivers consistently spotless results with eco-friendly products.'],
    ctas: { primary: 'Get a Free Quote', secondary: 'View Services' },
    valueProps: ['Fully Insured & Vetted Staff', 'Eco-Friendly Products', 'Flexible Scheduling', 'Satisfaction Guarantee', 'Commercial & Residential'],
    seoSuffix: 'professional cleaning service',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} provides professional cleaning services built on reliability, thoroughness, and a genuine commitment to quality. Our fully vetted team uses eco-friendly cleaning products and proven techniques to transform any space into a clean, healthy, and welcoming environment.`,
  },
  petcare: {
    headlines: ['Because Your Pet Deserves the Best', 'Loving Care for Your Furry Family', 'Happy Pets, Happy Owners'],
    subheadlines: ['Professional pet care services delivered with love, expertise, and attention to detail.', 'Trusted by pet owners for premium grooming, boarding, and veterinary care.'],
    ctas: { primary: 'Book a Visit', secondary: 'Meet Our Team' },
    valueProps: ['Certified Animal Care Specialists', 'Safe, Clean Facilities', 'Individual Attention for Every Pet', 'Regular Updates to Owners', 'Emergency Care Available'],
    seoSuffix: 'pet care specialist',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a dedicated pet care facility where every animal is treated like family. Our certified specialists provide professional grooming, boarding, training, and veterinary support in a safe, nurturing environment. We understand that your pet is your companion, and we are committed to their health, happiness, and comfort.`,
  },
  law: {
    headlines: ['Your Rights, Our Priority', 'Expert Legal Counsel You Can Trust', 'Fighting for Justice, Every Case'],
    subheadlines: ['Experienced attorneys providing comprehensive legal representation and strategic counsel.', 'Trusted legal expertise to protect your rights and achieve the best possible outcomes.'],
    ctas: { primary: 'Free Consultation', secondary: 'Our Practice Areas' },
    valueProps: ['Decades of Legal Experience', 'Client-Focused Approach', 'Transparent Fee Structures', 'Strong Track Record', 'Confidential Consultations'],
    seoSuffix: 'law firm',
    aboutTemplate: (name, city) => `${name}${city ? `, based in ${city},` : ''} is a respected law firm committed to providing exceptional legal representation across a wide range of practice areas. Our experienced attorneys combine deep legal knowledge with a personalised, client-focused approach to deliver strategic solutions that protect your interests and achieve meaningful results.`,
  },
  accounting: {
    headlines: ['Your Financial Future, Secured', 'Expert Accounting, Real Results', 'Numbers That Tell the Right Story'],
    subheadlines: ['Professional accounting and financial advisory services for businesses and individuals.', 'We handle the numbers so you can focus on what matters most — growing your business.'],
    ctas: { primary: 'Free Consultation', secondary: 'Our Services' },
    valueProps: ['Certified Public Accountants', 'Tax Optimisation Expertise', 'Business & Personal Finance', 'Cloud-Based Accounting', 'Year-Round Support'],
    seoSuffix: 'accounting firm',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a trusted accounting and financial advisory firm serving businesses and individuals with precision and integrity. Our CPAs and financial advisors deliver tailored solutions — from tax planning and bookkeeping to business strategy — ensuring your finances are always in expert hands.`,
  },
  dental: {
    headlines: ['Smile with Confidence', 'Expert Dental Care, Beautiful Smiles', 'Your Smile is Our Passion'],
    subheadlines: ['Comprehensive dental services in a comfortable, welcoming environment.', 'From routine check-ups to cosmetic dentistry — we care for your smile at every stage.'],
    ctas: { primary: 'Book Appointment', secondary: 'Our Treatments' },
    valueProps: ['Gentle & Experienced Dentists', 'Latest Dental Technology', 'Same-Day Emergency Appointments', 'Family-Friendly Practice', 'Flexible Payment Plans'],
    seoSuffix: 'dental clinic',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a modern dental practice dedicated to delivering exceptional oral health care in a comfortable, anxiety-free environment. Our experienced dental team combines clinical expertise with the latest technology to provide comprehensive treatments — from preventive care and cosmetic dentistry to orthodontics and implants.`,
  },
  hotel: {
    headlines: ['Where Comfort Meets Elegance', 'A Home Away From Home', 'Luxury Stays, Unforgettable Memories'],
    subheadlines: ['World-class hospitality with impeccable attention to detail and personalised service.', 'Experience the perfect blend of comfort, luxury, and exceptional amenities.'],
    ctas: { primary: 'Book Your Stay', secondary: 'Explore Rooms' },
    valueProps: ['Premium Room Accommodations', 'World-Class Dining', 'Spa & Wellness Facilities', 'Concierge Services', 'Prime Location'],
    seoSuffix: 'luxury hotel',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a distinguished hotel offering an exceptional blend of luxury, comfort, and personalised service. Our elegantly appointed rooms and suites, award-winning dining, and comprehensive wellness facilities create the perfect environment for business travellers and leisure guests alike. Every stay is crafted to exceed expectations.`,
  },
  events: {
    headlines: ['Events That Create Memories', 'Your Vision, Perfectly Executed', 'Extraordinary Events, Flawlessly Delivered'],
    subheadlines: ['Expert event planning and management for unforgettable occasions of every scale.', 'From intimate gatherings to grand celebrations — we bring your vision to life.'],
    ctas: { primary: 'Plan Your Event', secondary: 'View Our Work' },
    valueProps: ['Full-Service Event Management', 'Creative Design Team', 'Trusted Vendor Network', 'On-Day Coordination', 'Any Budget, Any Scale'],
    seoSuffix: 'event planning',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a full-service event planning and management company dedicated to crafting unforgettable experiences. Our creative team handles every detail — from concept design and vendor coordination to day-of management — ensuring your event runs flawlessly and leaves lasting impressions.`,
  },
  catering: {
    headlines: ['Exceptional Food for Every Occasion', 'Where Every Event Tastes Extraordinary', 'Catering Excellence, Delivered'],
    subheadlines: ['Award-winning catering services that elevate every event with exceptional cuisine.', 'From corporate lunches to lavish weddings — we bring culinary excellence to your event.'],
    ctas: { primary: 'Request a Quote', secondary: 'View Our Menu' },
    valueProps: ['Award-Winning Culinary Team', 'Custom Menu Creation', 'Full-Service Beverage Options', 'Professional Serving Staff', 'Dietary Needs Accommodated'],
    seoSuffix: 'catering service',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a premier catering company passionate about creating exceptional culinary experiences for events of every kind. Our executive chefs design bespoke menus using the finest seasonal ingredients, complemented by a professional service team that ensures every occasion is a resounding success.`,
  },
  tech: {
    headlines: ['Powering the Future of Business', 'Technology That Transforms', 'Innovation Delivered, Results Guaranteed'],
    subheadlines: ['Cutting-edge technology solutions that drive growth, efficiency, and competitive advantage.', 'Expert software development and IT consulting to take your business to the next level.'],
    ctas: { primary: 'Get a Free Demo', secondary: 'View Our Solutions' },
    valueProps: ['Expert Engineering Team', 'Scalable Architecture', 'Enterprise-Grade Security', 'Agile Development Process', '24/7 Technical Support'],
    seoSuffix: 'technology solutions',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a leading technology company specialising in building innovative software solutions that transform businesses. Our team of experienced engineers, designers, and strategists partners with organisations to deliver scalable, secure, and high-performing digital products.`,
  },
  startup: {
    headlines: ['Build Something Amazing', 'Turning Ideas Into Impact', 'The Future Starts Here'],
    subheadlines: ['Innovative products and services redefining what\'s possible in a digital-first world.', 'We\'re building tomorrow\'s solutions to today\'s most pressing challenges.'],
    ctas: { primary: 'Get Early Access', secondary: 'Learn More' },
    valueProps: ['AI-Powered Innovation', 'Rapid Iteration', 'Passionate Founding Team', 'Backed by Top Investors', 'Customer-Centric Design'],
    seoSuffix: 'startup & innovation',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a dynamic startup on a mission to revolutionise the way businesses operate. Founded by industry veterans and passionate innovators, we're building intelligent, user-centric products that deliver real, measurable impact for our customers.`,
  },
  consulting: {
    headlines: ['Expert Guidance, Transformative Results', 'Strategy That Drives Growth', 'Your Success is Our Mission'],
    subheadlines: ['Experienced consultants delivering strategic insights and actionable solutions.', 'We partner with businesses to unlock potential, streamline operations, and accelerate growth.'],
    ctas: { primary: 'Free Strategy Call', secondary: 'Our Services' },
    valueProps: ['Senior-Level Expertise', 'Data-Driven Strategies', 'Proven ROI Track Record', 'Industry-Specific Knowledge', 'Hands-On Implementation Support'],
    seoSuffix: 'business consulting',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a strategic consulting firm that partners with businesses at every stage to unlock growth, improve operational efficiency, and navigate complex challenges. Our senior consultants bring decades of industry experience and a results-driven methodology to every engagement.`,
  },
  healthcare: {
    headlines: ['Your Health, Our Commitment', 'Compassionate Care, Expert Outcomes', 'Excellence in Healthcare'],
    subheadlines: ['Comprehensive healthcare services delivered with compassion, expertise, and cutting-edge technology.', 'Patient-centred care that puts your health and wellbeing first, always.'],
    ctas: { primary: 'Book Appointment', secondary: 'Our Services' },
    valueProps: ['Board-Certified Physicians', 'Latest Medical Technology', 'Patient-Centred Approach', 'Comprehensive Care Plans', 'Emergency Services Available'],
    seoSuffix: 'healthcare provider',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a trusted healthcare provider committed to delivering exceptional medical care with compassion and expertise. Our team of board-certified physicians and healthcare professionals are dedicated to improving patient outcomes through personalised, evidence-based treatment plans and the latest medical technology.`,
  },
  ecommerce: {
    headlines: ['Shop the Best, Delivered to You', 'Quality Products, Unbeatable Value', 'Your Premier Online Destination'],
    subheadlines: ['Curated collections of premium products with fast, reliable delivery to your door.', 'Shop thousands of products from trusted brands with exclusive deals every day.'],
    ctas: { primary: 'Shop Now', secondary: 'View Collections' },
    valueProps: ['Free Shipping on Orders', 'Easy 30-Day Returns', 'Secure Checkout', 'Exclusive Member Discounts', '24/7 Customer Support'],
    seoSuffix: 'online store',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is your trusted online retail destination, offering a carefully curated selection of premium products at competitive prices. We work directly with trusted brands and manufacturers to bring you the best quality with seamless delivery and outstanding customer service.`,
  },
  realestate: {
    headlines: ['Your Dream Property Awaits', 'Exceptional Homes, Expert Guidance', 'Find Your Perfect Place'],
    subheadlines: ['Expert real estate services to help you buy, sell, and invest with confidence.', 'From starter homes to luxury estates — we guide you every step of the way.'],
    ctas: { primary: 'View Properties', secondary: 'Talk to an Agent' },
    valueProps: ['Experienced Licensed Agents', 'Exclusive Property Listings', 'Market Valuation Experts', 'Investment Portfolio Analysis', 'Full Negotiation Support'],
    seoSuffix: 'real estate agency',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a premier real estate agency with a deep knowledge of the local property market and a track record of exceptional client outcomes. Our licensed agents combine market expertise, negotiation skill, and genuine care for clients to deliver successful transactions, whether you're buying, selling, or investing.`,
  },
  education: {
    headlines: ['Unlock Your Potential', 'Education That Transforms Lives', 'Knowledge is Your Greatest Asset'],
    subheadlines: ['Comprehensive educational programmes that equip you with skills for the modern world.', 'Expert tutors, innovative methods, and a curriculum designed for real-world success.'],
    ctas: { primary: 'Enrol Today', secondary: 'View Courses' },
    valueProps: ['Expert Qualified Instructors', 'Personalised Learning Plans', 'Industry-Recognised Certifications', 'Flexible Online & In-Person', 'Career Support Included'],
    seoSuffix: 'education & training',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a leading educational institution dedicated to empowering learners with the knowledge, skills, and confidence to succeed. Our qualified instructors deliver engaging, outcomes-focused programmes across a wide range of disciplines, supported by a caring community and comprehensive career guidance.`,
  },
  default: {
    headlines: ['Excellence in Every Detail', 'Professional Service You Can Count On', 'Quality, Reliability, Results'],
    subheadlines: ['Premium professional services tailored to your unique needs and goals.', 'Delivering exceptional outcomes for every client, every time.'],
    ctas: { primary: 'Get Started Today', secondary: 'Learn More' },
    valueProps: ['Experienced Professionals', 'Premium Quality Service', 'Satisfaction Guaranteed', 'Trusted by Hundreds', 'Fast & Reliable Delivery'],
    seoSuffix: 'professional services',
    aboutTemplate: (name, city) => `${name}${city ? ` in ${city}` : ''} is a trusted professional services provider dedicated to delivering outstanding results for every client. Our expert team brings years of industry experience and genuine commitment to quality to every project. We believe in building long-term partnerships grounded in trust, transparency, and excellence.`,
  },
};

// Fallback service descriptions per type
const serviceDescriptionTemplates: Record<string, (service: string) => string> = {
  perfume: (s) => `Experience our exquisite ${s.toLowerCase()} featuring rare ingredients sourced from across the globe, crafted by master perfumers to create an unforgettable olfactory journey.`,
  restaurant: (s) => `Indulge in our ${s.toLowerCase()} featuring seasonal ingredients masterfully prepared by our award-winning culinary team in a warm, welcoming atmosphere.`,
  cafe: (s) => `Savour our ${s.toLowerCase()} crafted with the freshest single-origin beans and finest ingredients by our expert baristas.`,
  bakery: (s) => `Delight in our ${s.toLowerCase()} baked fresh every morning using all-natural ingredients, traditional techniques, and a whole lot of love.`,
  beauty: (s) => `Transform with our ${s.toLowerCase()} delivered by certified beauty professionals using premium products for stunning, long-lasting results.`,
  spa: (s) => `Restore and rejuvenate with our ${s.toLowerCase()}, a bespoke treatment designed to soothe your body, calm your mind, and renew your spirit.`,
  fitness: (s) => `Achieve your goals with our ${s.toLowerCase()} programme, designed and delivered by certified coaches for measurable, sustainable results.`,
  gym: (s) => `Push your limits with our ${s.toLowerCase()} programme, featuring professional-grade equipment and expert coaching for all fitness levels.`,
  yoga: (s) => `Cultivate balance and inner peace with our ${s.toLowerCase()} classes, guided by experienced instructors in a serene, inclusive studio.`,
  flowershop: (s) => `Brighten any moment with our ${s.toLowerCase()}, expertly arranged with the freshest seasonal blooms for a stunning, heartfelt presentation.`,
  jewelry: (s) => `Discover the artistry of our ${s.toLowerCase()}, handcrafted with certified gemstones and precious metals by our master jewellers.`,
  photography: (s) => `Capture life's most meaningful moments with our ${s.toLowerCase()} service — professional, creative, and delivered with stunning results.`,
  barbershop: (s) => `Experience the confidence of our ${s.toLowerCase()} delivered by master barbers with precision skill and premium grooming products.`,
  cleaning: (s) => `Enjoy a spotless space with our ${s.toLowerCase()} service, delivered by vetted professionals using eco-friendly products and thorough techniques.`,
  petcare: (s) => `Give your furry companion the best with our ${s.toLowerCase()}, delivered by certified animal care specialists in a safe, loving environment.`,
  law: (s) => `Our ${s.toLowerCase()} practice provides expert legal representation, strategic counsel, and dedicated advocacy to protect your interests.`,
  accounting: (s) => `Our ${s.toLowerCase()} service is delivered by certified professionals who provide clear, accurate financial guidance to protect and grow your wealth.`,
  dental: (s) => `Our ${s.toLowerCase()} service combines the latest dental technology with gentle, expert care to ensure your comfort and a beautiful, healthy smile.`,
  hotel: (s) => `Experience world-class ${s.toLowerCase()} services, thoughtfully curated for maximum comfort, relaxation, and unforgettable hospitality.`,
  events: (s) => `Let our expert team bring your vision to life with our ${s.toLowerCase()} — flawless planning, creative design, and seamless execution for every occasion.`,
  catering: (s) => `Elevate your event with our ${s.toLowerCase()}, featuring bespoke menus crafted by our executive chefs from the finest seasonal ingredients.`,
  tech: (s) => `Leverage our ${s.toLowerCase()} to drive innovation, efficiency, and competitive advantage with scalable, enterprise-grade technology solutions.`,
  startup: (s) => `Accelerate your growth with our ${s.toLowerCase()}, built with cutting-edge technology and customer-centric design by our passionate team.`,
  consulting: (s) => `Unlock your growth potential with our ${s.toLowerCase()}, delivered by senior consultants with decades of industry experience and a proven track record.`,
  healthcare: (s) => `Receive compassionate, expert ${s.toLowerCase()} services from our board-certified physicians using the latest medical technology and patient-centred approaches.`,
  ecommerce: (s) => `Shop our premium ${s.toLowerCase()} with confidence — curated for quality, competitively priced, and delivered with fast, reliable service.`,
  realestate: (s) => `Navigate your property journey with our expert ${s.toLowerCase()} service, backed by deep market knowledge and dedicated, personalised guidance.`,
  education: (s) => `Advance your skills with our ${s.toLowerCase()} programme, led by qualified instructors with industry-recognised certifications and flexible schedules.`,
  service: (s) => `Our expert ${s.toLowerCase()} is tailored to your unique needs, delivering reliable results with professionalism and a satisfaction guarantee.`,
  portfolio: (s) => `Explore our creative ${s.toLowerCase()} service, blending design excellence with strategic thinking to deliver impactful, user-centred solutions.`,
  agency: (s) => `Elevate your brand with our ${s.toLowerCase()} service, combining strategic insight, creative design, and data-driven execution for measurable growth.`,
  default: (s) => `Our ${s.toLowerCase()} service is delivered by experienced professionals with a commitment to quality, reliability, and your complete satisfaction.`,
};

class EnhancedContentGenerator {
  private getConfig(businessType: BusinessType | string): ContentConfig {
    return configs[businessType] || configs.default;
  }

  generateHeadline(businessName: string, businessType: BusinessType | string): string {
    const { headlines } = this.getConfig(businessType);
    return headlines[0];
  }

  generateSubheadline(businessName: string, businessType: BusinessType | string): string {
    const { subheadlines } = this.getConfig(businessType);
    return subheadlines[0];
  }

  generateAboutText(businessName: string, businessType: BusinessType | string, city?: string): string {
    const { aboutTemplate } = this.getConfig(businessType);
    return aboutTemplate(businessName, city);
  }

  generateCTAText(businessType: BusinessType | string, variant: 'primary' | 'secondary' = 'primary'): string {
    const { ctas } = this.getConfig(businessType);
    return ctas[variant];
  }

  generateValuePropositions(businessName: string, businessType: BusinessType | string): string[] {
    return this.getConfig(businessType).valueProps;
  }

  generateSEODescription(businessName: string, businessType: BusinessType | string, city?: string): string {
    const { seoSuffix } = this.getConfig(businessType);
    return `${businessName}${city ? ` - ${city}` : ''} | Professional ${seoSuffix} delivering excellence, quality, and unmatched customer satisfaction.`;
  }

  generateServiceDescriptions(
    businessType: BusinessType | string,
    services: string[],
  ): ServiceDescription[] {
    const template = serviceDescriptionTemplates[businessType] || serviceDescriptionTemplates.default;
    return services.map((service) => ({
      name: service,
      description: template(service),
    }));
  }
}

export default new EnhancedContentGenerator();
