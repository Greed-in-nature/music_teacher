import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, MapPin } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

const INSTRUMENTS = [
  'Zongora', 'Gitár', 'Hegedű', 'Ének', 'Dob', 
  'Basszusgitár', 'Szaxofon', 'Fuvola', 'Cselló', 'Ukulele'
];

const CITIES = [
  'Budapest', 'Debrecen', 'Szeged', 'Pécs', 'Győr', 'Miskolc'
];

const HeroSection = ({ className = '' }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const photoARef = useRef<HTMLDivElement>(null);
  const photoBRef = useRef<HTMLDivElement>(null);
  const photoCRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const badge1Ref = useRef<HTMLSpanElement>(null);
  const badge2Ref = useRef<HTMLSpanElement>(null);
  const badge3Ref = useRef<HTMLSpanElement>(null);

  const [instrument, setInstrument] = useState('');
  const [city, setCity] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { results, loading, search } = useSearch();

  // Load animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        photoARef.current,
        { x: '-12vw', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9 }
      )
        .fromTo(
          photoBRef.current,
          { x: '12vw', scale: 1.06, opacity: 0 },
          { x: 0, scale: 1, opacity: 1, duration: 1.0 },
          '-=0.7'
        )
        .fromTo(
          photoCRef.current,
          { y: '12vh', opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          '-=0.7'
        )
        .fromTo(
          textRef.current?.querySelectorAll('.word') || [],
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.6 },
          '-=0.5'
        )
        .fromTo(
          searchRef.current,
          { y: '10vh', scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
          '-=0.4'
        )
        .fromTo(
          [badge1Ref.current, badge2Ref.current, badge3Ref.current],
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.08, duration: 0.5 },
          '-=0.5'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Scroll animation
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
          onLeaveBack: () => {
            gsap.set([photoARef.current, photoBRef.current, photoCRef.current, textRef.current, searchRef.current], {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
            });
          },
        },
      });

      // EXIT phase (70% - 100%)
      scrollTl.fromTo(
        photoARef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        photoBRef.current,
        { y: 0, scale: 1, opacity: 1 },
        { y: '-10vh', scale: 0.98, opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        photoCRef.current,
        { y: 0, opacity: 1 },
        { y: '18vh', opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        textRef.current,
        { x: 0, opacity: 1 },
        { x: '8vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        searchRef.current,
        { y: 0, scale: 1, opacity: 1 },
        { y: '18vh', scale: 0.98, opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        [badge1Ref.current, badge2Ref.current, badge3Ref.current],
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await search({ instrument, city });
    setShowResults(true);
  };

  const handleQuickSearch = (term: string) => {
    setInstrument(term);
    search({ instrument: term });
    setShowResults(true);
  };

  const headlineWords = 'Találd meg a zenetanárod.'.split(' ');

  return (
    <>
      <section
        ref={sectionRef}
        className={`section-pinned bg-[#F4F2EE] ${className}`}
      >
        {/* Photo A - Top Left */}
        <div
          ref={photoARef}
          className="absolute img-rounded"
          style={{
            left: '6vw',
            top: '10vh',
            width: '34vw',
            height: '30vh',
          }}
        >
          <img
            src="/images/hero_piano.jpg"
            alt="Zongora játék"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Badge BUDAPEST */}
        <span
          ref={badge1Ref}
          className="absolute badge"
          style={{ left: '10vw', top: '14vh' }}
        >
          BUDAPEST
        </span>

        {/* Photo B - Top Right (largest) */}
        <div
          ref={photoBRef}
          className="absolute img-rounded"
          style={{
            left: '44vw',
            top: '10vh',
            width: '50vw',
            height: '44vh',
          }}
        >
          <img
            src="/images/hero_teacher.jpg"
            alt="Zenetanár és diák"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Badge ONLINE */}
        <span
          ref={badge2Ref}
          className="absolute badge"
          style={{ left: '48vw', top: '14vh' }}
        >
          ONLINE
        </span>

        {/* Photo C - Bottom Left */}
        <div
          ref={photoCRef}
          className="absolute img-rounded"
          style={{
            left: '6vw',
            top: '46vh',
            width: '34vw',
            height: '38vh',
          }}
        >
          <img
            src="/images/hero_portrait.jpg"
            alt="Zenetanár portré"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Badge VIDÉK */}
        <span
          ref={badge3Ref}
          className="absolute badge"
          style={{ left: '10vw', top: '50vh' }}
        >
          VIDÉK
        </span>

        {/* Text Block */}
        <div
          ref={textRef}
          className="absolute"
          style={{
            left: '52vw',
            top: '18vh',
            width: '40vw',
          }}
        >
          <h1 className="text-display font-semibold mb-4">
            {headlineWords.map((word, i) => (
              <span key={i} className="word inline-block mr-[0.3em]">
                {word}
              </span>
            ))}
          </h1>
          <p className="text-lg text-[#6F6A63] leading-relaxed max-w-md">
            Zongora, gitár, hegedű, ének és más hangszerek. Magánórák Budapesten és vidéken.
          </p>
        </div>

        {/* Search Card */}
        <div
          ref={searchRef}
          className="absolute card-float bg-white p-6"
          style={{
            left: '22vw',
            top: '85vh',
            width: '52vw',
          }}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F6A63]" size={20} />
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D] focus:ring-2 focus:ring-[#D7A04D]/10 appearance-none cursor-pointer"
              >
                <option value="">Milyen hangszer?</option>
                {INSTRUMENTS.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F6A63]" size={20} />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D] focus:ring-2 focus:ring-[#D7A04D]/10 appearance-none cursor-pointer"
              >
                <option value="">Város / Kerület</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              {loading ? 'Keresés...' : 'Keresés'}
            </button>
          </form>
          <p className="text-xs text-[#6F6A63] mt-4">
            Népszerű:{' '}
            {['zongora', 'gitár', 'ének', 'hegedű', 'dob'].map((term, i) => (
              <span key={term}>
                <button 
                  onClick={() => handleQuickSearch(term)}
                  className="text-[#D7A04D] hover:underline capitalize"
                >
                  {term}
                </button>
                {i < 4 && ', '}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Search Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Keresési eredmények
              {results.length > 0 && <span className="text-lg text-gray-500 ml-2">({results.length} találat)</span>}
            </DialogTitle>
          </DialogHeader>
          
          {results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600">Nincs találat a keresési feltételeknek megfelelően.</p>
              <p className="text-sm text-gray-500 mt-2">Próbálj meg más hangszer vagy város szerint keresni.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {results.map((ad) => (
                <div key={ad.id} className="card-float bg-white p-4">
                  <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {ad.title}
                  </h3>
                  <p className="text-sm text-[#6F6A63] mb-2">
                    {ad.instrument?.name_hu} · {ad.location?.city}
                  </p>
                  <p className="text-sm line-clamp-2">{ad.short_description}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-[#6F6A63]">
                      {ad.teacher?.first_name} {ad.teacher?.last_name}
                    </span>
                    <button className="text-sm text-[#D7A04D] hover:underline">
                      Részletek
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSection;
