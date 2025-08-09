import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileImage, Download, Eye, Loader, X } from 'lucide-react';

// V6: Kerala Style Road Animation
const RoadAnimation = () => {
  const sceneryVariants = {
    initial: { y: '-20vh', scale: 0.1, opacity: 0 },
    animate: (i) => ({
      y: '120vh',
      scale: 1,
      opacity: 1,
      transition: {
        duration: Math.random() * 5 + 8, // Slower for a more relaxed feel
        delay: i * 1.8,
        ease: 'linear',
        repeat: Infinity,
      },
    }),
  };

  const potholeVariants = {
    initial: { y: '-10vh', scale: 0.2, opacity: 0 },
    animate: (i) => ({
      y: '110vh',
      scale: 1,
      opacity: 1,
      transition: {
        duration: Math.random() * 4 + 5,
        delay: i * 0.4,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 1,
      },
    }),
  };
  
  const Cloud = ({ i }) => (
    <motion.div
      className="absolute"
      style={{ top: `${10 + (i * 15)}%`, left: '-100px' }}
      initial={{ x: '150vw' }}
      animate={{ x: '-150vw' }}
      transition={{
        duration: 50 + (i * 20),
        delay: i * 8,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
      }}
    >
        <div className="relative w-48 h-16">
            <div className="absolute w-24 h-24 bg-white/80 rounded-full -bottom-8 left-8"></div>
            <div className="absolute w-20 h-20 bg-white/80 rounded-full -bottom-4 left-0"></div>
            <div className="absolute w-28 h-28 bg-white/80 rounded-full -bottom-8 left-20"></div>
        </div>
    </motion.div>
  );

  const Sun = () => (
    <motion.div
        className="absolute w-24 h-24"
        style={{ top: '8%', right: '15%' }}
    >
        <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-yellow-300 rounded-full" />
            <motion.div 
                className="absolute inset-0 bg-yellow-200 rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
             <div className="absolute inset-0 rounded-full shadow-[0_0_80px_20px_rgba(253,218,13,0.7)]" />
        </div>
    </motion.div>
  );


  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-sky-400 via-teal-200 to-green-200">
      {/* Animated Sky with Sun and Clouds */}
      <Sun />
      {[...Array(4)].map((_, i) => <Cloud key={i} i={i} />)}

      {/* Road */}
      <div className="absolute left-1/2 top-0 h-full w-[300%] max-w-[1200px] -translate-x-1/2 [perspective:300px]">
        <div className="h-full w-full bg-gray-800 [transform:rotateX(75deg)]">
          {/* Road Lines */}
          <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2">
            <motion.div
              className="h-1/4 w-full bg-stone-400/80"
              initial={{ y: '-100%' }}
              animate={{ y: '400%' }}
              transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
            />
          </div>
          
          {/* Kerala Style Scenery */}
          {[...Array(12)].map((_, i) => {
            const isBuilding = Math.random() > 0.65;
            const side = Math.random() > 0.5 ? 'left' : 'right';
            // Corrected positioning logic
            const positionStyle = side === 'left' 
                ? { left: `${Math.random() * 20 + 5}%` } 
                : { right: `${Math.random() * 20 + 5}%` };

            if (isBuilding) {
              return (
                <motion.div
                  key={`scene-${i}`}
                  className="absolute bottom-0 flex flex-col items-center"
                  style={{ ...positionStyle, transformOrigin: 'bottom center' }}
                  variants={sceneryVariants} initial="initial" animate="animate" custom={i}
                >
                  <div className="relative bg-stone-200" style={{ width: '80px', height: '60px' }}>
                    {/* Terracotta Roof */}
                    <div className="absolute -top-10 left-[-10px] w-[100px] h-10 bg-red-800" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  </div>
                </motion.div>
              );
            } else {
              // Coconut Tree
              return (
                <motion.div
                  key={`scene-${i}`}
                  className="absolute bottom-0"
                  style={{ ...positionStyle, transformOrigin: 'bottom center' }}
                  variants={sceneryVariants} initial="initial" animate="animate" custom={i}
                >
                  <div className="relative w-2 h-40 bg-amber-800">
                    {/* Palm Fronds */}
                    <div className="absolute -top-2 left-1/2 w-16 h-16">
                      <div className="absolute w-16 h-2 bg-green-700 rounded-full" style={{ transform: 'translateX(-50%) rotate(30deg)' }} />
                      <div className="absolute w-16 h-2 bg-green-700 rounded-full" style={{ transform: 'translateX(-50%) rotate(-30deg)' }} />
                      <div className="absolute w-16 h-2 bg-green-700 rounded-full" style={{ transform: 'translateX(-50%) rotate(90deg)' }} />
                      <div className="absolute w-16 h-2 bg-green-700 rounded-full" style={{ transform: 'translateX(-50%) rotate(150deg)' }} />
                      <div className="absolute w-16 h-2 bg-green-700 rounded-full" style={{ transform: 'translateX(-50%) rotate(-150deg)' }} />
                    </div>
                  </div>
                </motion.div>
              );
            }
          })}
        </div>
      </div>
      
      {/* Potholes with Dirty Water */}
      <div className="absolute left-1/2 top-0 h-full w-[300%] max-w-[1200px] -translate-x-1/2 [perspective:300px]">
        <div className="h-full w-full [transform:rotateX(75deg)]">
          {[...Array(20)].map((_, i) => {
            const size = Math.random() * 50 + 30;
            const borderRadius = `${Math.random() * 40 + 60}% ${Math.random() * 40 + 40}% ${Math.random() * 40 + 60}% ${Math.random() * 40 + 40}% / ${Math.random() * 40 + 60}% ${Math.random() * 40 + 60}% ${Math.random() * 40 + 40}% ${Math.random() * 40 + 40}%`;
            return (
              <motion.div
                key={i}
                className="absolute bg-amber-900/70 p-1 flex items-start justify-start"
                style={{
                  left: `${Math.random() * 70 + 15}%`,
                  width: `${size}px`,
                  height: `${size / 1.5}px`,
                  borderRadius: borderRadius,
                }}
                variants={potholeVariants} initial="initial" animate="animate" custom={i}
              >
                <motion.div
                  className="w-1/2 h-1/3 bg-sky-200/40 rounded-full"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedFile, setProcessedFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'processing', 'done'
  const [error, setError] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setError(null);
      handleUpload(file);
    } else {
      setError('Invalid file type. Please upload a JPG, JPEG, or PNG file.');
      setSelectedFile(null);
    }
  };

  const handleUpload = (file) => {
    setStatus('uploading');
    setTimeout(() => {
      setStatus('processing');
      setTimeout(() => {
        const processedImageUrl = URL.createObjectURL(file); 
        setProcessedFile(processedImageUrl);
        setStatus('done');
      }, 3000);
    }, 1500);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const resetState = () => {
    setSelectedFile(null);
    setProcessedFile(null);
    setStatus('idle');
    setError(null);
    setShowViewer(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="relative min-h-screen w-full text-stone-800 flex flex-col items-center justify-center p-4 overflow-hidden">
      <RoadAnimation />
      
      <motion.div 
        className="relative z-20 w-full max-w-lg"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-800 via-teal-700 to-green-800"
          variants={itemVariants}
        >
          Kerala Road Survival
        </motion.h1>
        <motion.p 
          className="text-center text-grey-700 mb-8"
          variants={itemVariants}
        >
          Upload your image and let our AI find your path
        </motion.p>
        
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-green-800/50 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-600 hover:bg-white/80 transition-all duration-300 shadow-xl"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center"
              >
                <UploadCloud className="w-16 h-16 text-teal-800 mb-4" />
                <p className="font-semibold">Click to upload or drag & drop</p>
                <p className="text-sm text-stone-600 mt-1">PNG, JPG, JPEG up to 10MB</p>
              </motion.div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
              {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
            </motion.div>
          )}

          {(status === 'uploading' || status === 'processing') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/60 backdrop-blur-sm border border-stone-400 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl"
            >
              <Loader className="w-12 h-12 text-teal-600 animate-spin mb-4" />
              <p className="text-lg font-semibold capitalize">{status}...</p>
              <p className="text-sm text-stone-500 mt-2">{selectedFile?.name}</p>
            </motion.div>
          )}

          {status === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 backdrop-blur-sm border border-stone-400 rounded-2xl p-8 text-center shadow-xl"
            >
              <h2 className="text-2xl font-bold text-green-700 mb-4">Processing Complete!</h2>
              <div className="flex items-center justify-center space-x-2 text-stone-700 mb-6">
                <FileImage size={20} />
                <span>{selectedFile?.name}</span>
              </div>
              <img src={processedFile} alt="Processed result" className="rounded-lg max-h-60 mx-auto mb-6 shadow-lg shadow-stone-500/30" />
              <div className="flex justify-center space-x-4">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowViewer(true)} className="flex items-center bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded-lg">
                  <Eye className="mr-2" size={20} /> View
                </motion.button>
                <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href={processedFile} download={`processed_${selectedFile?.name}`} className="flex items-center bg-green-600 hover:bg-green-700 transition-colors text-white font-bold py-2 px-4 rounded-lg">
                  <Download className="mr-2" size={20} /> Download
                </motion.a>
              </div>
               <button onClick={resetState} className="mt-6 text-stone-500 hover:text-stone-800 transition-colors text-sm">Upload another image</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showViewer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowViewer(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="relative max-w-4xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={processedFile} alt="Processed result viewer" className="rounded-xl object-contain w-full h-full" />
                <button onClick={() => setShowViewer(false)} className="absolute -top-4 -right-4 bg-white text-gray-900 rounded-full p-2 shadow-lg">
                  <X size={24} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Home;
