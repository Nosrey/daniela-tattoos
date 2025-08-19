import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tattoo, Category } from '@/types';
import TattooModal from '@/components/gallery/TattooModal';
import { Card } from '@/components/ui';
import Image from 'next/image';

interface MasonryLayoutProps {
  tattoos: Tattoo[];
}

const MasonryLayout: React.FC<MasonryLayoutProps> = ({ tattoos }) => {
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);

  const openModal = (tattoo: Tattoo) => setSelectedTattoo(tattoo);
  const closeModal = () => setSelectedTattoo(null);

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {tattoos.map((tattoo) => (
          <motion.div
            key={tattoo._id}
            className="break-inside-avoid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              hover
              onClick={() => openModal(tattoo)}
              className="cursor-pointer overflow-hidden"
            >
              <Image
                src={tattoo.images[0].url}
                alt={tattoo.title}
                width={tattoo.images[0].width}
                height={tattoo.images[0].height}
                className="w-full h-auto"
                priority
              />
              <div className="p-4 bg-white dark:bg-gray-800">
                <h3 className="font-bold">{tattoo.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tattoo.category.name} | {tattoo.style.name}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      {selectedTattoo && (
        <TattooModal
          tattoo={selectedTattoo}
          isOpen={!!selectedTattoo}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default MasonryLayout; 