'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { apiClient } from '@/lib/api';
import { getLikedTattoos, addLike, hasLiked } from '@/lib/likes';
import { Button, Card, Input } from '@/components/ui';
import { CustomListbox, ListboxOption } from '@/components/ui/Listbox';
import {
  HeartIcon as HeartIconOutline,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Tattoo, Category, TattooFilters, PaginationInfo } from '@/types';
import Link from 'next/link';
import { TattooModal } from '@/components/gallery/TattooModal';


interface GalleryPageClientProps {
  initialTattoos: Tattoo[];
  initialCategories: Category[];
  initialPagination?: PaginationInfo;
  initialFilters: TattooFilters;
}

interface GalleryState {
  tattoos: Tattoo[];
  categories: Category[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  filters: TattooFilters;
}

export default function GalleryPageClient({ 
  initialTattoos, 
  initialCategories, 
  initialPagination, 
  initialFilters 
}: GalleryPageClientProps) {
  const router = useRouter();
  
  const [state, setState] = useState<GalleryState>({
    tattoos: initialTattoos,
    categories: initialCategories,
    isLoading: false,
    hasMore: initialPagination ? initialPagination.page < initialPagination.pages : false,
    page: 1,
    filters: {
      ...initialFilters,
      sortBy: initialFilters.sortBy || 'createdAt',
      order: initialFilters.order || 'desc'
    },
  });

  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [likedTattoos, setLikedTattoos] = useState<string[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleOpenTattooModal = async (tattoo: Tattoo) => {
    try {
      const fullTattoo = await apiClient.getTattooById(tattoo._id);
      setSelectedTattoo(fullTattoo);
    } catch (error) {
      console.error('Error fetching tattoo details:', error);
    }
  };

  const backgroundTattoos = useMemo(() => 
    state.tattoos.filter(t => t.images && t.images.length > 0).slice(0, 5),
    [state.tattoos]
  );

  useEffect(() => {
    setLikedTattoos(getLikedTattoos());
  }, []);

  const updateFilters = useCallback((newFilters: Partial<TattooFilters>) => {
    const updated = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updated, page: 1, hasMore: true }));
  }, [state.filters]);

  const loadTattoos = useCallback(async (pageToLoad: number, currentFilters: TattooFilters) => {
    if (pageToLoad === 1 && initialTattoos.length > 0 && JSON.stringify(currentFilters) === JSON.stringify(initialFilters)) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await apiClient.getTattoos({ ...currentFilters, page: pageToLoad });
      const newTattoos = response.data?.tattoos || [];

      setState(prev => ({
        ...prev,
        tattoos: pageToLoad === 1 ? newTattoos : [...prev.tattoos, ...newTattoos],
        isLoading: false,
        hasMore: newTattoos.length > 0 && (response.pagination ? pageToLoad < response.pagination.pages : false),
        page: pageToLoad,
      }));
    } catch (error) {
      console.error('Error loading tattoos:', error);
      setState(prev => ({ ...prev, isLoading: false, hasMore: false }));
    }
  }, [initialTattoos, initialFilters]);

  useEffect(() => {
    loadTattoos(1, state.filters);
  }, [state.filters, loadTattoos]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && state.hasMore && !state.isLoading) {
          loadTattoos(state.page + 1, state.filters);
        }
      },
      { rootMargin: "0px 0px 400px 0px" } // Cargar imágenes antes de que aparezcan en pantalla
    );
    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }
    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [state.hasMore, state.isLoading, state.page, state.filters, loadTattoos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery.trim() || undefined });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setState(prev => ({
      ...prev,
      filters: {
        sortBy: 'createdAt',
        order: 'desc'
      },
      page: 1,
      hasMore: true
    }));
  };

  const handleLikeTattoo = async (tattooId: string, isDoubleClick = false) => {
    if (hasLiked(tattooId)) return;

    try {
      if (!isDoubleClick) { // La API solo se llama desde el botón, no con el doble clic estético
      await apiClient.likeTattoo(tattooId);
      }
      addLike(tattooId);
      setLikedTattoos(prev => [...prev, tattooId]);

      const updateTattoo = (tattoo: Tattoo) => tattoo._id === tattooId ? { ...tattoo, likes: (tattoo.likes || 0) + 1 } : tattoo;
      setState(prev => ({ ...prev, tattoos: prev.tattoos.map(updateTattoo) }));
      
      if (selectedTattoo?._id === tattooId) {
        setSelectedTattoo(prev => prev ? updateTattoo(prev) : null);
      }
    } catch (error) {
      console.error('Error giving like:', error);
    }
  };

  const onLikeInModal = (e: React.MouseEvent, tattooId: string) => {
    e.stopPropagation();
    handleLikeTattoo(tattooId);
  };

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden pt-20">
      {/* Dynamic Background */}
      {backgroundTattoos.length > 0 && (
        <div className="absolute inset-0 z-0 opacity-[0.20]">
    <motion.div
            className="flex h-full w-[500%]" // 5 images
            animate={{ x: ['0%', '-400%'] }}
            transition={{
              ease: 'linear',
              duration: 1200,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            {backgroundTattoos.map((tattoo: Tattoo) => (
              <div key={tattoo._id} className="w-[100%] h-full" style={{
                backgroundImage: `url(${tattoo.images[0].url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
            ))}
          </motion.div>
          <div className="absolute inset-0 backdrop-blur-md" />
        </div>
      )}

      <div className="relative z-10">
        <header className="pt-24 pb-12 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter"
          >
            Galería
          </motion.h1>
          <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-gray-400"
          >
            Un lienzo de historias, cada una contada con tinta y aguja.
          </motion.p>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Botón para abrir filtros en móvil */}
          <div className="md:hidden text-center mb-6">
            <Button onClick={() => setIsFiltersOpen(true)} variant="outline" icon={<FunnelIcon className="h-5 w-5 mr-2" />}>
              Mostrar Filtros
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* --- Panel de Filtros para Escritorio --- */}
            <div className="hidden md:block">
              <FilterPanel 
                categories={state.categories} 
                filters={state.filters} 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onUpdateFilters={updateFilters}
                onSearch={handleSearch}
                onClear={clearFilters}
              />
        </div>

            {/* --- Modal de Filtros para Móvil --- */}
            <FilterModal 
              isOpen={isFiltersOpen}
              onClose={() => setIsFiltersOpen(false)}
              categories={state.categories} 
              filters={state.filters} 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onUpdateFilters={updateFilters}
              onSearch={handleSearch}
              onClear={clearFilters}
            />

            {/* --- Cuadrícula de Tatuajes --- */}
            <div className="flex-1">
              {state.isLoading && state.tattoos.length === 0 ? (
                <TattooGridSkeleton />
              ) : state.tattoos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]" style={{ gridAutoFlow: 'dense' }}>
                  {state.tattoos.map(tattoo => (
                    <div 
                      key={tattoo._id} 
                      className={getGridSpan(tattoo.images[0]?.width, tattoo.images[0]?.height)}
                    >
                      <TattooCard 
                        tattoo={tattoo} 
                        isLiked={likedTattoos.includes(tattoo._id)}
                        onSelect={() => handleOpenTattooModal(tattoo)} 
                        onLike={handleLikeTattoo} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold">No se encontraron tatuajes</h3>
                  <p className="text-gray-400 mt-2">Prueba a cambiar los filtros o a realizar otra búsqueda.</p>
                  <Button onClick={clearFilters} variant="primary" className="mt-6">Ver todos los tatuajes</Button>
                </div>
              )}
              <div ref={loaderRef} className="h-10" />
              {state.isLoading && state.tattoos.length > 0 && (
                  <div className="flex justify-center items-center py-10">
                    <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                )}
            </div>
          </div>
        </main>

        <AnimatePresence>
          {selectedTattoo && (
            <TattooModal 
              tattoo={selectedTattoo} 
              isLiked={hasLiked(selectedTattoo._id)}
              onClose={() => setSelectedTattoo(null)} 
              onLike={onLikeInModal}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Componentes de la Galería ---

const getGridSpan = (width?: number, height?: number): string => {
  if (!width || !height) return 'col-span-1 row-span-1';
  
  const aspectRatio = width / height;
  
  // Umbrales ajustados para una mejor detección de formato
  if (aspectRatio > 1.3) { // Antes era 1.5
    return 'col-span-2 row-span-1'; // Imagen horizontal (2x1)
  } else if (aspectRatio < 0.8) { // Antes era 0.7
    return 'col-span-1 row-span-2'; // Imagen vertical (1x2)
  }
  
  return 'col-span-1 row-span-1'; // Imagen cuadrada (1x1)
};

const TattooCard = ({ tattoo, isLiked, onSelect, onLike }: { tattoo: Tattoo; isLiked: boolean; onSelect: () => void; onLike: (id:string, isDoubleClick?: boolean) => void }) => {
  const image = tattoo.images[0];
  const gridSpanClass = getGridSpan(image?.width, image?.height);
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLiked || isAnimatingLike) return;
    
    setIsAnimatingLike(true);
    onLike(tattoo._id, false); // Explicitly false for button click
    
    setTimeout(() => {
      setIsAnimatingLike(false);
    }, 1000);
  };

  const handleDoubleClick = () => {
    if (isLiked || isAnimatingLike) return;
    
    setIsAnimatingLike(true);
    onLike(tattoo._id, true);
    
    setTimeout(() => {
      setIsAnimatingLike(false);
    }, 1000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
      className={`group relative cursor-pointer overflow-hidden rounded-lg h-full w-full`}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
    >
      <AnimatePresence>
        {isAnimatingLike && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <HeartIconSolid className="w-1/3 h-1/3 text-white/90" />
          </motion.div>
        )}
      </AnimatePresence>
      <img
        src={image?.url || '/placeholder.jpg'}
        alt={tattoo.title}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 p-4 text-white w-full">
        <div className="flex justify-between items-end">
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="font-bold text-lg"
          >
            {tattoo.title}
          </motion.h3>
          <button
            onClick={handleLike}
            disabled={isLiked}
            className={`transition-transform duration-200 ease-in-out text-white opacity-0 group-hover:opacity-100 ${!isLiked ? 'hover:scale-125' : ''}`}
            aria-label="Like tattoo"
          >
            {isLiked ? (
              <HeartIconSolid className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIconOutline className="w-6 h-6" />
            )}
          </button>
        </div>
        </div>
    </motion.div>
  );
};

const FilterPanelContent = ({ categories, filters, searchQuery, setSearchQuery, onUpdateFilters, onSearch, onClear }: any) => {
  const categoryOptions: ListboxOption[] = useMemo(() => [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((cat: Category) => ({ value: cat._id, label: cat.name }))
  ], [categories]);

  const styleOptions: ListboxOption[] = [
    { value: '', label: 'Todos los estilos' },
    { value: 'tradicional', label: 'Tradicional' },
    { value: 'realista', label: 'Realista' },
    { value: 'geometrico', label: 'Geométrico' },
    { value: 'minimalista', label: 'Minimalista' },
    { value: 'blackwork', label: 'Blackwork' },
    { value: 'color', label: 'Color' },
    { value: 'tribal', label: 'Tribal' },
    { value: 'neo-tradicional', label: 'Neo-tradicional' },
    { value: 'otro', label: 'Otro' },
  ];

  const bodyPartOptions: ListboxOption[] = [
    { value: '', label: 'Todas las zonas' },
    { value: 'brazo', label: 'Brazo' },
    { value: 'pierna', label: 'Pierna' },
    { value: 'espalda', label: 'Espalda' },
    { value: 'pecho', label: 'Pecho' },
    { value: 'cuello', label: 'Cuello' },
    { value: 'mano', label: 'Mano' },
    { value: 'pie', label: 'Pie' },
    { value: 'torso', label: 'Torso' },
    { value: 'otro', label: 'Otro' },
  ];

  const sizeOptions: ListboxOption[] = [
    { value: '', label: 'Todos los tamaños' },
    { value: 'pequeño', label: 'Pequeño' },
    { value: 'mediano', label: 'Mediano' },
    { value: 'grande', label: 'Grande' },
    { value: 'extra-grande', label: 'Extra grande' },
  ];

  const sortOptions: ListboxOption[] = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'popular', label: 'Más populares' },
    { value: 'views', label: 'Más vistos' },
  ];

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Filtrar</h3>
      <form onSubmit={onSearch} className="space-y-6">
        <Input
          label="Buscar..."
          placeholder="Realismo, flores, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
        />
        <CustomListbox
          label="Categoría"
          options={categoryOptions}
          value={filters.category || ''}
          onChange={(value) => onUpdateFilters({ category: value || undefined })}
        />
        <CustomListbox
          label="Estilo"
          options={styleOptions}
          value={filters.style || ''}
          onChange={(value) => onUpdateFilters({ style: value || undefined })}
        />
        <CustomListbox
          label="Parte del cuerpo"
          options={bodyPartOptions}
          value={filters.bodyPart || ''}
          onChange={(value) => onUpdateFilters({ bodyPart: value || undefined })}
        />
        <CustomListbox
          label="Tamaño"
          options={sizeOptions}
          value={filters.size || ''}
          onChange={(value) => onUpdateFilters({ size: value || undefined })}
        />
        <CustomListbox
          label="Ordenar por"
          options={sortOptions}
          value={filters.sortBy || 'newest'}
          onChange={(value) => onUpdateFilters({ 
            sortBy: value === 'newest' ? 'createdAt' : value === 'popular' ? 'likes' : 'views',
            order: 'desc'
          })}
        />
        <div className="pt-2 space-y-2">
            <Button type="submit" variant="primary" className="w-full">Buscar</Button>
            <Button type="button" variant="secondary" onClick={onClear} className="w-full">Limpiar</Button>
        </div>
      </form>
    </div>
  );
};

const FilterPanel = ({ categories, filters, searchQuery, setSearchQuery, onUpdateFilters, onSearch, onClear }: any) => (
  <aside className="w-full md:w-64 lg:w-72 md:sticky top-24 self-start">
    <div className="relative rounded-lg bg-black/90 backdrop-blur-sm">
      <FilterPanelContent
        categories={categories}
        filters={filters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onUpdateFilters={onUpdateFilters}
        onSearch={onSearch}
        onClear={onClear}
      />
    </div>
  </aside>
);

const FilterModal = ({ isOpen, onClose, ...props }: any) => (
  <Transition show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="transition-opacity ease-linear duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>

      <div className="fixed inset-0 flex">
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="translate-y-full"
          enterTo="translate-y-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-y-0"
          leaveTo="translate-y-full"
        >
          <Dialog.Panel className="relative ml-auto flex h-full w-full flex-col overflow-y-auto bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between px-4 pt-4">
              <h2 className="text-lg font-medium text-white">Filtros</h2>
              <button
                type="button"
                className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-white"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <FilterPanelContent {...props} />

          </Dialog.Panel>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

const TattooGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]" style={{ gridAutoFlow: 'dense' }}>
    {[...Array(9)].map((_, i) => {
      const spans = ['col-span-1 row-span-1', 'col-span-2 row-span-1', 'col-span-1 row-span-2'];
      const spanClass = spans[i % 3];
      return <div key={i} className={`bg-gray-900 rounded-lg animate-pulse ${spanClass}`} />
    })}
  </div>
);