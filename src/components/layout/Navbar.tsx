'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();
  const pathname = usePathname();

  const handleScroll = () => {
    const offset = window.scrollY;
    setScrolled(offset > 50);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isTransparent = pathname === '/' && !scrolled;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isTransparent ? 'bg-transparent' : 'bg-black/80 backdrop-blur-lg'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white tracking-wider">
              Daniela Tattoos
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-lg">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/gallery">Galería</NavLink>
            {isAuthenticated && isAdmin && (
              <NavLink href="/admin">Admin</NavLink>
            )}
          </div>
          <div className="md:hidden">
            {/* Mobile menu button can be added here */}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className="relative text-white font-medium transition-colors hover:text-gray-300"
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="underline"
          className="absolute left-0 -bottom-2 block h-0.5 w-full bg-white"
        />
      )}
    </Link>
  );
}; 