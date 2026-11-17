import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUp, Check, ChevronDown, List, Plus, Search, Settings2, ShoppingBag, Type, X } from 'lucide-react';
import type { B3Catalog, B3Product } from '@/lib/storefront/catalog';
import { soles } from '@/lib/storefront/catalog';
import { SiteLink } from '@/lib/navigation';
import './carta-inmersiva.css';

type Props = {
  data: B3Catalog | null;
  demo: boolean;
  error: string;
  onOpen: (product: B3Product) => void;
  onOpenCart: () => void;
  cartCount: number;
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

export function CartaInmersiva({ data, demo, error, onOpen, onOpenCart, cartCount, query, setQuery }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [showTop, setShowTop] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const chipRail = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const matching = useMemo(() => products.filter(product => `${product.name} ${product.description}`.toLocaleLowerCase('es-PE').includes(query.trim().toLocaleLowerCase('es-PE'))), [products, query]);
  const lead = products.find(p => p.featured && p.available && minPrice(p) !== null) ?? products.find(p => p.available && minPrice(p) !== null);
  const discoveries = products.filter(p => p.available && p.id !== lead?.id && minPrice(p) !== null).slice(0, 7);
  const categoryEntries = categories.map(category => ({ ...category, products: matching.filter(product => product.categoryId === category.id) }));
  const remaining = matching.filter(product => !categories.some(category => category.id === product.categoryId));
  const total = matching.length;

  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
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
      if (current) setActiveCategory((current.target as HTMLElement).dataset.b3CiCategory ?? '');
    }, { rootMargin: '-136px 0px -60% 0px', threshold: 0 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [data, query]);
  const moveTo = (id: string) => {
    setCategorySheet(false);
    setActiveCategory(id);
    document.getElementById(`b3-ci-cat-${id}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    chipRail.current?.querySelector<HTMLElement>(`[data-chip="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  };
  const available = (p: B3Product) => p.available && minPrice(p) !== null;
  const mainButton = (product: B3Product, extraClass = '') => <button type="button" className={`b3-ci-add ${extraClass}`} disabled={!available(product)} onClick={() => onOpen(product)}>{available(product) ? 'Elegir y agregar' : 'No disponible'} <Plus size={19} strokeWidth={2.6}/></button>;

  return <div className={`b3-ci-shell ${largeText ? 'b3-ci-large-text' : ''} ${lightTheme ? 'b3-ci-light' : ''}`}>
    <header className="b3-ci-header">
      <SiteLink className="b3-ci-brand" to="/" aria-label="Ir al inicio de Pollos B3"><img src="/brand/pollos-b3-logo.png" alt="Pollos B3"/><span>Pollos B3</span></SiteLink>
      <div className="b3-ci-tools">
        <button aria-label={searchOpen ? 'Cerrar buscador' : 'Buscar plato'} aria-expanded={searchOpen} title="Buscar" onClick={() => setSearchOpen(open => !open)}><Search size={21}/></button>
        <button aria-label={largeText ? 'Usar texto normal' : 'Aumentar texto'} aria-pressed={largeText} title="Tamaño de letra" onClick={() => setLargeText(old => !old)}><Type size={23}/></button>
        <button aria-label={lightTheme ? 'Activar fondo oscuro' : 'Activar fondo claro'} aria-pressed={lightTheme} title="Alternar apariencia" onClick={() => setLightTheme(old => !old)}><Settings2 size={22}/></button>
        <button className="b3-ci-cart" aria-label={`Abrir carrito, ${cartCount} productos`} onClick={onOpenCart}><ShoppingBag size={21}/>{cartCount > 0 && <span>{cartCount}</span>}</button>
      </div>
    </header>
    <AnimatePresence initial={false}>{searchOpen && <motion.div className="b3-ci-search-bar" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><Search size={20}/><input ref={searchInput} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar en la carta de Pollos B3" aria-label="Buscar en la carta"/>{query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery('')}><X size={18}/></button>}</motion.div>}</AnimatePresence>

    <div className="b3-ci-content">
      {demo && <p className="b3-ci-design-notice">VISTA DE DISEÑO · PRODUCTOS, FOTOS Y PRECIOS REFERENCIALES. SIN PEDIDOS REALES.</p>}
      {!query && <>
        <div className="b3-ci-introduction"><span>CARTA DE HOY</span><strong>· Pollos B3</strong><small>Santa Anita, Lima</small></div>
        {lead && <section className="b3-ci-lead" aria-labelledby="b3-ci-lead-title">
          <p className="b3-ci-pretitle">ELIGE A TU MANERA</p>
          <h1 id="b3-ci-lead-title">{lead.name}</h1>
          <p className="b3-ci-lead-description">{lead.description}</p>
          <motion.button type="button" className="b3-ci-lead-photo-button" onClick={() => onOpen(lead)} aria-label={`Ver detalles de ${lead.name}`}>
            <div className="b3-ci-lead-photo"><DishPhoto product={lead} priority label/><span className="b3-ci-price-pill">{minPrice(lead) === null ? 'CONSULTAR' : `DESDE ${soles(minPrice(lead)!)}`}</span></div>
          </motion.button>
          <div className="b3-ci-lead-actions"><button className="b3-ci-primary" onClick={() => onOpen(lead)} disabled={!available(lead)}>Elegir · {minPrice(lead) === null ? 'Consultar' : soles(minPrice(lead)!)} <Plus size={18}/></button><button className="b3-ci-secondary" onClick={() => onOpen(lead)}>Ver detalles</button></div>
        </section>}
        {discoveries.length > 0 && <section className="b3-ci-discoveries" aria-labelledby="b3-ci-discover-title">
          <div className="b3-ci-subheading"><h2 id="b3-ci-discover-title">Para descubrir</h2><span>Desliza para explorar <ChevronDown size={14}/></span></div>
          <div className="b3-ci-reel">{discoveries.map(p => <article className="b3-ci-reel-card" key={p.id}>
            <button className="b3-ci-reel-photo" onClick={() => onOpen(p)} aria-label={`Ver ${p.name}`}><DishPhoto product={p} label/><span className="b3-ci-small-price">{minPrice(p) === null ? 'Consultar' : soles(minPrice(p)!)}</span></button>
            <h3>{p.name}</h3><button className="b3-ci-reel-add" onClick={() => onOpen(p)}>Elegir +</button>
          </article>)}</div>
        </section>}
      </>}

      <section className="b3-ci-catalog" aria-labelledby="b3-ci-catalog-title">
        <div className="b3-ci-catalog-heading"><h2 id="b3-ci-catalog-title">La carta <span aria-hidden="true">↓</span></h2><span>{total} {total === 1 ? 'producto' : 'productos'}</span></div>
        {error && <p className="b3-ci-error" role="alert">No se pudo actualizar la carta: {error}</p>}
        <div className="b3-ci-sticky-categories">
          <div className="b3-ci-chips" ref={chipRail}>{categoryEntries.map(cat => <button key={cat.id} data-chip={cat.id} aria-current={activeCategory === cat.id ? 'true' : undefined} onClick={() => moveTo(cat.id)} className={activeCategory === cat.id ? 'is-selected' : ''}>{cat.name}</button>)}</div>
          <button type="button" className="b3-ci-all-categories" aria-label="Abrir todas las categorías" aria-expanded={categorySheet} onClick={() => setCategorySheet(true)}><List size={24}/></button>
        </div>
        {!matching.length && <div className="b3-ci-empty"><strong>La carta estará disponible aquí.</strong><p>{query ? 'No encontramos productos con esa búsqueda. Prueba con otro nombre.' : 'Los productos oficiales aparecerán cuando se conecte el administrador de Pollos B3.'}</p>{query && <button onClick={() => setQuery('')}>Mostrar toda la carta</button>}</div>}
        {categoryEntries.filter(cat => cat.products.length > 0).map(cat => <section id={`b3-ci-cat-${cat.id}`} data-b3-ci-category={cat.id} className="b3-ci-category-section" key={cat.id}>
          <div className="b3-ci-section-heading"><h3>{cat.name}</h3><span>{cat.products.length} {cat.products.length === 1 ? 'producto' : 'productos'}</span></div>
          {cat.products.map(product => <article className="b3-ci-dish" key={product.id}>
            <motion.button type="button" className="b3-ci-dish-photo" data-product-id={product.id} layoutId={`b3-image-${product.id}`} transition={{type:'tween',duration:.48}} onClick={() => onOpen(product)} aria-label={`Ver ${product.name}`}><DishPhoto product={product} label/></motion.button>
            <div className="b3-ci-dish-copy"><span className="b3-ci-dish-category">{cat.name}</span><h4>{product.name}</h4><p>{product.description}</p><strong>{minPrice(product) === null ? 'Precio por confirmar' : soles(minPrice(product)!)}</strong>{mainButton(product)}</div>
          </article>)}
        </section>)}
        {remaining.length > 0 && <section id="b3-ci-cat-otros" data-b3-ci-category="otros" className="b3-ci-category-section"><div className="b3-ci-section-heading"><h3>Otros productos</h3><span>{remaining.length} productos</span></div>{remaining.map(product => <article className="b3-ci-dish" key={product.id}><motion.button type="button" className="b3-ci-dish-photo" data-product-id={product.id} layoutId={`b3-image-${product.id}`} transition={{type:'tween',duration:.48}} onClick={() => onOpen(product)}><DishPhoto product={product} label/></motion.button><div className="b3-ci-dish-copy"><h4>{product.name}</h4><p>{product.description}</p><strong>{minPrice(product) === null ? 'Precio por confirmar' : soles(minPrice(product)!)}</strong>{mainButton(product)}</div></article>)}</section>}
      </section>
      <footer className="b3-ci-endnote"><img src="/brand/pollos-b3-logo.png" alt=""/><span>POLLOS B3 · SANTA ANITA</span><p>Vuelve al inicio para explorar la experiencia completa.</p><SiteLink to="/">Ir a Inicio <ArrowLeft size={16}/></SiteLink></footer>
    </div>
    <AnimatePresence>{showTop && !categorySheet && <motion.button type="button" className="b3-ci-top" aria-label="Volver arriba" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}} onClick={() => window.scrollTo({top:0,behavior:reduced?'auto':'smooth'})}><ArrowUp size={16}/> Arriba</motion.button>}</AnimatePresence>
    <AnimatePresence>{categorySheet && <motion.div className="b3-ci-sheet-layer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <button className="b3-ci-sheet-backdrop" aria-label="Cerrar categorías" onClick={() => setCategorySheet(false)}/>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="b3-ci-sheet-title" className="b3-ci-sheet" initial={reduced?false:{y:'100%'}} animate={{y:0}} exit={reduced?undefined:{y:'100%'}} transition={{duration:reduced?0:.32,ease:[.22,1,.36,1]}}>
        <div className="b3-ci-sheet-handle"/><div className="b3-ci-sheet-header"><h2 id="b3-ci-sheet-title">Categorías</h2><button aria-label="Cerrar" onClick={() => setCategorySheet(false)}><X size={21}/></button></div>
        {categoryEntries.map(cat => <button key={cat.id} type="button" className="b3-ci-sheet-category" onClick={() => moveTo(cat.id)}><span><strong>{cat.name}</strong>{cat.id === activeCategory && <small><Check size={14}/> Estás aquí</small>}</span><span>{cat.products.length} {cat.products.length === 1 ? 'producto' : 'productos'}</span></button>)}
        {remaining.length > 0 && <button className="b3-ci-sheet-category" onClick={() => moveTo('otros')}><strong>Otros productos</strong><span>{remaining.length} productos</span></button>}
      </motion.section>
    </motion.div>}</AnimatePresence>
  </div>;
}