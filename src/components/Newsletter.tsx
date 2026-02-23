import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 px-6 bg-gradient-gold">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto text-center max-w-xl"
      >
        <h2 className="font-heading text-3xl md:text-4xl text-background mb-4">
          Stay in the Know
        </h2>
        <p className="font-body text-background/70 mb-8">
          Be the first to hear about new collections, exclusive offers, and styling inspiration.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 bg-transparent border border-background/30 text-background placeholder:text-background/40 px-5 py-3 font-body text-sm tracking-wide focus:outline-none focus:border-background transition-colors"
          />
          <Button variant="newsletter" size="lg" type="submit">
            Subscribe
          </Button>
        </form>
      </motion.div>
    </section>
  );
};

export default Newsletter;
