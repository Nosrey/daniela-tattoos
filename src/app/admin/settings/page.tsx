'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button, Card, Input } from '@/components/ui';
import { apiClient } from '@/lib/api';
import type { Settings, Tattoo } from '@/types';

// Objeto con la estructura y valores por defecto para el estado inicial.
const defaultSettings: Settings = {
  _id: '',
  hero: {
    title: '',
    subtitle: '',
    source: 'latest_featured',
    specificTattooId: '',
    customImageUrl: '',
    customImagePublicId: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    overlayOpacity: 0.6,
  },
  about: {
    title: '',
    paragraph1: '',
    paragraph2: '',
    stat1_value: '',
    stat1_label: '',
    stat2_value: '',
    stat2_label: '',
    stat3_value: '',
    stat3_label: '',
    imageUrl: '',
    imagePublicId: '',
    experienceYear: new Date().getFullYear(),
  },
  footer: {
    contactTitle: 'Hagamos Realidad tu Tatuaje',
    contactSubtitle: '¿Tienes una idea en mente? Hablemos sobre tu próximo tatuaje y creemos algo único juntos.',
    title: 'Daniela Tattoos',
    tagline: 'Arte que perdura para siempre',
    address: 'Calle Falsa 123, Springfield',
    phone: '+1 234 567 890',
    email: 'contacto@danielatattoos.com',
    instagram: 'https://instagram.com/danielatattoos',
    whatsapp: 'https://wa.me/1234567890',
    facebook: '',
    twitter: '',
    copyright: 'Todos los derechos reservados.',
  },
};

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Estados para archivos de imagen
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  // Estados para previsualización de imágenes
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);

  const [bgHorizontal, setBgHorizontal] = useState('center');
  const [bgVertical, setBgVertical] = useState('center');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !isAdmin) return;
      setIsLoading(true);
      try {
        const [settingsData, tattoosResponse] = await Promise.all([
          apiClient.getSettings(),
          apiClient.getTattoos({ limit: 100 }),
        ]);

        // Fusionar los datos recibidos con la estructura por defecto
        setSettings({
          ...defaultSettings,
          ...settingsData,
          hero: {
            ...defaultSettings.hero,
            ...(settingsData.hero || {}),
          },
          about: {
            ...defaultSettings.about,
            ...(settingsData.about || {}),
          },
          footer: {
            ...defaultSettings.footer,
            ...(settingsData.footer || {}),
          },
        });
        setTattoos(tattoosResponse.data.tattoos);
      } catch (error) {
        setFeedback({ type: 'error', message: 'No se pudo cargar la configuración.' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (settings.hero.backgroundPosition) {
      const parts = settings.hero.backgroundPosition.split(' ');
      setBgHorizontal(parts[0] || 'center');
      setBgVertical(parts[1] || 'center');
    }
  }, [settings.hero.backgroundPosition]);

  const handleChange = (section: 'hero' | 'about' | 'footer', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? parseInt(value, 10) || 0 : value;
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [name]: parsedValue },
    }));
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => handleChange('hero', e);
  const handleAboutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => handleChange('about', e);
  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => handleChange('footer', e);

  const handleBackgroundPositionChange = (
    axis: 'horizontal' | 'vertical',
    value: string
  ) => {
    const newHorizontal = axis === 'horizontal' ? value : bgHorizontal;
    const newVertical = axis === 'vertical' ? value : bgVertical;
    setBgHorizontal(newHorizontal);
    setBgVertical(newVertical);
    setSettings(prev => ({
      ...prev,
      hero: { ...prev.hero, backgroundPosition: `${newHorizontal} ${newVertical}` },
    }));
  };

  const handleImageUpload = (
    fileSetter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      fileSetter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  // Limpiar Object URLs para evitar memory leaks
  useEffect(() => {
    return () => {
      if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
      if (aboutImagePreview) URL.revokeObjectURL(aboutImagePreview);
    };
  }, [heroImagePreview, aboutImagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const updatedSettings = await apiClient.updateSettings({
        settings: { hero: settings.hero, about: settings.about, footer: settings.footer },
        heroImageFile: heroImageFile,
        aboutImageFile: aboutImageFile,
      });

      setSettings(prev => ({ ...prev, ...updatedSettings }));
      
      // Limpiar los estados de los archivos e previsualizaciones después de una subida exitosa
      setHeroImageFile(null);
      setHeroImagePreview(null);
      setAboutImageFile(null);
      setAboutImagePreview(null);

      setFeedback({ type: 'success', message: '¡Configuración guardada con éxito!' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      setFeedback({ type: 'error', message: `Error guardando la configuración: ${message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  const sourceOptions = [
    { value: 'latest_featured', label: 'Último tatuaje destacado' },
    { value: 'latest_tattoo', label: 'Último tatuaje (cualquiera)' },
    { value: 'most_popular', label: 'Tatuaje más popular' },
    { value: 'specific_tattoo', label: 'Un tatuaje específico' },
    { value: 'custom_image', label: 'Subir imagen personalizada' },
  ];

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajustes Generales</h1>
        </div>
        
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`fixed top-24 right-8 z-50 p-4 rounded-lg shadow-xl ${
                feedback.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Settings Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Sección de Portada (Hero)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Título Principal" name="title" value={settings.hero.title} onChange={handleHeroChange} />
                <Input label="Subtítulo" name="subtitle" value={settings.hero.subtitle} onChange={handleHeroChange} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuente de la Imagen</label>
                  <select name="source" value={settings.hero.source} onChange={handleHeroChange} className="w-full input">
                    {sourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                {settings.hero.source === 'specific_tattoo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Tatuaje</label>
                    <select name="specificTattooId" value={settings.hero.specificTattooId} onChange={handleHeroChange} className="w-full input">
                      <option value="">-- Elige un tatuaje --</option>
                      {tattoos.map(tattoo => <option key={tattoo._id} value={tattoo._id}>{tattoo.title}</option>)}
                    </select>
                  </div>
                )}
                {settings.hero.source === 'custom_image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subir Imagen</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload(setHeroImageFile, setHeroImagePreview)} className="w-full input" />
                    
                    {heroImagePreview ? (
                      <img src={heroImagePreview} alt="Nueva previsualización" className="mt-4 rounded-lg max-h-40" />
                    ) : (
                      settings.hero.customImageUrl && <img src={settings.hero.customImageUrl} alt="Previsualización actual" className="mt-4 rounded-lg max-h-40" />
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opacidad del Fondo (0 a 1)</label>
                  <Input type="number" step="0.1" min="0" max="1" name="overlayOpacity" value={settings.hero.overlayOpacity} onChange={handleHeroChange} />
                </div>
              </div>
            </div>
          </Card>

          {/* About Section Settings Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Sección "Sobre Mí"</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input label="Título de la Sección" name="title" value={settings.about.title} onChange={handleAboutChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Párrafo 1</label>
                  <textarea name="paragraph1" value={settings.about.paragraph1} onChange={handleAboutChange} rows={3} className="w-full input"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Párrafo 2</label>
                  <textarea name="paragraph2" value={settings.about.paragraph2} onChange={handleAboutChange} rows={3} className="w-full input"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de la Artista</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload(setAboutImageFile, setAboutImagePreview)} className="w-full input" />
                  {aboutImagePreview ? (
                    <img src={aboutImagePreview} alt="Nueva previsualización" className="mt-4 rounded-lg max-h-40" />
                  ) : (
                    settings.about.imageUrl && <img src={settings.about.imageUrl} alt="Previsualización actual" className="mt-4 rounded-lg max-h-40" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año de Experiencia</label>
                  <Input type="number" name="experienceYear" value={settings.about.experienceYear} onChange={handleAboutChange} />
                </div>
                <hr className="md:col-span-2 my-4" />
                {/* Stats */}
                <Input label="Estadística 1: Valor" name="stat1_value" value={settings.about.stat1_value} onChange={handleAboutChange} />
                <Input label="Estadística 1: Etiqueta" name="stat1_label" value={settings.about.stat1_label} onChange={handleAboutChange} />
                <Input label="Estadística 2: Valor" name="stat2_value" value={settings.about.stat2_value} onChange={handleAboutChange} />
                <Input label="Estadística 2: Etiqueta" name="stat2_label" value={settings.about.stat2_label} onChange={handleAboutChange} />
                <Input label="Estadística 3: Valor" name="stat3_value" value={settings.about.stat3_value} onChange={handleAboutChange} />
                <Input label="Estadística 3: Etiqueta" name="stat3_label" value={settings.about.stat3_label} onChange={handleAboutChange} />
              </div>
            </div>
          </Card>

          {/* Footer Settings Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Configuración del Pie de Página</h2>
              <p className="text-sm text-gray-500 mb-6">
                Estos datos se usarán tanto en la sección de contacto como en el pie de página final del sitio.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input label="Título de la Sección de Contacto" name="contactTitle" value={settings.footer.contactTitle ?? ''} onChange={handleFooterChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo de la Sección de Contacto</label>
                  <textarea name="contactSubtitle" value={settings.footer.contactSubtitle ?? ''} onChange={handleFooterChange} rows={3} className="w-full input"></textarea>
                </div>

                <hr className="md:col-span-2 my-2" />

                <div className="md:col-span-2">
                  <Input label="Título Principal del Footer" name="title" value={settings.footer.title ?? ''} onChange={handleFooterChange} placeholder="Ej: Daniela Tattoos" />
                </div>
                <div className="md:col-span-2">
                  <Input label="Lema o Subtítulo" name="tagline" value={settings.footer.tagline ?? ''} onChange={handleFooterChange} placeholder="Ej: Arte que perdura para siempre" />
                </div>
                <Input label="Dirección" name="address" value={settings.footer.address ?? ''} onChange={handleFooterChange} />
                <Input label="Teléfono de Contacto" name="phone" value={settings.footer.phone ?? ''} onChange={handleFooterChange} />
                <Input label="Email de Contacto" name="email" value={settings.footer.email ?? ''} onChange={handleFooterChange} />
                <Input label="URL de Instagram" name="instagram" value={settings.footer.instagram ?? ''} onChange={handleFooterChange} />
                <Input label="URL de WhatsApp (wa.me)" name="whatsapp" value={settings.footer.whatsapp ?? ''} onChange={handleFooterChange} />
                <Input label="URL de Facebook" name="facebook" value={settings.footer.facebook ?? ''} onChange={handleFooterChange} />
                <Input label="URL de Twitter" name="twitter" value={settings.footer.twitter ?? ''} onChange={handleFooterChange} />
                <div className="md:col-span-2">
                  <Input label="Texto de Copyright" name="copyright" value={settings.footer.copyright ?? ''} onChange={handleFooterChange} placeholder="Ej: Todos los derechos reservados." />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 