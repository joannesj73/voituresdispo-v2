import { Link } from 'react-router-dom';
import { Voiture } from '../types/voiture';
import { formatPrice } from '../utils/formatPrice';

interface CarCardProps {
  car: Voiture;
}

export function CarCard({ car }: CarCardProps) {
  const isSold = car.status === 'sold';
  const totalPrice = car.ownerAskingPrice + car.serviceFee;

  return (
    <Link
      to={`/voitures/${car.id}`}
      className="group flex flex-col bg-white border border-vd-border rounded-sm overflow-hidden transition-shadow duration-300 hover:shadow-subtle-md cursor-pointer"
    >
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        {isSold && <div className="absolute inset-0 bg-black/35 z-10" />}
        <img
          src={car.images[0] || ''}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`px-2 py-1 border rounded-sm font-jost uppercase font-light transition-colors duration-200 text-[9px] tracking-widest ${
              isSold
                ? 'bg-vd-black text-white border-transparent'
                : 'bg-white text-vd-black border-vd-border'
            }`}
          >
            {isSold ? 'VENDU' : 'DISPONIBLE'}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-cormorant font-light text-vd-text text-xl leading-tight">
          {car.year} {car.make} {car.model}
        </h3>
        <p className="font-jost font-normal text-vd-text mt-2 text-base">
          {formatPrice(totalPrice)}
        </p>
        <div className="border-t border-vd-border my-4" />
        <p className="font-jost font-light text-vd-caption text-xs tracking-wide">
          {car.mileage} · {car.fuelType} · {car.transmission}
        </p>
      </div>

      <div className="border-t border-vd-border px-5 py-4 transition-all duration-200 group-hover:translate-x-1">
        <p className="font-jost uppercase font-light text-vd-text text-[11px] tracking-widest">
          {isSold ? 'VOIR LE VÉHICULE (VENDU) →' : 'VOIR LE VÉHICULE →'}
        </p>
      </div>
    </Link>
  );
}
