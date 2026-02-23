const footerLinks = {
  Shop: ["New Arrivals", "Dresses", "Tops", "Outerwear", "Accessories", "Sale"],
  Help: ["Shipping & Returns", "Size Guide", "FAQ", "Contact Us"],
  About: ["Our Story", "Sustainability", "Careers", "Press"],
};

const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <a href="/" className="font-heading text-2xl tracking-wider text-gradient-gold">
              LADEASE
            </a>
            <p className="font-body text-sm text-muted-foreground mt-4 leading-relaxed">
              Timeless elegance for the modern woman. Curated fashion, exceptional quality.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-body text-sm tracking-widest uppercase text-foreground mb-6">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 Ladease. All rights reserved. | Powered By <span className="font-semibold text-foreground">JDeviO TechnoLab</span>
          </p>
          <div className="flex gap-6">
            {["Instagram", "Pinterest", "TikTok"].map((social) => (
              <a
                key={social}
                href="#"
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
