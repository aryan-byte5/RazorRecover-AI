"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Zap, ArrowRight, ShieldCheck, Github } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/80 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
            RazorRecover <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono font-semibold">AI</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <Link href="/features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="/architecture" className="hover:text-foreground transition-colors">
            Architecture
          </Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">
            API Docs
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <span>Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
