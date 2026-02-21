import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, MapPin, Monitor, MessageCircle } from 'lucide-react';
import ContactModal from '@/components/ContactModal';

gsap.registerPlugin(ScrollTrigger);

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  bio_short?: string;
  years_experience: number;
  lesson_price?: number;
  instruments: string[];
  locations: string[];
  teaching_online: boolean;
}

interface FeaturedTeachersSectionProps {
  className?: string;
}

const FeaturedTeachersSection = ({ className = '' }: FeaturedTeachersSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<{id: number, name: string} | null>(null);

  // Fetch featured teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/teachers/featured?limit=6');
        if (response.ok) {
          const data = await response.json();
          setTeachers(data);
        }
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
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

      const cards = cardsRef.current?.children || [];
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
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
  }, [teachers]);

  const handleContactClick = (teacherId: number, teacherName: string) => {
    setSelectedTeacher({ id: teacherId, name: teacherName });
    setContactModalOpen(true);
  };

  // Fallback images for teachers
  const fallbackImages = [
    '/images/IMG_20241228_141149572_HDR_crop.jpg',
    '/images/hero_portrait.jpg',
    '/images/hero_teacher.jpg',
    '/images/instrument_voice.jpg',
    '/images/how_it_works.jpg',
    '/images/testimonial.jpg',
    '/images/for_teachers.jpg',
  ];

  if (loading) {
    return (
      <section ref={sectionRef} id="teachers" className={`section-flowing bg-[#F4F2EE] ${className}`}>
        <div className="px-[6vw] pt-[8vh] pb-[4vh]">
          <h2 className="text-heading font-semibold mb-3">Kiemelt tanárok.</h2>
        </div>
        <div className="px-[6vw] text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7A04D] mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="teachers"
      className={`section-flowing bg-[#F4F2EE] ${className}`}
    >
      {/* Headline */}
      <div ref={headlineRef} className="px-[6vw] pt-[8vh] pb-[4vh]">
        <h2 className="text-heading font-semibold mb-3">
          Kiemelt tanárok.
        </h2>
        <p className="text-[#6F6A63] text-lg max-w-xl">
          Ellenőrzött profilok, videóbemutatkozások, átlátható árak.
        </p>
      </div>

      {/* Teacher Cards Grid */}
      <div
        ref={cardsRef}
        className="px-[6vw] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[3vw]"
      >
        {teachers.map((teacher, index) => (
          <div
            key={teacher.id}
            className="card-float bg-white overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={fallbackImages[index % fallbackImages.length]}
                alt={`${teacher.first_name} ${teacher.last_name}`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {teacher.first_name} {teacher.last_name}
                </h3>
                <div className="flex items-center gap-1 text-[#D7A04D]">
                  <Star size={14} fill="#D7A04D" />
                  <span className="text-sm font-medium">4.9</span>
                </div>
              </div>

              <p className="text-sm text-[#6F6A63] mb-3 flex items-center gap-2 flex-wrap">
                <span>{teacher.instruments?.[0] || 'Zongora'}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {teacher.locations?.[0] || 'Budapest'}
                </span>
                <span>·</span>
                <span>{teacher.years_experience} éve tanít</span>
              </p>

              <p className="text-sm text-[#111111] mb-4 line-clamp-2">
                {teacher.bio_short || 'Tapasztalt zenetanár várja diákjait.'}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 text-xs rounded-md bg-[#F4F2EE] text-[#6F6A63]">
                  Kezdő
                </span>
                <span className="px-2 py-1 text-xs rounded-md bg-[#F4F2EE] text-[#6F6A63]">
                  Középhaladó
                </span>
                {teacher.teaching_online && (
                  <span className="px-2 py-1 text-xs rounded-md bg-[#F4F2EE] text-[#6F6A63]">
                    <Monitor size={10} className="inline mr-1" />
                    Online is
                  </span>
                )}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <span className="text-sm text-[#6F6A63]">Óradíj</span>
                  <p className="font-semibold text-[#D7A04D]">
                    {teacher.lesson_price?.toLocaleString() || '8 000'} Ft/óra
                  </p>
                </div>
                <button 
                  onClick={() => handleContactClick(teacher.id, `${teacher.first_name} ${teacher.last_name}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white rounded-full text-sm font-medium hover:bg-[#D7A04D] transition-colors"
                >
                  <MessageCircle size={16} />
                  Kapcsolat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-[6vw] pt-8 pb-[6vh] text-center">
        <button className="btn-primary">
          További tanárok
        </button>
      </div>

      {/* Contact Modal */}
      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        teacherId={selectedTeacher?.id}
        teacherName={selectedTeacher?.name}
      />
    </section>
  );
};

export default FeaturedTeachersSection;
