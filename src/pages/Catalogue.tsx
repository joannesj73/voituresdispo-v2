import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';
import voitures from '../data/voitures.json';
import { Voiture } from '../types/voiture';

interface CatalogueProps {
  searchValue: string;
  onClearSearch: () => void;
}

const ALL_CARS = voitures as Voiture[];

function matchesCar(car: Voiture, query: string): boolean {
  const totalPrice = car.ownerAskingPrice + car.serviceFee;
  const words = query.trim().split(/\s+/).filter(Boolean);

  // Detect year-range: two 4-digit numbers
  const fourDigitNums = words.filter(w => /^\d{4}$/.test(w)).map(Number);
  if (fourDigitNums.length === 2) {
    const [a, b] = fourDigitNums.sort((x, y) => x - y);
    return car.year >= a && car.year <= b;
  }

  // Detect single year: one 4-digit number
  if (fourDigitNums.length === 1) {
    return car.year === fourDigitNums[0];
  }

  return words.every(word => {
    const lower = word.toLowerCase();

    // Price ceiling: single number > 1000
    if (/^\d+$/.test(word) && Number(word) > 1000) {
      return totalPrice <= Number(word);
    }

    const fields = [
      car.make,
      car.model,
      String(car.year),
      car.fuelType,
      car.transmission,
      car.motorType,
      car.color,
      car.mileage,
      String(car.ownerAskingPrice),
      String(totalPrice),
      car.vehicleLocation,
    ];

    return fields.some(f => f.toLowerCase().includes(lower));
  });
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

// --- Request form ---

interface FormFields {
  nom: string;
  telephone: string;
  countryCode: string;
  vehicule: string;
  budget: string;
}

interface FormErrors {
  nom?: string;
  telephone?: string;
  vehicule?: string;
}

const COUNTRY_CODES = [
  { name: 'Benin', code: 'BJ', prefix: '+229' },
  { name: 'Côte d\'Ivoire', code: 'CI', prefix: '+225' },
  { name: 'Togo', code: 'TG', prefix: '+228' },
  { name: 'Ghana', code: 'GH', prefix: '+233' },
  { name: 'Cameroon', code: 'CM', prefix: '+237' },
  { name: 'Nigeria', code: 'NG', prefix: '+234' },
  { name: 'Senegal', code: 'SN', prefix: '+221' },
  { name: 'Mali', code: 'ML', prefix: '+223' },
  { name: 'Burkina Faso', code: 'BF', prefix: '+226' },
  { name: 'Niger', code: 'NE', prefix: '+227' },
];

function VehicleRequestForm({ searchQuery, onReturnToCatalogue }: { searchQuery: string; onReturnToCatalogue: () => void }) {
  const [fields, setFields] = useState<FormFields>({
    nom: '',
    telephone: '',
    countryCode: 'BJ',
    vehicule: searchQuery,
    budget: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormFields, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    if (!phone.trim()) return false;

    const country = COUNTRY_CODES.find(c => c.code === countryCode);
    if (!country) return false;

    // Build full phone number with country prefix
    let fullNumber = phone.trim();
    if (!fullNumber.startsWith('+')) {
      fullNumber = country.prefix + fullNumber;
    }

    // Special validation for Benin (both old and new formats)
    if (countryCode === 'BJ') {
      const cleaned = fullNumber.replace(/\D/g, '');
      // Old format: 22991007235 (11 digits)
      // New format: 2290191007235 (13 digits)
      if (!/^22991\d{7}$/.test(cleaned) && !/^229019\d{7}$/.test(cleaned)) {
        return false;
      }
      return true;
    }

    // For other countries, use libphonenumber-js validation
    return isValidPhoneNumber(fullNumber, countryCode as any);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Nom: required and must not be purely numeric
    if (!fields.nom.trim()) {
      newErrors.nom = 'Ce champ est obligatoire.';
    } else if (/^\d+$/.test(fields.nom.trim())) {
      newErrors.nom = 'Veuillez entrer un nom valide.';
    }

    // Téléphone: required and must be valid
    if (!fields.telephone.trim()) {
      newErrors.telephone = 'Ce champ est obligatoire.';
    } else if (!validatePhoneNumber(fields.telephone, fields.countryCode)) {
      newErrors.telephone = 'Veuillez entrer un numéro valide.';
    }

    // Véhicule: required
    if (!fields.vehicule.trim()) {
      newErrors.vehicule = 'Ce champ est obligatoire.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendTelegramMessage = async () => {
    // TELEGRAM SETUP:
    // 1. Open Telegram and search for @BotFather
    // 2. Send /newbot and follow the prompts to create your bot — copy the token it gives you
    // 3. Add your bot to your private group as an admin
    // 4. To get your group's chat_id, send a message in the group, then visit:
    //    https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates
    //    and look for "chat": { "id": ... } in the response
    // 5. Replace YOUR_BOT_TOKEN and YOUR_CHAT_ID below with your real values
    const BOT_TOKEN = 'YOUR_BOT_TOKEN';
    const CHAT_ID = 'YOUR_CHAT_ID';

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} à ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const budget = fields.budget.trim() || 'Non renseigné';

    const text =
      `*🚗 Nouvelle demande de véhicule*\n\n` +
      `*Nom :* ${fields.nom}\n` +
      `*Téléphone :* ${COUNTRY_CODES.find(c => c.code === fields.countryCode)?.prefix}${fields.telephone}\n` +
      `*Véhicule recherché :* ${fields.vehicule}\n` +
      `*Budget :* ${budget}\n\n` +
      `*Statut :* En attente ⏳\n` +
      `*Reçue le :* ${dateStr}`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, parse_mode: 'Markdown', text }),
      });
    } catch {
      // silently ignored
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    sendTelegramMessage();
  };

  const prenom = fields.nom.trim().split(/\s+/)[0] || '';

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <p
          className="font-jost font-light text-vd-caption uppercase"
          style={{ fontSize: '10px', letterSpacing: '0.25em' }}
        >
          CONFIRMATION
        </p>
        <h2
          className="font-cormorant font-light text-vd-text mt-6"
          style={{ fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: '0.01em' }}
        >
          Demande envoyée
        </h2>
        <div className="h-px bg-vd-border mt-6" style={{ width: '60px' }} />
        <p
          className="font-jost font-light text-vd-meta mt-6 max-w-md"
          style={{ fontSize: '14px', lineHeight: '1.8' }}
        >
          Merci {prenom}. Nous reviendrons vers vous dès que nous aurons trouvé votre véhicule.
        </p>
        <button
          onClick={onReturnToCatalogue}
          className="w-full max-w-md bg-vd-black text-white font-jost font-light uppercase py-4 mt-8 transition-colors duration-200 hover:bg-gray-800"
          style={{ fontSize: '12px', letterSpacing: '0.15em' }}
        >
          RETOUR AU CATALOGUE
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-16 px-5 md:px-8">
      <p
        className="font-jost font-light text-vd-caption uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.25em' }}
      >
        DEMANDE DE VÉHICULE
      </p>
      <h2
        className="font-cormorant font-light text-vd-text mt-6"
        style={{ fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: '0.01em' }}
      >
        Nous n'avons pas ce véhicule actuellement.
      </h2>
      <div className="h-px bg-vd-border mt-6" style={{ width: '60px' }} />
      <p
        className="font-jost font-light text-vd-meta mt-6 max-w-md"
        style={{ fontSize: '14px', lineHeight: '1.8' }}
      >
        Laissez-nous vos coordonnées et nous vous contacterons dès que nous aurons des propositions.
      </p>

      <div className="w-full max-w-md mt-10 text-left flex flex-col gap-5">
        {/* Prénom et nom */}
        <div className="flex flex-col gap-1">
          <label
            className="font-jost font-light text-vd-meta uppercase"
            style={{ fontSize: '10px', letterSpacing: '0.2em' }}
          >
            Prénom et nom <span className="text-vd-text">*</span>
          </label>
          <input
            type="text"
            value={fields.nom}
            onChange={e => handleChange('nom', e.target.value)}
            className="w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 focus:outline-none focus:border-vd-text transition-colors duration-200"
            style={{ fontSize: '14px' }}
          />
          {errors.nom && (
            <p className="font-jost font-light text-vd-caption" style={{ fontSize: '11px' }}>
              {errors.nom}
            </p>
          )}
        </div>

        {/* Numéro de téléphone avec sélecteur de pays */}
        <div className="flex flex-col gap-1">
          <label
            className="font-jost font-light text-vd-meta uppercase"
            style={{ fontSize: '10px', letterSpacing: '0.2em' }}
          >
            Numéro de téléphone <span className="text-vd-text">*</span>
          </label>
          <div className="flex gap-3">
            <select
              value={fields.countryCode}
              onChange={e => handleChange('countryCode', e.target.value)}
              className="flex-shrink-0 border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 focus:outline-none focus:border-vd-text transition-colors duration-200"
              style={{ fontSize: '14px', minWidth: '100px' }}
            >
              {COUNTRY_CODES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.prefix}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={fields.telephone}
              onChange={e => handleChange('telephone', e.target.value)}
              placeholder="Votre numéro"
              className="flex-1 border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 focus:outline-none focus:border-vd-text transition-colors duration-200"
              style={{ fontSize: '14px' }}
            />
          </div>
          {errors.telephone && (
            <p className="font-jost font-light text-vd-caption" style={{ fontSize: '11px' }}>
              {errors.telephone}
            </p>
          )}
        </div>

        {/* Le véhicule recherché */}
        <div className="flex flex-col gap-1">
          <label
            className="font-jost font-light text-vd-meta uppercase"
            style={{ fontSize: '10px', letterSpacing: '0.2em' }}
          >
            Le véhicule que vous recherchez <span className="text-vd-text">*</span>
          </label>
          <textarea
            value={fields.vehicule}
            onChange={e => handleChange('vehicule', e.target.value)}
            rows={3}
            className="w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 resize-none focus:outline-none focus:border-vd-text transition-colors duration-200"
            style={{ fontSize: '14px' }}
          />
          {errors.vehicule && (
            <p className="font-jost font-light text-vd-caption" style={{ fontSize: '11px' }}>
              {errors.vehicule}
            </p>
          )}
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-1">
          <label
            className="font-jost font-light text-vd-meta uppercase"
            style={{ fontSize: '10px', letterSpacing: '0.2em' }}
          >
            Votre budget approximatif
          </label>
          <input
            type="text"
            value={fields.budget}
            onChange={e => handleChange('budget', e.target.value)}
            className="w-full border-b border-vd-border bg-transparent font-jost font-light text-vd-text py-2 focus:outline-none focus:border-vd-text transition-colors duration-200"
            style={{ fontSize: '14px' }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-vd-black text-white font-jost font-light uppercase py-4 mt-2 transition-colors duration-200 hover:bg-gray-800"
          style={{ fontSize: '12px', letterSpacing: '0.15em' }}
        >
          ENVOYER MA DEMANDE
        </button>

        <p
          className="font-jost font-light text-vd-caption text-center"
          style={{ fontSize: '12px' }}
        >
          Nous vous contacterons dès que possible.
        </p>
      </div>
    </div>
  );
}

// --- Main Catalogue ---

export default function Catalogue({ searchValue, onClearSearch }: CatalogueProps) {
  const filteredCars = useMemo(() => {
    if (!searchValue.trim()) return ALL_CARS;
    return ALL_CARS.filter(car => matchesCar(car, searchValue));
  }, [searchValue]);

  const hasQuery = searchValue.trim().length > 0;
  const hasResults = filteredCars.length > 0;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-vd-black py-20 md:py-32 lg:py-40">
        <div className="px-5 md:px-8 lg:px-12 flex flex-col items-center text-center">
          <p
            className="font-jost font-light text-vd-caption uppercase anim-init animate-fade-up"
            style={{ fontSize: '10px', letterSpacing: '0.25em', animationDelay: '0ms' }}
          >
            Collection
          </p>
          <h1
            className="font-cormorant font-light text-white mt-6 anim-init animate-fade-up"
            style={{ fontSize: 'clamp(48px, 10vw, 80px)', letterSpacing: '0.01em', animationDelay: '120ms' }}
          >
            Notre Collection
          </h1>
          <div
            className="h-px bg-gray-600 mt-8 anim-init animate-fade-up"
            style={{ width: '60px', animationDelay: '240ms' }}
          />
          <p
            className="font-jost font-light text-vd-caption mt-8 max-w-lg anim-init animate-fade-up"
            style={{ fontSize: '14px', letterSpacing: '0.05em', animationDelay: '360ms' }}
          >
            Des véhicules d'exception, soigneusement sélectionnés
          </p>
        </div>
      </section>

      {/* Result count */}
      {hasQuery && hasResults && (
        <div className="px-5 md:px-8 lg:px-12 pt-8 pb-0">
          <p
            className="font-jost font-light text-vd-caption"
            style={{ fontSize: '12px' }}
          >
            {filteredCars.length} véhicule{filteredCars.length > 1 ? 's' : ''} trouvé{filteredCars.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Grid or Zero state */}
      {hasQuery && !hasResults ? (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12">
          <VehicleRequestForm searchQuery={searchValue} onReturnToCatalogue={onClearSearch} />
        </section>
      ) : (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
          <div
            className="grid gap-5 md:gap-6 lg:gap-8"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}
          >
            {filteredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function CarCard({ car }: { car: Voiture }) {
  const isSold = car.status === 'sold';
  const totalPrice = car.ownerAskingPrice + car.serviceFee;

  return (
    <Link
      to={`/voitures/${car.id}`}
      className="group flex flex-col bg-white border border-vd-border rounded-sm overflow-hidden transition-shadow duration-300 hover:shadow-subtle-md cursor-pointer"
    >
      {/* Cover Photo */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        {isSold && <div className="absolute inset-0 bg-black bg-opacity-35 z-10" />}
        <img
          src={car.images[0] || ''}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-300"
          onMouseEnter={e => {
            if (!isSold) (e.target as HTMLImageElement).style.transform = 'scale(1.03)';
          }}
          onMouseLeave={e => {
            if (!isSold) (e.target as HTMLImageElement).style.transform = 'scale(1)';
          }}
        />
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`px-2 py-1 border border-vd-border rounded-sm font-jost uppercase font-light transition-colors duration-200 ${
              isSold ? 'bg-vd-black text-white' : 'bg-white text-vd-black'
            }`}
            style={{ letterSpacing: '0.18em', fontSize: '9px' }}
          >
            {isSold ? 'VENDU' : 'DISPONIBLE'}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-cormorant font-light text-vd-text" style={{ fontSize: '22px', lineHeight: '1.2' }}>
          {car.year} {car.make} {car.model}
        </h3>
        <p className="font-jost font-normal text-vd-text mt-2" style={{ fontSize: '16px' }}>
          {formatPrice(totalPrice)}
        </p>
        <div className="border-t border-vd-border" style={{ margin: '16px 0' }} />
        <p className="font-jost font-light text-vd-caption" style={{ fontSize: '12px', letterSpacing: '0.03em' }}>
          {car.mileage} · {car.fuelType} · {car.transmission}
        </p>
      </div>

      {/* CTA Footer */}
      <div
        className="border-t border-vd-border px-5 py-4 transition-all duration-200 group-hover:translate-x-1"
        style={{ borderTop: '1px solid #E0E0E0' }}
      >
        <p
          className="font-jost uppercase font-light text-vd-text"
          style={{ fontSize: '11px', letterSpacing: '0.18em' }}
        >
          {isSold ? 'VOIR LE VÉHICULE (VENDU) →' : 'VOIR LE VÉHICULE →'}
        </p>
      </div>
    </Link>
  );
}
