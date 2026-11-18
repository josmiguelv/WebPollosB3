import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUp, Check, ChevronDown, Clapperboard, List, Plus, Search, Settings2, ShoppingBag, Type, X } from 'lucide-react';
import type { B3Catalog, B3Product } from '@/lib/storefront/catalog';
import type { CartItem, Delivery } from './Home';
import { B3_CARTA_PILOT } from '@/lib/navigation';
import { CartaCompra } from './CartaCompra';
import { VideoGiroDemo } from './VideoGiroDemo';
import { soles } from '@/lib/storefront/catalog';
import { SiteLink } from '@/lib/navigation';
import './carta-inmersiva.css';

type Props = {
  data: B3Catalog | null;
  demo: boolean;
  error: string;
  onOpen: (product: B3Product) => void;
  cart: CartItem[];
  total: number;
  setQty: (key:string,qty:number) => void;
  delivery: Delivery;
  setDelivery: (value:Delivery) => void;
  query: string;
  setQuery: (value: string) => void;
};

function minPrice(product: B3Product): number | null {
  const prices = product.variants.filter(variant => variant.available !== false).map(variant => variant.price);
  return prices.length ? Math.min(...prices) : null;
}

function DishPhoto({ product, priority = false, label = false }: { product: B3Product; priority?: boolean; label?: boolean }) {
  const [failed, setFailed] = useState(false);
  const illustrative = product.id.startsWith('demo-');
  return <div className="b3-ci-photo">
    {product.imageUrl && !failed ? <img src={product.imageUrl} alt={illustrative ? `Foto referencial de ${product.name}` : product.name} loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} /> : <div className="b3-ci-photo-fallback" aria-label="Imagen por publicar"><span>B3</span><small>IMAGEN POR PUBLICAR</small></div>}
    {illustrative && label && <span className="b3-ci-reference">FOTOGRAFÍA REFERENCIAL</span>}
    {!product.available && <span className="b3-ci-unavailable">NO DISPONIBLE</span>}
  </div>;
}

/* Un toque en la foto la gira; el botón de compra permanece separado. */
function FlipDishPhoto({ product, kind = 'dish', priority = false }: { product: B3Product; kind?: 'dish'|'lead'|'reel'; priority?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const included = product.name.split(/\s+\+\s+/).filter(Boolean);
  const isReference = product.id.startsWith('demo-');
  const summary = product.kind === 'combo'
    ? 'Una combinación de pollo a la brasa, acompañamientos y bebida, ideal para compartir.'
    : product.kind === 'bebida'
      ? 'La bebida que acompaña tu elección, en su presentación indicada.'
      : 'Pollo a la brasa acompañado con todo lo que incluye esta presentación.';
  const backTitle = product.kind === 'combo' ? 'Tu combo, al detalle'
    : product.kind === 'bebida' ? 'Tu bebida' : 'Tu plato, al detalle';
  const base = kind === 'lead' ? 'b3-ci-lead-photo-button' : kind === 'reel' ? 'b3-ci-reel-photo' : 'b3-ci-dish-photo';
  const price = minPrice(product);
  const layoutProps = kind === 'dish' ? { layoutId: 'b3-image-' + product.id, transition: { type: 'tween' as const, duration: .48 } } : {};
  return <motion.button type="button" className={base + ' b3-ci-flip-photo'} data-product-id={product.id} {...layoutProps}
    aria-label={(flipped ? 'Volver a la foto de ' : 'Girar foto y ver qué incluye ') + product.name}
    aria-pressed={flipped} onClick={() => setFlipped(previous => !previous)}>
    <div className={'b3-ci-flip-inner' + (flipped ? ' is-flipped' : '')}>
      <div className={'b3-ci-flip-face b3-ci-flip-front' + (kind === 'lead' ? ' b3-ci-lead-photo' : '')}>
        <DishPhoto product={product} priority={priority} label/>
        <span className="b3-ci-flip-hint" aria-hidden="true">↻ QUÉ INCLUYE</span>
        {kind !== 'dish' && <span className={kind === 'lead' ? 'b3-ci-price-pill' : 'b3-ci-small-price'}>{price === null ? 'Consultar' : soles(price)}</span>}
      </div>
      <div className="b3-ci-flip-face b3-ci-flip-back">
        <div className="b3-ci-flip-back-heading">
          <span className="b3-ci-flip-kicker">UNA MIRADA A TU ELECCIÓN</span>
          <strong>{backTitle}</strong>
          <p>{summary}</p>
        </div>
        <div className="b3-ci-flip-includes">
          <span>ESTA PRESENTACIÓN INCLUYE</span>
          <div className="b3-ci-flip-parts">
            {included.map((item,i) => <span key={i}><Check size={14} aria-hidden="true"/>{item}</span>)}
          </div>
        </div>
        <div className="b3-ci-flip-bottom">
          <span>{price === null ? 'Precio por confirmar' : (isReference ? 'PRECIO REFERENCIAL · ' : '') + soles(price)}</span>
          <small>↶ TOCA PARA VOLVER</small>
        </div>
      </div>
    </div>
  </motion.button>;
}

export function CartaInmersiva({ data, demo, error, onOpen, cart, total, setQty, delivery, setDelivery, query, setQuery }: Props) {
  const [purchaseOpen,setPurchaseOpen]=useState(false);
  const cartCount=cart.reduce((sum,item)=>sum+item.qty,0);
  const openPurchase=()=>{setPurchaseOpen(true);window.scrollTo({top:0,behavior:'instant'});};
  const [searchOpen, setSearchOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [showTop, setShowTop] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const chipRail = useRef<HTMLDivElement>(null);
  const isCategoryJumping = useRef(false);
  const categoryJumpTimer = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const matching = useMemo(() => products.filter(product => `${product.name} ${product.description}`.toLocaleLowerCase('es-PE').includes(query.trim().toLocaleLowerCase('es-PE'))), [products, query]);
  const lead = products.find(p => p.featured && p.available && minPrice(p) !== null) ?? products.find(p => p.available && minPrice(p) !== null);
  const discoveries = products.filter(p => p.available && p.id !== lead?.id && minPrice(p) !== null).slice(0, 7);
  const categoryEntries = categories.map(category => ({ ...category, products: matching.filter(product => product.categoryId === category.id) }));
  const remaining = matching.filter(product => !categories.some(category => category.id === product.categoryId));
  const productCount = matching.length;

  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => () => {
    if (categoryJumpTimer.current !== null) window.clearTimeout(categoryJumpTimer.current);
  }, []);
  useEffect(() => {
    if (!categorySheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setCategorySheet(false); };
    window.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', escape); };
  }, [categorySheet]);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-b3-ci-category]');
    if (!elements.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(item => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (current && !isCategoryJumping.current) setActiveCategory((current.target as HTMLElement).dataset.b3CiCategory ?? '');
    }, { rootMargin: '-136px 0px -60% 0px', threshold: 0 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [data, query]);
  const moveTo = (id: string) => {
    const wasSheetOpen = categorySheet;
    setCategorySheet(false);
    setActiveCategory(id);
    isCategoryJumping.current = true;
    if (categoryJumpTimer.current !== null) window.clearTimeout(categoryJumpTimer.current);
    const scrollOnlyTheCorrectAxes = () => {
      const section = document.getElementById('b3-ci-cat-' + id);
      const headerHeight = document.querySelector<HTMLElement>('.b3-ci-header')?.offsetHeight ?? 79;
      const barHeight = document.querySelector<HTMLElement>('.b3-ci-sticky-categories')?.offsetHeight ?? 68;
      if (section) {
        const top = Math.max(0, window.scrollY + section.getBoundingClientRect().top - headerHeight - barHeight - 12);
        window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
      }
      // A chip's scrollIntoView also scrolls the document vertically: never use it here.
      const rail = chipRail.current;
      const chip = Array.from(rail?.querySelectorAll<HTMLButtonElement>('[data-chip]') ?? [])
        .find(button => button.dataset.chip === id);
      if (rail && chip) {
        const railRect = rail.getBoundingClientRect();
        const chipRect = chip.getBoundingClientRect();
        const left = Math.max(0, rail.scrollLeft + chipRect.left - railRect.left - (rail.clientWidth - chipRect.width) / 2);
        rail.scrollTo({ left, behavior: reduced ? 'instant' : 'smooth' });
      }
      categoryJumpTimer.current = window.setTimeout(() => { isCategoryJumping.current = false; }, reduced ? 100 : 1100);
    };
    // Cerrar primero el selector inferior y liberar el bloqueo de scroll.
    if (wasSheetOpen) window.requestAnimationFrame(() => window.requestAnimationFrame(scrollOnlyTheCorrectAxes));
    else scrollOnlyTheCorrectAxes();
  };
  const available = (p: B3Product) => p.available && minPrice(p) !== null;
  const mainButton = (product: B3Product, extraClass = '') => <button type="button" className={`b3-ci-add ${extraClass}`} disabled={!available(product)} onClick={() => onOpen(product)}>{available(product) ? 'Elegir y agregar' : 'No disponible'} <Plus size={19} strokeWidth={2.6}/></button>;

  return <div className={`b3-ci-shell ${largeText ? 'b3-ci-large-text' : ''} ${lightTheme ? 'b3-ci-light' : ''}`}>
    {purchaseOpen ? <CartaCompra cart={cart} total={total} data={data} delivery={delivery} demo={demo} setQty={setQty} setDelivery={setDelivery} onClose={()=>{setPurchaseOpen(false);window.scrollTo({top:0,behavior:'instant'});}}/> : <>
    <header className="b3-ci-header">
      <SiteLink className="b3-ci-brand" to={B3_CARTA_PILOT ? '/carta' : '/'} aria-label={B3_CARTA_PILOT ? 'Pollos B3, carta' : 'Ir al inicio de Pollos B3'}><img src="/brand/pollos-b3-logo.png" alt="Pollos B3"/></SiteLink>
      <div className="b3-ci-tools">
        <button aria-label={searchOpen ? 'Cerrar buscador' : 'Buscar plato'} aria-expanded={searchOpen} title="Buscar" onClick={() => setSearchOpen(open => !open)}><Search size={21}/></button>
        <button aria-label={largeText ? 'Usar texto normal' : 'Aumentar texto'} aria-pressed={largeText} title="Tamaño de letra" onClick={() => setLargeText(old => !old)}><Type size={23}/></button>
        <button aria-label={lightTheme ? 'Activar fondo oscuro' : 'Activar fondo claro'} aria-pressed={lightTheme} title="Alternar apariencia" onClick={() => setLightTheme(old => !old)}><Settings2 size={22}/></button>
        <button className="b3-ci-cart" aria-label={`Abrir carrito, ${cartCount} productos`} onClick={openPurchase}><ShoppingBag size={21}/>{cartCount > 0 && <span>{cartCount}</span>}</button>
      </div>
    </header>
    <AnimatePresence initial={false}>{searchOpen && <motion.div className="b3-ci-search-bar" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><Search size={20}/><input ref={searchInput} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar en la carta de Pollos B3" aria-label="Buscar en la carta"/>{query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery('')}><X size={18}/></button>}</motion.div>}</AnimatePresence>

    <div className="b3-ci-content">
      {demo && <p className="b3-ci-design-notice">VISTA DE DISEÑO · PRODUCTOS, FOTOS Y PRECIOS REFERENCIALES. SIN PEDIDOS REALES.</p>}
      {!query && <>
        <div className="b3-ci-introduction"><span>CARTA DE HOY</span><strong>· Pollos B3</strong><small>Santa Anita, Lima</small></div>
        {B3_CARTA_PILOT && <a className="b3-ci-video-shortcut" href="#b3-video-giro"><Clapperboard size={17} aria-hidden="true"/> VER EL PLATO EN MOVIMIENTO <span aria-hidden="true">↓</span></a>}
        {lead && <section className="b3-ci-lead" aria-labelledby="b3-ci-lead-title">
          <p className="b3-ci-pretitle">ELIGE A TU MANERA</p>
          <h1 id="b3-ci-lead-title">{lead.name}</h1>
          <p className="b3-ci-lead-description">{lead.description}</p>
          <FlipDishPhoto product={lead} kind="lead" priority/>
          <div className="b3-ci-lead-actions"><button className="b3-ci-primary" onClick={() => onOpen(lead)} disabled={!available(lead)}>Elegir · {minPrice(lead) === null ? 'Consultar' : soles(minPrice(lead)!)} <Plus size={18}/></button><button className="b3-ci-secondary" onClick={() => onOpen(lead)}>Ver detalles</button></div>
        </section>}
        {B3_CARTA_PILOT && <VideoGiroDemo fallbackImage={lead?.imageUrl}/>}
        {discoveries.length > 0 && <section className="b3-ci-discoveries" aria-labelledby="b3-ci-discover-title">
          <div className="b3-ci-subheading"><h2 id="b3-ci-discover-title">Para descubrir</h2><span>Desliza para explorar <ChevronDown size={14}/></span></div>
          <div className="b3-ci-reel">{discoveries.map(p => <article className="b3-ci-reel-card" key={p.id}>
            <FlipDishPhoto product={p} kind="reel"/>
            <h3>{p.name}</h3><button className="b3-ci-reel-add" onClick={() => onOpen(p)}>Elegir +</button>
          </article>)}</div>
        </section>}
      </>}

      <section className="b3-ci-catalog" aria-labelledby="b3-ci-catalog-title">
        <div className="b3-ci-catalog-heading"><h2 id="b3-ci-catalog-title">La carta <span aria-hidden="true">↓</span></h2><span>{productCount} {productCount === 1 ? 'producto' : 'productos'}</span></div>
        {error && <p className="b3-ci-error" role="alert">No se pudo actualizar la carta: {error}</p>}
        <div className="b3-ci-sticky-categories">
          <div className="b3-ci-chips" ref={chipRail}>{categoryEntries.map(cat => <button key={cat.id} data-chip={cat.id} aria-current={activeCategory === cat.id ? 'true' : undefined} onClick={() => moveTo(cat.id)} className={activeCategory === cat.id ? 'is-selected' : ''}>{cat.name}</button>)}</div>
          <button type="button" className="b3-ci-all-categories" aria-label="Abrir todas las categorías" aria-expanded={categorySheet} onClick={() => setCategorySheet(true)}><List size={24}/></button>
        </div>
        {!matching.length && <div className="b3-ci-empty"><strong>La carta estará disponible aquí.</strong><p>{query ? 'No encontramos productos con esa búsqueda. Prueba con otro nombre.' : 'Los productos oficiales aparecerán cuando se conecte el administrador de Pollos B3.'}</p>{query && <button onClick={() => setQuery('')}>Mostrar toda la carta</button>}</div>}
        {categoryEntries.filter(cat => cat.products.length > 0).map(cat => <section id={`b3-ci-cat-${cat.id}`} data-b3-ci-category={cat.id} className="b3-ci-category-section" key={cat.id}>
          <div className="b3-ci-section-heading"><h3>{cat.name}</h3><span>{cat.products.length} {cat.products.length === 1 ? 'producto' : 'productos'}</span></div>
          {cat.products.map(product => <article className="b3-ci-dish" key={product.id}>
            <FlipDishPhoto product={product}/>
            <div className="b3-ci-dish-copy"><span className="b3-ci-dish-category">{cat.name}</span><h4>{product.name}</h4><p>{product.description}</p><strong>{minPrice(product) === null ? 'Precio por confirmar' : soles(minPrice(product)!)}</strong>{mainButton(product)}</div>
          </article>)}
        </section>)}
        {remaining.length > 0 && <section id="b3-ci-cat-otros" data-b3-ci-category="otros" className="b3-ci-category-section"><div className="b3-ci-section-heading"><h3>Otros productos</h3><span>{remaining.length} productos</span></div>{remaining.map(product => <article className="b3-ci-dish" key={product.id}><FlipDishPhoto product={product}/><div className="b3-ci-dish-copy"><h4>{product.name}</h4><p>{product.description}</p><strong>{minPrice(product) === null ? 'Precio por confirmar' : soles(minPrice(product)!)}</strong>{mainButton(product)}</div></article>)}</section>}
      </section>
      <footer className="b3-ci-endnote"><img src="/brand/pollos-b3-logo.png" alt=""/><span>POLLOS B3 · SANTA ANITA</span>{!B3_CARTA_PILOT && <><p>Vuelve al inicio para explorar la experiencia completa.</p><SiteLink to="/">Ir a Inicio <ArrowLeft size={16}/></SiteLink></>}</footer>
    </div>
    {cartCount>0&&!categorySheet&&<button type="button" className="b3-ci-buybar" onClick={openPurchase} aria-label={"Ver mi pedido, "+cartCount+" productos"}><span><b>{cartCount}</b> Ver mi pedido</span><strong>{soles(total)} <span aria-hidden="true">→</span></strong></button>}
    <AnimatePresence>{showTop && !categorySheet && <motion.button type="button" className="b3-ci-top" aria-label="Volver arriba" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}} onClick={() => window.scrollTo({top:0,behavior:reduced?'auto':'smooth'})}><ArrowUp size={16}/> Arriba</motion.button>}</AnimatePresence>
    <AnimatePresence>{categorySheet && <motion.div className="b3-ci-sheet-layer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <button className="b3-ci-sheet-backdrop" aria-label="Cerrar categorías" onClick={() => setCategorySheet(false)}/>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="b3-ci-sheet-title" className="b3-ci-sheet" initial={reduced?false:{y:'100%'}} animate={{y:0}} exit={reduced?undefined:{y:'100%'}} transition={{duration:reduced?0:.32,ease:[.22,1,.36,1]}}>
        <div className="b3-ci-sheet-handle"/><div className="b3-ci-sheet-header"><h2 id="b3-ci-sheet-title">Categorías</h2><button aria-label="Cerrar" onClick={() => setCategorySheet(false)}><X size={21}/></button></div>
        {categoryEntries.map(cat => <button key={cat.id} type="button" className="b3-ci-sheet-category" onClick={() => moveTo(cat.id)}><span><strong>{cat.name}</strong>{cat.id === activeCategory && <small><Check size={14}/> Estás aquí</small>}</span><span>{cat.products.length} {cat.products.length === 1 ? 'producto' : 'productos'}</span></button>)}
        {remaining.length > 0 && <button className="b3-ci-sheet-category" onClick={() => moveTo('otros')}><strong>Otros productos</strong><span>{remaining.length} productos</span></button>}
      </motion.section>
    </motion.div>}</AnimatePresence>
    </>}
  </div>;
}