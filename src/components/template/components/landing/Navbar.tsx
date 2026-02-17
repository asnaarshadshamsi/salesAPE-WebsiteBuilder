"use client";

import { motion } from "framer-motion";
import { BusinessData } from "../../types/landing";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  data: BusinessData;
}

const Navbar = ({ data }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-display text-xl font-bold tracking-tight text-foreground">
          {data.brand.logo ? (
            <img src={data.brand.logo} alt={data.brand.name} className="h-8" />
          ) : (
            data.brand.name
          )}
        </a>

        {data.nav && (
          <>
            <div className="hidden md:flex items-center gap-8">
              {data.nav.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {data.hero.cta && (
                <a
                  href={data.hero.cta.href}
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {data.hero.cta.label}
                </a>
              )}
            </div>

            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        )}
      </div>

      {mobileOpen && data.nav && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background border-b border-border px-6 pb-4"
        >
          {data.nav.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
