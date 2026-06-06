import { useMemo } from 'react';
import voitures from '../data/voitures.json';
import { Voiture } from '../types/voiture';
import { VehicleRequestForm } from '../components/VehicleRequestForm';
import { CarCard } from '../components/CarCard';
import { matchesCar } from '../utils/matchesCar';

interface CatalogueProps {
  searchValue: string;
  onClearSearch: () => void;
}

const ALL_CARS = voitures as Voiture[];

export default function Catalogue({ searchValue, onClearSearch }: CatalogueProps) {
  const filteredCars = useMemo(() => {
    if (!searchValue.trim()) return ALL_CARS;
    return ALL_CARS.filter(car => matchesCar(car, searchValue));
  }, [searchValue]);

  const hasQuery = searchValue.trim().length > 0;
  const hasResults = filteredCars.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <section className="w-full bg-vd-black py-20 md:py-32 lg:py-40">
        <div className="px-5 md:px-8 lg:px-12 flex flex-col items-center text-center">
          <p className="font-jost font-light text-vd-caption uppercase text-label tracking-widest anim-init animate-fade-up">
            Collection
          </p>
          <h1 className="font-cormorant font-light text-white mt-6 text-[clamp(48px,10vw,80px)] tracking-wide anim-init animate-fade-up">
            Notre Collection
          </h1>
          <div className="h-px bg-gray-600 mt-8 w-15 anim-init animate-fade-up" />
          <p className="font-jost font-light text-vd-caption mt-8 max-w-lg text-sm tracking-wide anim-init animate-fade-up">
            Garantie: un seul intermédiaire, nous.
          </p>
        </div>
      </section>

      {hasQuery && hasResults && (
        <div className="px-5 md:px-8 lg:px-12 pt-8 pb-0">
          <p className="font-jost font-light text-vd-caption text-xs">
            {filteredCars.length} véhicule{filteredCars.length > 1 ? 's' : ''} trouvé{filteredCars.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {hasQuery && !hasResults ? (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12">
          <VehicleRequestForm searchQuery={searchValue} onReturnToCatalogue={onClearSearch} />
        </section>
      ) : (
        <section className="w-full bg-white px-5 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20">
          <div className="grid gap-5 md:gap-6 lg:gap-8 grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))]">
            {filteredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
