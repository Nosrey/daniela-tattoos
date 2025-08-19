// Configuración global de la aplicación
export const config = {
  // URLs del backend
  backend: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    api: {
      auth: '/api/auth',
      tattoos: '/api/tattoos',
      categories: '/api/categories',
      upload: '/api/upload',
      settings: '/api/settings',
    }
  },
  
  // Configuración de la aplicación
  app: {
    name: 'Daniela Tattoos',
    description: 'Portafolio profesional de tatuajes - Daniela Tattoos',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    email: 'contacto@danielatattoos.com',
    phone: '+1 (555) 123-4567',
    address: 'Ciudad, País',
  },
  
  // Redes sociales
  social: {
    instagram: 'https://instagram.com/danielatattoos',
    facebook: 'https://facebook.com/danielatattoos',
    twitter: 'https://twitter.com/danielatattoos',
    whatsapp: 'https://wa.me/15551234567',
  },
  
  // Configuración de paginación
  pagination: {
    tattoos: 12,
    categories: 20,
  },
  
  // Configuración de animaciones
  animation: {
    duration: 0.3,
    ease: 'easeInOut',
    stagger: 0.1,
  },
  
  // Configuración de imágenes
  images: {
    placeholder: '/images/placeholder.jpg',
    quality: 90,
    formats: ['webp', 'jpg'],
  },
  
  // Configuración de autenticación
  auth: {
    tokenKey: 'tattoo_token',
    refreshKey: 'tattoo_refresh',
    redirectAfterLogin: '/admin',
    redirectAfterLogout: '/',
  },
};

// URLs completas para las APIs
export const apiUrls = {
  // Autenticación
  login: `${config.backend.url}${config.backend.api.auth}/login`,
  register: `${config.backend.url}${config.backend.api.auth}/register`,
  profile: `${config.backend.url}${config.backend.api.auth}/profile`,
  changePassword: `${config.backend.url}${config.backend.api.auth}/change-password`,
  
  // Tatuajes
  tattoos: `${config.backend.url}${config.backend.api.tattoos}`,
  tattoosById: (id: string) => `${config.backend.url}${config.backend.api.tattoos}/${id}`,
  tattooView: (id: string) => `${config.backend.url}${config.backend.api.tattoos}/${id}/view`,
  tattoosFeatured: `${config.backend.url}${config.backend.api.tattoos}/featured`,
  tattooLike: (id: string) => `${config.backend.url}${config.backend.api.tattoos}/${id}/like`,
  featuredTattoos: '/tattoos/featured',
  latestTattoo: '/tattoos/latest',
  mostPopularTattoo: '/tattoos/most-popular',
  
  // Categorías
  categories: `${config.backend.url}${config.backend.api.categories}`,
  categoriesById: (id: string) => `${config.backend.url}${config.backend.api.categories}/${id}`,
  categoriesReorder: `${config.backend.url}${config.backend.api.categories}/reorder`,
  
  // Upload
  upload: `${config.backend.url}${config.backend.api.upload}`,

  // Settings
  settings: `${config.backend.url}${config.backend.api.settings}`,
};

export default config; 