import { useState } from 'react';
import { useVoitures, notifyVoituresChanged } from '../hooks/useVoitures';
import { VoitureDB } from '../types/voitureDB';
import { formatPrice } from '../utils/formatPrice';
import { supabase } from '../lib/supabase';
import { VehicleDrawer } from '../components/VehicleDrawer';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';

const ACTION_BTN =
  'font-jost font-light text-xs text-vd-meta hover:text-vd-text underline-offset-2 hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-none p-0';

export default function Admin() {
  const { voitures, loading } = useVoitures();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<VoitureDB | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VoitureDB | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (car: VoitureDB) => {
    setEditing(car);
    setDrawerOpen(true);
  };

  const toggleStatus = async (car: VoitureDB) => {
    const newStatus = car.status === 'available' ? 'sold' : 'available';
    await supabase.from('voitures').update({ status: newStatus }).eq('id', car.id);
    notifyVoituresChanged();
  };

  const copyLink = async (car: VoitureDB) => {
    const url = `${window.location.origin}/voitures/${car.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(car.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback silently
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await supabase.from('voitures').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    notifyVoituresChanged();
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="px-5 md:px-8 lg:px-12 py-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-vd-border">
          <p className="font-jost font-[400] uppercase text-vd-text text-[13px] tracking-[0.2em]">
            Voitures Dispo — Gestion du Stock
          </p>
          <button
            onClick={openAdd}
            className="w-full md:w-auto bg-vd-black text-white font-jost uppercase font-light text-xs tracking-[0.15em] px-6 py-3 transition-colors duration-200 hover:bg-gray-800"
          >
            AJOUTER UN VÉHICULE +
          </button>
        </div>

        {loading ? (
          <p className="font-jost font-light text-vd-caption text-sm">Chargement...</p>
        ) : voitures.length === 0 ? (
          <p className="font-jost font-light text-vd-caption text-sm">Aucun véhicule.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-vd-border">
                    {['Photo', 'Véhicule', 'Prix total', 'Statut', 'Actions'].map(col => (
                      <th
                        key={col}
                        className="text-left font-jost font-light uppercase text-vd-caption text-[10px] tracking-[0.15em] pb-3 pr-6 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {voitures.map(car => (
                    <tr key={car.id} className="border-b border-vd-border">
                      <td className="py-4 pr-6">
                        <div className="w-14 h-14 rounded-sm overflow-hidden bg-vd-surface flex-shrink-0">
                          {car.images[0] ? (
                            <img
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-vd-surface" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-jost font-[400] text-vd-text text-sm whitespace-nowrap">
                          {car.year} {car.make} {car.model}
                        </p>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-jost font-light text-vd-text text-sm whitespace-nowrap">
                          {formatPrice(car.owner_asking_price + car.service_fee)}
                        </p>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-jost font-light text-vd-meta text-sm">
                          {car.status === 'available' ? 'Disponible' : 'Vendu'}
                        </p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <button className={ACTION_BTN} onClick={() => openEdit(car)}>
                            Modifier
                          </button>
                          <button className={ACTION_BTN} onClick={() => toggleStatus(car)}>
                            Changer le statut
                          </button>
                          <button
                            className={ACTION_BTN}
                            onClick={() => copyLink(car)}
                          >
                            {copiedId === car.id ? (
                              <span className="text-vd-text">Copié !</span>
                            ) : (
                              'Copier le lien'
                            )}
                          </button>
                          <button
                            className={`${ACTION_BTN} hover:!text-vd-text`}
                            onClick={() => setDeleteTarget(car)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-4">
              {voitures.map(car => (
                <div key={car.id} className="border border-vd-border rounded-sm overflow-hidden">
                  <div className="w-full aspect-[4/3] bg-vd-surface overflow-hidden">
                    {car.images[0] ? (
                      <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-vd-surface" />
                    )}
                  </div>

                  <div className="px-4 py-3 border-b border-vd-border">
                    <p className="font-jost font-[400] text-vd-text text-sm">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="font-jost font-light text-vd-text text-sm mt-1">
                      {formatPrice(car.owner_asking_price + car.service_fee)}
                    </p>
                    <p className="font-jost font-light text-vd-meta text-xs mt-1">
                      {car.status === 'available' ? 'Disponible' : 'Vendu'}
                    </p>
                  </div>

                  <div className="flex flex-col divide-y divide-vd-border">
                    <button
                      onClick={() => openEdit(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => toggleStatus(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
                    >
                      Changer le statut
                    </button>
                    <button
                      onClick={() => copyLink(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface transition-colors duration-150"
                    >
                      {copiedId === car.id ? 'Copié !' : 'Copier le lien'}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(car)}
                      className="w-full text-left px-4 py-3 font-jost font-light text-xs tracking-wide text-vd-meta hover:bg-vd-surface hover:text-vd-text transition-colors duration-150"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <VehicleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editing={editing}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}
