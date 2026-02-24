import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/utils";

interface Banner {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  link_url: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "10%" : "-10%",
    opacity: 0,
    scale: 1.05,
    filter: "blur(8px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "10%" : "-10%",
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
    transition: {
      duration: 1,
    },
  }),
};

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://thedeepcollection.com/api/banners")
      .then((res) => res.json())
      .then((data) => {
        setBanners(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch banners", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  if (loading) {
    return <div className="relative h-[80vh] min-h-[600px] w-full bg-gray-100 animate-pulse mt-16 flex items-center justify-center">Loading Banners...</div>;
  }

  if (banners.length === 0) {
    // Fallback if no banners exist
    return (
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden mt-16">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion model"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="relative z-20 container mx-auto h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading text-white mb-6 uppercase tracking-wider">
            Elevate Your <br /> Everyday
          </h1>
          <p className="font-body text-white/90 text-lg md:text-xl max-w-2xl mb-10 tracking-wide font-light">
            Discover our new collection of timeless pieces designed for the modern woman.
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-body tracking-widest uppercase px-8 py-6 text-sm"
            asChild
          >
            <a href="/shop">
              Shop Collection <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden mt-16 bg-black">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 z-10" />
          <img
            src={getImageUrl(banners[currentSlide].image_url)}
            alt={banners[currentSlide].title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="relative z-20 container mx-auto h-full flex flex-col items-center justify-center text-center px-6">
            <motion.div className="overflow-hidden mb-6 pb-2">
              <motion.h1
                initial={{ y: "100%", opacity: 0, rotateZ: 2 }}
                animate={{ y: 0, opacity: 1, rotateZ: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-5xl md:text-7xl lg:text-8xl font-heading text-white uppercase tracking-wider"
              >
                {banners[currentSlide].title}
              </motion.h1>
            </motion.div>

            {banners[currentSlide].subtitle && (
              <motion.div className="overflow-hidden mb-10">
                <motion.p
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="font-body text-white/90 text-lg md:text-xl max-w-2xl tracking-wide font-light"
                >
                  {banners[currentSlide].subtitle}
                </motion.p>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 font-body tracking-widest uppercase px-8 py-6 text-sm group"
                asChild
              >
                <a href={banners[currentSlide].link_url || "/shop"}>
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 backdrop-blur-md border border-white/20 transition-all group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 backdrop-blur-md border border-white/20 transition-all group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4 items-center">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 rounded-full ${currentSlide === index
                  ? "bg-white w-10 h-2"
                  : "bg-white/50 w-2 h-2 hover:bg-white/80 hover:scale-125"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;
