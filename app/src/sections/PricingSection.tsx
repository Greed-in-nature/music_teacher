import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles, Info, Loader2, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

interface PricingSectionProps {
  className?: string;
}

const PricingSection = ({ className = '' }: PricingSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  const { token, isAuthenticated } = useAuth();

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

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
        { y: 60, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.12,
          duration: 0.5,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        infoRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 85%',
            end: 'top 65%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handlePlanSelect = (plan: 'free' | 'premium') => {
    if (plan === 'premium') {
      if (!isAuthenticated) {
        setPaymentError('Kérjük, jelentkezzen be az előfizetéshez');
      }
      setPaymentOpen(true);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');

    if (!token) {
      setPaymentError('Kérjük, jelentkezzen be a fizetéshez');
      setPaymentLoading(false);
      return;
    }

    try {
      const API_URL = 'http://localhost:8000/api';
      
      // Create payment intent
      const response = await fetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: 2900,
          currency: 'HUF',
          payment_type: 'subscription',
          description: 'Prémium előfizetés - 1 hónap',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Fizetés inicializálása sikertelen');
      }

      await response.json();
      
      // Simulate payment confirmation (in real app, this would be handled by Stripe Elements)
      // For demo, we'll just show success after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPaymentSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setCardName('');
        setPaymentSuccess(false);
        setPaymentOpen(false);
      }, 2000);
    } catch (err: any) {
      setPaymentError(err.message || 'Hiba történt a fizetés közben');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const plans = [
    {
      name: 'Ingyenes',
      price: '0',
      period: 'hónap',
      description: 'Alap hirdetés minden tanárnak',
      features: [
        'Alap hirdetés',
        'Videó feltöltése',
        'Üzenetek fogadása',
        'Alap statisztika',
      ],
      cta: 'Ingyenes regisztráció',
      highlighted: false,
      id: 'free' as const,
    },
    {
      name: 'Prémium',
      price: '2 900',
      period: 'hónap',
      description: 'Kiemelt megjelenés a legjobb eredményekért',
      features: [
        'Kiemelés a keresésekben',
        'Elsőbbségi megjelenés',
        'Részletes statisztika',
        'Prioritásos ügyfélszolgálat',
        'Ingyenes jutalék az első 3 találkozó után',
      ],
      cta: 'Prémium előfizetés',
      highlighted: true,
      id: 'premium' as const,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className={`section-flowing bg-[#F4F2EE] ${className}`}
    >
      {/* Headline */}
      <div ref={headlineRef} className="px-[6vw] pt-[8vh] pb-[4vh]">
        <h2 className="text-heading font-semibold mb-3">
          Átlátható árak.
        </h2>
        <p className="text-[#6F6A63] text-lg max-w-xl">
          Nincs havidíj. Nincs rejtett költség.
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        ref={cardsRef}
        className="px-[6vw] flex flex-col lg:flex-row gap-6 justify-center max-w-5xl mx-auto"
      >
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`card-float bg-white p-8 flex-1 max-w-md ${
              plan.highlighted ? 'ring-2 ring-[#D7A04D]' : ''
            }`}
          >
            {plan.highlighted && (
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#D7A04D]" />
                <span className="text-xs font-medium uppercase tracking-wider text-[#D7A04D]">
                  Ajánlott
                </span>
              </div>
            )}

            <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {plan.name}
            </h3>
            <p className="text-[#6F6A63] text-sm mb-6">{plan.description}</p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-[#6F6A63]">Ft / {plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <Check size={18} className="text-[#D7A04D] mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(plan.id)}
              className={`w-full py-3 rounded-full font-medium transition-all duration-300 ${
                plan.highlighted
                  ? 'btn-primary'
                  : 'btn-ghost'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Commission Info */}
      <div
        ref={infoRef}
        className="px-[6vw] pt-8 pb-[6vh] max-w-3xl mx-auto"
      >
        <div className="flex items-start gap-4 p-6 bg-white/50 rounded-2xl border border-[#D7A04D]/20">
          <Info size={20} className="text-[#D7A04D] mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-1">Jutalékrendszer</h4>
            <p className="text-sm text-[#6F6A63]">
              Sikeres első találkozó után 10% jutalékot számítunk fel (maximum 5 000 Ft). 
              Ez biztosítja, hogy csak akkor fizess, ha tényleg találsz diákot.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Prémium előfizetés
            </DialogTitle>
          </DialogHeader>
          
          {paymentSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sikeres fizetés!</h3>
              <p className="text-gray-600">
                Köszönjük az előfizetést! Prémium funkcióid mostantól aktívak.
              </p>
            </div>
          ) : !isAuthenticated ? (
            <div className="py-8 text-center">
              <p className="text-gray-600 mb-4">
                Az előfizetéshez be kell jelentkezned.
              </p>
              <button 
                onClick={() => setPaymentOpen(false)}
                className="btn-primary"
              >
                Értem
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-4 mt-4">
              {paymentError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {paymentError}
                </div>
              )}
              
              <div className="p-4 bg-[#F4F2EE] rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#6F6A63]">Előfizetés</span>
                  <span className="font-medium">Prémium</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#6F6A63]">Időtartam</span>
                  <span className="font-medium">1 hónap</span>
                </div>
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                  <span className="font-semibold">Összesen</span>
                  <span className="text-xl font-bold text-[#D7A04D]">2 900 Ft</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Kártyatulajdonos neve</Label>
                <Input
                  id="card-name"
                  placeholder="KOVACS JANOS"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-number">Kártyaszám</Label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Lejárat</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Fizetés feldolgozása...
                  </>
                ) : (
                  'Fizetés bankkártyával'
                )}
              </Button>

              <p className="text-xs text-center text-[#6F6A63]">
                A fizetés biztonságosan történik. Kártyaadataidat nem tároljuk.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PricingSection;
