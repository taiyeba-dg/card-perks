import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, UtensilsCrossed, Car, ShoppingCart, Package, Star } from "lucide-react";
import { Link } from "react-router-dom";

const vouchers = [
  { name: "Flipkart", id: "flipkart", category: "Shopping", discount: "Up to 7%", icon: ShoppingBag, best: false },
  { name: "Zomato", id: "zomato", category: "Food & Dining", discount: "Up to 10%", icon: UtensilsCrossed, best: true },
  { name: "Uber", id: "uber", category: "Travel & Rides", discount: "Up to 5%", icon: Car, best: false },
  { name: "BigBasket", id: "bigbasket", category: "Groceries", discount: "Up to 8%", icon: ShoppingCart, best: false },
  { name: "Amazon", id: "amazon", category: "Shopping", discount: "Up to 6%", icon: Package, best: false },
];

export default function PopularVouchers() {
  return (
    <section className="py-10 sm:py-16 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-7 sm:mb-12"
        >
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-gold mb-3">Popular Vouchers</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Trending <span className="gold-gradient">Brands</span>
            </h2>
          </div>
          <Link
            to="/vouchers"
            className="hidden sm:flex items-center gap-1 text-sm text-gold hover:text-gold-light transition-colors group"
          >
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* ── Mobile: horizontal scrollable pills ───────────────────── */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-hide">
            {vouchers.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex-shrink-0 snap-start"
              >
                <Link
                  to="/vouchers"
                  className="flex flex-col items-center gap-2.5 glass-card rounded-2xl p-4 w-28 active:scale-95 transition-transform"
                  style={{ borderTop: '2px solid hsl(var(--gold))' }}
                >
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                      <v.icon className="w-5 h-5 text-gold" />
                    </div>
                    {v.best && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 fill-background text-background" />
                      </span>
                    )}
                  </div>
                  {/* Name */}
                  <p className="text-xs font-semibold text-center leading-tight">{v.name}</p>
                  {/* Rate */}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-semibold whitespace-nowrap">
                    {v.discount}
                  </span>
                </Link>
              </motion.div>
            ))}

            {/* View all pill */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex-shrink-0 snap-start self-center"
            >
              <Link
                to="/vouchers"
                className="flex flex-col items-center justify-center gap-2 glass-card rounded-2xl p-4 w-28 h-full min-h-[6.5rem] border border-gold/20 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-gold" />
                </div>
                <span className="text-[10px] font-semibold text-gold text-center">View All</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── Desktop: grid ──────────────────────────────────────────── */}
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {vouchers.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to="/vouchers"
                className="block tilt-card glass-card rounded-2xl p-4 sm:p-6 group cursor-pointer relative overflow-hidden"
                style={{ borderTop: '3px solid hsl(var(--gold))' }}
              >
                {v.best && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    Best Rate
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gold/10">
                    <v.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{v.name}</h3>
                    <p className="text-xs text-muted-foreground">{v.category}</p>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">
                  {v.discount}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link
          to="/vouchers"
          className="sm:hidden flex items-center justify-center gap-1 text-sm text-gold mt-6 hover:text-gold-light transition-colors"
        >
          View All Vouchers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
