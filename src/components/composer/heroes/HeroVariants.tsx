/**
 * Hero Section Variants
 * Dynamic hero components that adapt to brand tone
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export interface HeroData {
  title: string;
  subtitle: string;
  description?: string;
  ctaText: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  image?: string;
  backgroundImage?: string;
}

interface HeroProps {
  data: HeroData;
  variant: 'background' | 'split' | 'centered' | 'gradient';
  tone: string;
}

/**
 * Hero with Full Background Image
 * Best for: Luxury, Bold brands
 */
export function HeroBackgroundImage({ data, tone }: Omit<HeroProps, 'variant'>) {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      {data.backgroundImage && (
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={data.backgroundImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
            style={{ 
              fontWeight: tone === 'luxury' ? 300 : tone === 'bold' ? 800 : 700 
            }}
          >
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-3xl mx-auto font-light">
            {data.subtitle}
          </p>
          {data.description && (
            <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90">
              {data.description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="text-lg px-8 py-6 bg-white text-black hover:bg-gray-100"
              >
                {data.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            {data.secondaryCtaText && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-black"
                >
                  {data.secondaryCtaText}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Hero with Split Layout
 * Best for: Corporate, Minimal brands
 */
export function HeroSplitLayout({ data, tone }: Omit<HeroProps, 'variant'>) {
  return (
    <section className="min-h-screen flex items-center py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {data.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {data.subtitle}
            </p>
            {data.description && (
              <p className="text-lg text-muted-foreground mb-10">
                {data.description}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="lg" className="text-lg px-8 py-6">
                  {data.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              {data.secondaryCtaText && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    {data.secondaryCtaText}

                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl"
          >
            {data.image && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <Image
                  src={data.image}
                  alt={data.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Hero with Centered Text
 * Best for: Minimal, Editorial brands
 */
export function HeroCentered({ data, tone }: Omit<HeroProps, 'variant'>) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight"
            style={{
              lineHeight: tone === 'editorial' ? '1.2' : '1.1',
            }}
          >
            {data.title}
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-10 font-light">
            {data.subtitle}
          </p>
          {data.description && (
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <Button size="lg" className="text-lg px-10 py-6">
                {data.ctaText}
              </Button>
            </motion.div>
            
            {data.secondaryCtaText && (
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                  {data.secondaryCtaText}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Optional Image Below */}
        {data.image && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[400px] md:h-[600px] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image
              src={data.image}
              alt={data.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}

/**
 * Hero with Gradient Overlay
 * Best for: Playful, Bold brands
 */
export function HeroGradientOverlay({ data, tone }: Omit<HeroProps, 'variant'>) {
  const gradients = {
    playful: 'from-pink-500 via-purple-500 to-indigo-500',
    bold: 'from-red-600 via-orange-500 to-yellow-500',
    luxury: 'from-gray-900 via-gray-800 to-black',
    minimal: 'from-gray-50 via-white to-gray-50',
    corporate: 'from-blue-900 via-blue-800 to-blue-900',
    editorial: 'from-slate-900 via-slate-800 to-slate-900',
  };

  const gradient = gradients[tone as keyof typeof gradients] || gradients.bold;
  const isLight = tone === 'minimal';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
        />
      </div>

      {/* Background Image with Blend Mode */}
      {data.backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={data.backgroundImage}
            alt="Background"
            fill
            className="object-cover mix-blend-overlay opacity-30"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-6 ${isLight ? 'text-black' : 'text-white'}`}>
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {data.title}
            </motion.h1>
            
            <motion.p 
              className="text-2xl md:text-3xl lg:text-4xl mb-12 font-medium opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {data.subtitle}
            </motion.p>
            
            {data.description && (
              <motion.p 
                className="text-xl md:text-2xl mb-14 opacity-80 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {data.description}
              </motion.p>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  size="lg"
                  className={`text-xl px-12 py-7 rounded-2xl font-bold shadow-2xl ${
                    isLight 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {data.ctaText}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </motion.div>
              
              {data.secondaryCtaText && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    size="lg"
                    variant="outline"
                    className={`text-xl px-12 py-7 rounded-2xl font-bold border-3 ${
                      isLight
                        ? 'border-black text-black hover:bg-black hover:text-white'
                        : 'border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {data.secondaryCtaText}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

/**
 * Main Hero Component with Variant Selection
 */
export default function Hero({ data, variant, tone }: HeroProps) {
  switch (variant) {
    case 'background':
      return <HeroBackgroundImage data={data} tone={tone} />;
    case 'split':
      return <HeroSplitLayout data={data} tone={tone} />;
    case 'centered':
      return <HeroCentered data={data} tone={tone} />;
    case 'gradient':
      return <HeroGradientOverlay data={data} tone={tone} />;
    default:
      return <HeroCentered data={data} tone={tone} />;
  }
}
