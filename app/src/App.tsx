import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import InstrumentsSection from './sections/InstrumentsSection';
import FeaturedTeachersSection from './sections/FeaturedTeachersSection';
import ForTeachersSection from './sections/ForTeachersSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import CitiesSection from './sections/CitiesSection';
import FinalCTASection from './sections/FinalCTASection';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SearchResultsPage from './pages/SearchResultsPage';
import { useAuth } from './hooks/useAuth';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Home page component with all sections
const HomePage = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <main ref={mainRef} className="relative">
      <HeroSection className="z-10" />
      <HowItWorksSection className="z-20" />
      <InstrumentsSection className="z-30" />
      <FeaturedTeachersSection className="z-40" />
      <ForTeachersSection className="z-50" />
      <PricingSection className="z-60" />
      <TestimonialsSection className="z-70" />
      <CitiesSection className="z-80" />
      <FinalCTASection className="z-90" />
    </main>
  );
};

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {

  return (
    <Router>
      <div className="relative">
        {/* Grain overlay */}
        <div className="grain-overlay" />
        
        {/* Navigation */}
        <Navigation />
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/profil" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/kereses" element={<SearchResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
