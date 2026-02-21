import { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface InstrumentsSectionProps {
  className?: string;
}

const InstrumentsSection = ({ className = '' }: InstrumentsSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      scrollTl.fromTo(
        headlineRef.current,
        { y: '-8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0
      );
      scrollTl.fromTo(
        cardsRef.current?.children || [],
        { y: '60vh', opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, stagger: 0.08, ease: 'none' },
        0.05
      );

      // SETTLE (30% - 70%)

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        cardsRef.current?.children || [],
        { y: 0, opacity: 1 },
        { y: '-18vh', opacity: 0, stagger: 0.03, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-6vh', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleInstrumentClick = (instrumentName: string) => {
    navigate(`/kereses?instrument=${encodeURIComponent(instrumentName)}`);
  };

  const instruments = [
    {
      name: 'ZONGORA',
      styles: 'Klasszikus / Jazz / Pop',
      image: '/images/instrument_piano.jpg',
      searchName: 'Zongora',
    },
    {
      name: 'GITÁR',
      styles: 'Akusztikus / Elektromos / Basszus',
      image: '/images/instrument_guitar.jpg',
      searchName: 'Gitár',
    },
    {
      name: 'ÉNEK',
      styles: 'Jazz / Klasszikus / Musical',
      image: '/images/instrument_voice.jpg',
      searchName: 'Ének',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="instruments"
      className={`section-pinned bg-[#F4F2EE] ${className}`}
    >
      {/* Headline */}
      <div
        ref={headlineRef}
        className="absolute"
        style={{
          left: '6vw',
          top: '10vh',
          width: '40vw',
        }}
      >
        <h2 className="text-heading font-semibold mb-3">
          Válassz hangszert.
        </h2>
        <p className="text-[#6F6A63] text-lg mb-4">
          Kezdő vagy haladó—találj tanárt a stílusodhoz.
        </p>
      </div>

      {/* Instrument Cards */}
      <div
        ref={cardsRef}
        className="absolute flex gap-[3vw]"
        style={{
          left: '6vw',
          top: '30vh',
          width: '88vw',
        }}
      >
        {instruments.map((instrument, index) => (
          <div
            key={index}
            onClick={() => handleInstrumentClick(instrument.searchName)}
            className="card-float bg-white overflow-hidden cursor-pointer group"
            style={{
              width: '26vw',
              height: '56vh',
            }}
          >
            <div className="relative h-full">
              <img
                src={instrument.image}
                alt={instrument.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute top-4 left-4">
                <span className="mono text-xs text-white/80 uppercase tracking-widest">
                  {instrument.styles}
                </span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <h3 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {instrument.name}
                </h3>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#D7A04D] transition-colors">
                  <ArrowUpRight size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstrumentsSection;
