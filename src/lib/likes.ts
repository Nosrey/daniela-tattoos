const LIKED_TATTOOS_KEY = 'daniela_liked_tattoos';

/**
 * Obtiene la lista de IDs de tatuajes que han recibido "like".
 * @returns {string[]} Un array de IDs.
 */
export const getLikedTattoos = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const liked = window.localStorage.getItem(LIKED_TATTOOS_KEY);
  return liked ? JSON.parse(liked) : [];
};

/**
 * Añade un ID de tatuaje a la lista de "likes".
 * @param {string} tattooId - El ID del tatuaje.
 */
export const addLike = (tattooId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const liked = getLikedTattoos();
  if (!liked.includes(tattooId)) {
    const newLiked = [...liked, tattooId];
    window.localStorage.setItem(LIKED_TATTOOS_KEY, JSON.stringify(newLiked));
  }
};

/**
 * Comprueba si a un tatuaje ya se le ha dado "like".
 * @param {string} tattooId - El ID del tatuaje.
 * @returns {boolean} True si ya tiene "like", de lo contrario false.
 */
export const hasLiked = (tattooId: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const liked = getLikedTattoos();
  return liked.includes(tattooId);
}; 