import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { apiUrls, config } from './config';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Category,
  Tattoo,
  CreateTattooData,
  UpdateTattooData,
  CreateCategoryData,
  UpdateCategoryData,
  LoginData,
  RegisterData,
  ChangePasswordData,
  UpdateProfileData,
  UploadResponse,
  TattooFilters,
  Settings,
  Style,
  CreateStyleData,
  UpdateStyleData,
} from '@/types';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.backend.url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para añadir token de autorización
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar respuestas y errores
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o no válido
          this.clearStoredToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(config.auth.tokenKey);
    }
    return null;
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(config.auth.tokenKey, token);
    }
  }

  private clearStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(config.auth.tokenKey);
    }
  }

  // Métodos de autenticación
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const response = await this.axiosInstance.post<ApiResponse<{ user: User }>>(
      apiUrls.login,
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      const result = response.data as any;
      this.setStoredToken(result.token);
      return { user: result.data.user, token: result.token };
    }
    
    throw new Error(response.data.message || 'Error en login');
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await this.axiosInstance.post<ApiResponse<{ user: User }>>(
      apiUrls.register,
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      const result = response.data as any;
      this.setStoredToken(result.token);
      return { user: result.data.user, token: result.token };
    }
    
    throw new Error(response.data.message || 'Error en registro');
  }

  async getProfile(): Promise<User> {
    const response = await this.axiosInstance.get<ApiResponse<{ user: User }>>(
      apiUrls.profile
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.user;
    }
    
    throw new Error(response.data.message || 'Error obteniendo perfil');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await this.axiosInstance.put<ApiResponse<{ user: User }>>(
      apiUrls.profile,
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.user;
    }
    
    throw new Error(response.data.message || 'Error actualizando perfil');
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await this.axiosInstance.put<ApiResponse<void>>(
      apiUrls.changePassword,
      data
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error cambiando contraseña');
    }
  }

  logout(): void {
    this.clearStoredToken();
  }

  // Métodos de tatuajes
  async getTattoos(filters?: TattooFilters): Promise<PaginatedResponse<Tattoo>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `${apiUrls.tattoos}?${params.toString()}`;
    const response = await this.axiosInstance.get<PaginatedResponse<Tattoo>>(url);
    
    return response.data;
  }

  async getTattooById(id: string): Promise<Tattoo> {
    const response = await this.axiosInstance.get<ApiResponse<{ tattoo: Tattoo }>>(
      apiUrls.tattoosById(id)
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.tattoo;
    }
    
    throw new Error(response.data.message || 'Error obteniendo tatuaje');
  }

  async getFeaturedTattoos(): Promise<Tattoo[]> {
    const response = await this.axiosInstance.get<ApiResponse<{ tattoos: Tattoo[] }>>(
      apiUrls.tattoosFeatured
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.tattoos;
    }
    
    throw new Error(response.data.message || 'Error obteniendo tatuajes destacados');
  }

  async likeTattoo(id: string): Promise<{ likes: number }> {
    const response = await this.axiosInstance.post<ApiResponse<{ likes: number }>>(
      apiUrls.tattooLike(id)
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error dando like');
  }

  async incrementTattooView(id: string): Promise<{ views: number }> {
    const response = await this.axiosInstance.post<ApiResponse<{ views: number }>>(
      apiUrls.tattooView(id)
    );

    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Error incrementando vista');
  }

  async createTattoo(data: CreateTattooData): Promise<Tattoo> {
    const response = await this.axiosInstance.post<ApiResponse<{ tattoo: Tattoo }>>(
      apiUrls.tattoos,
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.tattoo;
    }
    
    throw new Error(response.data.message || 'Error creando tatuaje');
  }

  async updateTattoo(data: UpdateTattooData): Promise<Tattoo> {
    const { _id, ...updateData } = data;
    const response = await this.axiosInstance.put<ApiResponse<{ tattoo: Tattoo }>>(
      apiUrls.tattoosById(_id),
      updateData
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.tattoo;
    }
    
    throw new Error(response.data.message || 'Error actualizando tatuaje');
  }

  async deleteTattoo(id: string): Promise<void> {
    const response = await this.axiosInstance.delete<ApiResponse<void>>(
      apiUrls.tattoosById(id)
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error eliminando tatuaje');
    }
  }

  // Métodos de categorías
  async getCategories(): Promise<Category[]> {
    const response = await this.axiosInstance.get<ApiResponse<{ categories: Category[] }>>(
      apiUrls.categories
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.categories;
    }
    
    throw new Error(response.data.message || 'Error obteniendo categorías');
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await this.axiosInstance.get<ApiResponse<{ category: Category }>>(
      apiUrls.categoriesById(id)
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.category;
    }
    
    throw new Error(response.data.message || 'Error obteniendo categoría');
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await this.axiosInstance.post<ApiResponse<{ category: Category }>>(
      apiUrls.categories,
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.category;
    }
    
    throw new Error(response.data.message || 'Error creando categoría');
  }

  async updateCategory(data: UpdateCategoryData): Promise<Category> {
    const { _id, ...updateData } = data;
    const response = await this.axiosInstance.put<ApiResponse<{ category: Category }>>(
      apiUrls.categoriesById(_id),
      updateData
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.category;
    }
    
    throw new Error(response.data.message || 'Error actualizando categoría');
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await this.axiosInstance.delete<ApiResponse<void>>(
      apiUrls.categoriesById(id)
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error eliminando categoría');
    }
  }

  async reorderCategories(categories: { id: string; position: number }[]): Promise<void> {
    const response = await this.axiosInstance.put<ApiResponse<void>>(
      apiUrls.categoriesReorder,
      { categories }
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error reordenando categorías');
    }
  }

  // Métodos de settings
  async getSettings(): Promise<Settings> {
    const response = await this.axiosInstance.get<ApiResponse<{ settings: Settings }>>(
      apiUrls.settings
    );
    if (response.data.status === 'success' && response.data.data?.settings) {
      return response.data.data.settings;
    }
    throw new Error(response.data.message || 'Error obteniendo la configuración');
  }

  async updateSettings(data: {
    settings: Partial<Settings>;
    heroImageFile?: File | null;
    aboutImageFile?: File | null;
  }): Promise<Settings> {
    const formData = new FormData();
    formData.append('settings', JSON.stringify(data.settings));

    if (data.heroImageFile) {
      formData.append('heroImage', data.heroImageFile);
    }
    if (data.aboutImageFile) {
      formData.append('aboutImage', data.aboutImageFile);
    }

    const response = await this.axiosInstance.put<ApiResponse<{ settings: Settings }>>(
      apiUrls.settings,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.status === 'success' && response.data.data?.settings) {
      return response.data.data.settings;
    }
    throw new Error(response.data.message || 'Error actualizando la configuración');
  }

  async uploadImages(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await this.axiosInstance.post<ApiResponse<{ images: UploadResponse[] }>>(
      apiUrls.upload, // La URL base /api/upload
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.status === 'success' && response.data.data?.images) {
      return response.data.data.images;
    }
    throw new Error(response.data.message || 'Error subiendo imágenes');
  }

  async deleteImage(publicId: string): Promise<void> {
    // Codificar el publicId para que los slashes no rompan la URL
    const encodedPublicId = encodeURIComponent(publicId);
    await this.axiosInstance.delete(`${apiUrls.upload}/${encodedPublicId}`);
  }

  // Método para obtener estadísticas en tiempo real
  async getTattooStats(): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      `${apiUrls.tattoos}/stats`
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Error obteniendo estadísticas');
  }

  // Métodos de estilos
  async getStyles(): Promise<Style[]> {
    const response = await this.axiosInstance.get<ApiResponse<{ styles: Style[] }>>(
      apiUrls.styles
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.styles;
    }
    
    throw new Error(response.data.message || 'Error obteniendo estilos');
  }

  async createStyle(data: CreateStyleData): Promise<Style> {
    const response = await this.axiosInstance.post<ApiResponse<{ style: Style }>>(
      apiUrls.styles,
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.style;
    }
    
    throw new Error(response.data.message || 'Error creando estilo');
  }

  async updateStyle(id: string, data: Partial<UpdateStyleData>): Promise<Style> {
    const response = await this.axiosInstance.put<ApiResponse<{ style: Style }>>(
      apiUrls.stylesById(id),
      data
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data.style;
    }
    
    throw new Error(response.data.message || 'Error actualizando estilo');
  }

  async deleteStyle(id: string): Promise<void> {
    const response = await this.axiosInstance.delete<ApiResponse<void>>(
      apiUrls.stylesById(id)
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error eliminando estilo');
    }
  }

  async reorderStyles(styles: { id: string; position: number }[]): Promise<void> {
    const response = await this.axiosInstance.put<ApiResponse<void>>(
      apiUrls.stylesReorder,
      { styles }
    );
    
    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Error reordenando estilos');
    }
  }
}

// Instancia única del cliente API
export const apiClient = new ApiClient();
export default apiClient;