"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Mail, Phone, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export function Footer() {
  // Use state to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState(2025); // Default to the current year
  
  // Update the year client-side to avoid hydration mismatch
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-8">
      <div className="container mx-auto py-10 px-4">
        {/* Top section with logo and main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-3">
              <Image 
                src="/logo.svg" 
                alt="Calculate.ng Logo" 
                width={140} 
                height={40} 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Your comprehensive Nigerian calculator suite
            </p>
          </div>
          
          {/* Contact information */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <h3 className="text-sm font-semibold mb-2">Contact Us</h3>
            <Link 
              href="mailto:support@devchi.me" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              support@devchi.me
            </Link>
            <Link 
              href="tel:+2347011655197" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              +234 701 165 5197
            </Link>
          </div>
          
          {/* Social links and build info */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-sm font-semibold mb-2">Connect With Us</h3>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/devchijay" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary p-2 rounded-full transition-all"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link 
                href="https://x.com/devchijay" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary p-2 rounded-full transition-all"
                aria-label="X (formerly Twitter)"
              >
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-border my-6"></div>
        
        {/* Bottom section with copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {currentYear} <a href="https://devchi.me">Devchi Digital</a>. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center">
            Made with <Heart className="h-3 w-3 text-red-500 mx-1" /> in Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}
