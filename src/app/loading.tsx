import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
      <div className="flex items-center space-x-3 bg-gray-900 p-4 rounded-lg shadow-xl">
        <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
        <span className="text-white text-lg font-medium">Cargando...</span>
      </div>
    </div>
  );
} 