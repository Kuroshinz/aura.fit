const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/components/layout/global-ai-coach.tsx', 'utf8');

const oldButtonRegex = /\{\/\* Floating Action Button \*\/\}[\s\S]*?<\/motion\.button>/;

const newButtonCode = `{/* Floating Action Button (Draggable & Futuristic) */}
      {!isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, cursor: "grabbing" }}
          style={{ position: 'fixed', bottom: 100, right: 24, zIndex: 50, touchAction: 'none' }}
          className="cursor-grab flex flex-col items-center justify-center group"
        >
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
            {/* Spinning futuristic borders */}
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 border-r-amber-400 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border border-cyan-500/20 border-b-cyan-400 animate-[spin_4s_linear_infinite_reverse]" />
            
            {/* Pulsing energy core */}
            <div className="absolute inset-2 bg-gradient-to-br from-amber-500/40 to-indigo-600/40 rounded-full animate-pulse blur-sm" />
            
            {/* Main Interactive Button */}
            <button 
              onClick={() => setIsOpen(true)}
              className="relative z-10 w-12 h-12 bg-[#030308] border border-amber-400/50 rounded-full flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] transition-all"
            >
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </button>
          </div>
          <span className="mt-2 text-[10px] font-mono font-bold text-amber-400/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md pointer-events-none select-none border border-white/5">
            AURA AI
          </span>
        </motion.div>
      )}`;

c = c.replace(oldButtonRegex, newButtonCode);

fs.writeFileSync('d:/Nexus/src/components/layout/global-ai-coach.tsx', c, 'utf8');
console.log('Global AI Coach updated with draggable future animations!');
