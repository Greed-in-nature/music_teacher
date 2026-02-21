import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import PostAdModal from '@/components/PostAdModal';

gsap.registerPlugin(ScrollTrigger);

interface FinalCTASectionProps {
  className?: string;
}

const FinalCTASection = ({ className = '' }: FinalCTASectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postAdModalOpen, setPostAdModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ctaRef.current,
        { y: '6vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSearchTeachers = () => {
    const teachersSection = document.querySelector('#teachers');
    if (teachersSection) {
      teachersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePostAd = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      setPostAdModalOpen(true);
    }
  };

  return (
    <>
      <section
        ref={sectionRef}
        className={`relative ${className}`}
      >
        {/* CTA Panel */}
        <div
          ref={ctaRef}
          className="bg-[#111111] text-white py-24 px-[6vw]"
          style={{ borderRadius: '0 0 28px 28px' }}
        >
          <div ref={contentRef} className="max-w-2xl mx-auto text-center">
            <h2 className="text-heading font-semibold mb-4">
              Kezdj bele ma.
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Böngéssz, válassz, és foglalj időpontot percek alatt.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleSearchTeachers}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium bg-[#D7A04D] text-white hover:bg-[#c99445] transition-colors"
              >
                <Search size={18} />
                Tanárok keresése
              </button>
              <button 
                onClick={handlePostAd}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                <Plus size={18} />
                Hirdetés feladása
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#F4F2EE] py-16 px-[6vw]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Logo & Description */}
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  ZeneTanár.hu
                </h3>
                <p className="text-sm text-[#6F6A63] leading-relaxed">
                  Találd meg a tökéletes zenetanárt Magyarországon. 
                  Több száz ellenőrzött tanár vár rád.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold mb-4">Navigáció</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#teachers" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      Tanárok
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      Árak
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      Hogyan működik?
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      Kapcsolat
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold mb-4">Jogi információk</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      ÁSZF
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      Adatvédelem
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-[#6F6A63] hover:text-[#D7A04D] transition-colors">
                      Cookie szabályzat
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-[#111111]/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#6F6A63]">
                © 2026 ZeneTanár.hu. Minden jog fenntartva.
              </p>
              <p className="text-sm text-[#6F6A63]">
                Készült Magyarországon
              </p>
            </div>
          </div>
        </footer>
      </section>

      {/* Modals */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab="login"
      />
      <PostAdModal 
        open={postAdModalOpen} 
        onOpenChange={setPostAdModalOpen}
      />
    </>
  );
};

export default FinalCTASection;
