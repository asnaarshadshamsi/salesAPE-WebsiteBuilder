import { BusinessData } from "../types/landing";

export const sampleData: BusinessData = {
  brand: {
    name: "Acme Studio",
    tagline: "Design that moves people",
  },
  hero: {
    headline: "We craft digital experiences that inspire",
    subheadline:
      "A full-service creative studio helping brands stand out through bold design, seamless technology, and strategic thinking.",
    cta: { label: "Get Started", href: "#contact" },
    secondaryCta: { label: "View Our Work", href: "#services" },
  },
  about: {
    title: "Who We Are",
    description:
      "We're a team of designers, developers, and strategists passionate about creating meaningful digital products. With over a decade of experience, we've helped hundreds of brands transform their online presence and connect with their audience in powerful new ways.",
  },
  features: {
    title: "What Sets Us Apart",
    subtitle: "Built on principles that deliver results",
    items: [
      {
        icon: "✦",
        title: "Human-Centered Design",
        description:
          "Every pixel is placed with your users in mind. We create intuitive experiences that feel natural.",
      },
      {
        icon: "◈",
        title: "Performance First",
        description:
          "Lightning-fast load times and smooth interactions. We don't compromise on speed.",
      },
      {
        icon: "▲",
        title: "Scalable Architecture",
        description:
          "Built to grow with your business. Our solutions adapt as your needs evolve.",
      },
      {
        icon: "●",
        title: "Data-Driven Decisions",
        description:
          "We measure everything. Real insights guide our creative process for maximum impact.",
      },
      {
        icon: "◆",
        title: "Ongoing Partnership",
        description:
          "We're not just vendors — we're collaborators invested in your long-term success.",
      },
      {
        icon: "■",
        title: "Rapid Delivery",
        description:
          "Agile workflows and clear communication mean your project launches on time, every time.",
      },
    ],
  },
  stats: {
    items: [
      { value: "200+", label: "Projects Delivered" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "12", label: "Years Experience" },
      { value: "50+", label: "Team Members" },
    ],
  },
  testimonials: {
    title: "What Our Clients Say",
    items: [
      {
        quote:
          "Acme Studio transformed our brand entirely. The results exceeded every expectation we had.",
        author: "Sarah Chen",
        role: "CEO, TechFlow",
      },
      {
        quote:
          "Working with this team was seamless. They understood our vision from day one and delivered beautifully.",
        author: "Marcus Rivera",
        role: "Founder, GreenLeaf",
      },
      {
        quote:
          "The attention to detail is remarkable. Our conversion rates doubled within three months of launch.",
        author: "Emily Nakamura",
        role: "CMO, Stride Health",
      },
    ],
  },
  services: {
    title: "Our Services",
    subtitle: "End-to-end solutions for the modern brand",
    items: [
      {
        title: "Brand Identity",
        description:
          "Logo design, visual systems, and brand guidelines that capture your essence.",
      },
      {
        title: "Web Development",
        description:
          "Custom websites and web applications built with cutting-edge technology.",
      },
      {
        title: "Digital Marketing",
        description:
          "SEO, content strategy, and campaigns that drive meaningful growth.",
      },
    ],
  },
  cta: {
    title: "Ready to start your project?",
    description:
      "Let's create something extraordinary together. Get in touch and we'll bring your vision to life.",
    buttonLabel: "Contact Us",
    buttonHref: "#contact",
  },
  footer: {
    description:
      "Crafting digital experiences that move people forward.",
    links: [
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" },
      { label: "Privacy", href: "#" },
    ],
    copyright: "© 2026 Acme Studio. All rights reserved.",
  },
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "Features", href: "#features" },
      { label: "Services", href: "#services" },
      { label: "Testimonials", href: "#testimonials" },
      { label: "Contact", href: "#contact" },
    ],
  },
};
