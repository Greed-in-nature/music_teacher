import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId?: number;
  teacherName?: string;
  advertisementId?: number;
}

const ContactModal = ({ 
  open, 
  onOpenChange, 
  teacherId, 
  teacherName = 'a tanár',
  advertisementId 
}: ContactModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState(user?.first_name + ' ' + user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!teacherId) {
      setError('Hiba: Nincs megadva tanár');
      setLoading(false);
      return;
    }

    try {
      const API_URL = 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: teacherId,
          advertisement_id: advertisementId,
          name,
          email,
          phone,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Üzenet küldése sikertelen');
      }

      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Hiba történt az üzenet küldése közben');
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
            <h3 className="text-xl font-semibold mb-2">Üzenet elküldve!</h3>
            <p className="text-gray-600 text-center">
              {teacherName} hamarosan felveszi veled a kapcsolatot.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Kapcsolatfelvétel
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-600 mb-4">
          Üzenetet küldesz neki: <span className="font-semibold">{teacherName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="contact-name">Neved *</Label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="contact-name"
                placeholder="Kovács János"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Email címed *</Label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="contact-email"
                type="email"
                placeholder="pelda@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Telefonszámod (opcionális)</Label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="contact-phone"
                type="tel"
                placeholder="+36 30 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Üzeneted *</Label>
            <div className="relative">
              <MessageSquare size={18} className="absolute left-3 top-3 text-gray-400" />
              <Textarea
                id="contact-message"
                placeholder="Írd le, milyen hangszeren szeretnél tanulni, milyen szinten vagy, és mikor lenne szabad időpontod..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Küldés...
              </>
            ) : (
              'Üzenet küldése'
            )}
          </Button>

          <p className="text-xs text-center text-[#6F6A63]">
            A tanár emailben és/vagy telefonon fog felvenni veled a kapcsolatot.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
