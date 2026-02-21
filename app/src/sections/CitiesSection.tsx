import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CitiesSectionProps {
  className?: string;
}

interface CityStats {
  [city: string]: number;
}

const CitiesSection = ({ className = '' }: CitiesSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [cityStats, setCityStats] = useState<CityStats>({});

  // Fetch city stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/locations/cities');
        if (response.ok) {
          const cities = await response.json();
          // For now, we'll use placeholder counts - in production these would come from the backend
          const stats: CityStats = {};
          cities.forEach((city: string) => {
            // Default stats - in production fetch from /api/admin/stats/locations
            stats[city] = Math.floor(Math.random() * 50) + 10;
          });
          setCityStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch city stats:', error);
      }
    };
    fetchStats();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.5,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleCityClick = (cityName: string) => {
    navigate(`/kereses?city=${encodeURIComponent(cityName)}`);
  };

  const cities = [
    { name: 'Budapest', image: '/images/city_budapest.jpg' },
    { name: 'Debrecen', image: '/images/city_debrecen.jpg' },
    { name: 'Szeged', image: '/images/city_szeged.jpg' },
    { name: 'Pécs', image: '/images/city_pecs.jpg' },
    { name: 'Győr', image: '/images/city_gyor.jpg' },
    { name: 'Miskolc', image: '/images/city_miskolc.jpg' },
  ];

  return (
    <section
      ref={sectionRef}
      className={`section-flowing bg-[#F4F2EE] ${className}`}
    >
      {/* Headline */}
      <div ref={headlineRef} className="px-[6vw] pt-[8vh] pb-[4vh]">
        <h2 className="text-heading font-semibold mb-3">
          Keress város szerint.
        </h2>
        <p className="text-[#6F6A63] text-lg max-w-xl">
          Budapesten és vidéki városokban is találsz tanárt.
        </p>
      </div>

      {/* City Cards Grid */}
      <div
        ref={cardsRef}
        className="px-[6vw] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[3vw]"
      >
        {cities.map((city, index) => (
          <div
            key={index}
            onClick={() => handleCityClick(city.name)}
            className="card-float bg-white overflow-hidden cursor-pointer group"
          >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* City Name */}
              <div className="absolute bottom-3 left-4">
                <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {city.name}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#6F6A63]">
                <Users size={16} />
                <span className="text-sm">{cityStats[city.name] || 0} tanár</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F4F2EE] flex items-center justify-center group-hover:bg-[#D7A04D] transition-colors">
                <ArrowUpRight size={14} className="text-[#6F6A63] group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CitiesSection;
