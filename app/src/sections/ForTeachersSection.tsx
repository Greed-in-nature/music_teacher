import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ForTeachersSectionProps {
  className?: string;
}

const ForTeachersSection = ({ className = '' }: ForTeachersSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);

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
        photoRef.current,
        { x: '55vw', opacity: 0, scale: 0.97 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );
      scrollTl.fromTo(
        contentRef.current,
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );
      scrollTl.fromTo(
        propsRef.current?.children || [],
        { y: '6vh', opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, ease: 'none' },
        0.1
      );

      // SETTLE (30% - 70%)

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        photoRef.current,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        [contentRef.current, propsRef.current],
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const valueProps = [
    {
      title: 'Ingyenes hirdetés',
      description: 'Csak sikeres találkozó után fizetsz jutalékot.',
    },
    {
      title: 'Saját ütemezés',
      description: 'Te döntesz az időpontokról és a helyszínről.',
    },
    {
      title: 'Biztonságos kapcsolat',
      description: 'Üzenetküldés telefonszámod elküldése nélkül.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`section-pinned bg-[#F4F2EE] ${className}`}
    >
      {/* Left Content */}
      <div
        ref={contentRef}
        className="absolute"
        style={{
          left: '6vw',
          top: '18vh',
          width: '44vw',
        }}
      >
        <h2 className="text-heading font-semibold mb-3">
          Taníts nálunk.
        </h2>
        <p className="text-[#6F6A63] text-lg mb-10">
          Tölts fel egy videót, írd meg az óradíjad, és kapj érdeklődőket.
        </p>
      </div>

      {/* Value Props */}
      <div
        ref={propsRef}
        className="absolute flex flex-col gap-6"
        style={{
          left: '6vw',
          top: '42vh',
          width: '44vw',
        }}
      >
        {valueProps.map((prop, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-[#D7A04D] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={14} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {prop.title}
              </h3>
              <p className="text-[#6F6A63] text-sm">{prop.description}</p>
            </div>
          </div>
        ))}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button className="btn-primary">
            Hirdetés feladása
          </button>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6F6A63] hover:text-[#D7A04D] transition-colors"
          >
            Hogyan működik a jutalék? <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Right Photo */}
      <div
        ref={photoRef}
        className="absolute img-rounded"
        style={{
          left: '54vw',
          top: '14vh',
          width: '40vw',
          height: '72vh',
        }}
      >
        <img
          src="/images/for_teachers.jpg"
          alt="Tanítás folyamat"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default ForTeachersSection;
