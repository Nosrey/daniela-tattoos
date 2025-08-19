'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Instagram, Phone, Mail, MapPin, Facebook, Twitter } from 'lucide-react';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { apiClient } from '@/lib/api';
import { getLikedTattoos, addLike, hasLiked } from '@/lib/likes';
import { Tattoo, Category, Settings } from '@/types';
import { config } from '@/lib/config';
import { TattooModal } from '@/components/gallery/TattooModal';

export default function HomePage() {
  const [featuredTattoos, setFeaturedTattoos] = useState<Tattoo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [heroTattoo, setHeroTattoo] = useState<Tattoo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likedTattoos, setLikedTattoos] = useState<string[]>([]);
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    setLikedTattoos(getLikedTattoos());
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [settingsData, featuredTattoosData, categoriesData] = await Promise.all([
          apiClient.getSettings(),
          apiClient.getFeaturedTattoos(),
          apiClient.getCategories(),
        ]);
        
        setSettings(settingsData);
        setFeaturedTattoos(featuredTattoosData);
        setCategories(categoriesData);

        let activeHeroTattoo: Tattoo | null = null;
        if (settingsData.hero.source === 'specific_tattoo' && settingsData.hero.specificTattooId) {
          activeHeroTattoo = await apiClient.getTattooById(settingsData.hero.specificTattooId);
        } else if (settingsData.hero.source === 'latest_tattoo') {
          const { data } = await apiClient.getTattoos({ limit: 1, page: 1, sortBy: 'createdAt', order: 'desc' });
          activeHeroTattoo = data.tattoos[0];
        } else if (settingsData.hero.source === 'most_popular') {
          const { data } = await apiClient.getTattoos({ limit: 1, page: 1, sortBy: 'likes', order: 'desc' });
           activeHeroTattoo = data.tattoos[0];
        } else if (settingsData.hero.source === 'latest_featured' && featuredTattoosData.length > 0) {
          activeHeroTattoo = featuredTattoosData[0];
        }
        setHeroTattoo(activeHeroTattoo);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroImageUrl = useMemo(() => {
    if (!settings) return null;

    switch (settings.hero.source) {
      case 'custom_image':
        return settings.hero.customImageUrl;
      case 'specific_tattoo':
      case 'latest_tattoo':
      case 'most_popular':
      case 'latest_featured':
      default:
        return heroTattoo?.images[0]?.url;
    }
  }, [settings, heroTattoo]);


  const handleLike = async (tattooId: string) => {
    if (hasLiked(tattooId)) return;
    
    try {
      await apiClient.likeTattoo(tattooId);
      addLike(tattooId);
      setLikedTattoos(prev => [...prev, tattooId]);
      setFeaturedTattoos(prev => prev.map(t => t._id === tattooId ? { ...t, likes: (t.likes || 0) + 1 } : t));
    } catch (error) {
      console.error('Error liking tattoo:', error);
    }
  };

  const handleOpenTattooModal = async (tattoo: Tattoo | null) => {
    if (!tattoo) return;
    try {
      const fullTattoo = await apiClient.getTattooById(tattoo._id);
      setSelectedTattoo(fullTattoo);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching full tattoo details:', error);
    }
  };

  const handleCloseTattooModal = () => {
    setModalOpen(false);
    setSelectedTattoo(null);
  };

  // Función para determinar el tamaño de cuadrícula basado en las dimensiones de la imagen
  const getGridSpanClass = (width?: number, height?: number): string => {
    if (!width || !height) return '';
    
    const aspectRatio = width / height;
    
    if (aspectRatio > 1.5) {
      return 'col-span-2 row-span-1'; // Imagen horizontal (2x1)
    } else if (aspectRatio < 0.7) {
      return 'col-span-1 row-span-2'; // Imagen vertical (1x2)
    }
    
    return 'col-span-1 row-span-1'; // Imagen cuadrada (1x1)
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
        <motion.div
          key={heroImageUrl}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          {heroImageUrl && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${heroImageUrl}')`,
                backgroundSize: settings?.hero.backgroundSize || 'cover',
                backgroundPosition: settings?.hero.backgroundPosition || 'center center',
              }}
            />
          )}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: settings?.hero.overlayOpacity ?? 0.6 }}
          />
        </motion.div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading text-5xl md:text-7xl font-bold mb-6"
          >
            {settings?.hero.title || config.app.name}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
          >
            {settings?.hero.subtitle || 'Arte en tu piel. Historias que perduran para siempre.'}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center space-x-4"
          >
            <Link href="/gallery" className="btn btn-primary px-8 py-3">
              Ver Galería
            </Link>
            {heroTattoo && settings?.hero.source !== 'custom_image' && (
              <button onClick={() => handleOpenTattooModal(heroTattoo)} className="btn btn-outline border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Ver Tatuaje
              </button>
            )}
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                {settings?.about?.title || 'Arte que Cuenta Historias'}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {settings?.about?.paragraph1 || 'Con más de 10 años de experiencia...'}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {settings?.about?.paragraph2 || 'Mi compromiso es brindarte una experiencia excepcional...'}
              </p>
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{settings?.about?.stat1_value || '500+'}</div>
                  <div className="text-gray-600">{settings?.about?.stat1_label || 'Tatuajes'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{settings?.about?.stat2_value || '10+'}</div>
                  <div className="text-gray-600">{settings?.about?.stat2_label || 'Años'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{settings?.about?.stat3_value || '100%'}</div>
                  <div className="text-gray-600">{settings?.about?.stat3_label || 'Satisfacción'}</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={settings?.about?.imageUrl || '/daniela.jpg'}
                alt="Daniela - Artista de Tatuajes"
                className="rounded-lg shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-black text-white p-6 rounded-lg">
                <div className="text-sm">Experiencia desde</div>
                <div className="text-2xl font-bold">{settings?.about?.experienceYear || '2014'}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Estilos de Tatuaje
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora mi trabajo en diferentes estilos, cada uno con su propia técnica 
              y personalidad única.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-32 animate-pulse bg-gray-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card card-hover text-center p-6 cursor-pointer"
                  style={{ borderColor: category.color }}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.tattooCount} obras</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Tattoos Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Trabajos Destacados
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Una selección de mis trabajos más recientes y representativos.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse bg-gray-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]">
              {featuredTattoos.map((tattoo) => (
                <div 
                  key={tattoo._id} 
                  className={`${getGridSpanClass(tattoo.images[0]?.width, tattoo.images[0]?.height)}`}
                >
                  <TattooCard 
                    tattoo={tattoo} 
                    isLiked={likedTattoos.includes(tattoo._id)}
                    onLike={handleLike} 
                    onPreview={() => handleOpenTattooModal(tattoo)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/gallery" className="btn btn-primary px-10 py-4 text-lg">
              Explorar Galería Completa
            </Link>
          </div>

          <AnimatePresence>
            {modalOpen && selectedTattoo && (
              <TattooModal
                tattoo={selectedTattoo}
                isLiked={likedTattoos.includes(selectedTattoo._id)}
                onClose={handleCloseTattooModal}
                onLike={(e, id) => handleLike(id)}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pt-20 pb-10 gradient-primary text-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {settings?.footer?.contactTitle || 'Hagamos Realidad tu Tatuaje'}
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {settings?.footer?.contactSubtitle || '¿Tienes una idea en mente? Hablemos sobre tu próximo tatuaje y creemos algo único juntos.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Teléfono</h3>
              <p className="opacity-90">{settings?.footer?.phone || config.app.phone}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="opacity-90">{settings?.footer?.email || config.app.email}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Ubicación</h3>
              <p className="opacity-90">{settings?.footer?.address || config.app.address}</p>
            </motion.div>
          </div>

          <div className="text-center">

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="container">
          <div className="text-center">
            <h3 className="font-heading text-2xl font-bold mb-2">{settings?.footer?.title || config.app.name}</h3>
            <p className="text-gray-400 mb-4">{settings?.footer?.tagline || 'Arte que perdura para siempre'}</p>
            
            <div className="flex justify-center space-x-6 mb-6">
              {settings?.footer?.instagram && (
                <a 
                  href={settings.footer.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}

              {settings?.footer?.whatsapp && (
                <a
                  href={settings.footer.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                </a>
              )}
              
              {settings?.footer?.facebook && (
                <a 
                  href={settings.footer.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              
              {settings?.footer?.twitter && (
                <a 
                  href={settings.footer.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
              {settings?.footer?.address && (
                <div className="flex flex-col items-center">
                  <MapPin className="w-5 h-5 mb-2" />
                  <p className="text-sm text-gray-400">{settings.footer.address}</p>
                </div>
              )}
              
              {settings?.footer?.phone && (
                <div className="flex flex-col items-center">
                  <Phone className="w-5 h-5 mb-2" />
                  <p className="text-sm text-gray-400">{settings.footer.phone}</p>
                </div>
              )}
              
              {settings?.footer?.email && (
                <div className="flex flex-col items-center">
                  <Mail className="w-5 h-5 mb-2" />
                  <p className="text-sm text-gray-400">{settings.footer.email}</p>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {settings?.footer?.title || config.app.name}. {settings?.footer?.copyright || 'Todos los derechos reservados.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const TattooCard = ({ tattoo, isLiked, onLike, onPreview }: { tattoo: Tattoo; isLiked: boolean; onLike: (id: string) => void; onPreview: () => void }) => {
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);

  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasLiked(tattoo._id) || isAnimatingLike) return;
    
    setIsAnimatingLike(true);
    onLike(tattoo._id);
    
    // Reset after animation
    setTimeout(() => {
      setIsAnimatingLike(false);
    }, 1000);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleLike();
  };

  return (
    <motion.div
      layout
      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg h-full w-full"
      onClick={onPreview}
      onDoubleClick={handleDoubleClick}
    >
      <AnimatePresence>
        {isAnimatingLike && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onAnimationComplete={() => setIsAnimatingLike(false)}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <HeartIconSolid className="w-1/3 h-1/3 text-white/90" />
          </motion.div>
        )}
      </AnimatePresence>
      <img
        src={tattoo.images[0]?.url || '/placeholder.jpg'}
        alt={tattoo.title}
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
      <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg truncate">{tattoo.title}</h3>
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={`transition-transform duration-200 ease-in-out ${!isLiked ? 'hover:scale-125' : ''}`}
              aria-label="Like tattoo"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} />
            </button>
        </div>
        <p className="text-sm text-gray-300">{tattoo.category.name}</p>
      </div>
    </motion.div>
  );
};
