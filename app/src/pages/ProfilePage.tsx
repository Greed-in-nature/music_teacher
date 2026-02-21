import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, Mail, Phone, Calendar, Edit, Save, 
  Plus, Clock, Eye, MessageCircle, CheckCircle, 
  AlertCircle, Hourglass, MapPin, Music
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostAdModal from '@/components/PostAdModal';

const ProfilePage = () => {
  useAuth();
  const { profile, loading, fetchProfile, updateProfile } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [postAdOpen, setPostAdOpen] = useState(false);
  
  // Edit form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bioShort, setBioShort] = useState('');
  const [bioLong, setBioLong] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [lessonPrice, setLessonPrice] = useState('');
  const [teachingOnline, setTeachingOnline] = useState(false);
  const [teachingAtStudent, setTeachingAtStudent] = useState(false);
  const [teachingAtTeacher, setTeachingAtTeacher] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone || '');
      if (profile.teacher_profile) {
        setBioShort(profile.teacher_profile.bio_short || '');
        setBioLong(profile.teacher_profile.bio_long || '');
        setYearsExperience(profile.teacher_profile.years_experience || 0);
        setLessonPrice(profile.teacher_profile.lesson_price?.toString() || '');
        setTeachingOnline(profile.teacher_profile.teaching_online || false);
        setTeachingAtStudent(profile.teacher_profile.teaching_at_student || false);
        setTeachingAtTeacher(profile.teacher_profile.teaching_at_teacher || false);
      }
    }
  }, [profile]);

  const handleSave = async () => {
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      phone: phone || undefined,
    };
    
    if (profile?.role === 'teacher') {
      updateData.teacher_profile = {
        bio_short: bioShort || undefined,
        bio_long: bioLong || undefined,
        years_experience: yearsExperience,
        lesson_price: lessonPrice ? parseFloat(lessonPrice) : undefined,
        teaching_online: teachingOnline,
        teaching_at_student: teachingAtStudent,
        teaching_at_teacher: teachingAtTeacher,
      };
    }
    
    const result = await updateProfile(updateData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Hourglass size={16} className="text-yellow-500" />;
      case 'expired':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktív';
      case 'pending':
        return 'Jóváhagyásra vár';
      case 'expired':
        return 'Lejárt';
      case 'suspended':
        return 'Felfüggesztve';
      default:
        return status;
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7A04D] mx-auto mb-4"></div>
          <p className="text-gray-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Kérjük, jelentkezzen be a profil megtekintéséhez.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Profilom
          </h1>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isEditing 
                ? 'btn-primary' 
                : 'btn-ghost'
            }`}
          >
            {isEditing ? (
              <><Save size={18} /> Mentés</>
            ) : (
              <><Edit size={18} /> Szerkesztés</>
            )}
          </button>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl">
            <TabsTrigger value="info" className="px-6 py-2">Adatok</TabsTrigger>
            {profile.role === 'teacher' && (
              <TabsTrigger value="ads" className="px-6 py-2">
                Hirdetéseim ({profile.advertisements?.length || 0})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            {/* Basic Info Card */}
            <div className="card-float bg-white p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User size={20} className="text-[#D7A04D]" />
                Alapadatok
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Vezetéknév</Label>
                  {isEditing ? (
                    <Input 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{profile.last_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Keresztnév</Label>
                  {isEditing ? (
                    <Input 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-700">{profile.first_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail size={14} /> Email
                  </Label>
                  <p className="text-gray-700">{profile.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone size={14} /> Telefonszám
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+36 30 123 4567"
                    />
                  ) : (
                    <p className="text-gray-700">{profile.phone || 'Nincs megadva'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar size={14} /> Regisztráció dátuma
                  </Label>
                  <p className="text-gray-700">
                    {new Date(profile.created_at).toLocaleDateString('hu-HU')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Szerepkör</Label>
                  <p className="text-gray-700 capitalize">
                    {profile.role === 'teacher' ? 'Tanár' : profile.role === 'student' ? 'Diák' : 'Admin'}
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher Profile Card */}
            {profile.role === 'teacher' && (
              <div className="card-float bg-white p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Music size={20} className="text-[#D7A04D]" />
                  Tanári profil
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Rövid bemutatkozás</Label>
                    {isEditing ? (
                      <Input 
                        value={bioShort} 
                        onChange={(e) => setBioShort(e.target.value)}
                        placeholder="Pl.: 10 éves tapasztalattal rendelkező zongoratanár"
                        maxLength={255}
                      />
                    ) : (
                      <p className="text-gray-700">{profile.teacher_profile?.bio_short || 'Nincs megadva'}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Részletes bemutatkozás</Label>
                    {isEditing ? (
                      <Textarea 
                        value={bioLong} 
                        onChange={(e) => setBioLong(e.target.value)}
                        placeholder="Írj magadról részletesebben..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700">{profile.teacher_profile?.bio_long || 'Nincs megadva'}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Tapasztalat (év)</Label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={yearsExperience} 
                          onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      ) : (
                        <p className="text-gray-700">{profile.teacher_profile?.years_experience || 0} év</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Óradíj (Ft/óra)</Label>
                      {isEditing ? (
                        <Input 
                          type="number"
                          value={lessonPrice} 
                          onChange={(e) => setLessonPrice(e.target.value)}
                          placeholder="8000"
                        />
                      ) : (
                        <p className="text-gray-700">
                          {profile.teacher_profile?.lesson_price 
                            ? `${profile.teacher_profile.lesson_price} Ft/óra` 
                            : 'Nincs megadva'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Előfizetés</Label>
                      <p className="text-gray-700 capitalize">
                        {profile.teacher_profile?.subscription_type === 'premium' ? (
                          <span className="text-[#D7A04D] font-medium">Prémium</span>
                        ) : (
                          'Ingyenes'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Oktatás módja</Label>
                    {isEditing ? (
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
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.teacher_profile?.teaching_online && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Online</span>
                        )}
                        {profile.teacher_profile?.teaching_at_student && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Diáknál</span>
                        )}
                        {profile.teacher_profile?.teaching_at_teacher && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Tanárnál</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {profile.role === 'teacher' && (
            <TabsContent value="ads" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Hirdetéseim</h2>
                <button
                  onClick={() => setPostAdOpen(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Új hirdetés
                </button>
              </div>

              {profile.advertisements?.length === 0 ? (
                <div className="card-float bg-white p-8 text-center">
                  <p className="text-gray-600 mb-4">Még nincs hirdetésed.</p>
                  <button
                    onClick={() => setPostAdOpen(true)}
                    className="btn-primary"
                  >
                    Hirdetés feladása
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.advertisements?.map((ad) => (
                    <div key={ad.id} className="card-float bg-white p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                          {getStatusIcon(ad.status)}
                          <span>{getStatusText(ad.status)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <Music size={14} /> {ad.instrument}
                        <span className="mx-1">·</span>
                        <MapPin size={14} /> {ad.location}
                      </p>
                      
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {ad.short_description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye size={14} /> {ad.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} /> {ad.contacts}
                          </span>
                        </div>
                        
                        {ad.days_remaining !== undefined && ad.days_remaining > 0 && (
                          <span className="flex items-center gap-1 text-[#D7A04D]">
                            <Clock size={14} />
                            {ad.days_remaining} nap hátravan
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      <PostAdModal open={postAdOpen} onOpenChange={setPostAdOpen} />
    </div>
  );
};

export default ProfilePage;
