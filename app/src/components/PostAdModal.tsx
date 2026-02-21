import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle } from 'lucide-react';

interface PostAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INSTRUMENTS = [
  { id: 1, name_hu: 'Zongora' },
  { id: 2, name_hu: 'Gitár' },
  { id: 3, name_hu: 'Hegedű' },
  { id: 4, name_hu: 'Ének' },
  { id: 5, name_hu: 'Dob' },
  { id: 6, name_hu: 'Basszusgitár' },
  { id: 7, name_hu: 'Szaxofon' },
  { id: 8, name_hu: 'Fuvola' },
  { id: 9, name_hu: 'Cselló' },
  { id: 10, name_hu: 'Ukulele' },
];

const CITIES = [
  { id: 1, city: 'Budapest' },
  { id: 11, city: 'Debrecen' },
  { id: 12, city: 'Szeged' },
  { id: 13, city: 'Pécs' },
  { id: 14, city: 'Győr' },
  { id: 15, city: 'Miskolc' },
];

const PostAdModal = ({ open, onOpenChange }: PostAdModalProps) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [lessonPrice, setLessonPrice] = useState('');
  const [teachingOnline, setTeachingOnline] = useState(false);
  const [teachingAtStudent, setTeachingAtStudent] = useState(false);
  const [teachingAtTeacher, setTeachingAtTeacher] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token) {
      setError('Kérjük, jelentkezzen be a hirdetés feladásához');
      setLoading(false);
      return;
    }

    try {
      const API_URL = 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/advertisements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          short_description: shortDescription,
          long_description: longDescription,
          instrument_id: parseInt(instrumentId),
          location_id: parseInt(locationId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Hirdetés feladása sikertelen');
      }

      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setTitle('');
        setShortDescription('');
        setLongDescription('');
        setInstrumentId('');
        setLocationId('');
        setLessonPrice('');
        setTeachingOnline(false);
        setTeachingAtStudent(false);
        setTeachingAtTeacher(false);
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Hiba történt a hirdetés feladása közben');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle size={64} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sikeres hirdetés!</h3>
            <p className="text-gray-600 text-center">
              A hirdetésedet sikeresen feladtuk. Hamarosan megjelenik a keresésekben.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Hirdetés feladása
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="py-8 text-center">
            <p className="text-gray-600 mb-4">
              A hirdetés feladásához be kell jelentkezned.
            </p>
            <Button onClick={() => onOpenChange(false)} className="btn-primary">
              Bejelentkezés
            </Button>
          </div>
        ) : user.role !== 'teacher' ? (
          <div className="py-8 text-center">
            <p className="text-gray-600 mb-4">
              Csak tanárok adhatnak fel hirdetést.
            </p>
            <Button onClick={() => onOpenChange(false)} className="btn-primary">
              Értem
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ad-title">Hirdetés címe *</Label>
              <Input
                id="ad-title"
                placeholder="Pl.: Zongora oktatás Budapesten"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-instrument">Hangszer *</Label>
              <select
                id="ad-instrument"
                value={instrumentId}
                onChange={(e) => setInstrumentId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D] focus:ring-2 focus:ring-[#D7A04D]/10"
              >
                <option value="">Válassz hangszert</option>
                {INSTRUMENTS.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name_hu}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-location">Város *</Label>
              <select
                id="ad-location"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D] focus:ring-2 focus:ring-[#D7A04D]/10"
              >
                <option value="">Válassz várost</option>
                {CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-price">Óradíj (Ft/óra)</Label>
              <Input
                id="ad-price"
                type="number"
                placeholder="Pl.: 8000"
                value={lessonPrice}
                onChange={(e) => setLessonPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Oktatás módja</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teachingOnline}
                    onChange={(e) => setTeachingOnline(e.target.checked)}
                    className="accent-[#D7A04D] w-4 h-4"
                  />
                  <span>Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teachingAtStudent}
                    onChange={(e) => setTeachingAtStudent(e.target.checked)}
                    className="accent-[#D7A04D] w-4 h-4"
                  />
                  <span>Diáknál</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teachingAtTeacher}
                    onChange={(e) => setTeachingAtTeacher(e.target.checked)}
                    className="accent-[#D7A04D] w-4 h-4"
                  />
                  <span>Tanárnál</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-short">Rövid leírás *</Label>
              <Textarea
                id="ad-short"
                placeholder="Pl.: 10 éves tapasztalattal várom kezdő és haladó zongorázni vágyókat."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
                maxLength={500}
                rows={2}
              />
              <p className="text-xs text-gray-500">
                {shortDescription.length}/500 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-long">Részletes leírás</Label>
              <Textarea
                id="ad-long"
                placeholder="Írd le részletesen, mit kínálsz, milyen szinten, milyen időpontokban..."
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Hirdetés feladása...
                </>
              ) : (
                'Hirdetés feladása'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PostAdModal;
