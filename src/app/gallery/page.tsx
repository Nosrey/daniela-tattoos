import { apiClient } from '@/lib/api';
import GalleryPageClient from './GalleryPageClient';
import type { Tattoo, Category, PaginationInfo, TattooFilters } from '@/types';

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function GalleryPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const categoryId = searchParams.category as string | undefined;
  const searchQuery = searchParams.search as string | undefined;
  const style = searchParams.style as string | undefined;
  const bodyPart = searchParams.bodyPart as string | undefined;
  const size = searchParams.size as string | undefined;
  const sortBy = (searchParams.sortBy as string) || 'createdAt';
  const order = (searchParams.order as 'asc' | 'desc') || 'desc';

  const initialFilters: TattooFilters = {
    page: 1,
    limit: 12,
    category: categoryId,
    search: searchQuery,
    style: style as Tattoo['style'],
    bodyPart: bodyPart as Tattoo['bodyPart'],
    size: size as Tattoo['size'],
    sortBy: sortBy as 'createdAt' | 'likes' | 'views',
    order: order as 'asc' | 'desc',
  };

  try {
    // Fetch data in parallel
    const [tattooResponse, allCategories] = await Promise.all([
      apiClient.getTattoos(initialFilters),
      apiClient.getCategories()
    ]);

    const initialTattoos: Tattoo[] = tattooResponse.data?.tattoos || [];
    const pagination: PaginationInfo | undefined = tattooResponse.pagination;
    const activeCategories: Category[] = allCategories.filter(c => c.isActive);

    return (
      <GalleryPageClient
        initialTattoos={initialTattoos}
        initialCategories={activeCategories}
        initialPagination={pagination}
        initialFilters={initialFilters}
      />
    );
  } catch (error) {
    console.error("Failed to fetch gallery data:", error);
    // Render a fallback or error state
    return (
      <div className="text-center py-20 text-white">
        <h2 className="text-2xl font-bold mb-4">Error al Cargar la Galería</h2>
        <p>No se pudieron obtener los datos. Por favor, inténtalo de nuevo más tarde.</p>
      </div>
    );
  }
} 