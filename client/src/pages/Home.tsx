import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Flame, Heart, Instagram, MapPin, Menu, MessageCircle, Minus, Navigation, Plus, RotateCcw, Search, ShoppingBag, Sparkles, Store, Truck, UserRound, UtensilsCrossed, X } from 'lucide-react';
import { B3Catalog, B3Product, B3Story, designFixtures, editorialStories, loadPublicCatalog, soles } from '@/lib/storefront/catalog';
import { SpinCanvas } from '@/features/menu/SpinCanvas';
import { SiteLink, navigate, useRoute, pageTitles } from '@/lib/navigation';
import { AboutPage, AccountPage, CartPage, CheckoutPage, CommercialHero, FeaturedIntro, HelpPage, HomePathways, NotFoundPage, OrdersPage, PromotionsPage } from './CommercialViews';
import './premium.css';

type Notice = { title: string; text: string } | null;
export type CartItem = { key: string; productId: string; name: string; variant: string; unit: number; extras: string[]; qty: number; isCombo?: boolean };
export type Delivery = { mode: 'delivery' | 'pickup'; address: string; storeId: string; coords?: { latitude: number; longitude: number } };
const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const imgLogo = '/brand/pollos-b3-logo.png';
const labelFor = (s: string) => s.toUpperCase();
const panelIn = { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 15 }, transition: { duration: .34 } };

function usePublicStore() {
  const demo = import.meta.env.DEV || import.meta.env.VITE_B3_ENABLE_DESIGN_PREVIEW === 'true';
  const [value, setValue] = useState<B3Catalog | null>(demo ? designFixtures : null);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    loadPublicCatalog(abort.signal).then(res => { if (res) { setValue(res); setConnected(true); setError(''); } }).catch(err => { if (!abort.signal.aborted) setError(err instanceof Error ? err.message : 'No se pudo consultar la carta.'); });
    return () => abort.abort();
  }, []);
  return { data: value, demo: demo && !connected, connected, error };
}

function usePersistentCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('b3-storefront-draft-v1');
      const array = saved ? JSON.parse(saved) as unknown : [];
      if (!Array.isArray(array)) return [];
      return array.filter((item): item is CartItem => !!item && typeof item === 'object' && typeof item.key === 'string' && Number.isFinite(item.unit) && Number.isInteger(item.qty) && item.qty > 0);
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('b3-storefront-draft-v1', JSON.stringify(cart)); } catch {} }, [cart]);
  const add = (item: CartItem) => setCart(old => {
    const found = old.find(entry => entry.key === item.key);
    return found ? old.map(entry => entry.key === item.key ? { ...entry, qty: Math.min(99, entry.qty + item.qty) } : entry) : [...old, item];
  });
  const setQty = (key: string, count: number) => setCart(old => old.map(item => item.key === key ? { ...item, qty: Math.min(99, count) } : item).filter(item => item.qty > 0));
  return { cart, add, setQty, total: cart.reduce((sum, i) => sum + i.qty * i.unit, 0), count: cart.reduce((sum, i) => sum + i.qty, 0) };
}

function useBodyLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [enabled]);
}
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: reduced ? 0 : .7, delay, ease: [.2, .8, .2, 1] }}>{children}</motion.div>;
}
function BrandImage({ className = '' }: { className?: string }) { return <img src={imgLogo} alt="Pollos B3" className={`b3-logo ${className}`} draggable={false} />; }
function BrandGlyph({ label = 'B3' }: { label?: string }) { return <span aria-hidden="true" className="brand-glyph">{label}</span>; }
function ProductArt({ product, featured = false, isDetail = false }: { product: B3Product; featured?: boolean; isDetail?: boolean }) {
  const art = <div className={`product-art product-art--${product.kind} ${featured ? 'product-art--large' : ''} ${isDetail ? 'product-art--detail' : ''}`}>
    <span className="product-art-oval"/><span className="product-art-orbit product-art-orbit--one"/><span className="product-art-orbit product-art-orbit--two"/>
    <span className="product-art-top">POLLOS B3 · SANTA ANITA</span>
    <span className="product-art-digits">{product.kind === 'pollo' ? '01' : product.kind === 'bebida' ? '03' : product.kind === 'combo' ? '02' : '04'}</span>
    <span className="product-art-sub">{product.kind === 'pollo' ? 'EL CLÁSICO DE LA BRASA' : product.kind === 'combo' ? 'PARA COMPARTIR' : product.kind === 'bebida' ? 'REFRESCA TU MOMENTO' : 'A TU MANERA'}</span>
  </div>;
  if (isDetail && product.kind === 'pollo' && product.spinFrames?.length) return <SpinCanvas urls={product.spinFrames} alt={`${product.name}, vista interactiva de giro`}/>;
  if (product.videoUrl && !isDetail) return <VisibleProductVideo url={product.videoUrl} poster={product.imageUrl} label={product.name}/>;
  if (product.imageUrl) return <img className="product-photo" src={product.imageUrl} alt={product.name} loading={isDetail ? 'eager' : 'lazy'}/>;
  return art;
}

function VisibleProductVideo({ url, poster, label }: { url: string; poster?: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const node = video.current;
    if (!node || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && !reduceMotion()) node.play().catch(() => undefined);
      else node.pause();
    }, { threshold: .25 });
    observer.observe(node);
    return () => { observer.disconnect(); node.pause(); };
  }, []);
  return <video ref={video} aria-label={label} className="product-photo" src={url} poster={poster} muted playsInline loop preload="none"/>;
}

const heroSlides = [
  { eyebrow: 'SANTA ANITA · UNA FORMA DIFERENTE DE DISFRUTAR', top: 'EL ANTOJO', bottom: 'TIENE NOMBRE.', accent: 'POLLOS B3.', color: 'red' },
  { eyebrow: 'TU MOMENTO · TU ELECCIÓN', top: 'EL SABOR', bottom: 'SE COMPARTE.', accent: 'A LO B3.', color: 'amber' },
  { eyebrow: 'EXPERIENCIA INTERACTIVA', top: 'MÍRALO.', bottom: 'ELÍGELO.', accent: 'DISFRÚTALO.', color: 'red' },
];
function Intro({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  useEffect(() => { if (reduced) { onDone(); return; } const timer = window.setTimeout(onDone, 1900); return () => clearTimeout(timer); }, [onDone, reduced]);
  return <motion.div className="intro-overlay" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .4 } }} onClick={onDone} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') onDone(); }} aria-label="Omitir presentación">
    <div className="intro-ring"><BrandImage className="intro-logo"/></div>
    <div className="intro-name">POLLOS B3</div>
    <div className="intro-subtitle">LA POLLERÍA MÁS VIRAL DE SANTA ANITA</div>
    <span className="intro-skip">TOCA PARA CONTINUAR <ArrowRight size={14}/></span>
  </motion.div>;
}
function Hero({ onOrder }: { onOrder: () => void }) {
  const [slide, setSlide] = useState(0);
  const pointer = useRef<number | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => { if (reduced) return; const timer = window.setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5800); return () => clearInterval(timer); }, [reduced]);
  const move = (delta: number) => setSlide(s => (s + delta + heroSlides.length) % heroSlides.length);
  const item = heroSlides[slide];
  return <section className="b3-hero" id="inicio" aria-label="Bienvenidos a Pollos B3" onTouchStart={event => { pointer.current = event.touches[0].clientX; }} onTouchEnd={event => { if (pointer.current === null) return; const diff = event.changedTouches[0].clientX - pointer.current; if (Math.abs(diff) > 55) move(diff < 0 ? 1 : -1); pointer.current = null; }}>
    <div className="hero-static-grain" aria-hidden="true"/>
    <div className="hero-inner">
      <div className="hero-editorial">
        <div className="hero-overline"><span className="overline-stroke"/>{item.eyebrow}</div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div className="hero-slide-copy" key={slide} initial={reduced ? false : { opacity: 0, x: 42 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -40 }} transition={{ duration: reduced ? 0 : .55, ease: [.22, 1, .36, 1] }}>
            <h1>{item.top}<br/>{item.bottom}<br/><em>{item.accent}</em></h1>
            <p>Una experiencia con identidad propia, hecha para elegir a tu manera.</p>
          </motion.div>
        </AnimatePresence>
        <div className="hero-actions-modern"><SiteLink className="b3-pill b3-pill--red" to="/carta">EXPLORAR LA CARTA <ArrowUpRight size={18}/></SiteLink><button className="b3-pill b3-pill--outline" onClick={onOrder}>¿CÓMO VAS A PEDIR? <ArrowRight size={17}/></button></div>
        <div className="hero-slide-controls"><span className="hero-count">0{slide + 1} <i/> 0{heroSlides.length}</span><div className="hero-pagination" aria-label="Diapositivas">{heroSlides.map((s, idx) => <button key={s.top} type="button" aria-label={`Ver presentación ${idx + 1}`} aria-current={idx === slide ? 'true' : undefined} onClick={() => setSlide(idx)} className={idx === slide ? 'active' : ''}/>)}</div><div className="hero-arrows"><button onClick={() => move(-1)} aria-label="Anterior"><ArrowLeft size={17}/></button><button onClick={() => move(1)} aria-label="Siguiente"><ArrowRight size={17}/></button></div></div>
      </div>
      <div className="hero-brand-stage" aria-label="Identidad oficial de Pollos B3">
        <div className="stage-halo stage-halo--outer"/><div className="stage-halo stage-halo--inner"/><div className="stage-red-ring"/>
        <span className="stage-side-text">UN SABOR QUE SE VIVE</span>
        <BrandImage className="hero-brand-image"/>
        <div className="stage-index"><span>POLLOS B3</span><span>EST. SANTA ANITA</span></div>
      </div>
    </div>
    <a className="hero-scroll-cue" href="#momentos"><ArrowDown size={16}/> DESLIZA PARA DESCUBRIR</a>
  </section>;
}

function Stories({ stories, onProduct }: { stories: B3Story[]; onProduct: (id: string) => void }) {
  const [current, setCurrent] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);
  const video = useRef<HTMLVideoElement>(null);
  useBodyLock(current !== null);
  const active = current === null ? null : stories[current];
  useEffect(() => {
    if (current === null) return;
    setProgress(0);
    let start = performance.now(); let raf = 0;
    const tick = (timestamp: number) => {
      if (document.hidden) { start = timestamp - progress * 4500; raf = requestAnimationFrame(tick); return; }
      const next = Math.min(1, (timestamp - start) / 4500);
      setProgress(next);
      if (next >= 1) {
        setSeen(old => old.includes(stories[current].id) ? old : [...old, stories[current].id]);
        setCurrent(old => old === null || old === stories.length - 1 ? null : old + 1);
      } else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // progress intentionally resets on each story, not each animation frame
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, stories]);
  useEffect(() => { if (active?.videoUrl) video.current?.play().catch(() => undefined); }, [active]);
  const go = (delta: number) => setCurrent(old => old === null ? null : old + delta < 0 ? 0 : old + delta >= stories.length ? null : old + delta);
  return <section className="moments-section layout-gutter" id="momentos">
    <Reveal className="section-heading-modern"><div><p className="section-index">01 / EN PRIMER PLANO</p><h2>Un vistazo<br/><i>a lo B3.</i></h2></div><p>Descubre la experiencia antes de elegir tu próximo antojo.</p></Reveal>
    <div className="moments-rail" role="list" aria-label="Historias interactivas">{stories.map((story, idx) => <button role="listitem" className="moment" type="button" onClick={() => setCurrent(idx)} key={story.id}><div className={`moment-ring ${seen.includes(story.id) ? 'is-seen' : ''}`}><div className={`moment-core tone-${story.tone || 'red'}`}>{story.imageUrl ? <img src={story.imageUrl} alt="" loading="lazy"/> : <BrandGlyph label={`0${idx + 1}`}/>}</div></div><span>{story.title}</span></button>)}</div>
    <AnimatePresence>{active && <motion.div className="story-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Historia: ${active.title}`}>
      <div className={`story-screen tone-${active.tone || 'red'}`}><div className="story-bars">{stories.map((story, i) => <span key={story.id}><b style={{ width: i < current! ? '100%' : i === current ? `${progress * 100}%` : '0%' }}/></span>)}</div>
        <div className="story-top"><BrandImage/><span>POLLOS B3 · HISTORIAS</span><button onClick={() => { setSeen(old => old.includes(active.id) ? old : [...old, active.id]); setCurrent(null); }} aria-label="Cerrar historias"><X size={23}/></button></div>
        {active.videoUrl ? <video ref={video} className="story-media" src={active.videoUrl} autoPlay muted playsInline loop/> : active.imageUrl ? <img src={active.imageUrl} className="story-media" alt=""/> : <div className="story-typography" aria-hidden="true"><div className="story-typography-ring"/><BrandImage/></div>}
        <div className="story-tap story-tap--left" onClick={() => go(-1)} role="button" tabIndex={0} aria-label="Historia anterior" onKeyDown={e => { if (e.key === 'Enter') go(-1); }}/><div className="story-tap story-tap--right" onClick={() => go(1)} role="button" tabIndex={0} aria-label="Siguiente historia" onKeyDown={e => { if (e.key === 'Enter') go(1); }}/>
        <div className="story-bottom"><p>UNA HISTORIA B3</p><h3>{active.title}</h3><span>{active.subtitle}</span><button className="b3-pill b3-pill--white" onClick={() => { const id = active.productId; setCurrent(null); if (id) onProduct(id); else navigate('/carta'); }}>{active.productId ? 'VER PRODUCTO' : 'EXPLORAR LA CARTA'} <ArrowUpRight size={16}/></button></div>
      </div></motion.div>}</AnimatePresence>
  </section>;
}

function ProductDetail({ product, close, add }: { product: B3Product; close: () => void; add: (item: CartItem, id: string) => void }) {
  const [variant, setVariant] = useState(product.variants.find(v => v.available !== false)?.id || product.variants[0].id);
  const [creams, setCreams] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [warn, setWarn] = useState('');
  useBodyLock(true);
  useEffect(() => { const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); }; window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown); }, [close]);
  const pick = product.variants.find(v => v.id === variant) || product.variants[0];
  const extraItems = (product.extras || []).filter(x => extras.includes(x.id));
  const sauceItems = (product.sauces || []).filter(x => creams.includes(x.id));
  const unit = pick.price + [...extraItems, ...sauceItems].reduce((sum, x) => sum + x.price, 0);
  const onCream = (id: string) => { setWarn(''); setCreams(old => old.includes(id) ? old.filter(x => x !== id) : old.length >= (product.sauceLimit ?? 3) ? (setWarn(`Puedes elegir hasta ${product.sauceLimit ?? 3} cremas.`), old) : [...old, id]); };
  const addCurrent = () => {
    const options = [...sauceItems.map(x => x.label), ...extraItems.map(x => x.label)];
    add({ key: [product.id, variant, ...[...creams, ...extras].sort()].join('::'), productId: product.id, name: product.name, variant: pick.label, extras: options, unit, qty }, product.id);
    if ('vibrate' in navigator) navigator.vibrate?.(15);
    close();
  };
  return <motion.div className="detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={close} role="presentation">
    <motion.section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-name" initial={{ y: 45, opacity: .8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: .48, ease: [.2, .75, .2, 1] }} onMouseDown={event => event.stopPropagation()}>
      <button className="floating-close" onClick={close} aria-label="Cerrar ficha"><X size={21}/></button>
      <motion.div layoutId={`b3-image-${product.id}`} transition={{ type: 'tween', duration: .48 }} className="detail-media"><ProductArt product={product} isDetail/>{!product.imageUrl && <span className="detail-photo-note">ILUSTRACIÓN CONCEPTUAL · FOTO OFICIAL POR CONECTAR</span>}</motion.div>
      <div className="detail-body"><p className="section-index">ELIGE A TU MANERA · POLLOS B3</p><h2 id="detail-name">{product.name}</h2><p className="detail-description">{product.description}</p>
        <fieldset className="option-set"><legend>Selecciona tu presentación <span>01</span></legend><div className="option-choices">{product.variants.map(x => <button type="button" disabled={x.available === false} className={`option-pill ${variant === x.id ? 'is-picked' : ''}`} key={x.id} onClick={() => { setVariant(x.id); navigator.vibrate?.(8); }}><b>{x.label}</b><span>{soles(x.price)}</span></button>)}</div></fieldset>
        {!!product.sauces?.length && <fieldset className="option-set"><legend>Elige tus cremas <span>HASTA {product.sauceLimit ?? 3}</span></legend><div className="chip-choices">{product.sauces.filter(x => x.available !== false).map(x => <button type="button" className={`chip ${creams.includes(x.id) ? 'is-picked' : ''}`} key={x.id} onClick={() => onCream(x.id)}>{creams.includes(x.id) ? <Check size={15}/> : <Plus size={15}/>} {x.label}{x.price > 0 && ` +${soles(x.price)}`}</button>)}</div>{warn && <p className="option-warning" role="alert">{warn}</p>}</fieldset>}
        {!!product.extras?.length && <fieldset className="option-set"><legend>¿Algo adicional? <span>OPCIONAL</span></legend><div className="chip-choices">{product.extras.filter(x => x.available !== false).map(x => <button type="button" className={`chip ${extras.includes(x.id) ? 'is-picked' : ''}`} key={x.id} onClick={() => setExtras(old => old.includes(x.id) ? old.filter(v => v !== x.id) : [...old, x.id])}>{extras.includes(x.id) ? <Check size={15}/> : <Plus size={15}/>} {x.label} +{soles(x.price)}</button>)}</div></fieldset>}
      </div>
      <div className="detail-order"><div className="quantity-picker"><button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Disminuir cantidad"><Minus size={17}/></button><b>{qty}</b><button onClick={() => setQty(q => Math.min(99, q + 1))} aria-label="Aumentar cantidad"><Plus size={17}/></button></div><button className="b3-pill b3-pill--red detail-add" disabled={!product.available || pick.available === false} onClick={addCurrent}>AGREGAR <AnimatePresence mode="wait"><motion.span key={unit * qty} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}>{soles(unit * qty)}</motion.span></AnimatePresence><ArrowRight size={17}/></button></div>
    </motion.section>
  </motion.div>;
}

function MenuSection({ data, demo, error, open, query, setQuery }: { data: B3Catalog | null; demo: boolean; error: string; open: (p: B3Product) => void; query: string; setQuery: (s: string) => void }) {
  const [category, setCategory] = useState('all');
  const items = (data?.products || []).filter(x => (category === 'all' || category === x.categoryId) && `${x.name} ${x.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="menu-modern layout-gutter" id="carta">
    <Reveal className="section-heading-modern"><div><p className="section-index">02 / ELEGIR ES PARTE DE LA EXPERIENCIA</p><h2>La carta.<br/><i>Sin apuros.</i></h2></div><p>Explora cada detalle. Personaliza tu elección y descubre tu favorito.</p></Reveal>
    <div className="menu-toolbar"><div className="category-chips"><button onClick={() => setCategory('all')} className={category === 'all' ? 'selected' : ''}>Toda la carta</button>{(data?.categories || []).map(x => <button key={x.id} className={category === x.id ? 'selected' : ''} onClick={() => setCategory(x.id)}>{x.name}</button>)}</div><label className="menu-search"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="¿Qué se te antoja?" aria-label="Buscar en la carta"/></label></div>
    {error && <p className="menu-error" role="alert">No se pudo actualizar la carta: {error}</p>}
    {demo && <p className="demo-disclosure"><CircleHelp size={15}/> Experiencia de diseño: los productos y precios que ves son muestras para probar interacciones. No son la carta oficial ni permiten realizar pedidos.</p>}
    {items.length ? <div className="product-grid-modern">{items.map((p, idx) => <motion.button layout key={p.id} type="button" className={`product-card-modern ${p.featured ? 'is-featured' : ''}`} onClick={() => open(p)} aria-label={`Ver ${p.name} desde ${soles(p.variants[0].price)}`}><motion.div data-product-id={p.id} className="product-card-media" layoutId={`b3-image-${p.id}`} transition={{ type: 'tween', duration: .48 }}><ProductArt product={p} featured={p.featured}/></motion.div><div className="product-card-info"><div><span className="product-card-numeral">0{idx + 1} / {p.kind === 'pollo' ? 'A LA BRASA' : labelFor(p.categoryId)}</span><h3>{p.name}</h3><p>{p.description}</p><b>DESDE {soles(Math.min(...p.variants.map(v => v.price)))}</b></div><span className="product-card-arrow"><ArrowUpRight size={23}/></span></div></motion.button>)}</div> : <div className="menu-editorial-empty"><div className="empty-art"><BrandGlyph label="B3"/><span className="empty-art-ring"/></div><div><span className="section-index">LA CARTA, A TU RITMO</span><h3>{query ? 'No encontramos coincidencias.' : 'Muy pronto, todo el sabor en un lugar.'}</h3><p>{query ? 'Prueba con otra palabra o vuelve a explorar las categorías.' : 'La carta oficial se mostrará aquí al vincular el administrador que también utiliza la aplicación móvil. Nada de precios ni productos inventados.'}</p>{query && <button className="text-inline-button" onClick={() => { setQuery(''); setCategory('all'); }}>Limpiar búsqueda <ArrowRight size={16}/></button>}</div></div>}
  </section>;
}

const questions = [
  { text: '¿Cuánta hambre tienes?', answers: ['Poca', 'Normal', 'Mucha'] },
  { text: '¿Te gusta el picante?', answers: ['Nada', 'Un poco', 'Mucho'] },
  { text: '¿Para cuántos es?', answers: ['Solo yo', 'Somos 2', '3 o más'] },
];
function Recommender({ products, open }: { products: B3Product[]; open: (p: B3Product) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const reset = () => { setStep(0); setAnswers([]); };
  const done = step === 3;
  const candidates = useMemo(() => {
    const pp = products.filter(p => p.available);
    const kindPriority = answers[2] === '3 o más' ? ['combo','pollo','bebida'] : answers[2] === 'Somos 2' ? ['pollo','combo','otro'] : ['pollo','otro','bebida'];
    return pp.sort((a,b) => (kindPriority.indexOf(a.kind) < 0 ? 99 : kindPriority.indexOf(a.kind)) - (kindPriority.indexOf(b.kind) < 0 ? 99 : kindPriority.indexOf(b.kind))).slice(0, 3);
  }, [products, answers]);
  return <section className="quiz-modern layout-gutter" id="antojo"><div className="quiz-aside"><Reveal><p className="section-index section-index--light">03 / ALGO SOLO PARA TI</p><h2>¿Qué se<br/><i>te antoja?</i></h2><p>Tres preguntas. Un camino más corto hacia lo que te provoca.</p><span className="quiz-decor">03 <span/> 01</span></Reveal></div><div className="quiz-interface"><div className="quiz-upper"><span>RECOMENDADOR B3</span><span>0{Math.min(step + 1,3)} / 03</span></div><div className="quiz-rule">{questions.map((q, i) => <span className={i <= step ? 'on' : ''} key={q.text}/>)}</div>
    <AnimatePresence mode="wait">{!done ? <motion.div key={step} {...panelIn} className="quiz-question"><span className="quiz-question-count">PREGUNTA 0{step + 1}</span><h3>{questions[step].text}</h3><div className="quiz-options">{questions[step].answers.map((answer, i) => <button key={answer} onClick={() => { setAnswers(old => [...old.slice(0,step), answer]); setStep(step + 1); }}><span>0{i+1}</span><b>{answer}</b><ArrowUpRight size={18}/></button>)}</div>{step > 0 && <button className="quiz-back-modern" onClick={() => setStep(s => s - 1)}><ArrowLeft size={16}/> Volver</button>}</motion.div> : <motion.div key="results" {...panelIn} className="quiz-results"><p className="quiz-question-count">PENSAMOS EN TU ANTOJO</p><h3>Algo que va contigo.</h3>{candidates.length ? <div className="quiz-suggestions">{candidates.map((p,i) => <button key={p.id} onClick={() => open(p)} style={{ animationDelay: `${i*.1}s` }}><span>0{i+1}</span><strong>{p.name}</strong><b>{soles(p.variants[0].price)}</b><ArrowUpRight size={18}/></button>)}</div> : <p className="quiz-empty">Conectaremos tus respuestas con los productos realmente disponibles desde administración.</p>}<button className="quiz-back-modern" onClick={reset}><RotateCcw size={16}/> Volver a empezar</button></motion.div>}</AnimatePresence>
  </div></section>;
}

function ComboBuilder({ data, add }: { data: B3Catalog | null; add: (item: CartItem, id: string) => void }) {
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState<(string | null)[]>([null,null,null]);
  const pool = data?.products.filter(x => x.available) || [];
  const stages = [pool.filter(x => x.kind === 'pollo' || x.kind === 'otro' || x.kind === 'combo'), pool.filter(x => x.kind === 'bebida'), pool.filter(x => x.kind === 'postre')];
  const pick = (id: string | null) => { setChosen(old => old.map((s,i) => i === step ? id : s)); if (step < 2) setStep(step + 1); };
  const selected = chosen.map(id => pool.find(p => p.id === id) || null);
  const price = selected.reduce((sum,p) => sum + (p?.variants[0]?.price || 0), 0);
  const discount = selected[0] && selected[1] ? (selected[2] ? data?.comboDiscounts?.withDessert : data?.comboDiscounts?.plateDrink) || 0 : 0;
  const total = Math.round(price * (1 - discount / 100) * 100)/100;
  const createCombo = () => {
    if (!selected[0] || !selected[1]) return;
    const entries = selected.filter((p): p is B3Product => p !== null);
    add({ key: `combo-${chosen.join('-')}`, productId: 'combo', name: 'Combo a tu manera', variant: entries.map(e => e.name).join(' + '), unit: total, extras: [], qty: 1, isCombo: true }, 'combo');
    setStep(0); setChosen([null,null,null]);
  };
  return <section className="combo-modern layout-gutter" id="combos"><Reveal className="section-heading-modern"><div><p className="section-index">04 / HECHO A TU GUSTO</p><h2>Tu combo.<br/><i>Tus reglas.</i></h2></div><p>Elige un plato, acompáñalo y termina como más te provoque.</p></Reveal><div className="combo-board"><div className="combo-board-side"><span className="board-eyebrow">LA EXPERIENCIA B3</span><span className="board-display">01<span>/</span>03</span><div className="board-circle"><Flame size={73} strokeWidth={.75}/></div><p>Una elección que se arma paso a paso.</p></div><div className="combo-board-main"><div className="combo-progress-modern">{['TU PLATO','TU BEBIDA','TU TOQUE FINAL'].map((item,i) => <button key={item} className={step===i ? 'is-current' : chosen[i] ? 'is-complete' : ''} onClick={() => setStep(i)}><span>{chosen[i] ? <Check size={13}/> : `0${i+1}`}</span>{item}</button>)}</div><AnimatePresence mode="wait"><motion.div key={step} {...panelIn} className="combo-stage"><p className="section-index">PASO 0{step + 1} / 03</p><h3>{['Empieza con lo que más te gusta.','¿Con qué lo acompañamos?','Un final a tu manera.'][step]}</h3><div className="combo-choice-list">{stages[step].length ? stages[step].map(p => <button key={p.id} className={chosen[step] === p.id ? 'chosen' : ''} onClick={() => pick(p.id)}><span className="combo-choice-icon"><BrandGlyph/></span><span className="combo-choice-content"><b>{p.name}</b><small>Desde {soles(p.variants[0].price)}</small></span><ArrowRight size={19}/></button>) : <div className="combo-choice-empty">Las opciones para este paso aparecerán cuando se conecte el catálogo autorizado.</div>}{step===2 && <button className="combo-choice-skip" onClick={() => pick(null)}>Continuar sin postre <ArrowRight size={16}/></button>}</div></motion.div></AnimatePresence><div className="combo-board-bottom"><button className="text-inline-button" disabled={step===0} onClick={() => setStep(s=>Math.max(0,s-1))}><ArrowLeft size={16}/> Anterior</button><div className="combo-price-block"><span>{discount ? `AHORRAS ${soles(price-total)}` : 'PRECIO DEL COMBO'}</span><strong>{soles(total)}</strong></div><button className="b3-pill b3-pill--dark" disabled={!selected[0] || !selected[1]} onClick={createCombo}>AGREGAR COMBO <Plus size={16}/></button></div></div></div></section>;
}

function LocationPicker({ data, close, set }: { data: B3Catalog | null; close: () => void; set: (delivery: Delivery) => void }) {
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [storeId, setStoreId] = useState('');
  const [coords, setCoords] = useState<Delivery['coords']>();
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  useBodyLock(true);
  const getLocation = () => {
    if (!navigator.geolocation) { setError('Tu navegador no permite obtener la ubicación. Ingresa la dirección.'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition(pos => { setLocating(false); setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setError('Ubicación aproximada detectada. Completa y confirma la dirección de entrega.'); }, () => { setLocating(false); setError('No pudimos obtener tu ubicación. Ingresa tu dirección manualmente.'); }, { timeout: 11000, enableHighAccuracy: true, maximumAge: 60000 });
  };
  return <div className="b3-overlay" role="presentation" onMouseDown={close}><section className="selector-modal" role="dialog" aria-modal="true" aria-labelledby="location-title" onMouseDown={e=>e.stopPropagation()}><button className="floating-close" onClick={close} aria-label="Cerrar"><X/></button><span className="section-index">ELIGE TU EXPERIENCIA</span><h2 id="location-title">¿Cómo quieres<br/><i>disfrutar B3?</i></h2><div className="delivery-toggle"><button className={mode==='delivery'?'selected':''} onClick={()=>setMode('delivery')}><Truck size={24}/><b>Delivery</b><span>Te lo llevamos</span></button><button className={mode==='pickup'?'selected':''} onClick={()=>setMode('pickup')}><Store size={24}/><b>Recojo</b><span>Tú eliges dónde</span></button></div>
  {mode==='delivery' ? <div className="location-form"><label>Tu dirección de entrega<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Calle, número y referencia"/></label><button className="text-inline-button" onClick={getLocation} disabled={locating}><Navigation size={17}/>{locating?'Obteniendo ubicación…':'Usar ubicación actual'}</button>{error && <p className="form-note" role="status">{error}</p>}{coords && <small>Coordenadas aproximadas obtenidas. El punto debe validarse antes de calcular cobertura.</small>}</div> : <div className="location-form"><label>Elige un local<select value={storeId} onChange={e=>setStoreId(e.target.value)}><option value="">Seleccionar sede</option>{(data?.stores || []).filter(x=>x.available!==false).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>{!data?.stores?.length && <p className="form-note">Los locales se mostrarán al conectar administración.</p>}</div>}
  <button className="b3-pill b3-pill--red location-confirm" disabled={mode==='delivery'?address.trim().length<5:!storeId} onClick={()=>{set({mode,address:address.trim(),storeId,coords}); close();}}>GUARDAR PREFERENCIA <ArrowRight size={17}/></button><p className="location-legal">La cobertura, la disponibilidad y el costo de entrega se verificarán en el servidor antes de aceptar un pedido.</p></section></div>;
}

function CartDrawer({ cart, total, setQty, close, openDelivery }: { cart: CartItem[]; total: number; setQty: (id:string,q:number)=>void; close: ()=>void; openDelivery: ()=>void }) {
  useBodyLock(true);
  return <div className="drawer-backdrop" role="presentation" onMouseDown={close}><motion.aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'tween', duration:.35 }} onMouseDown={e=>e.stopPropagation()}><div className="drawer-heading"><div><p className="section-index">TU ELECCIÓN</p><h2 id="cart-title">Tu pedido<span>.</span></h2></div><button className="round-control" onClick={close} aria-label="Cerrar carrito"><X size={22}/></button></div><div className="cart-items">{cart.length ? cart.map(item=><div className="cart-entry" key={item.key}><div className="cart-entry-image"><BrandGlyph/></div><div className="cart-entry-description"><b>{item.name}</b><span>{item.variant}</span>{!!item.extras.length&&<small>{item.extras.join(' · ')}</small>}<div className="cart-entry-qty"><button onClick={()=>setQty(item.key,item.qty-1)} aria-label={`Restar ${item.name}`}><Minus size={14}/></button><b>{item.qty}</b><button onClick={()=>setQty(item.key,item.qty+1)} aria-label={`Sumar ${item.name}`}><Plus size={14}/></button></div></div><strong>{soles(item.qty*item.unit)}</strong></div>) : <div className="cart-empty"><ShoppingBag size={38} strokeWidth={1}/><h3>Tu próximo antojo empieza aquí.</h3><p>Explora la carta para elegir tus favoritos.</p><button className="b3-pill b3-pill--dark" onClick={()=>{close();navigate('/carta');}}>VER LA CARTA <ArrowRight size={17}/></button></div>}</div><div className="drawer-foot"><div className="cart-total"><span>Subtotal</span><strong>{soles(total)}</strong></div><p>El costo de delivery y la disponibilidad se validarán antes de confirmar la compra.</p><button className="b3-pill b3-pill--red cart-checkout" disabled={!cart.length} onClick={()=>{close();openDelivery();}}>CONTINUAR MI PEDIDO <ArrowRight size={17}/></button></div></motion.aside></div>;
}

function TuVersoChat({ open, setOpen }: { open:boolean; setOpen:(v:boolean)=>void }) {
  const widget = import.meta.env.VITE_TUVERSO_WEB_EMBED_URL as string | undefined;
  const accepted = (()=>{ if(!widget) return ''; try {const url = new URL(widget); return url.protocol === 'https:' ? url.toString() : '';}catch{return '';} })();
  return <><button className={`chat-fab ${open ? 'chat-fab--open' : ''}`} type="button" aria-label={open?'Cerrar atención web':'Abrir chat de atención'} onClick={()=>setOpen(!open)}>{open?<X size={22}/>:<MessageCircle size={24}/>}<span>{open?'CERRAR':'¿TE AYUDAMOS?'}</span></button><AnimatePresence>{open&&<motion.section className="chat-window" role="dialog" aria-label="Atención web TU VERSO" initial={{opacity:0,y:20,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:10,scale:.98}}><header><BrandImage/><div><strong>ATENCIÓN POLLOS B3</strong><span>Canal WEB · TU VERSO</span></div><button onClick={()=>setOpen(false)} aria-label="Cerrar chat"><X size={19}/></button></header>{accepted ? <iframe src={accepted} title="Chat web Pollos B3 operado en TU VERSO" referrerPolicy="strict-origin-when-cross-origin" allow="clipboard-write"/> : <div className="chat-not-ready"><MessageCircle size={42} strokeWidth={1}/><h3>Estamos preparando este espacio para ti.</h3><p>Aquí podrás conversar sin salir de la web con el equipo de Pollos B3 mediante TU VERSO.</p><span>CANAL WEB · INTEGRACIÓN PENDIENTE</span></div>}</motion.section>}</AnimatePresence></>;
}

function Locations({ data, openDelivery }: { data: B3Catalog | null; openDelivery: ()=>void }) {
  return <section className="locations-modern layout-gutter" id="locales"><Reveal className="section-heading-modern"><div><p className="section-index">05 / SIEMPRE CERCA</p><h2>Nos vemos<br/><i>en B3.</i></h2></div><p>Elige dónde recoger o consulta la disponibilidad de entrega para tu dirección.</p></Reveal><div className="locations-grid-modern"><div className="locations-graphic"><div className="locations-map-lines"/><span>POLLOS B3</span><MapPin size={62} strokeWidth={.9}/><small>SANTA ANITA · LIMA</small></div><div className="locations-list">{data?.stores?.length ? data.stores.map(s=><div key={s.id} className="location-row"><span><MapPin size={18}/></span><div><b>{s.name}</b><p>{s.address}</p><small>{s.hoursLabel || 'Consultar horario'} {s.open !== undefined ? ` · ${s.open?'Abierto':'Cerrado'}` : ''}</small></div><button onClick={openDelivery} aria-label={`Elegir ${s.name}`}><ArrowUpRight size={20}/></button></div>) : <div className="locations-not-ready"><span className="section-index">LOCALES Y HORARIOS</span><h3>Elige cómo pedir. Nosotros te guiamos.</h3><p>Los locales y horarios verificados aparecerán aquí desde el mismo administrador que utiliza la aplicación móvil.</p><button className="b3-pill b3-pill--dark" onClick={openDelivery}>SELECCIONAR MODALIDAD <ArrowRight size={17}/></button></div>}</div></div></section>;
}

function NoticeDialog({ notice, close }: { notice: {title:string;text:string}; close:()=>void }) { useBodyLock(true); return <div className="b3-overlay" role="presentation" onMouseDown={close}><section role="dialog" aria-modal="true" aria-labelledby="notice-title" className="notice-modal" onMouseDown={e=>e.stopPropagation()}><button className="floating-close" onClick={close} aria-label="Cerrar"><X size={20}/></button><span className="notice-mark"><CheckCircle2 size={28}/></span><p className="section-index">INFORMACIÓN IMPORTANTE</p><h2 id="notice-title">{notice.title}</h2><p>{notice.text}</p><button className="b3-pill b3-pill--dark" onClick={close}>ENTENDIDO <ArrowRight size={16}/></button></section></div>; }

function Footer({ openChat, notice }: { openChat:()=>void; notice:(title:string,text:string)=>void }) {
  return <footer className="footer-modern"><div className="footer-top-modern"><div><BrandImage className="footer-logo"/><p>La pollería más viral de Santa Anita.</p><span>SANTA ANITA · LIMA, PERÚ</span></div><div><b>EXPLORA</b><SiteLink to="/">Inicio</SiteLink><SiteLink to="/carta">Carta</SiteLink><SiteLink to="/combos">Combos</SiteLink><SiteLink to="/locales">Locales</SiteLink></div><div><b>CONVERSEMOS</b><button onClick={openChat}>Chat web <ArrowUpRight size={14}/></button>{([['Instagram',import.meta.env.VITE_B3_INSTAGRAM_URL],['TikTok',import.meta.env.VITE_B3_TIKTOK_URL],['Facebook',import.meta.env.VITE_B3_FACEBOOK_URL]] as Array<[string,string|undefined]>).filter(([,u]) => { try {return !!u && new URL(u).protocol === 'https:';}catch{return false;} }).map(([name,url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer">{name} <ArrowUpRight size={14}/></a>)}</div><div className="footer-big-b3">B3</div></div><div className="footer-bottom-modern"><span>© {new Date().getFullYear()} POLLOS B3</span><span>EXPERIENCIA DIGITAL POR INTEGRA B2G</span><button onClick={()=>notice('Información legal','Las políticas, términos y el Libro de Reclamaciones deben vincularse a sus documentos oficiales antes del lanzamiento.')}>PRIVACIDAD · TÉRMINOS · LIBRO DE RECLAMACIONES</button></div></footer>;
}

export default function Home() {
  const { data, demo, error } = usePublicStore();
  const route = useRoute();
  const reducedAnimations = useReducedMotion();
  const { cart, add, setQty, total, count } = usePersistentCart();
  const [intro, setIntro] = useState(() => { try { return window.location.pathname === '/' && !reduceMotion() && !sessionStorage.getItem('b3-intro-seen'); } catch { return !reduceMotion(); } });
  const [openProduct, setOpenProduct] = useState<B3Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [delivery, setDelivery] = useState<Delivery>({mode:'delivery',address:'',storeId:''});
  const [cartBounce, setCartBounce] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneIntro = () => { setIntro(false); try { sessionStorage.setItem('b3-intro-seen','1'); } catch {} };
  const flyToCart = (productId: string) => {
    if (reduceMotion()) return;
    const source = document.querySelector(`[data-product-id="${productId}"]`) || document.querySelector('.detail-media');
    const target = document.querySelector('.header-cart') || document.querySelector('.cart-floating-modern');
    if (!target) return;
    const a = source?.getBoundingClientRect() || {left:innerWidth/2,top:innerHeight/2,width:0,height:0};
    const b = target.getBoundingClientRect();
    const circle = document.createElement('div'); circle.className = 'cart-flying-dot';
    const image = data?.products.find(p => p.id === productId)?.imageUrl;
    if (image) { circle.style.backgroundImage = `url("${image.replace(/["\\]/g, '')}")`; circle.style.backgroundSize = 'cover'; circle.style.backgroundPosition = 'center'; }
    else circle.textContent='B3';
    document.body.appendChild(circle);
    const sx=a.left+a.width/2-21, sy=a.top+a.height/2-21, ex=b.left+b.width/2-21, ey=b.top+b.height/2-21;
    const animation = circle.animate([{ transform:`translate(${sx}px,${sy}px) scale(1)`,opacity:1 },{transform:`translate(${(sx+ex)/2}px,${Math.min(sy,ey)-110}px) scale(.72)`,opacity:1,offset:.55},{transform:`translate(${ex}px,${ey}px) scale(.15)`,opacity:.6}],{duration:680,easing:'cubic-bezier(.21,.68,.16,1)',fill:'forwards'});
    animation.onfinish=()=>circle.remove(); animation.oncancel=()=>circle.remove();
  };
  const addToCart = (item: CartItem, id: string) => { add(item); flyToCart(id); setCartBounce(true); setToast('Agregado a tu pedido'); if(toastTimer.current)clearTimeout(toastTimer.current); toastTimer.current=setTimeout(()=>{setToast('');setCartBounce(false);},2300); };
  const notify = (title:string,text:string) => setNotice({title,text});
  const onNavigate = () => { setMobileMenu(false); setCartOpen(false); };
  useEffect(() => { document.title = `${route === '/404' ? 'No encontrada' : pageTitles[route]} | Pollos B3 · Santa Anita`; }, [route]);
  const openById = (id: string) => { const product=data?.products.find(p=>p.id===id); if(product) setOpenProduct(product); else navigate('/carta'); };
  const openCart = () => setCartOpen(true);
  useEffect(() => { if(!toastTimer.current)return;return()=>{if(toastTimer.current)clearTimeout(toastTimer.current);}; },[]);
  return <LayoutGroup id="b3-shared-products"><div className="b3-website">
    <AnimatePresence>{intro&&route==='/'&&<Intro onDone={doneIntro}/>}</AnimatePresence>
    <div className="microstrip"><span>POLLOS B3 · SANTA ANITA</span><span>LA POLLERÍA MÁS VIRAL DE SANTA ANITA <Flame size={13}/></span></div>
    <header className="b3-header"><SiteLink to="/" onClick={onNavigate} aria-label="Pollos B3, inicio"><BrandImage className="header-brand"/></SiteLink>
      <nav className="header-navigation" aria-label="Navegación principal">
        {([['/','Inicio'],['/carta','La carta'],['/combos','Arma tu combo'],['/promociones','Promociones'],['/locales','Locales'],['/nosotros','Nosotros']] as const).map(([href,label]) => <SiteLink key={href} to={href} onClick={onNavigate} aria-current={route===href?'page':undefined}>{label}</SiteLink>)}
      </nav>
      <div className="header-utilities"><button className="header-address" onClick={()=>setLocationOpen(true)}><MapPin size={17}/><span><small>{delivery.mode==='delivery'?'ENVIAR A':'RECOJO EN'}</small>{delivery.mode==='delivery'?(delivery.address||'Elige tu ubicación'):(data?.stores.find(s=>s.id===delivery.storeId)?.name||'Seleccionar local')}</span><ChevronDown size={15}/></button>
        <button className="header-cart" onClick={openCart} aria-label={`Ver carrito, ${count} productos`}><ShoppingBag size={21}/><span>{count}</span></button>
        <button className="header-menu" onClick={()=>setMobileMenu(s=>!s)} aria-label={mobileMenu?'Cerrar menú':'Abrir menú'} aria-expanded={mobileMenu}><Menu size={24}/></button>
      </div></header>
    {mobileMenu&&<nav className="header-mobile-popover" aria-label="Menú adicional">{([['/','Inicio'],['/carta','La carta'],['/combos','Arma tu combo'],['/promociones','Promociones'],['/locales','Locales'],['/pedidos','Pedidos'],['/mi-cuenta','Mi cuenta'],['/nosotros','Nosotros'],['/ayuda','Ayuda']] as const).map(([href,label])=><SiteLink key={href} to={href} onClick={onNavigate}>{label} <ArrowUpRight size={17}/></SiteLink>)}<button onClick={()=>{setMobileMenu(false);setLocationOpen(true);}}>Elegir modalidad <MapPin size={17}/></button></nav>}
    {demo&&<div className="design-preview-banner"><Sparkles size={15}/> VISTA DE DISEÑO — CATÁLOGO Y PRECIOS DE MUESTRA. SIN PEDIDOS REALES.</div>}
    <AnimatePresence mode="wait" initial={false}><motion.main id="main-content" key={route} initial={reducedAnimations ? false : {opacity:0,y:10}} animate={{opacity:1,y:0}} exit={reducedAnimations ? undefined : {opacity:0,y:-6}} transition={{duration:reducedAnimations?0:.2}}>
      {route==='/' && <>
        <Hero onOrder={()=>setLocationOpen(true)}/>
        <div className="marquee-band" aria-label="Experiencia Pollos B3"><div>EL SABOR NOS REÚNE <span>✳</span> HAZLO A TU MANERA <span>✳</span> EL SABOR NOS REÚNE <span>✳</span> HAZLO A TU MANERA <span>✳</span></div></div>
        <Stories stories={(data?.stories.length?data.stories:editorialStories)} onProduct={openById}/>
        <FeaturedIntro products={data?.products||[]} onOpen={openById}/>
        <div className="midpoint-banner"><span>NO ES SOLO ELEGIR.</span><strong>ES VIVIR LA EXPERIENCIA.</strong><BrandGlyph label="B3"/></div>
        <Recommender products={data?.products || []} open={setOpenProduct}/>
        <HomePathways onChat={()=>setChatOpen(true)}/>
        <section className="support-modern layout-gutter" id="atencion"><div className="support-orbital"><MessageCircle size={88} strokeWidth={.7}/></div><div><p className="section-index section-index--light">TU VERSO / ATENCIÓN</p><h2>Hablemos.<br/><i>Sin salir de aquí.</i></h2><p>Un espacio de atención dentro de Pollos B3, preparado para el canal WEB de TU VERSO.</p><button className="b3-pill b3-pill--white" onClick={()=>setChatOpen(true)}>ABRIR ATENCIÓN WEB <ArrowUpRight size={18}/></button></div><span className="support-side-label">TU VERSO · BY INTEGRA B2G</span></section>
      </>}
      {route==='/carta'&& <><CommercialHero eyebrow="CARTA / EXPERIENCIA INTERACTIVA" heading="Elige con ganas." highlight="Disfruta a tu manera." description="Explora, descubre y personaliza cada detalle. La carta premium de Pollos B3 está hecha para disfrutarse desde la primera interacción."><button className="commercial-button commercial-button--light" onClick={()=>setLocationOpen(true)}>DELIVERY O RECOJO <ArrowRight size={17}/></button></CommercialHero><MenuSection data={data} demo={demo} error={error} open={setOpenProduct} query={query} setQuery={setQuery}/></>}
      {route==='/combos'&& <><CommercialHero eyebrow="EXPERIENCIA / COMBOS" heading="Tu combo." highlight="Tus reglas." description="Una experiencia interactiva de tres pasos para elegir algo a tu medida. Las opciones y descuentos dependen de la carta oficial."/><ComboBuilder data={data} add={addToCart}/></>}
      {route==='/locales'&& <><CommercialHero eyebrow="SANTA ANITA / LOCALES" heading="Cerca de ti." highlight="A lo B3." description="Selecciona dónde recoger o introduce tu dirección de entrega. La cobertura y disponibilidad se validarán desde administración."><button className="commercial-button commercial-button--light" onClick={()=>setLocationOpen(true)}>ELEGIR MODALIDAD <ArrowRight size={17}/></button></CommercialHero><Locations data={data} openDelivery={()=>setLocationOpen(true)}/></>}
      {route==='/promociones'&&<PromotionsPage/>}
      {route==='/carrito'&&<CartPage cart={cart} total={total} setQty={setQty} onCheckout={()=>navigate('/checkout')} demo={demo}/>}
      {route==='/checkout'&&<CheckoutPage cart={cart} total={total} data={data} delivery={delivery} onChooseLocation={()=>setLocationOpen(true)} demo={demo}/>}
      {route==='/pedidos'&&<OrdersPage onChat={()=>setChatOpen(true)}/>}
      {route==='/mi-cuenta'&&<AccountPage onChat={()=>setChatOpen(true)}/>}
      {route==='/nosotros'&&<AboutPage/>}
      {route==='/ayuda'&&<HelpPage onChat={()=>setChatOpen(true)}/>}
      {route==='/404'&&<NotFoundPage/>}
    </motion.main></AnimatePresence>
    <Footer openChat={()=>setChatOpen(true)} notice={notify}/>
    <button className={`cart-floating-modern ${count?'has-items':''} ${cartBounce?'is-bouncing':''}`} onClick={openCart} aria-label={`Ver carrito: ${count} productos, ${soles(total)}`}><ShoppingBag size={19}/><span>VER CARRITO</span><b>{count}</b>{count>0&&<strong>{soles(total)}</strong>}</button>
    <TuVersoChat open={chatOpen} setOpen={setChatOpen}/>
    <nav className="bottom-nav-modern" aria-label="Navegación móvil">
      {([['/','Inicio',Flame],['/carta','Carta',UtensilsCrossed],['/pedidos','Pedidos',ShoppingBag],['/mi-cuenta','Mi cuenta',UserRound]] as const).map(([href,label,Icon])=><SiteLink key={href} to={href} onClick={onNavigate} aria-current={route===href?'page':undefined}><Icon size={19}/><span>{label}</span></SiteLink>)}
    </nav>
    <AnimatePresence>{openProduct&&<ProductDetail key={openProduct.id} product={openProduct} close={()=>setOpenProduct(null)} add={addToCart}/>}</AnimatePresence>
    <AnimatePresence>{cartOpen&&<CartDrawer cart={cart} total={total} setQty={setQty} close={()=>setCartOpen(false)} openDelivery={()=>{setCartOpen(false);navigate('/checkout');}}/>}</AnimatePresence>
    {locationOpen&&<LocationPicker data={data} close={()=>setLocationOpen(false)} set={setDelivery}/>}
    {notice&&<NoticeDialog notice={notice} close={()=>setNotice(null)}/>}
    <AnimatePresence>{toast&&<motion.div role="status" className="b3-toast" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}><CheckCircle2 size={18}/>{toast}</motion.div>}</AnimatePresence>
  </div></LayoutGroup>;
}
