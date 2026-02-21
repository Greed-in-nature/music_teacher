import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface TestimonialsSectionProps {
  className?: string;
}

const TestimonialsSection = ({ className = '' }: TestimonialsSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        quoteRef.current,
        { x: '-12vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
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
        quoteRef.current,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      quote: 'Egy hét alatt találtam zongoratanárt, aki pont azt a jazz-stílust tanítja, amit kerestem. A platform nagyon egyszerűen használható.',
      author: 'Nagy Péter',
      location: 'Budapest',
      instrument: 'Zongora',
    },
    {
      quote: 'Lányom imádja az új hegedűtanárát. Végre találtunk valakit, aki türelmes és profi módon tanít.',
      author: 'Kovács Anna',
      location: 'Debrecen',
      instrument: 'Hegedű',
    },
    {
      quote: 'Online gitárórákat veszek, és tökéletesen működik. A tanár videóbemutatkozása segített a választásban.',
      author: 'Szabó Dániel',
      location: 'Szeged',
      instrument: 'Gitár',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section
      ref={sectionRef}
      className={`section-pinned bg-[#F4F2EE] ${className}`}
    >
      {/* Left Quote Block */}
      <div
        ref={quoteRef}
        className="absolute"
        style={{
          left: '6vw',
          top: '18vh',
          width: '46vw',
        }}
      >
        <h2 className="text-heading font-semibold mb-8">
          Diákjaink mondták.
        </h2>

        {/* Quote */}
        <div className="relative">
          {/* Big quote mark */}
          <Quote
            size={80}
            className="absolute -top-4 -left-2 text-[#111111] opacity-5"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          />

          <blockquote className="text-xl lg:text-2xl leading-relaxed mb-6 relative z-10" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            "{current.quote}"
          </blockquote>

          <p className="text-[#6F6A63]">
            — {current.author}, {current.location}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={prevTestimonial}
            className="w-10 h-10 rounded-full border border-[#111111]/20 flex items-center justify-center hover:bg-[#111111] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextTestimonial}
            className="w-10 h-10 rounded-full border border-[#111111]/20 flex items-center justify-center hover:bg-[#111111] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm text-[#6F6A63] ml-2">
            {currentIndex + 1} / {testimonials.length}
          </span>
        </div>

        {/* Link */}
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#D7A04D] hover:underline mt-8"
        >
          További történetek <ArrowUpRight size={16} />
        </a>
      </div>

      {/* Right Photo */}
      <div
        ref={photoRef}
        className="absolute img-rounded"
        style={{
          left: '56vw',
          top: '14vh',
          width: '38vw',
          height: '72vh',
        }}
      >
        <img
          src="/images/testimonial.jpg"
          alt="Elégedett diák"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default TestimonialsSection;
