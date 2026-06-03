import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import voitures from '../data/voitures.json';
import { Voiture } from '../types/voiture';
import Toast from '../components/Toast';

export default function VoitureDetail() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Voiture | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    const found = (voitures as Voiture[]).find((v) => v.id === id);
    if (found) {
      setCar(found);
      setMainImage(found.images[0]);
    }
  }, [id]);

  if (!car) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-jost text-vd-caption">Chargement...</p>
      </main>
    );
  }

  const isSold = car.status === 'sold';
  const totalPrice = car.ownerAskingPrice + car.serviceFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '2290191007235';
    const message = `Bonjour, je suis intéressé(e) par le ${car.year} ${car.make} ${car.model} ${car.licencePlateLetters} disponible sur Voitures Dispo.\n\nVoici le lien vers le véhicule : ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Photo Gallery */}
      <section className="w-full">
        {/* Main Image */}
        <div className="w-full bg-gray-100" style={{ aspectRatio: '16 / 9' }}>
          {isSold && (
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)',
              }}
            />
          )}
          <img
            src={mainImage}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-opacity duration-200"
          />
        </div>

        {/* Thumbnail Strip */}
        <div className="w-full bg-white px-5 md:px-8 lg:px-12 py-5 flex gap-3 overflow-x-auto">
          {car.images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setMainImage(image)}
              className="flex-shrink-0 transition-opacity duration-150 rounded-sm"
              style={{
                width: window.innerWidth < 768 ? '60px' : '80px',
                height: window.innerWidth < 768 ? '60px' : '80px',
                border: mainImage === image ? '1px solid #0A0A0A' : '1px solid #E0E0E0',
                opacity: mainImage === image ? 1 : 0.7,
              }}
            >
              <img
                src={image}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Details Section */}
      <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        {/* Status Pill */}
        <div className="mb-6">
          <div
            className={`inline-block px-2 py-1 border border-vd-border rounded-sm font-jost uppercase text-xs font-light ${
              isSold ? 'bg-vd-black text-white' : 'bg-white text-vd-black'
            }`}
            style={{
              letterSpacing: '0.18em',
              fontSize: '9px',
              borderColor: isSold ? 'transparent' : '#E0E0E0',
            }}
          >
            {isSold ? 'VENDU' : 'DISPONIBLE'}
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <p
            className="font-jost font-light text-vd-caption uppercase mb-3"
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
            }}
          >
            Véhicule
          </p>
          <h1
            className="font-cormorant font-light text-vd-text"
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              letterSpacing: '0.01em',
            }}
          >
            {car.year} {car.make} {car.model}
          </h1>
        </div>

        {/* Price Block */}
        <div
          className="bg-vd-surface border border-vd-border rounded-sm p-6 mb-8"
          style={{
            borderRadius: '2px',
            padding: '24px',
          }}
        >
          <PriceRow
            label="Prix demandé par le propriétaire"
            value={formatPrice(car.ownerAskingPrice)}
            bold={false}
            divider={true}
          />
          <PriceRow
            label="Frais de service de Voitures Dispo"
            value={formatPrice(car.serviceFee)}
            bold={false}
            divider={true}
          />
          <PriceRow
            label="PRIX TOTAL"
            value={formatPrice(totalPrice)}
            bold={true}
            divider={false}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-vd-border mb-8" />

        {/* Specs Grid */}
        <div className="mb-8">
          <p
            className="font-jost font-light text-vd-caption uppercase mb-6"
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
            }}
          >
            Caractéristiques
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <SpecCell label="Série / Immatriculation" value={car.licencePlateLetters} />
            <SpecCell label="Kilométrage" value={car.mileage} />
            <SpecCell label="Carburant" value={car.fuelType} />
            <SpecCell label="Consommation" value={car.fuelConsumption} />
            <SpecCell label="Transmission" value={car.transmission} />
            <SpecCell label="Motorisation" value={car.motorType} />
            <SpecCell label="Couleur" value={car.color} />
            <SpecCell label="Localisation" value={car.vehicleLocation} />
            <SpecCell
              label="Provenance"
              value={
                car.dealerPurchased
                  ? 'Acheté chez un concessionnaire'
                  : 'Particulier'
              }
            />
            {car.underWarranty !== null && (
              <SpecCell
                label="Garantie"
                value={
                  car.underWarranty
                    ? car.warrantyDetails || ''
                    : 'Non garantie'
                }
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-vd-border mb-8" />

        {/* Description */}
        <div className="mb-12">
          <p
            className="font-jost font-light text-vd-caption uppercase mb-4"
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
            }}
          >
            Description
          </p>
          <p
            className="font-jost font-light text-vd-meta"
            style={{
              fontSize: '15px',
              lineHeight: '1.9',
            }}
          >
            {car.description}
          </p>
        </div>

        {/* Action Buttons or Sold Message */}
        {isSold ? (
          <div className="flex items-center justify-center gap-4 py-12">
            <div className="flex-1 border-t border-vd-border" />
            <p
              className="font-cormorant font-light italic text-vd-caption text-center flex-shrink-0"
              style={{ fontSize: '20px' }}
            >
              Ce véhicule a trouvé son propriétaire.
            </p>
            <div className="flex-1 border-t border-vd-border" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleWhatsAppClick}
              className="bg-vd-black text-white font-jost uppercase font-light py-3 px-6 rounded-sm transition-colors duration-200 hover:bg-gray-800"
              style={{
                letterSpacing: '0.15em',
                fontSize: '12px',
              }}
            >
              Contacter sur WhatsApp
            </button>
            <button
              onClick={handleShareClick}
              className="bg-white text-vd-black border border-vd-black font-jost uppercase font-light py-3 px-6 rounded-sm transition-colors duration-200 hover:bg-vd-surface"
              style={{
                letterSpacing: '0.15em',
                fontSize: '12px',
              }}
            >
              {copyToast ? 'Lien Copié ✓' : 'Partager ce véhicule'}
            </button>
          </div>
        )}
      </section>

      {/* Toast */}
      {copyToast && <Toast message="Lien copié." />}
    </main>
  );
}

function PriceRow({
  label,
  value,
  bold,
  divider,
}: {
  label: string;
  value: string;
  bold: boolean;
  divider: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-center py-4">
        <span
          className="font-jost font-light text-vd-meta"
          style={{
            fontSize: bold ? '13px' : '13px',
            textTransform: bold ? 'uppercase' : 'none',
            letterSpacing: bold ? '0.12em' : 'normal',
          }}
        >
          {label}
        </span>
        <span
          className="font-jost text-vd-text"
          style={{
            fontSize: bold ? '18px' : '14px',
            fontWeight: bold ? 600 : 400,
          }}
        >
          {value}
        </span>
      </div>
      {divider && <div className="border-t border-vd-border" />}
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-vd-border pb-4">
      <p
        className="font-jost uppercase text-vd-caption mb-2"
        style={{
          fontSize: '10px',
          letterSpacing: '0.2em',
        }}
      >
        {label}
      </p>
      <p
        className="font-jost font-normal text-vd-text"
        style={{ fontSize: '14px' }}
      >
        {value}
      </p>
    </div>
  );
}
