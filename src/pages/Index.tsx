
import React from 'react';
import { motion } from 'framer-motion';
import { PredictionCard } from '@/components/PredictionCard';
import { DocumentsSection } from '@/components/dashboard/DocumentsSection';
import { ConvocationsSection } from '@/components/dashboard/ConvocationsSection';
import { scaleVariants } from '@/utils/animations';

export default function Index() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.h1 
        className="text-2xl font-bold mb-6"
        variants={scaleVariants}
        initial="hidden"
        animate="visible"
      >
        Dashboard
      </motion.h1>
      
      <div className="grid gap-8">
        {/* Prediction Card */}
        <PredictionCard />
        
        {/* Documents Section */}
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-medium mb-4">Documentos</h2>
          <DocumentsSection />
        </motion.div>
        
        {/* Convocations Section */}
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-medium mb-4">Convocações</h2>
          <ConvocationsSection />
        </motion.div>
      </div>
    </div>
  );
}
