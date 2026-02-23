import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils";

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.slice(0, 3))) // Show top 3
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-6 bg-secondary/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl text-gradient-gold">
            New Arrivals
          </h2>
          <p className="font-body text-muted-foreground mt-3">
            Fresh pieces for your wardrobe
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group cursor-pointer"
              onClick={() => window.location.href = `/product/${product.id}`}
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-4 bg-muted">
                {product.image_url ? (
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    No Image
                  </div>
                )}
                {/* {product.tag && (
                  <span className="absolute top-4 left-4 bg-foreground text-background font-body text-xs tracking-wider uppercase px-3 py-1">
                    {product.tag}
                  </span>
                )} */}
              </div>
              <h3 className="font-body text-sm tracking-wide text-foreground group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              <p className="font-body text-sm text-muted-foreground mt-1">
                ₹{Number(product.price).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="/shop"
            className="font-body text-sm tracking-widest uppercase text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
          >
            View All New Arrivals
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals;
