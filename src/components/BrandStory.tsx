import { motion } from "framer-motion";
import brandStory from "@/assets/brand-story.jpg";

const BrandStory = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="overflow-hidden"
          >
            <img
              src={brandStory}
              alt="Our craftsmanship"
              className="w-full h-[500px] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="font-body text-sm tracking-[0.3em] uppercase text-gradient-gold mb-4">
              Our Story
            </p>
            <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-6 leading-tight">
              Crafted with
              <br />
              <span className="italic">Intention</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-6">
              At Ladease, we believe in the power of thoughtful design. Every piece in our collection is crafted with care, using premium fabrics and meticulous attention to detail. Our designs are inspired by the modern woman who values both elegance and comfort.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              From our atelier to your wardrobe, each garment tells a story of artisanal craftsmanship and timeless style.
            </p>
            <a
              href="#"
              className="font-body text-sm tracking-widest uppercase text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
