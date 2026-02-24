import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Ladease" className="h-8 md:h-12 w-auto object-contain" />
        </a>

        {/* Desktop Links (Dynamic) */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <li>
              <a href="/shop" className="font-body text-sm tracking-widest uppercase text-foreground transition-colors duration-300 font-semibold">
                Shop All
              </a>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <a
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="font-body text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Actions (Search & Cart) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-32 md:w-48 bg-transparent border-b border-foreground/30 text-sm focus:outline-none focus:border-foreground py-1 px-2 pr-6"
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-0 text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} aria-label="Search" className="text-foreground hover:text-accent transition-colors">
                <Search size={20} />
              </button>
            )}
          </div>

          <button aria-label="Cart" className="text-foreground hover:text-accent transition-colors relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-gold text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-body font-semibold">
              0
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="py-8 px-6">
              <form onSubmit={handleSearchSubmit} className="mb-6 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border-none rounded-md py-3 px-4 pl-10 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </form>

              <ul className="flex flex-col gap-6">
                <li>
                  <a
                    href="/shop"
                    className="font-body text-sm tracking-widest uppercase text-foreground font-semibold block"
                    onClick={() => setIsOpen(false)}
                  >
                    Shop All
                  </a>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`/shop?category=${encodeURIComponent(c.name)}`}
                      className="font-body text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors block"
                      onClick={() => setIsOpen(false)}
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
