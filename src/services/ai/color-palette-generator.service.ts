/**
 * Business Color Palette Generator
 * Generates psychologically researched color palettes per business type
 */

import type { BusinessType } from '@/types/business';

export interface BusinessColorPalette {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  gradients: {
    hero: string;
    cta: string;
    card: string;
  };
  mood: string;
  businessRationale: string;
}

// Business-type colour psychology presets
const palettes: Record<BusinessType | 'default', BusinessColorPalette> = {
  // ── Luxury / Scent ──────────────────────────────────────
  perfume: {
    palette: {
      primary:    '#6B3F6B',   // deep plum
      secondary:  '#C8A97A',   // warm gold
      accent:     '#E8D5C4',   // soft blush
      background: '#FAF7F5',
      surface:    '#FFFFFF',
      text:       '#1C1117',
      textMuted:  '#7A6872',
      border:     '#EDE0D9',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #6B3F6B 0%, #C8A97A 100%)',
      cta:  'linear-gradient(135deg, #6B3F6B 0%, #8B5E8B 100%)',
      card: 'linear-gradient(135deg, #FAF7F5 0%, #F0E8E6 100%)',
    },
    mood: 'luxury',
    businessRationale: 'Deep plum and warm gold evoke luxury, sensuality and exclusivity — the hallmarks of fine fragrance.',
  },

  // ── Food & Beverage ──────────────────────────────────────
  restaurant: {
    palette: {
      primary:    '#C0392B',
      secondary:  '#E67E22',
      accent:     '#F39C12',
      background: '#FFF8F0',
      surface:    '#FFFFFF',
      text:       '#2C1810',
      textMuted:  '#7D6355',
      border:     '#FAEBD7',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #C0392B 0%, #E67E22 100%)',
      cta:  'linear-gradient(135deg, #C0392B 0%, #E74C3C 100%)',
      card: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 100%)',
    },
    mood: 'warm',
    businessRationale: 'Warm reds and oranges stimulate appetite and create welcoming, energetic dining atmospheres.',
  },

  cafe: {
    palette: {
      primary:    '#6F4E37',   // coffee brown
      secondary:  '#D4A574',   // caramel
      accent:     '#F5E6D3',   // cream
      background: '#FDFAF6',
      surface:    '#FFFFFF',
      text:       '#2C1A0E',
      textMuted:  '#8B6355',
      border:     '#EDE0D0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #6F4E37 0%, #D4A574 100%)',
      cta:  'linear-gradient(135deg, #6F4E37 0%, #8B6045 100%)',
      card: 'linear-gradient(135deg, #FDFAF6 0%, #F5E6D3 100%)',
    },
    mood: 'cozy',
    businessRationale: 'Earthy coffee tones and creamy accents create the warm, inviting aesthetic of artisanal cafés.',
  },

  bakery: {
    palette: {
      primary:    '#C27C4C',
      secondary:  '#E8B89A',
      accent:     '#F9E4C8',
      background: '#FFFBF5',
      surface:    '#FFFFFF',
      text:       '#3B2010',
      textMuted:  '#8A6A50',
      border:     '#F0DEC8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #C27C4C 0%, #E8B89A 100%)',
      cta:  'linear-gradient(135deg, #C27C4C 0%, #D4934F 100%)',
      card: 'linear-gradient(135deg, #FFFBF5 0%, #FFF0DC 100%)',
    },
    mood: 'warm',
    businessRationale: 'Biscuit and caramel tones communicate freshness, warmth, and artisan craftsmanship.',
  },

  catering: {
    palette: {
      primary:    '#B5451B',
      secondary:  '#D4892A',
      accent:     '#F0C060',
      background: '#FFF9F0',
      surface:    '#FFFFFF',
      text:       '#2A1005',
      textMuted:  '#7A5540',
      border:     '#EDD9C0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #B5451B 0%, #D4892A 100%)',
      cta:  'linear-gradient(135deg, #B5451B 0%, #CC6022 100%)',
      card: 'linear-gradient(135deg, #FFF9F0 0%, #FFECD4 100%)',
    },
    mood: 'warm',
    businessRationale: 'Rich oranges and golds communicate festivity, celebration and delicious food experiences.',
  },

  // ── Wellness & Beauty ──────────────────────────────────────
  beauty: {
    palette: {
      primary:    '#C2185B',
      secondary:  '#E91E8C',
      accent:     '#FCE4EC',
      background: '#FFF0F5',
      surface:    '#FFFFFF',
      text:       '#1A0010',
      textMuted:  '#7A4060',
      border:     '#FAD7E8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #C2185B 0%, #E91E8C 100%)',
      cta:  'linear-gradient(135deg, #C2185B 0%, #D81B70 100%)',
      card: 'linear-gradient(135deg, #FFF0F5 0%, #FFE0ED 100%)',
    },
    mood: 'elegant',
    businessRationale: 'Feminine rose and vibrant pink hues evoke glamour, confidence, and modern beauty.',
  },

  spa: {
    palette: {
      primary:    '#4A7C7C',   // teal sage
      secondary:  '#9BBBBB',
      accent:     '#D4EAE8',
      background: '#F5FAFA',
      surface:    '#FFFFFF',
      text:       '#1A2E2E',
      textMuted:  '#6A8A8A',
      border:     '#D8EAEA',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #4A7C7C 0%, #9BBBBB 100%)',
      cta:  'linear-gradient(135deg, #4A7C7C 0%, #5A9090 100%)',
      card: 'linear-gradient(135deg, #F5FAFA 0%, #E5F5F5 100%)',
    },
    mood: 'serene',
    businessRationale: 'Cool sage and teal evoke calm, healing, and the tranquility of premium wellness retreats.',
  },

  barbershop: {
    palette: {
      primary:    '#1A3A6B',
      secondary:  '#C8A84B',
      accent:     '#E8DCA8',
      background: '#F7F5F0',
      surface:    '#FFFFFF',
      text:       '#0D1A2E',
      textMuted:  '#556070',
      border:     '#D8D0C0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1A3A6B 0%, #C8A84B 100%)',
      cta:  'linear-gradient(135deg, #1A3A6B 0%, #2A4A7E 100%)',
      card: 'linear-gradient(135deg, #F7F5F0 0%, #EDE8E0 100%)',
    },
    mood: 'classic',
    businessRationale: 'Navy and gold convey tradition, craftsmanship, and the timeless prestige of master grooming.',
  },

  // ── Retail ──────────────────────────────────────
  ecommerce: {
    palette: {
      primary:    '#4F46E5',
      secondary:  '#7C3AED',
      accent:     '#E0D7FF',
      background: '#F8F8FF',
      surface:    '#FFFFFF',
      text:       '#0F0B1E',
      textMuted:  '#60558A',
      border:     '#E0DCFF',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      cta:  'linear-gradient(135deg, #4F46E5 0%, #6355D5 100%)',
      card: 'linear-gradient(135deg, #F8F8FF 0%, #F0EDFF 100%)',
    },
    mood: 'modern',
    businessRationale: 'Indigo and violet signal trust, creativity, and a contemporary shopping experience.',
  },

  jewelry: {
    palette: {
      primary:    '#2C2C2C',
      secondary:  '#B8972A',
      accent:     '#F0E0A0',
      background: '#FAFAF8',
      surface:    '#FFFFFF',
      text:       '#1A1A1A',
      textMuted:  '#808070',
      border:     '#E8E4D8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #2C2C2C 0%, #B8972A 100%)',
      cta:  'linear-gradient(135deg, #2C2C2C 0%, #404040 100%)',
      card: 'linear-gradient(135deg, #FAFAF8 0%, #F4F0E8 100%)',
    },
    mood: 'luxury',
    businessRationale: 'Charcoal and gold express timeless luxury, exclusivity, and precious craftsmanship.',
  },

  flowershop: {
    palette: {
      primary:    '#D63384',
      secondary:  '#6F42C1',
      accent:     '#FFEAF4',
      background: '#FFF8FC',
      surface:    '#FFFFFF',
      text:       '#1A001A',
      textMuted:  '#805060',
      border:     '#FFD8EC',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #D63384 0%, #6F42C1 100%)',
      cta:  'linear-gradient(135deg, #D63384 0%, #E04090 100%)',
      card: 'linear-gradient(135deg, #FFF8FC 0%, #FFEAF4 100%)',
    },
    mood: 'romantic',
    businessRationale: 'Vibrant pinks and purples capture the beauty, emotion, and natural vibrancy of fresh flowers.',
  },

  // ── Health & Fitness ──────────────────────────────────────
  fitness: {
    palette: {
      primary:    '#E63900',
      secondary:  '#FF6B35',
      accent:     '#FFF0E8',
      background: '#0F0F0F',
      surface:    '#1A1A1A',
      text:       '#FFFFFF',
      textMuted:  '#A0A0A0',
      border:     '#2A2A2A',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #E63900 0%, #FF6B35 100%)',
      cta:  'linear-gradient(135deg, #E63900 0%, #FF4D00 100%)',
      card: 'linear-gradient(135deg, #1A1A1A 0%, #222222 100%)',
    },
    mood: 'energetic',
    businessRationale: 'Bold oranges on dark backgrounds create high-energy contrast suited to fitness and performance brands.',
  },

  gym: {
    palette: {
      primary:    '#FF3D00',
      secondary:  '#FF6D00',
      accent:     '#FFE0B2',
      background: '#0A0A0A',
      surface:    '#181818',
      text:       '#FFFFFF',
      textMuted:  '#909090',
      border:     '#282828',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #FF3D00 0%, #FF6D00 100%)',
      cta:  'linear-gradient(135deg, #FF3D00 0%, #F44336 100%)',
      card: 'linear-gradient(135deg, #181818 0%, #202020 100%)',
    },
    mood: 'energetic',
    businessRationale: 'Fiery reds on black evoke power, intensity, and the raw energy of serious training environments.',
  },

  yoga: {
    palette: {
      primary:    '#7B5EA7',
      secondary:  '#A78BCA',
      accent:     '#EDE0FF',
      background: '#F8F5FF',
      surface:    '#FFFFFF',
      text:       '#1A1028',
      textMuted:  '#7060A0',
      border:     '#E0D5F8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #7B5EA7 0%, #A78BCA 100%)',
      cta:  'linear-gradient(135deg, #7B5EA7 0%, #8868B0 100%)',
      card: 'linear-gradient(135deg, #F8F5FF 0%, #EDE0FF 100%)',
    },
    mood: 'serene',
    businessRationale: 'Soft lavenders and purples communicate mindfulness, spirituality, and peaceful transformation.',
  },

  healthcare: {
    palette: {
      primary:    '#0077B6',
      secondary:  '#00B4D8',
      accent:     '#CAF0F8',
      background: '#F0F9FF',
      surface:    '#FFFFFF',
      text:       '#03045E',
      textMuted:  '#4080A0',
      border:     '#B8E0F0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
      cta:  'linear-gradient(135deg, #0077B6 0%, #0099D4 100%)',
      card: 'linear-gradient(135deg, #F0F9FF 0%, #E0F4FF 100%)',
    },
    mood: 'trustworthy',
    businessRationale: 'Clinical blues convey medical expertise, trust, and the calm professionalism of quality healthcare.',
  },

  dental: {
    palette: {
      primary:    '#0891B2',
      secondary:  '#06B6D4',
      accent:     '#CFFAFE',
      background: '#F0FEFF',
      surface:    '#FFFFFF',
      text:       '#0C2A34',
      textMuted:  '#407080',
      border:     '#B8EAF0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
      cta:  'linear-gradient(135deg, #0891B2 0%, #0A9EC0 100%)',
      card: 'linear-gradient(135deg, #F0FEFF 0%, #E0FAFF 100%)',
    },
    mood: 'clean',
    businessRationale: 'Fresh teals and whites convey hygiene, precision, and modern dental excellence.',
  },

  petcare: {
    palette: {
      primary:    '#FF8C00',
      secondary:  '#FFB347',
      accent:     '#FFF3CC',
      background: '#FFFBF0',
      surface:    '#FFFFFF',
      text:       '#2A1800',
      textMuted:  '#8A6030',
      border:     '#FFE5A0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #FF8C00 0%, #FFB347 100%)',
      cta:  'linear-gradient(135deg, #FF8C00 0%, #FF9B00 100%)',
      card: 'linear-gradient(135deg, #FFFBF0 0%, #FFF5D8 100%)',
    },
    mood: 'playful',
    businessRationale: 'Warm oranges and yellows radiate joy, friendliness, and the loving care pets deserve.',
  },

  cleaning: {
    palette: {
      primary:    '#00897B',
      secondary:  '#4DB6AC',
      accent:     '#E0F2F1',
      background: '#F0FAFA',
      surface:    '#FFFFFF',
      text:       '#00241E',
      textMuted:  '#409090',
      border:     '#B2DFDB',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)',
      cta:  'linear-gradient(135deg, #00897B 0%, #00998A 100%)',
      card: 'linear-gradient(135deg, #F0FAFA 0%, #E0F5F5 100%)',
    },
    mood: 'fresh',
    businessRationale: 'Crisp teals and greens communicate cleanliness, freshness, and professional thoroughness.',
  },

  // ── Professional Services ──────────────────────────────────────
  service: {
    palette: {
      primary:    '#1E40AF',
      secondary:  '#3B82F6',
      accent:     '#DBEAFE',
      background: '#F0F4FF',
      surface:    '#FFFFFF',
      text:       '#0B1733',
      textMuted:  '#4060A0',
      border:     '#BFCFE8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      cta:  'linear-gradient(135deg, #1E40AF 0%, #2550BF 100%)',
      card: 'linear-gradient(135deg, #F0F4FF 0%, #E0EBFF 100%)',
    },
    mood: 'professional',
    businessRationale: 'Deep blues communicate competence, stability, and professional reliability.',
  },

  law: {
    palette: {
      primary:    '#1A1A2E',
      secondary:  '#8B7355',
      accent:     '#D4C5A9',
      background: '#F8F6F2',
      surface:    '#FFFFFF',
      text:       '#1A1A2E',
      textMuted:  '#6B6050',
      border:     '#E4DDD0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1A1A2E 0%, #8B7355 100%)',
      cta:  'linear-gradient(135deg, #1A1A2E 0%, #2A2A40 100%)',
      card: 'linear-gradient(135deg, #F8F6F2 0%, #F0EBE2 100%)',
    },
    mood: 'authoritative',
    businessRationale: 'Dark navy and warm gold project authority, gravitas, and trustworthy legal professionalism.',
  },

  accounting: {
    palette: {
      primary:    '#0D6A3A',
      secondary:  '#1A9E58',
      accent:     '#D4F0E0',
      background: '#F2FCF5',
      surface:    '#FFFFFF',
      text:       '#082A18',
      textMuted:  '#406850',
      border:     '#B8E8CC',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0D6A3A 0%, #1A9E58 100%)',
      cta:  'linear-gradient(135deg, #0D6A3A 0%, #128040 100%)',
      card: 'linear-gradient(135deg, #F2FCF5 0%, #E4F8EC 100%)',
    },
    mood: 'trustworthy',
    businessRationale: 'Financial green communicates growth, stability, and the prosperity that clients seek.',
  },

  consulting: {
    palette: {
      primary:    '#2D3A8C',
      secondary:  '#5E6DC8',
      accent:     '#E0E4FF',
      background: '#F5F6FF',
      surface:    '#FFFFFF',
      text:       '#0F1240',
      textMuted:  '#5060A8',
      border:     '#CCD0F0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #2D3A8C 0%, #5E6DC8 100%)',
      cta:  'linear-gradient(135deg, #2D3A8C 0%, #3A4AA0 100%)',
      card: 'linear-gradient(135deg, #F5F6FF 0%, #EAECFF 100%)',
    },
    mood: 'corporate',
    businessRationale: 'Strategic blue-violet builds confidence in expertise and forward-thinking consultancy.',
  },

  agency: {
    palette: {
      primary:    '#7C3AED',
      secondary:  '#A855F7',
      accent:     '#F3E8FF',
      background: '#FAF5FF',
      surface:    '#FFFFFF',
      text:       '#1E0038',
      textMuted:  '#7050A8',
      border:     '#E9D5FF',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
      cta:  'linear-gradient(135deg, #7C3AED 0%, #8B48F0 100%)',
      card: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
    },
    mood: 'creative',
    businessRationale: 'Bold purple signals creativity, innovation, and the bold thinking that leading agencies deliver.',
  },

  tech: {
    palette: {
      primary:    '#0EA5E9',
      secondary:  '#6366F1',
      accent:     '#E0F2FE',
      background: '#040A20',
      surface:    '#0C1530',
      text:       '#E0EEFF',
      textMuted:  '#80A0C8',
      border:     '#1A2A4A',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
      cta:  'linear-gradient(135deg, #0EA5E9 0%, #0CC0F0 100%)',
      card: 'linear-gradient(135deg, #0C1530 0%, #121C38 100%)',
    },
    mood: 'futuristic',
    businessRationale: 'Electric blue and indigo on dark backgrounds communicate cutting-edge tech innovation.',
  },

  startup: {
    palette: {
      primary:    '#06B6D4',
      secondary:  '#8B5CF6',
      accent:     '#E0F7FF',
      background: '#F5FEFF',
      surface:    '#FFFFFF',
      text:       '#041020',
      textMuted:  '#406080',
      border:     '#B0E8F8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
      cta:  'linear-gradient(135deg, #06B6D4 0%, #09C8E0 100%)',
      card: 'linear-gradient(135deg, #F5FEFF 0%, #E8F8FF 100%)',
    },
    mood: 'innovative',
    businessRationale: 'Energetic cyan-violet blends communicate disruptive innovation and tech optimism.',
  },

  // ── Hospitality & Events ──────────────────────────────────────
  hotel: {
    palette: {
      primary:    '#1B2C4E',
      secondary:  '#C9A84C',
      accent:     '#F0E6C8',
      background: '#FDFAF4',
      surface:    '#FFFFFF',
      text:       '#0D1520',
      textMuted:  '#606858',
      border:     '#E5DCC0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1B2C4E 0%, #C9A84C 100%)',
      cta:  'linear-gradient(135deg, #1B2C4E 0%, #263A60 100%)',
      card: 'linear-gradient(135deg, #FDFAF4 0%, #F5F0E0 100%)',
    },
    mood: 'luxury',
    businessRationale: 'Deep navy and champagne gold communicate five-star hospitality and sophisticated elegance.',
  },

  events: {
    palette: {
      primary:    '#C2185B',
      secondary:  '#7B1FA2',
      accent:     '#FCE4EC',
      background: '#FFF8FC',
      surface:    '#FFFFFF',
      text:       '#1A0020',
      textMuted:  '#804060',
      border:     '#F8C8E0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #C2185B 0%, #7B1FA2 100%)',
      cta:  'linear-gradient(135deg, #C2185B 0%, #D01A6A 100%)',
      card: 'linear-gradient(135deg, #FFF8FC 0%, #FFF0F8 100%)',
    },
    mood: 'festive',
    businessRationale: 'Rich magenta-purple conveys celebration, excitement, and unforgettable event experiences.',
  },

  // ── Other ──────────────────────────────────────
  portfolio: {
    palette: {
      primary:    '#334155',
      secondary:  '#64748B',
      accent:     '#F1F5F9',
      background: '#F8FAFC',
      surface:    '#FFFFFF',
      text:       '#0F172A',
      textMuted:  '#64748B',
      border:     '#E2E8F0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #334155 0%, #64748B 100%)',
      cta:  'linear-gradient(135deg, #334155 0%, #475569 100%)',
      card: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    },
    mood: 'minimal',
    businessRationale: 'Refined slate tones let work speak for itself with understated creative confidence.',
  },

  realestate: {
    palette: {
      primary:    '#1E3A2F',
      secondary:  '#2D6A4F',
      accent:     '#D8F3DC',
      background: '#F0FAF2',
      surface:    '#FFFFFF',
      text:       '#0A1F14',
      textMuted:  '#407058',
      border:     '#B8E0C0',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1E3A2F 0%, #2D6A4F 100%)',
      cta:  'linear-gradient(135deg, #1E3A2F 0%, #284838 100%)',
      card: 'linear-gradient(135deg, #F0FAF2 0%, #E0F5E4 100%)',
    },
    mood: 'trustworthy',
    businessRationale: 'Forest greens evoke growth, stability, and the natural aspiration of premium real estate.',
  },

  education: {
    palette: {
      primary:    '#1565C0',
      secondary:  '#1E88E5',
      accent:     '#E3F2FD',
      background: '#F0F8FF',
      surface:    '#FFFFFF',
      text:       '#0A1A40',
      textMuted:  '#406090',
      border:     '#BBDEFB',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
      cta:  'linear-gradient(135deg, #1565C0 0%, #1870CC 100%)',
      card: 'linear-gradient(135deg, #F0F8FF 0%, #E4F2FF 100%)',
    },
    mood: 'academic',
    businessRationale: 'Classic academic blue evokes knowledge, trust, and the pursuit of intellectual excellence.',
  },

  photography: {
    palette: {
      primary:    '#1A1A1A',
      secondary:  '#D4A847',
      accent:     '#F5EFD8',
      background: '#FAFAFA',
      surface:    '#FFFFFF',
      text:       '#0A0A0A',
      textMuted:  '#707070',
      border:     '#E8E8E8',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #1A1A1A 0%, #D4A847 100%)',
      cta:  'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
      card: 'linear-gradient(135deg, #FAFAFA 0%, #F4F4F4 100%)',
    },
    mood: 'artistic',
    businessRationale: 'Classic black with gold accent honours photographic craft and the prestige of visual storytelling.',
  },

  other: {
    palette: {
      primary:    '#4F46E5',
      secondary:  '#6366F1',
      accent:     '#EEF2FF',
      background: '#F9FAFB',
      surface:    '#FFFFFF',
      text:       '#111827',
      textMuted:  '#6B7280',
      border:     '#E5E7EB',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
      cta:  'linear-gradient(135deg, #4F46E5 0%, #5850EC 100%)',
      card: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    },
    mood: 'modern',
    businessRationale: 'Versatile indigo-violet works across business contexts with modern appeal.',
  },

  default: {
    palette: {
      primary:    '#4F46E5',
      secondary:  '#6366F1',
      accent:     '#EEF2FF',
      background: '#F9FAFB',
      surface:    '#FFFFFF',
      text:       '#111827',
      textMuted:  '#6B7280',
      border:     '#E5E7EB',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
      cta:  'linear-gradient(135deg, #4F46E5 0%, #5850EC 100%)',
      card: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    },
    mood: 'modern',
    businessRationale: 'Clean indigo palette provides a modern, trustworthy foundation for any business.',
  },
};

/**
 * Retrieve a colour palette for a given business type.
 * Falls back to `default` for unknown types.
 */
export function generateBusinessColorPalette(
  businessType: BusinessType | string,
  _businessName?: string
): BusinessColorPalette {
  const key = businessType as BusinessType;
  return palettes[key] ?? palettes.default;
}

export default generateBusinessColorPalette;
