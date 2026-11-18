import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Clapperboard } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import './video-giro-demo.css';

/** Video proporcionado por el usuario para la fase piloto de Carta.
 * Los recursos se incluyen en client/public/media y no requieren instalación manual.
 * Es una referencia audiovisual, NO un plato oficial B3 ni un Canvas 360° controlable.
 */
export function VideoGiroDemo({ fallbackImage }: { fallbackImage?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [intent, setIntent] = useState<'auto' | 'paused' | 'playing'>('auto');
  const [playing, setPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(Boolean(entry?.isIntersecting));
    }, { threshold: 0.4 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || mediaError) return;
    const shouldPlay = inView && (intent === 'playing' || (intent === 'auto' && !reduced));
    if (!shouldPlay) {
      video.pause();
      setPlaying(false);
      return;
    }
    let active = true;
    void video.play().then(() => {
      if (active) setPlaying(true);
    }).catch(() => {
      if (active) setPlaying(false);
    });
    return () => { active = false; };
  }, [inView, intent, reduced, mediaError]);

  const toggle = () => setIntent(playing ? 'paused' : 'playing');

  return <section id="b3-video-giro" className="b3-ci-motion-feature" aria-label="Ejemplo de video giratorio en Carta">
    <div className="b3-ci-motion-head">
      <span><Clapperboard size={17} aria-hidden="true"/> PRESENTACIÓN EN MOVIMIENTO</span>
      <h2>El antojo también se mueve.</h2>
      <p>Así podemos mostrar un plato girando antes de que el cliente lo elija.</p>
    </div>
    <div className="b3-ci-motion-stage">
      {!mediaError ? <video
        ref={videoRef}
        className="b3-ci-motion-video"
        src="/media/b3-giro-demo.mp4"
        poster="/media/b3-giro-poster.webp"
        loop muted playsInline preload="metadata"
        disablePictureInPicture
        aria-label="Video de muestra: pollo a la brasa con papas y ensalada rotando en una plataforma"
        onError={() => { setMediaError(true); setPlaying(false); }}
      /> : fallbackImage ? <img className="b3-ci-motion-fallback" src={fallbackImage} alt="Referencia visual de comida a la brasa" loading="lazy"/> :
        <div className="b3-ci-motion-unavailable"><Clapperboard size={38}/><span>No se pudo cargar el video de demostración</span></div>}
      <span className="b3-ci-motion-watermark">VIDEO REFERENCIAL · NO ES PLATO OFICIAL B3</span>
      {!mediaError && <button type="button" className="b3-ci-motion-control"
        aria-label={playing ? 'Pausar video giratorio' : 'Reproducir video giratorio'}
        aria-pressed={playing} onClick={toggle}>
        {playing ? <Pause size={21} fill="currentColor"/> : <Play size={21} fill="currentColor"/>}
        <span>{playing ? 'Pausar' : 'Reproducir'}</span>
      </button>}
    </div>
    <p className="b3-ci-motion-caption">
      Muestra audiovisual de 4 segundos. Se reproduce en silencio mientras está visible, sin reemplazar las fichas FLIP ni el giro Canvas del catálogo.
    </p>
  </section>;
}
