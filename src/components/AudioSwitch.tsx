import { useState, useEffect, useRef, useCallback } from 'react';

export default function AudioSwitch() {
  const [isPlaying, setIsPlaying] = useState(false); // Cambiado a false por defecto
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialized = useRef(false);

  // Función para inicializar el audio solo cuando sea necesario
  const initializeAudio = useCallback(async () => {
    if (isInitialized.current || audioRef.current) return;

    try {
      const audio = new Audio();
      audio.preload = 'none'; // No precargar automáticamente
      audio.loop = true;
      audio.volume = 0.5; // Volumen más bajo por defecto
      
      // Event listeners para controlar el estado
      audio.addEventListener('loadstart', () => {
        console.log('Iniciando carga de audio...');
      });
      
      audio.addEventListener('canplaythrough', () => {
        setIsLoaded(true);
        setHasError(false);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Error cargando audio:', e);
        setHasError(true);
        setIsLoaded(false);
      });

      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      
      audioRef.current = audio;
      isInitialized.current = true;
      
    } catch (error) {
      console.error('Error inicializando audio:', error);
      setHasError(true);
    }
  }, []);

  // Función para cargar y reproducir el audio
  const loadAndPlay = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      // Solo asignar src si no está ya asignado (evita recargas)
      if (!audioRef.current.src) {
        audioRef.current.src = '/sounds/dialup.wav';
      }

      // Cargar si no está cargado
      if (!isLoaded && audioRef.current.readyState < 4) {
        audioRef.current.load();
        // Esperar a que esté listo
        await new Promise((resolve, reject) => {
          const audio = audioRef.current!;
          const onCanPlay = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve(void 0);
          };
          const onError = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error('Error loading audio'));
          };
          audio.addEventListener('canplaythrough', onCanPlay);
          audio.addEventListener('error', onError);
        });
      }

      await audioRef.current.play();
    } catch (error) {
      console.log("No se pudo reproducir el audio:", error);
      setIsPlaying(false);
      setHasError(true);
    }
  }, [isLoaded]);

  // Inicializar solo una vez al montar el componente
  useEffect(() => {
    initializeAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadstart', () => {});
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('pause', () => {});
        audioRef.current.src = ''; // Limpiar src para liberar recursos
        audioRef.current = null;
      }
      isInitialized.current = false;
    };
  }, [initializeAudio]);

  const toggleSound = useCallback(async () => {
    if (!audioRef.current) {
      await initializeAudio();
      return;
    }

    if (hasError) {
      // Reintentar en caso de error
      setHasError(false);
      await loadAndPlay();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!audioRef.current.src || !isLoaded) {
        await loadAndPlay();
      } else {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.log("Error reproduciendo audio:", error);
          await loadAndPlay(); // Reintentar cargando de nuevo
        }
      }
    }
  }, [isPlaying, hasError, isLoaded, initializeAudio, loadAndPlay]);

  // Indicador visual del estado
  const getStatusIcon = () => {
    if (hasError) return '❌';
    if (!isLoaded && isPlaying) return '⏳';
    return isPlaying ? '🔊' : '🔇';
  };

  const getButtonColor = () => {
    if (hasError) return 'bg-red-600';
    if (!isLoaded && isPlaying) return 'bg-yellow-600';
    return isPlaying ? 'bg-green-600' : 'bg-gray-600';
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-black/20 backdrop-blur-sm p-2 rounded-full">
      <span className="text-sm text-white" title={hasError ? 'Error cargando audio' : isLoaded ? 'Audio listo' : 'Cargando...'}>
        {getStatusIcon()}
      </span>
      <button
        onClick={toggleSound}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${getButtonColor()}`}
        aria-label={`${isPlaying ? 'Pausar' : 'Reproducir'} sonido de fondo`}
        disabled={!isLoaded && !hasError && isPlaying} // Deshabilitar mientras carga
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