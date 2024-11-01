"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function TopLeftLogo() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (!isHomePage) {
    return (
      <div className="absolute top-4 left-6 z-[99]">
        <Image
          src="/wordware.png"
          alt="WordWare Logo"
          width={200}
          height={120}
          className="object-contain"
        />
      </div>
    );
  }

  // Only render on homepage after intro animation
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 2.5 }}
      className="absolute top-[-2em] left-3 z-[99]"
    >
      <Image
        src="/wordware.png"
        alt="WordWare Logo"
        width={200}
        height={120}
        className="object-contain"
      />
    </motion.div>
  );
}
