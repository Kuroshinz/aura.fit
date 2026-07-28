const fs = require('fs');
let c = fs.readFileSync('d:/Nexus/src/components/workout/rest-timer.tsx', 'utf8');

c = c.replace(
  "const { restTimerSeconds, isRestTimerRunning, setRestTimer, startRestTimer, pauseRestTimer, resetRestTimer, tickRestTimer } =",
  "const { restTimerSeconds, isRestTimerRunning, setRestTimer, startRestTimer, pauseRestTimer, resetRestTimer, closeRestTimer, tickRestTimer } ="
);

c = c.replace(
  `          <button
            onClick={resetRestTimer}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors touch-target"
            aria-label="Close timer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>`,
  `          <button
            onClick={closeRestTimer}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors touch-target"
            aria-label="Close timer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>`
);

// Add tap to change time
const timeBlock = `          <div className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-wider gold-gradient-text min-w-[60px] sm:min-w-[75px] pointer-events-none select-none">
            {formatTime(validSeconds)}
          </div>`;

const newTimeBlock = `          <div 
            onClick={() => {
              const presets = [45, 60, 90, 120, 180];
              const currentIndex = presets.indexOf(validSeconds);
              const nextTime = currentIndex === -1 || currentIndex === presets.length - 1 ? presets[0] : presets[currentIndex + 1];
              setRestTimer(nextTime);
            }}
            className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-wider gold-gradient-text min-w-[60px] sm:min-w-[75px] cursor-pointer hover:scale-105 transition-transform select-none flex flex-col items-center"
            title="Bấm để đổi thời gian nghỉ"
          >
            {formatTime(validSeconds)}
            <span className="text-[8px] text-amber-400/50 font-sans uppercase -mt-1 font-bold tracking-widest">ĐỔI THỜI GIAN</span>
          </div>`;

c = c.replace(timeBlock, newTimeBlock);

fs.writeFileSync('d:/Nexus/src/components/workout/rest-timer.tsx', c, 'utf8');
console.log('Rest timer updated');
