import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileSearchOpen(false);
    setSearchValue('');
  }, [location.pathname]);

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const handleCloseMobileSearch = () => {
    setMobileSearchOpen(false);
    setSearchValue('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-vd-black" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Main navbar row */}
      <div className="w-full px-5 md:px-8 lg:px-12">
        <div className="flex items-center h-16 gap-4">

          {/* Left: Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="font-cormorant text-white font-light tracking-wide transition-opacity duration-200 hover:opacity-75"
              style={{ fontSize: '22px', letterSpacing: '0.05em' }}
            >
              Voitures Dispo
            </Link>
          </div>

          {/* Center: Desktop search bar */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <div className="w-full max-w-md relative">
              <Search
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-vd-caption pointer-events-none"
              />
              <input
                type="text"
                placeholder="Rechercher par marque, modèle, année..."
                className="w-full pl-10 pr-4 py-2 rounded-full font-jost font-light text-sm text-white placeholder-vd-caption focus:outline-none focus:ring-0 transition-colors duration-200"
                style={{
                  background: '#1A1A1A',
                  fontSize: '13px',
                  fontWeight: 300,
                }}
                readOnly
              />
            </div>
          </div>

          {/* Right: desktop empty + mobile search icon */}
          <div className="flex-shrink-0 ml-auto">
            {/* Mobile: search icon */}
            <button
              className="md:hidden flex items-center justify-center text-white transition-opacity duration-200 hover:opacity-70"
              onClick={() => setMobileSearchOpen(prev => !prev)}
              aria-label="Ouvrir la recherche"
            >
              <Search size={20} />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile: expandable search bar */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${
          mobileSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ borderTop: mobileSearchOpen ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
      >
        <div className="px-5 py-3 flex items-center gap-3" style={{ background: '#0A0A0A' }}>
          <Search size={14} className="text-vd-caption flex-shrink-0" />
          <input
            ref={mobileInputRef}
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Rechercher par marque, modèle, année..."
            className="flex-1 bg-transparent font-jost font-light text-white placeholder-vd-caption focus:outline-none"
            style={{ fontSize: '13px', fontWeight: 300 }}
          />
          <button
            onClick={handleCloseMobileSearch}
            className="flex-shrink-0 text-white transition-opacity duration-200 hover:opacity-70"
            aria-label="Fermer la recherche"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
