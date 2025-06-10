import { useState, useEffect, useRef } from 'react';

export default function AudioSwitch() {
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/dialup.wav');
    audioRef.current.loop = true;
    
    // Intentar reproducir cuando el componente se monte
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log("Reproducción automática bloqueada:", error);
        setIsPlaying(false);
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-black/20 backdrop-blur-sm p-2 rounded-full">
      <span className="text-sm text-white">
        {isPlaying ? '🔊' : '🔇'}
      </span>
      <button
        onClick={toggleSound}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isPlaying ? 'bg-green-600' : 'bg-gray-600'
        }`}
        aria-label="Toggle sound"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            isPlaying ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
