import { useEffect, useState } from 'react';
import { useAdmin, type DashboardStats, type AdminUser, type AdminAdvertisement } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, FileText, DollarSign, 
  CheckCircle, XCircle, Clock, AlertCircle,
  RefreshCw, Settings, Eye, Trash2,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminPage = () => {
  useAuth();
  const { 
    isAdmin, loading, fetchStats, fetchUsers, fetchUserEmails, 
    fetchAdvertisements, approveAdvertisement, rejectAdvertisement,
    extendAdvertisement, deleteAdvertisement, updatePricing
  } = useAdmin();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [advertisements, setAdvertisements] = useState<AdminAdvertisement[]>([]);
  const [emails, setEmails] = useState<{email: string; name: string; role: string}[]>([]);
  
  const [adFilter, setAdFilter] = useState<string>('all');
  const [pricingOpen, setPricingOpen] = useState(false);
  const [emailsOpen, setEmailsOpen] = useState(false);
  
  // Pricing state
  const [premiumPrice, setPremiumPrice] = useState(2900);
  const [commissionPercent, setCommissionPercent] = useState(10);
  const [commissionMax, setCommissionMax] = useState(5000);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    const [statsData, usersData, adsData] = await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchAdvertisements(),
    ]);
    
    if (statsData) setStats(statsData);
    if (usersData) setUsers(usersData);
    if (adsData) setAdvertisements(adsData);
  };

  const handleApprove = async (adId: number) => {
    const result = await approveAdvertisement(adId);
    if (result.success) {
      loadData();
    }
  };

  const handleReject = async (adId: number) => {
    const result = await rejectAdvertisement(adId);
    if (result.success) {
      loadData();
    }
  };

  const handleExtend = async (adId: number) => {
    const result = await extendAdvertisement(adId, 30);
    if (result.success) {
      loadData();
    }
  };

  const handleDelete = async (adId: number) => {
    if (confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) {
      const result = await deleteAdvertisement(adId);
      if (result.success) {
        loadData();
      }
    }
  };

  const handleExportEmails = async () => {
    const emailsData = await fetchUserEmails();
    setEmails(emailsData);
    setEmailsOpen(true);
  };

  const handleSavePricing = async () => {
    const result = await updatePricing({
      premium_monthly: premiumPrice,
      commission_percent: commissionPercent,
      commission_max: commissionMax,
    });
    if (result.success) {
      setPricingOpen(false);
    }
  };

  const filteredAds = adFilter === 'all' 
    ? advertisements 
    : advertisements.filter(ad => ad.status === adFilter);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Hozzáférés megtagadva</h1>
          <p className="text-gray-600">Ez az oldal csak adminisztrátorok számára érhető el.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Adminisztrációs felület
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportEmails}
              className="btn-ghost flex items-center gap-2"
            >
              <Mail size={18} />
              Email export
            </button>
            <button
              onClick={() => setPricingOpen(true)}
              className="btn-ghost flex items-center gap-2"
            >
              <Settings size={18} />
              Árak
            </button>
            <button
              onClick={loadData}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Frissítés
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card-float bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Felhasználók</span>
                <Users size={20} className="text-[#D7A04D]" />
              </div>
              <p className="text-3xl font-bold">{stats.users.total}</p>
              <p className="text-sm text-gray-500">
                {stats.users.teachers} tanár, {stats.users.students} diák
              </p>
            </div>
            
            <div className="card-float bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Hirdetések</span>
                <FileText size={20} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{stats.advertisements.total}</p>
              <p className="text-sm text-gray-500">
                {stats.advertisements.active} aktív, {stats.advertisements.pending} függőben
              </p>
            </div>
            
            <div className="card-float bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Bevétel</span>
                <DollarSign size={20} className="text-green-500" />
              </div>
              <p className="text-3xl font-bold">{stats.revenue.toLocaleString()} Ft</p>
              <p className="text-sm text-gray-500">Összes bevétel</p>
            </div>
            
            <div className="card-float bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Lejáró hirdetések</span>
                <Clock size={20} className="text-red-500" />
              </div>
              <p className="text-3xl font-bold">{stats.advertisements.expiring_soon}</p>
              <p className="text-sm text-gray-500">Következő 7 napban</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="advertisements" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl">
            <TabsTrigger value="advertisements" className="px-6 py-2">
              Hirdetések
            </TabsTrigger>
            <TabsTrigger value="users" className="px-6 py-2">
              Felhasználók
            </TabsTrigger>
          </TabsList>

          {/* Advertisements Tab */}
          <TabsContent value="advertisements" className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500">Szűrés:</span>
              {[
                { key: 'all', label: 'Összes' },
                { key: 'pending', label: 'Jóváhagyásra vár' },
                { key: 'active', label: 'Aktív' },
                { key: 'expired', label: 'Lejárt' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setAdFilter(filter.key)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    adFilter === filter.key
                      ? 'bg-[#D7A04D] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Hirdetés</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Tanár</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Státusz</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Lejárat</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Statisztika</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} className="border-t border-gray-100">
                      <td className="p-4">
                        <p className="font-medium">{ad.title}</p>
                        <p className="text-sm text-gray-500">
                          {ad.instrument} · {ad.location}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{ad.teacher.name}</p>
                        <p className="text-xs text-gray-500">{ad.teacher.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ad.status === 'active' ? 'bg-green-100 text-green-700' :
                          ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          ad.status === 'expired' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ad.status === 'active' ? 'Aktív' :
                           ad.status === 'pending' ? 'Függőben' :
                           ad.status === 'expired' ? 'Lejárt' : ad.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {ad.expires_at 
                          ? new Date(ad.expires_at).toLocaleDateString('hu-HU')
                          : 'Nincs'
                        }
                      </td>
                      <td className="p-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye size={14} /> {ad.views}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {ad.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(ad.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Jóváhagyás"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(ad.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Elutasítás"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {ad.status === 'active' && (
                            <button
                              onClick={() => handleExtend(ad.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Meghosszabbítás (+30 nap)"
                            >
                              <Clock size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Törlés"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Név</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Szerepkör</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Regisztráció</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Hirdetések</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100">
                      <td className="p-4">
                        <p className="font-medium">{user.last_name} {user.first_name}</p>
                        <p className="text-sm text-gray-500">{user.phone || 'Nincs telefon'}</p>
                      </td>
                      <td className="p-4 text-sm">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role === 'teacher' ? 'Tanár' :
                           user.role === 'admin' ? 'Admin' : 'Diák'}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(user.created_at).toLocaleDateString('hu-HU')}
                      </td>
                      <td className="p-4 text-sm">
                        {user.advertisement_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pricing Dialog */}
      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Árak beállítása</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Prémium havi díj (Ft)</Label>
              <Input
                type="number"
                value={premiumPrice}
                onChange={(e) => setPremiumPrice(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Jutalék százalék (%)</Label>
              <Input
                type="number"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(parseInt(e.target.value))}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Jutalék maximum (Ft)</Label>
              <Input
                type="number"
                value={commissionMax}
                onChange={(e) => setCommissionMax(parseInt(e.target.value))}
              />
            </div>
            <Button onClick={handleSavePricing} className="w-full btn-primary">
              Mentés
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emails Dialog */}
      <Dialog open={emailsOpen} onOpenChange={setEmailsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Felhasználói email címek</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <textarea
              readOnly
              value={emails.map(e => `${e.email} (${e.name})`).join('\n')}
              className="w-full h-64 p-4 bg-gray-50 rounded-lg text-sm font-mono"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">{emails.length} email cím</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(emails.map(e => e.email).join(', '));
                }}
                className="btn-ghost text-sm"
              >
                Másolás vágólapra
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
