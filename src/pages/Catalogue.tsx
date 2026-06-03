import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import voitures from '../data/voitures.json';
import { Voiture } from '../types/voiture';

export default function Catalogue() {
  const [carsData, setCarsData] = useState<Voiture[]>([]);

  useEffect(() => {
    setCarsData(voitures as Voiture[]);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-vd-black py-20 md:py-32 lg:py-40">
        <div className="px-5 md:px-8 lg:px-12 flex flex-col items-center text-center">
          {/* Label */}
          <p
            className="font-jost font-light text-vd-caption uppercase anim-init animate-fade-up"
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
              animationDelay: '0ms',
            }}
          >
            Collection
          </p>

          {/* Heading */}
          <h1
            className="font-cormorant font-light text-white mt-6 anim-init animate-fade-up"
            style={{
              fontSize: 'clamp(48px, 10vw, 80px)',
              letterSpacing: '0.01em',
              animationDelay: '120ms',
            }}
          >
            Notre Collection
          </h1>

          {/* Divider */}
          <div
            className="w-15 h-px bg-gray-600 mt-8 anim-init animate-fade-up"
            style={{
              width: '60px',
              animationDelay: '240ms',
            }}
          />

          {/* Subtitle */}
          <p
            className="font-jost font-light text-vd-caption mt-8 max-w-lg anim-init animate-fade-up"
            style={{
              fontSize: '14px',
              letterSpacing: '0.05em',
              animationDelay: '360ms',
            }}
          >
            Des véhicules d'exception, soigneusement sélectionnés
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
        <div
          className="grid gap-5 md:gap-6 lg:gap-8"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 1fr), 1fr))',
          }}
        >
          {carsData.map((car) => (
            <CarCard key={car.id} car={car} formatPrice={formatPrice} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CarCard({
  car,
  formatPrice,
}: {
  car: Voiture;
  formatPrice: (price: number) => string;
}) {
  const isSold = car.status === 'sold';
  const totalPrice = car.ownerAskingPrice + car.serviceFee;

  return (
    <Link
      to={`/voitures/${car.id}`}
      className="group flex flex-col bg-white border border-vd-border rounded-sm overflow-hidden transition-shadow duration-300 hover:shadow-subtle-md cursor-pointer"
    >
      {/* Cover Photo */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        {isSold && (
          <div className="absolute inset-0 bg-black bg-opacity-35 z-10" />
        )}
        <img
          src={car.images[0] || ''}
          alt={`${car.year} ${car.make} ${car.model}`}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            !isSold ? 'group-hover:scale-103' : ''
          }`}
          style={{
            transform: !isSold ? undefined : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!isSold) {
              (e.target as HTMLImageElement).style.transform = 'scale(1.03)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSold) {
              (e.target as HTMLImageElement).style.transform = 'scale(1)';
            }
          }}
        />

        {/* Status Pill */}
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`px-2 py-1 border border-vd-border rounded-sm font-jost uppercase text-xs font-light transition-colors duration-200 ${
              isSold
                ? 'bg-vd-black text-white'
                : 'bg-white text-vd-black'
            }`}
            style={{
              letterSpacing: '0.18em',
              fontSize: '9px',
            }}
          >
            {isSold ? 'VENDU' : 'DISPONIBLE'}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <h3
          className="font-cormorant font-light text-vd-text"
          style={{
            fontSize: '22px',
            lineHeight: '1.2',
          }}
        >
          {car.year} {car.make} {car.model}
        </h3>

        {/* Price */}
        <p
          className="font-jost font-normal text-vd-text mt-2"
          style={{ fontSize: '16px' }}
        >
          {formatPrice(totalPrice)}
        </p>

        {/* Divider */}
        <div
          className="border-t border-vd-border"
          style={{ margin: '16px 0' }}
        />

        {/* Specs */}
        <p
          className="font-jost font-light text-vd-caption"
          style={{
            fontSize: '12px',
            letterSpacing: '0.03em',
          }}
        >
          {car.mileage} · {car.fuelType} · {car.transmission}
        </p>
      </div>

      {/* CTA Footer */}
      <div
        className="border-t border-vd-border px-5 py-4 transition-all duration-200 group-hover:translate-x-1"
        style={{
          borderTop: '1px solid #E0E0E0',
        }}
      >
        <p
          className="font-jost uppercase font-light text-vd-text"
          style={{
            fontSize: '11px',
            letterSpacing: '0.18em',
          }}
        >
          {isSold ? 'VOIR LE VÉHICULE (VENDU) →' : 'VOIR LE VÉHICULE →'}
        </p>
      </div>
    </Link>
  );
}
