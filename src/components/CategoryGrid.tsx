import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import categoryDresses from "@/assets/category-dresses.jpg";
import categoryTops from "@/assets/category-tops.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import { getImageUrl } from "@/lib/utils";

const fallbackCategories = [
  { name: "Dresses", image: categoryDresses },
  { name: "Tops & Blouses", image: categoryTops },
  { name: "Accessories", image: categoryAccessories },
];

const CategoryGrid = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://thedeepcollection.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(console.error);
  }, []);

  // Use dynamic categories if they have images, otherwise fallback
  const displayCategories = categories.some((c) => c.image_url)
    ? categories.filter((c) => c.image_url)
    : fallbackCategories;

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-3xl md:text-4xl text-center text-foreground mb-16"
        >
          <span className="text-gradient-gold">Shop by Category</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCategories.map((cat, i) => {
            const imgSrc = cat.image_url ? getImageUrl(cat.image_url) : cat.image;
            return (
              <motion.a
                key={cat.id || cat.name}
                href={`/shop`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative overflow-hidden aspect-[3/4] cursor-pointer"
              >
                <img
                  src={imgSrc}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/30 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-heading text-2xl text-primary-foreground">
                    {cat.name}
                  </h3>
                  <p className="font-body text-sm tracking-widest uppercase text-primary-foreground/80 mt-2 group-hover:underline">
                    Explore
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
