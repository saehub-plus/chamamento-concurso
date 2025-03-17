
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import '@/components/ui/header.css';

export function HeaderWrapper() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className={`header-container ${isScrolled ? 'scrolled' : ''}`}>
      <Header />
    </div>
  );
}
