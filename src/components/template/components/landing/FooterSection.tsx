import { BusinessData } from "../../types/landing";

interface FooterSectionProps {
  data: NonNullable<BusinessData["footer"]>;
  brandName: string;
}

const FooterSection = ({ data, brandName }: FooterSectionProps) => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-sm">
            <div className="font-display text-lg font-bold text-foreground mb-2">
              {brandName}
            </div>
            {data.description && (
              <p className="text-sm text-muted-foreground">
                {data.description}
              </p>
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
