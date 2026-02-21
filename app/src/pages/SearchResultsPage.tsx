import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { Search, MapPin, Music, ArrowLeft, Eye, MessageCircle, Filter } from 'lucide-react';
import ContactModal from '@/components/ContactModal';

const INSTRUMENTS = [
  'Zongora', 'Gitár', 'Hegedű', 'Ének', 'Dob', 
  'Basszusgitár', 'Szaxofon', 'Fuvola', 'Cselló', 'Ukulele'
];

const CITIES = [
  'Budapest', 'Debrecen', 'Szeged', 'Pécs', 'Győr', 'Miskolc'
];

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { results, loading, search } = useSearch();
  
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<{id: number, name: string} | null>(null);
  
  const instrumentParam = searchParams.get('instrument') || '';
  const cityParam = searchParams.get('city') || '';
  const keywordParam = searchParams.get('keyword') || '';

  const [instrument, setInstrument] = useState(instrumentParam);
  const [city, setCity] = useState(cityParam);
  const [keyword, setKeyword] = useState(keywordParam);

  useEffect(() => {
    search({ 
      instrument: instrumentParam, 
      city: cityParam,
      keyword: keywordParam 
    });
  }, [instrumentParam, cityParam, keywordParam, search]);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (instrument) params.instrument = instrument;
    if (city) params.city = city;
    if (keyword) params.keyword = keyword;
    setSearchParams(params);
  };

  const handleContact = (teacherId: number, teacherName: string) => {
    setSelectedTeacher({ id: teacherId, name: teacherName });
    setContactModalOpen(true);
  };

  const getActiveFilters = () => {
    const filters = [];
    if (instrumentParam) filters.push({ type: 'instrument', value: instrumentParam });
    if (cityParam) filters.push({ type: 'city', value: cityParam });
    if (keywordParam) filters.push({ type: 'keyword', value: keywordParam });
    return filters;
  };

  const removeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete(type);
    setSearchParams(params);
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="min-h-screen bg-[#F4F2EE] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-[#D7A04D] mb-6"
        >
          <ArrowLeft size={18} />
          Vissza a főoldalra
        </button>

        <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Keresési eredmények
        </h1>

        {/* Search Form */}
        <div className="card-float bg-white p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Hangszer</label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D]"
              >
                <option value="">Összes hangszer</option>
                {INSTRUMENTS.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Város</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D]"
              >
                <option value="">Összes város</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Kulcsszó</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Keresés címben..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#D7A04D]"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Keresés
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">Aktív szűrők:</span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.type}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#D7A04D]/10 text-[#D7A04D] rounded-full text-sm"
                >
                  {filter.value}
                  <button
                    onClick={() => removeFilter(filter.type)}
                    className="hover:text-[#D7A04D]/70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Keresés...' : `${results.length} találat`}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7A04D] mx-auto mb-4"></div>
            <p className="text-gray-600">Keresés folyamatban...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-600 mb-2">Nincs találat a megadott feltételeknek megfelelően.</p>
            <p className="text-sm text-gray-500">Próbálj meg más szűrőfeltételeket.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((ad) => (
              <div key={ad.id} className="card-float bg-white overflow-hidden">
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {ad.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                    <Music size={14} /> {typeof ad.instrument === 'object' ? ad.instrument?.name_hu : ad.instrument}
                    <span className="mx-1">·</span>
                    <MapPin size={14} /> {typeof ad.location === 'object' ? ad.location?.city : ad.location}
                  </p>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {ad.short_description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {ad.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} /> {ad.contacts}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleContact(ad.teacher_id, `${ad.teacher?.first_name} ${ad.teacher?.last_name}`)}
                      className="px-4 py-2 bg-[#111111] text-white rounded-full text-sm hover:bg-[#D7A04D] transition-colors"
                    >
                      Kapcsolat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        teacherId={selectedTeacher?.id}
        teacherName={selectedTeacher?.name}
      />
    </div>
  );
};

export default SearchResultsPage;
