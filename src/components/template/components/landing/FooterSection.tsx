import { BusinessData } from "../../types/landing";

interface FooterSectionProps {
  data: NonNullable<BusinessData["footer"]>;
  brandName: string;
  brandLogo?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

const FooterSection = ({ data, brandName, brandLogo, contact }: FooterSectionProps) => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              {brandLogo ? (
                <img src={brandLogo} alt={brandName} className="w-auto object-contain" style={{width: '80px', height: '32px'}} />
              ) : (
                <div className="font-display text-lg font-bold text-foreground">
                  {brandName}
                </div>
              )}
            </div>
            {data.description && (
              <p className="text-sm text-muted-foreground">
                {data.description}
              </p>
            )}
            {contact && (contact.phone || contact.email || contact.address) && (
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                {contact.phone && (
                  <p>
                    📞{' '}
                    <a 
                      href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </p>
                )}
                {contact.email && (
                  <p>
                    ✉️{' '}
                    <a 
                      href={`mailto:${contact.email}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {contact.email}
                    </a>
                  </p>
                )}
                {contact.address && (
                  <p>📍 {contact.address}</p>
                )}
              </div>
            )}
          </div>

          {data.links && data.links.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {data.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {data.copyright && (
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">{data.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default FooterSection;
