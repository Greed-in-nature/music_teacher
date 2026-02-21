import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HowItWorksSectionProps {
  className?: string;
}

const HowItWorksSection = ({ className = '' }: HowItWorksSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const numbersRef = useRef<HTMLDivElement>(null);

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
        { x: '-55vw', opacity: 0, scale: 0.96 },
        { x: 0, opacity: 1, scale: 1, ease: 'none' },
        0
      );
      scrollTl.fromTo(
        headlineRef.current,
        { x: '10vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'none' },
        0
      );
      scrollTl.fromTo(
        stepsRef.current?.children || [],
        { x: '18vw', opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.08, ease: 'none' },
        0.05
      );
      scrollTl.fromTo(
        numbersRef.current?.children || [],
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 0.08, stagger: 0.05, ease: 'none' },
        0.05
      );

      // SETTLE (30% - 70%) - hold position

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        photoRef.current,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        [headlineRef.current, stepsRef.current],
        { x: 0, opacity: 1 },
        { x: '10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
      scrollTl.fromTo(
        numbersRef.current,
        { opacity: 0.08 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Böngéssz',
      description: 'Szűrj hangszerre, városra és szintre.',
    },
    {
      number: '02',
      title: 'Válassz',
      description: 'Nézd meg a tanárok videóit, óradíját és elérhetőségét.',
    },
    {
      number: '03',
      title: 'Írj vagy hívj',
      description: 'Küldj üzenetet, és egyeztess időpontot.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={`section-pinned bg-[#F4F2EE] ${className}`}
    >
      {/* Left Photo Card */}
      <div
        ref={photoRef}
        className="absolute img-rounded"
        style={{
          left: '6vw',
          top: '14vh',
          width: '40vw',
          height: '72vh',
        }}
      >
        <img
          src="/images/how_it_works.jpg"
          alt="Zenetanítás folyamat"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Content */}
      <div
        ref={headlineRef}
        className="absolute"
        style={{
          left: '52vw',
          top: '18vh',
          width: '42vw',
        }}
      >
        <h2 className="text-heading font-semibold mb-3">
          Három lépésben kezdhetsz.
        </h2>
        <p className="text-[#6F6A63] text-lg mb-12">
          Nincs szerződés, nincs bonyodalom—csak zene.
        </p>
      </div>

      {/* Steps */}
      <div
        ref={stepsRef}
        className="absolute flex flex-col gap-8"
        style={{
          left: '52vw',
          top: '38vh',
          width: '42vw',
        }}
      >
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <span className="mono text-sm text-[#D7A04D] font-medium mt-1">
              {step.number}
            </span>
            <div>
              <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {step.title}
              </h3>
              <p className="text-[#6F6A63]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Big Numbers Background */}
      <div ref={numbersRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <span
          className="absolute text-[12vw] font-bold text-[#111111]"
          style={{
            left: '50vw',
            top: '34vh',
            opacity: 0.08,
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          01
        </span>
        <span
          className="absolute text-[12vw] font-bold text-[#111111]"
          style={{
            left: '62vw',
            top: '50vh',
            opacity: 0.08,
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          02
        </span>
        <span
          className="absolute text-[12vw] font-bold text-[#111111]"
          style={{
            left: '74vw',
            top: '66vh',
            opacity: 0.08,
            fontFamily: 'Cormorant Garamond, serif',
          }}
        >
          03
        </span>
      </div>
    </section>
  );
};

export default HowItWorksSection;
