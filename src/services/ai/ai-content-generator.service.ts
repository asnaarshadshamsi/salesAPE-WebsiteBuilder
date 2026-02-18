/**
 * AI Content Generator Service
 * Generates missing content using LLM when scraping doesn't find data
 * Ensures ALL template fields are filled with business-specific content
 */

import { BusinessType } from '@/types';

const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.cohere_api_key || '';
const COHERE_API_URL = 'https://api.cohere.ai/v1';

interface BusinessContext {
  name: string;
  businessType: BusinessType;
  description?: string;
  industry?: string;
  category?: string;
  services?: string[];
  targetAudience?: string;
  tone?: string;
}

interface GeneratedContent {
  headline?: string;
  subheadline?: string;
  services?: string[];
  features?: string[];
  aboutText?: string;
  testimonials?: Array<{ name: string; text: string; rating: number }>;
  stats?: Array<{ value: string; label: string }>;
  ctaText?: string;
  tagline?: string;
  metaDescription?: string;
}

export class AIContentGeneratorService {
  /**
   * Generate missing content using AI
   */
  async generateMissingContent(
    context: BusinessContext,
    missingFields: string[]
  ): Promise<GeneratedContent> {
    console.log('[AIContentGenerator] Generating content for missing fields:', missingFields);

    if (!COHERE_API_KEY) {
      console.log('[AIContentGenerator] No API key, using intelligent fallbacks');
      return this.generateFallbackContent(context, missingFields);
    }

    try {
      const prompt = this.buildGenerationPrompt(context, missingFields);
      const response = await this.callCohere(prompt);
      
      if (response) {
        return this.parseGeneratedContent(response, missingFields);
      }
      
      return this.generateFallbackContent(context, missingFields);
    } catch (error) {
      console.error('[AIContentGenerator] Error:', error);
      return this.generateFallbackContent(context, missingFields);
    }
  }

  /**
   * Build prompt for content generation
   */
  private buildGenerationPrompt(context: BusinessContext, missingFields: string[]): string {
    const fieldsToGenerate = missingFields.join(', ');

    return `You are a professional copywriter creating compelling content for a ${context.businessType} business.

Business Context:
- Name: ${context.name}
- Type: ${context.businessType}
- Industry: ${context.industry || 'Not specified'}
- Category: ${context.category || 'Not specified'}
- Description: ${context.description || 'Professional business'}
- Target Audience: ${context.targetAudience || 'General customers'}
- Tone: ${context.tone || 'professional and modern'}
${context.services?.length ? `- Existing Services: ${context.services.join(', ')}` : ''}

Generate the following missing content fields (${fieldsToGenerate}). Return ONLY a valid JSON object:

{
  ${missingFields.includes('headline') ? '"headline": "Compelling headline (5-10 words)",' : ''}
  ${missingFields.includes('subheadline') ? '"subheadline": "Engaging subheadline that explains value (10-20 words)",' : ''}
  ${missingFields.includes('services') ? '"services": ["Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Service 6"],' : ''}
  ${missingFields.includes('features') ? '"features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],' : ''}
  ${missingFields.includes('aboutText') ? '"aboutText": "Compelling about text (50-100 words)",' : ''}
  ${missingFields.includes('testimonials') ? '"testimonials": [{"name": "Client Name", "text": "Authentic testimonial", "rating": 5}, {"name": "Client Name 2", "text": "Another testimonial", "rating": 5}, {"name": "Client Name 3", "text": "Third testimonial", "rating": 5}],' : ''}
  ${missingFields.includes('stats') ? '"stats": [{"value": "Stat 1", "label": "Label 1"}, {"value": "Stat 2", "label": "Label 2"}, {"value": "Stat 3", "label": "Label 3"}, {"value": "Stat 4", "label": "Label 4"}],' : ''}
  ${missingFields.includes('ctaText') ? '"ctaText": "Action-oriented CTA",' : ''}
  ${missingFields.includes('tagline') ? '"tagline": "Memorable tagline (3-6 words)",' : ''}
  ${missingFields.includes('metaDescription') ? '"metaDescription": "SEO-optimized description (120-160 characters)"' : ''}
}

Create content that is:
- Specific to ${context.businessType} businesses
- Professional and compelling
- Authentic and believable
- Tailored to ${context.targetAudience || 'the target audience'}
- Written in a ${context.tone || 'professional'} tone

JSON output:`;
  }

  /**
   * Call Cohere API
   */
  private async callCohere(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(`${COHERE_API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Cohere-Version': '2022-12-06',
        },
        body: JSON.stringify({
          model: 'command',
          prompt,
          max_tokens: 1500,
          temperature: 0.7,
          stop_sequences: ['--END--'],
        }),
      });

      if (!response.ok) {
        console.error('[AIContentGenerator] Cohere API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.generations?.[0]?.text?.trim() || null;
    } catch (error) {
      console.error('[AIContentGenerator] Cohere request failed:', error);
      return null;
    }
  }

  /**
   * Parse generated content from LLM response
   */
  private parseGeneratedContent(response: string, missingFields: string[]): GeneratedContent {
    try {
      let jsonStr = response;
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      const result: GeneratedContent = {};

      if (missingFields.includes('headline') && parsed.headline) {
        result.headline = parsed.headline;
      }
      if (missingFields.includes('subheadline') && parsed.subheadline) {
        result.subheadline = parsed.subheadline;
      }
      if (missingFields.includes('services') && Array.isArray(parsed.services)) {
        result.services = parsed.services.filter(Boolean);
      }
      if (missingFields.includes('features') && Array.isArray(parsed.features)) {
        result.features = parsed.features.filter(Boolean);
      }
      if (missingFields.includes('aboutText') && parsed.aboutText) {
        result.aboutText = parsed.aboutText;
      }
      if (missingFields.includes('testimonials') && Array.isArray(parsed.testimonials)) {
        result.testimonials = parsed.testimonials.map((t: any) => ({
          name: t.name || 'Customer',
          text: t.text || '',
          rating: t.rating || 5,
        }));
      }
      if (missingFields.includes('stats') && Array.isArray(parsed.stats)) {
        result.stats = parsed.stats.map((s: any) => ({
          value: s.value || '',
          label: s.label || '',
        }));
      }
      if (missingFields.includes('ctaText') && parsed.ctaText) {
        result.ctaText = parsed.ctaText;
      }
      if (missingFields.includes('tagline') && parsed.tagline) {
        result.tagline = parsed.tagline;
      }
      if (missingFields.includes('metaDescription') && parsed.metaDescription) {
        result.metaDescription = parsed.metaDescription;
      }

      return result;
    } catch (error) {
      console.error('[AIContentGenerator] Failed to parse response:', error);
      return {};
    }
  }

  /**
   * Generate fallback content when LLM is unavailable
   */
  private generateFallbackContent(context: BusinessContext, missingFields: string[]): GeneratedContent {
    const result: GeneratedContent = {};

    const templates = this.getBusinessTypeTemplates(context.businessType);

    if (missingFields.includes('headline')) {
      result.headline = templates.headlines[0]
        .replace('{name}', context.name)
        .replace('{category}', context.category || context.industry || '');
    }

    if (missingFields.includes('subheadline')) {
      result.subheadline = templates.subheadlines[0]
        .replace('{name}', context.name)
        .replace('{category}', context.category || context.industry || '');
    }

    if (missingFields.includes('services')) {
      result.services = templates.defaultServices;
    }

    if (missingFields.includes('features')) {
      result.features = templates.defaultFeatures;
    }

    if (missingFields.includes('aboutText')) {
      result.aboutText = templates.aboutTemplate
        .replace('{name}', context.name)
        .replace('{businessType}', context.businessType);
    }

    if (missingFields.includes('testimonials')) {
      result.testimonials = templates.sampleTestimonials;
    }

    if (missingFields.includes('stats')) {
      result.stats = templates.defaultStats;
    }

    if (missingFields.includes('ctaText')) {
      result.ctaText = templates.primaryCTA;
    }

    if (missingFields.includes('tagline')) {
      result.tagline = templates.tagline.replace('{name}', context.name);
    }

    if (missingFields.includes('metaDescription')) {
      result.metaDescription = `${context.name} - Professional ${context.businessType} services. ${context.description || templates.metaDescSuffix}`;
    }

    return result;
  }

  /**
   * Get business-type-specific templates
   */
  private getBusinessTypeTemplates(businessType: BusinessType) {
    const templates: Record<BusinessType, any> = {
      agency: {
        headlines: [
          'Transform Your Brand with Creative Excellence',
          'Where Strategy Meets Creativity',
          'Elevate Your Digital Presence',
        ],
        subheadlines: [
          'Award-winning creative agency delivering innovative solutions that drive results',
          'We partner with ambitious brands to create memorable experiences',
        ],
        defaultServices: [
          'Brand Strategy',
          'Creative Design',
          'Digital Marketing',
          'Content Creation',
          'Social Media Management',
          'Web Development',
        ],
        defaultFeatures: [
          'Expert Team',
          'Data-Driven Results',
          'Creative Excellence',
          'On-Time Delivery',
        ],
        aboutTemplate: '{name} is a creative agency dedicated to helping businesses grow through innovative design and strategic marketing. We combine creativity with data-driven insights to deliver exceptional results.',
        sampleTestimonials: [
          { name: 'Michael Chen', text: 'Working with them transformed our brand. The results exceeded our expectations.', rating: 5 },
          { name: 'Sarah Johnson', text: 'Professional, creative, and always on time. Highly recommended!', rating: 5 },
          { name: 'David Martinez', text: 'Their strategic approach helped us achieve amazing growth.', rating: 5 },
        ],
        defaultStats: [
          { value: '100+', label: 'Projects Completed' },
          { value: '50+', label: 'Happy Clients' },
          { value: '98%', label: 'Client Satisfaction' },
          { value: '24/7', label: 'Support Available' },
        ],
        primaryCTA: 'Start Your Project',
        tagline: 'Creative Solutions, Real Results',
        metaDescSuffix: 'Comprehensive creative and digital marketing services.',
        bookingTitle: 'Book a Strategy Session',
        bookingSubtitle: 'Transform your brand with our expert team. Schedule a strategy session to discuss your goals and explore creative solutions.',
      },
      ecommerce: {
        headlines: [
          'Shop the Latest Collection',
          'Quality Products, Unbeatable Prices',
          'Your One-Stop Online Store',
        ],
        subheadlines: [
          'Discover premium products with fast shipping and easy returns',
          'Shop with confidence - quality guaranteed',
        ],
        defaultServices: [
          'Fast Shipping',
          'Easy Returns',
          'Secure Checkout',
          '24/7 Customer Support',
          'Price Match Guarantee',
          'Gift Wrapping',
        ],
        defaultFeatures: [
          'Free Shipping Over $50',
          '30-Day Returns',
          'Secure Payment',
          'Quality Guarantee',
        ],
        aboutTemplate: '{name} offers a curated selection of premium products. We are committed to providing exceptional quality, competitive prices, and outstanding customer service.',
        sampleTestimonials: [
          { name: 'Jessica Lee', text: 'Great products and super fast shipping! Will definitely order again.', rating: 5 },
          { name: 'Robert Taylor', text: 'Excellent quality and customer service. Very satisfied with my purchase.', rating: 5 },
          { name: 'Amanda White', text: 'Best online shopping experience I have had. Highly recommend!', rating: 5 },
        ],
        defaultStats: [
          { value: '10K+', label: 'Products' },
          { value: '50K+', label: 'Happy Customers' },
          { value: '4.9★', label: 'Average Rating' },
          { value: '24hrs', label: 'Fast Shipping' },
        ],
        primaryCTA: 'Shop Now',
        tagline: 'Quality You Can Trust',
        metaDescSuffix: 'Shop premium products with fast shipping and easy returns.',
        bookingTitle: 'Book a Personal Consultation',
        bookingSubtitle: 'Get personalized recommendations and expert advice. Schedule a consultation to find the perfect products for your needs.',
      },
      restaurant: {
        headlines: [
          'Experience Culinary Excellence',
          'Where Every Meal is a Celebration',
          'Authentic Flavors, Memorable Moments',
        ],
        subheadlines: [
          'Fresh ingredients • Authentic recipes • Exceptional dining experience',
          'Savor the taste of tradition with a modern twist',
        ],
        defaultServices: [
          'Dine-In Service',
          'Takeout',
          'Delivery',
          'Private Events',
          'Catering',
          'Reservations',
        ],
        defaultFeatures: [
          'Fresh Daily Ingredients',
          'Expert Chefs',
          'Cozy Atmosphere',
          'Full Bar',
        ],
        aboutTemplate: '{name} brings you an unforgettable dining experience. Our passionate chefs create each dish with fresh ingredients and authentic recipes that celebrate flavor.',
        sampleTestimonials: [
          { name: 'Emily Rodriguez', text: 'The best dining experience! Food was amazing and service was impeccable.', rating: 5 },
          { name: 'James Wilson', text: 'Fantastic atmosphere and delicious food. Our new favorite restaurant!', rating: 5 },
          { name: 'Lisa Anderson', text: 'Every dish was perfect. Can not wait to come back!', rating: 5 },
        ],
        defaultStats: [
          { value: '5★', label: 'Average Rating' },
          { value: '15+', label: 'Years Experience' },
          { value: '100+', label: 'Menu Items' },
          { value: 'Daily', label: 'Fresh Ingredients' },
        ],
        primaryCTA: 'Reserve a Table',
        tagline: 'Taste the Difference',
        metaDescSuffix: 'Fresh ingredients, authentic recipes, and exceptional dining.',
        bookingTitle: 'Reserve Your Table',
        bookingSubtitle: 'Secure your spot for an unforgettable dining experience. Book your table now and let us prepare something special for you.',
      },
      fitness: {
        headlines: [
          'Transform Your Life Today',
          'Achieve Your Fitness Goals',
          'Your Journey to Better Health Starts Here',
        ],
        subheadlines: [
          'Expert trainers • Proven programs • Real results',
          'Join a community dedicated to your success',
        ],
        defaultServices: [
          'Personal Training',
          'Group Classes',
          'Nutrition Coaching',
          'Online Programs',
          'Fitness Assessments',
          'Recovery Sessions',
        ],
        defaultFeatures: [
          'Expert Trainers',
          'State-of-the-Art Equipment',
          'Flexible Schedules',
          'Personalized Plans',
        ],
        aboutTemplate: '{name} is dedicated to helping you achieve your fitness goals. Our experienced trainers provide personalized programs and ongoing support to ensure your success.',
        sampleTestimonials: [
          { name: 'Mark Stevens', text: 'Lost 30 pounds and feel amazing! Best investment I have ever made.', rating: 5 },
          { name: 'Rachel Green', text: 'The trainers are incredible. They really care about your progress.', rating: 5 },
          { name: 'Kevin Brown', text: 'Great facility and even better results. Highly recommend!', rating: 5 },
        ],
        defaultStats: [
          { value: '500+', label: 'Members' },
          { value: '95%', label: 'Success Rate' },
          { value: '10+', label: 'Expert Trainers' },
          { value: '24/7', label: 'Gym Access' },
        ],
        primaryCTA: 'Start Training',
        tagline: 'Get Fit, Stay Strong',
        metaDescSuffix: 'Professional training programs for all fitness levels.',
        bookingTitle: 'Schedule Your First Session',
        bookingSubtitle: 'Start your fitness journey today. Book a complimentary consultation with our expert trainers to create your personalized plan.',
      },
      healthcare: {
        headlines: [
          'Your Health, Our Priority',
          'Comprehensive Care You Can Trust',
          'Expert Medical Services',
        ],
        subheadlines: [
          'Experienced professionals • Modern facilities • Patient-centered care',
          'Providing compassionate healthcare for you and your family',
        ],
        bookingTitle: 'Book Your Appointment',
        bookingSubtitle: 'Access quality healthcare when you need it. Schedule your appointment with our experienced medical professionals today.',
        bookingCTA: 'Book Appointment',
        defaultServices: [
          'General Consultations',
          'Preventive Care',
          'Specialist Referrals',
          'Lab Services',
          'Emergency Care',
          'Follow-up Care',
        ],
        defaultFeatures: [
          'Board-Certified Doctors',
          'Modern Equipment',
          'Insurance Accepted',
          'Same-Day Appointments',
        ],
        aboutTemplate: '{name} provides comprehensive healthcare services with a focus on patient well-being. Our experienced medical professionals are dedicated to your health.',
        sampleTestimonials: [
          { name: 'Susan Parker', text: 'Excellent care and very professional staff. I feel confident in their expertise.', rating: 5 },
          { name: 'Thomas Hill', text: 'They take time to listen and explain everything clearly. Highly recommended.', rating: 5 },
          { name: 'Jennifer Moore', text: 'Best healthcare experience. Caring staff and quality treatment.', rating: 5 },
        ],
        defaultStats: [
          { value: '20+', label: 'Years Experience' },
          { value: '10K+', label: 'Patients Served' },
          { value: '98%', label: 'Satisfaction Rate' },
          { value: '24/7', label: 'Emergency Care' },
        ],
        primaryCTA: 'Book Appointment',
        tagline: 'Quality Care, Compassionate Service',
        metaDescSuffix: 'Comprehensive healthcare services for you and your family.',
      },
      beauty: {
        headlines: [
          'Enhance Your Natural Beauty',
          'Where Beauty Meets Expertise',
          'Premium Beauty Services',
        ],
        subheadlines: [
          'Expert stylists • Premium products • Relaxing atmosphere',
          'Treat yourself to luxury and rejuvenation',
        ],
        bookingTitle: 'Book Your Beauty Treatment',
        bookingSubtitle: 'Treat yourself to professional beauty services. Reserve your appointment and experience luxury and relaxation.',
        bookingCTA: 'Book Appointment',
        defaultServices: [
          'Hair Styling',
          'Color Services',
          'Spa Treatments',
          'Skin Care',
          'Makeup Services',
          'Nail Care',
        ],
        defaultFeatures: [
          'Expert Stylists',
          'Premium Products',
          'Relaxing Environment',
          'Personalized Service',
        ],
        aboutTemplate: '{name} offers premium beauty services in a relaxing atmosphere. Our skilled professionals use only the finest products to help you look and feel your best.',
        sampleTestimonials: [
          { name: 'Nicole Turner', text: 'Amazing service! I always leave feeling beautiful and refreshed.', rating: 5 },
          { name: 'Catherine Davis', text: 'The best salon experience. Professional and talented staff.', rating: 5 },
          { name: 'Olivia Martinez', text: 'Love my new look! They really understand what I want.', rating: 5 },
        ],
        defaultStats: [
          { value: '15+', label: 'Years Experience' },
          { value: '5K+', label: 'Happy Clients' },
          { value: '4.9★', label: 'Average Rating' },
          { value: '100%', label: 'Satisfaction' },
        ],
        primaryCTA: 'Book Now',
        tagline: 'Bringing Out Your Best',
        metaDescSuffix: 'Premium beauty and spa services for your complete transformation.',
      },
      service: {
        headlines: [
          'Professional Services You Can Trust',
          'Expert Solutions for Your Needs',
          'Quality Service, Every Time',
        ],
        subheadlines: [
          'Experienced professionals • Reliable service • Customer satisfaction guaranteed',
          'Delivering excellence in every project',
        ],
        bookingTitle: 'Schedule a Consultation',
        bookingSubtitle: "Let's discuss your project. Book a free consultation with our experts to explore how we can help achieve your goals.",
        bookingCTA: 'Book Consultation',
        defaultServices: [
          'Consultation',
          'Project Planning',
          'Implementation',
          'Ongoing Support',
          'Maintenance',
          'Training',
        ],
        defaultFeatures: [
          'Expert Team',
          'Quality Guarantee',
          'Competitive Pricing',
          'Timely Delivery',
        ],
        aboutTemplate: '{name} provides professional {businessType} services with a commitment to quality and customer satisfaction. We deliver reliable solutions tailored to your needs.',
        sampleTestimonials: [
          { name: 'Brian Cooper', text: 'Excellent service from start to finish. Very professional and efficient.', rating: 5 },
          { name: 'Michelle Young', text: 'They exceeded our expectations. Would definitely recommend!', rating: 5 },
          { name: 'Daniel King', text: 'Quality work and great communication throughout the project.', rating: 5 },
        ],
        defaultStats: [
          { value: '10+', label: 'Years Experience' },
          { value: '500+', label: 'Projects' },
          { value: '98%', label: 'Client Satisfaction' },
          { value: '24/7', label: 'Support' },
        ],
        primaryCTA: 'Get Started',
        tagline: 'Professional Service, Exceptional Results',
        metaDescSuffix: 'Professional services delivered with excellence.',
      },
      portfolio: {
        headlines: [
          'Creative Work That Stands Out',
          'Building Digital Experiences',
          'Where Innovation Meets Design',
        ],
        subheadlines: [
          'Passionate creator • Innovative solutions • Quality craftsmanship',
          'Turning ideas into reality',
        ],
        defaultServices: [
          'Design',
          'Development',
          'Consulting',
          'Branding',
          'Strategy',
          'Iteration',
        ],
        defaultFeatures: [
          'Innovative Approach',
          'Attention to Detail',
          'Client Collaboration',
          'Timely Delivery',
        ],
        aboutTemplate: '{name} creates innovative digital solutions. With a focus on quality and creativity, I help bring ideas to life.',
        sampleTestimonials: [
          { name: 'Alex Foster', text: 'Exceptional work! Creative solutions and professional delivery.', rating: 5 },
          { name: 'Sophia Lewis', text: 'Great to work with. Understood our vision perfectly.', rating: 5 },
          { name: 'Chris Allen', text: 'High-quality work and excellent communication. Recommended!', rating: 5 },
        ],
        defaultStats: [
          { value: '50+', label: 'Projects' },
          { value: '30+', label: 'Happy Clients' },
          { value: '5+', label: 'Years Experience' },
          { value: '100%', label: 'Dedication' },
        ],
        primaryCTA: 'View Portfolio',
        tagline: 'Crafting Digital Excellence',
        metaDescSuffix: 'Creative professional delivering innovative solutions.',
        bookingTitle: 'Schedule a Discovery Call',
        bookingSubtitle: 'Ready to start your project? Book a consultation to discuss your vision and how we can bring it to life.',
      },
      realestate: {
        headlines: [
          'Find Your Dream Home',
          'Your Trusted Real Estate Partner',
          'Making Your Property Dreams Reality',
        ],
        subheadlines: [
          'Expert guidance • Local expertise • Exceptional service',
          'Navigate your real estate journey with confidence',
        ],
        defaultServices: [
          'Property Buying',
          'Property Selling',
          'Property Management',
          'Market Analysis',
          'Home Staging',
          'Investment Consulting',
        ],
        defaultFeatures: [
          'Local Market Expertise',
          'Personalized Service',
          'Proven Track Record',
          'Negotiation Skills',
        ],
        aboutTemplate: '{name} is dedicated to helping you find the perfect property. With deep local knowledge and years of experience, we make real estate simple.',
        sampleTestimonials: [
          { name: 'Linda Mitchell', text: 'Found us our dream home! Professional and patient throughout.', rating: 5 },
          { name: 'George Scott', text: 'Excellent agent who really knows the market. Highly recommend!', rating: 5 },
          { name: 'Patricia Adams', text: 'Made selling our home stress-free. Great experience!', rating: 5 },
        ],
        defaultStats: [
          { value: '200+', label: 'Properties Sold' },
          { value: '15+', label: 'Years Experience' },
          { value: '98%', label: 'Client Satisfaction' },
          { value: '$50M+', label: 'Sales Volume' },
        ],
        primaryCTA: 'Browse Properties',
        tagline: 'Your Journey Home Starts Here',
        metaDescSuffix: 'Expert real estate services for buyers and sellers.',
        bookingTitle: 'Schedule a Property Viewing',
        bookingSubtitle: 'Find your dream property. Book a viewing or consultation with our experienced real estate professionals today.',
      },
      education: {
        headlines: [
          'Learn, Grow, Succeed',
          'Quality Education for All',
          'Your Path to Success',
        ],
        subheadlines: [
          'Expert instructors • Flexible learning • Proven results',
          'Empowering students to achieve their goals',
        ],
        defaultServices: [
          'Online Courses',
          'In-Person Classes',
          'One-on-One Tutoring',
          'Group Sessions',
          'Exam Preparation',
          'Career Counseling',
        ],
        defaultFeatures: [
          'Expert Instructors',
          'Flexible Schedule',
          'Interactive Learning',
          'Career Support',
        ],
        aboutTemplate: '{name} provides quality education and training. Our experienced instructors are committed to helping students achieve their academic and career goals.',
        sampleTestimonials: [
          { name: 'Ashley Bennett', text: 'Excellent instruction and supportive environment. Passed with flying colors!', rating: 5 },
          { name: 'Timothy Clark', text: 'Great learning experience. The instructors are knowledgeable and patient.', rating: 5 },
          { name: 'Karen Wright', text: 'Highly recommend! They really care about student success.', rating: 5 },
        ],
        defaultStats: [
          { value: '1K+', label: 'Students' },
          { value: '95%', label: 'Success Rate' },
          { value: '20+', label: 'Expert Instructors' },
          { value: '50+', label: 'Courses' },
        ],
        primaryCTA: 'Enroll Now',
        tagline: 'Invest in Your Future',
        metaDescSuffix: 'Quality education and training for success.',
        bookingTitle: 'Schedule a Campus Tour',
        bookingSubtitle: 'Discover our programs and facilities. Book a campus tour or consultation to learn how we can help you achieve your educational goals.',
      },
      startup: {
        headlines: [
          'Innovation That Changes Everything',
          'Building the Future Today',
          'Where Technology Meets Vision',
        ],
        subheadlines: [
          'Cutting-edge solutions • User-focused design • Scalable technology',
          'Transforming industries through innovation',
        ],
        defaultServices: [
          'Product Development',
          'Technology Consulting',
          'Cloud Solutions',
          'Integration Services',
          'Technical Support',
          'Custom Development',
        ],
        defaultFeatures: [
          'Innovative Technology',
          'User-Centric Design',
          'Scalable Solutions',
          'Expert Support',
        ],
        aboutTemplate: '{name} is revolutionizing the industry with innovative solutions. We combine cutting-edge technology with user-focused design to solve real problems.',
        sampleTestimonials: [
          { name: 'Eric Campbell', text: 'Game-changing product! Exactly what we needed for our business.', rating: 5 },
          { name: 'Maria Garcia', text: 'Innovative solution with excellent support. Highly recommended!', rating: 5 },
          { name: 'Andrew Phillips', text: 'Streamlined our entire workflow. Amazing results!', rating: 5 },
        ],
        defaultStats: [
          { value: '10K+', label: 'Active Users' },
          { value: '99.9%', label: 'Uptime' },
          { value: '24/7', label: 'Support' },
          { value: '4.8★', label: 'User Rating' },
        ],
        primaryCTA: 'Get Started',
        tagline: 'Innovation for Everyone',
        metaDescSuffix: 'Innovative technology solutions for modern businesses.',
      },
      other: {
        headlines: [
          'Professional Services',
          'Quality Solutions',
          'Your Trusted Partner',
        ],
        subheadlines: [
          'Professional service • Expert solutions • Customer focused',
          'Delivering quality results you can trust',
        ],
        defaultServices: [
          'Consultation',
          'Planning',
          'Implementation',
          'Support',
          'Maintenance',
          'Training',
        ],
        defaultFeatures: [
          'Professional Service',
          'Quality Results',
          'Customer Support',
          'Competitive Pricing',
        ],
        aboutTemplate: '{name} provides professional services with a focus on quality and customer satisfaction. We are dedicated to delivering excellent results.',
        sampleTestimonials: [
          { name: 'John Smith', text: 'Excellent service and professional approach. Very satisfied!', rating: 5 },
          { name: 'Mary Johnson', text: 'Quality work delivered on time. Would definitely use again.', rating: 5 },
          { name: 'Robert Brown', text: 'Professional and reliable. Highly recommend their services.', rating: 5 },
        ],
        defaultStats: [
          { value: '100+', label: 'Clients' },
          { value: '5+', label: 'Years Experience' },
          { value: '95%', label: 'Satisfaction' },
          { value: '24/7', label: 'Support' },
        ],
        primaryCTA: 'Get Started',
        tagline: 'Quality Service Guaranteed',
        metaDescSuffix: 'Professional services delivered with excellence.',
      },
    };

    return templates[businessType] || templates.other;
  }
}

export const aiContentGeneratorService = new AIContentGeneratorService();
