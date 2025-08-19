'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { Tattoo } from '@/types';
import { Button } from '@/components/ui';

interface TattooModalProps {
  tattoo: Tattoo | null;
  isLiked: boolean;
  onClose: () => void;
  onLike: (e: React.MouseEvent, id: string) => void;
}

export function TattooModal({ tattoo, isLiked, onClose, onLike }: TattooModalProps) {
  if (!tattoo) return null;

  const imageUrl = tattoo.images?.[0]?.url || tattoo.imageUrl;

  return (
    <Transition.Root show={!!tattoo} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-80 transition-opacity" />
        </Transition.Child>

        {/* Close button (top right corner) */}
        <button
          type="button"
          className="fixed top-4 right-4 text-gray-400 hover:text-white z-50 transition-transform hover:scale-110"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-8 w-8" aria-hidden="true" />
        </button>

        <div className="fixed inset-0 z-40 w-screen overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex w-full transform text-left text-base transition md:my-8 max-w-5xl rounded-lg overflow-hidden">
                <div className="grid w-full grid-cols-1 items-stretch md:grid-cols-2">
                  {/* Image container */}
                  <div className="relative aspect-[4/5] bg-black md:aspect-auto md:h-full md:w-full">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={tattoo.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-900">
                        <p className="text-gray-500">Imagen no disponible</p>
                      </div>
                    )}
                  </div>

                  {/* Tattoo info container */}
                  <div className="flex h-full max-h-[90vh] flex-col bg-gray-900 p-6 text-white md:max-h-none">
                    <div className="flex-shrink-0 border-b border-gray-700 pb-4">
                      <h2 className="text-3xl font-bold">{tattoo.title}</h2>
                      <p className="text-md text-gray-400">{tattoo.category.name}</p>
                    </div>

                    <div className="flex-grow overflow-y-auto py-4">
                      <p className="text-base text-gray-300">{tattoo.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div>
                          <strong className="block text-gray-500">Categoría</strong>
                          <span>{tattoo.category.name}</span>
                        </div>
                        <div>
                          <strong className="block text-gray-500">Estilo</strong>
                          <span>{tattoo.style.name}</span>
                        </div>
                        <div>
                          <strong className="block text-gray-500">Parte del cuerpo</strong>
                          <span className="capitalize">{tattoo.bodyPart}</span>
                        </div>
                        {tattoo.size && (
                           <div>
                            <h3 className="text-sm font-medium text-gray-400">Tamaño</h3>
                            <p className="text-lg font-medium text-white capitalize">{tattoo.size}</p>
                          </div>
                        )}
                        {tattoo.duration && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-400">Duración</h3>
                            <p className="text-lg font-medium text-white">{tattoo.duration}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 border-t border-gray-700 pt-4">
                      <div className="flex items-center justify-between">
                        <Button
                          variant={isLiked ? "secondary" : "primary"}
                          onClick={(e) => onLike(e, tattoo._id)}
                          disabled={isLiked}
                          icon={<HeartIcon className="h-5 w-5 mr-2" />}
                        >
                          {isLiked ? 'Te gusta' : 'Me gusta'}
                        </Button>
                        {tattoo.isFeatured && (
                          <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 