// Tipos para la aplicación de tatuajes

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  bio?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  image?: {
    url: string;
    publicId: string;
  };
  isActive: boolean;
  position: number;
  tattooCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Style {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  position: number;
  tattooCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TattooImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  alt?: string;
}

export interface Tattoo {
  _id: string;
  title: string;
  description: string;
  images: TattooImage[];
  category: Category;
  style: Style;
  tags: string[];
  size: 'pequeño' | 'mediano' | 'grande' | 'extra-grande';
  duration?: string;
  bodyPart: 'brazo' | 'pierna' | 'espalda' | 'pecho' | 'cuello' | 'mano' | 'pie' | 'torso' | 'otro';
  isPortfolio: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  likes: number;
  createdBy: User;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTattooData {
  title: string;
  description: string;
  images: TattooImage[];
  category: string;
  style: string;
  tags?: string[];
  size?: Tattoo['size'];
  duration?: string;
  bodyPart?: Tattoo['bodyPart'];
  isFeatured?: boolean;
  isPublished?: boolean;
}

export interface UpdateTattooData extends Partial<CreateTattooData> {
  _id: string;
}

export interface CreateStyleData {
  name: string;
  description?: string;
  position?: number;
}

export interface UpdateStyleData extends Partial<CreateStyleData> {
  _id: string;
  isActive?: boolean;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  image?: {
    url: string;
    publicId: string;
  };
  position?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  _id: string;
  isActive?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'admin' | 'user';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export interface Settings {
  _id: string;
  hero: {
    source: 'latest_featured' | 'latest_tattoo' | 'most_popular' | 'specific_tattoo' | 'custom_image';
    specificTattooId?: string;
    customImageUrl?: string;
    customImagePublicId?: string;
    backgroundSize: 'cover' | 'contain' | 'auto';
    backgroundPosition: string;
    overlayOpacity: number;
    title: string;
    subtitle: string;
  };
  about: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    stat1_value: string;
    stat1_label: string;
    stat2_value: string;
    stat2_label:string;
    stat3_value: string;
    stat3_label: string;
    imageUrl: string;
    imagePublicId: string;
    experienceYear: number;
  };
  footer: {
    contactTitle: string;
    contactSubtitle: string;
    title: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    instagram: string;
    whatsapp: string;
    facebook: string;
    twitter: string;
    copyright: string;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  results: number;
  pagination: PaginationInfo;
  data: {
    [key: string]: T[];
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TattooFilters {
  page?: number;
  limit?: number;
  category?: string;
  style?: string;
  bodyPart?: Tattoo['bodyPart'];
  size?: Tattoo['size'];
  featured?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'likes' | 'views';
  order?: 'asc' | 'desc';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface TattooContextType {
  tattoos: Tattoo[];
  categories: Category[];
  featuredTattoos: Tattoo[];
  selectedCategory: Category | null;
  filters: TattooFilters;
  isLoading: boolean;
  error: string | null;
  fetchTattoos: (filters?: TattooFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFeaturedTattoos: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  updateFilters: (filters: Partial<TattooFilters>) => void;
  likeTattoo: (tattooId: string) => Promise<void>;
}

export interface AdminContextType {
  createTattoo: (data: CreateTattooData) => Promise<Tattoo>;
  updateTattoo: (data: UpdateTattooData) => Promise<Tattoo>;
  deleteTattoo: (tattooId: string) => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (categories: { id: string; position: number }[]) => Promise<void>;
  createStyle: (data: CreateStyleData) => Promise<Style>;
  updateStyle: (data: UpdateStyleData) => Promise<Style>;
  deleteStyle: (styleId: string) => Promise<void>;
  reorderStyles: (styles: { id: string; position: number }[]) => Promise<void>;
  uploadImage: (file: File) => Promise<UploadResponse>;
  uploadImages: (files: File[]) => Promise<UploadResponse[]>;
  deleteImage: (publicId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Tipos para componentes
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  form?: string;
}

export interface InputProps {
  label?: string;
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
}

export interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
} 