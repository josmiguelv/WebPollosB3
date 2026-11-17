import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, CircleHelp, ClipboardList, CreditCard, Flame, Heart, MapPin, MessageCircle, Minus, Navigation, PackageCheck, Plus, ShieldCheck, ShoppingBag, Store, Truck, UserRound, X } from 'lucide-react';
import type { B3Catalog } from '@/lib/storefront/catalog';
import { soles } from '@/lib/storefront/catalog';
import { SiteLink } from '@/lib/navigation';
import type { CartItem, Delivery } from './Home';
import './commercial.css';

type SectionProps = { eyebrow: string; heading: string; highlight?: string; description: string; children?: ReactNode };
export function CommercialHero({ eyebrow, heading, highlight, description, children }: SectionProps) {
  return <section className="commercial-hero layout-gutter">
    <div className="commercial-hero-grid">
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
        <span className="commercial-overline"><span/> {eyebrow}</span>
        <h1>{heading}{highlight && <><br/><em>{highlight}</em></>}</h1>
        <p>{description}</p>{children && <div className="commercial-hero-actions">{children}</div>}
      </motion.div>
      <div className="commercial-hero-symbol" aria-hidden="true"><span className="commercial-circle-outline"/><span className="commercial-circle-text">B3</span><span className="commercial-circle-caption">POLLOS B3 · SANTA ANITA</span></div>
    </div>
  </section>;
}

export function FeaturedIntro({ onOpen, products }: { onOpen: (id:string)=>void; products: B3Catalog['products'] }) {
  const available = products.filter(p=>p.available).slice(0,3);
  return <section className="commercial-featured layout-gutter">
    <div className="commercial-section-heading"><div><span className="commercial-kicker">02 / ELIGE TU MOMENTO</span><h2>El antojo<br/><em>empieza aquí.</em></h2></div><SiteLink className="commercial-text-link" to="/carta">DESCUBRIR TODA LA CARTA <ArrowUpRight size={19}/></SiteLink></div>
    {available.length > 0 ? <div className="commercial-featured-grid">{available.map((product,i) => <button type="button" className="commercial-featured-card" onClick={()=>onOpen(product.id)} key={product.id}><span className="commercial-card-label">0{i+1} / POLLOS B3</span><motion.div layoutId={`b3-image-${product.id}`} transition={{type:'tween',duration:.48}} className="commercial-featured-media"><><span className="commercial-illustration" aria-hidden="true">B3<span className="commercial-card-orbit"/></span>{product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" onError={e=>{e.currentTarget.style.display='none';}}/>}{product.id.startsWith('demo-') && <span className="commercial-photo-disclaimer">IMAGEN REFERENCIAL</span>}</></motion.div><span className="commercial-card-bottom"><b>{product.name}</b><strong>{product.variants.some(v=>v.available!==false) ? `DESDE ${soles(Math.min(...product.variants.filter(v=>v.available!==false).map(v=>v.price)))}` : 'CONSULTAR DISPONIBILIDAD'}</strong><ArrowUpRight size={21}/></span></button>)}</div> : <div className="commercial-empty-panel"><div><span className="commercial-kicker">EXPLORA LA EXPERIENCIA</span><h3>Una carta con personalidad.</h3><p>Muy pronto podrás descubrir los platos oficiales aquí, con precios y disponibilidad actualizados desde el administrador de Pollos B3.</p><SiteLink className="commercial-button commercial-button--dark" to="/carta">EXPLORAR LA CARTA <ArrowRight size={18}/></SiteLink></div><div className="commercial-empty-monogram" aria-hidden="true">B3</div></div>}
  </section>;
}

export function HomePathways({ onChat }: { onChat:()=>void }) {
  return <section className="commercial-pathways layout-gutter"><div className="commercial-section-heading"><div><span className="commercial-kicker">04 / A TU MANERA</span><h2>Tu pedido.<br/><em>Tu momento.</em></h2></div><p>Elige cómo quieres disfrutar Pollos B3, sin complicaciones.</p></div>
    <div className="commercial-pathway-grid">
      <SiteLink to="/combos" className="commercial-pathway commercial-pathway--dark"><span>01 / PERSONALIZA</span><div><h3>Arma tu<br/>combo.</h3><p>Tres decisiones, una experiencia interactiva.</p></div><ArrowUpRight size={27}/></SiteLink>
      <SiteLink to="/locales" className="commercial-pathway commercial-pathway--red"><span>02 / DONDE ESTÉS</span><div><h3>Encuentra<br/>tu local.</h3><p>Consulta los puntos disponibles y elige recojo o delivery.</p></div><ArrowUpRight size={27}/></SiteLink>
      <button onClick={onChat} className="commercial-pathway commercial-pathway--light"><span>03 / CONTÁCTANOS</span><div><h3>Hablemos<br/>por aquí.</h3><p>Atención desde el chat web de Pollos B3.</p></div><MessageCircle size={27}/></button>
    </div>
  </section>;
}

export function CartPage({cart,total,setQty,onCheckout, demo}:{cart:CartItem[];total:number;setQty:(key:string,qty:number)=>void;onCheckout:()=>void;demo:boolean}) {
  const count=cart.reduce((sum,item)=>sum+item.qty,0);
  return <><CommercialHero eyebrow="TU PEDIDO / CARRITO" heading="A tu gusto." highlight="A tu ritmo." description="Revisa lo que elegiste, ajusta cantidades y continúa cuando lo tengas listo."><SiteLink className="commercial-button commercial-button--light" to="/carta">SEGUIR EXPLORANDO <ArrowUpRight size={17}/></SiteLink></CommercialHero>
  <section className="commercial-cart-layout layout-gutter">
    <div className="commercial-cart-main"><div className="commercial-panel-heading"><span className="commercial-kicker">TU SELECCIÓN</span><strong>{count} {count===1?'PRODUCTO':'PRODUCTOS'}</strong></div>
    {cart.length===0 ? <div className="commercial-cart-empty"><ShoppingBag size={54} strokeWidth={1}/><h2>Tu próximo antojo<br/>empieza aquí.</h2><p>Explora la carta interactiva y descubre qué se te provoca.</p><SiteLink to="/carta" className="commercial-button commercial-button--red">VER LA CARTA <ArrowRight size={18}/></SiteLink></div> : <div className="commercial-order-lines">{cart.map(item=><article className="commercial-order-line" key={item.key}><span className="commercial-order-monogram">B3</span><div><h3>{item.name}</h3><p>{item.variant}</p>{item.extras.length>0&&<small>{item.extras.join(' · ')}</small>}<div className="commercial-quantity"><button onClick={()=>setQty(item.key,item.qty-1)} aria-label={`Quitar unidad de ${item.name}`}><Minus size={15}/></button><b>{item.qty}</b><button onClick={()=>setQty(item.key,item.qty+1)} aria-label={`Añadir unidad de ${item.name}`}><Plus size={15}/></button></div></div><strong>{soles(item.qty*item.unit)}</strong></article>)}</div>}
    </div>
    <aside className="commercial-checkout-card"><span className="commercial-kicker">RESUMEN DEL PEDIDO</span><div className="commercial-summary-row"><span>Subtotal</span><strong>{soles(total)}</strong></div><div className="commercial-summary-row muted"><span>Delivery</span><span>Por calcular</span></div><div className="commercial-summary-total"><span>Total parcial</span><strong>{soles(total)}</strong></div><p>Los precios, disponibilidad y costo de envío deben validarse desde el administrador antes de confirmar una compra.</p>{demo&&<p className="commercial-demo-note">Los importes actuales son de demostración, no representan precios oficiales.</p>}<button className="commercial-button commercial-button--red full" disabled={!cart.length} onClick={onCheckout}>CONTINUAR <ArrowRight size={18}/></button></aside>
  </section></>;
}

export function CheckoutPage({ cart,total,delivery,data,onChooseLocation,demo }:{cart:CartItem[];total:number;delivery:Delivery;data:B3Catalog|null;onChooseLocation:()=>void;demo:boolean}) {
  const [customer,setCustomer]=useState({name:'',phone:'',email:'',note:''});
  const pickupStore=data?.stores.find(s=>s.id===delivery.storeId);
  const isDelivery=delivery.mode==='delivery';
  return <><CommercialHero eyebrow="FINALIZAR PEDIDO" heading="Un paso más." highlight="Sin apuros." description="El pedido se confirmará cuando la administración central valide productos, cobertura y pago."/>
  <section className="commercial-checkout-layout layout-gutter"><div className="commercial-checkout-form">
    <div className="commercial-step"><span>01</span><div><h2>Entrega o recojo</h2><p>Selecciona la modalidad para continuar.</p></div></div>
    <button className="commercial-location-choice" onClick={onChooseLocation}><span>{isDelivery?<Truck size={24}/>:<Store size={24}/>}</span><span><b>{isDelivery?'Delivery':'Recojo en tienda'}</b><small>{isDelivery?(delivery.address||'Elige una dirección de entrega'):(pickupStore?.name||'Selecciona tu local de recojo')}</small></span><ArrowRight size={19}/></button>
    <div className="commercial-step"><span>02</span><div><h2>Datos de contacto</h2><p>Completa tus datos para preparar la solicitud. No se enviarán mientras la integración esté pendiente.</p></div></div>
    <form className="commercial-guest-form" onSubmit={e=>e.preventDefault()}><label>Nombre y apellido<input autoComplete="name" value={customer.name} onChange={e=>setCustomer(v=>({...v,name:e.target.value}))} placeholder="Tu nombre"/></label><label>Celular<input inputMode="tel" autoComplete="tel" value={customer.phone} onChange={e=>setCustomer(v=>({...v,phone:e.target.value}))} placeholder="Número de contacto"/></label><label>Correo (opcional)<input type="email" autoComplete="email" value={customer.email} onChange={e=>setCustomer(v=>({...v,email:e.target.value}))} placeholder="tu@correo.com"/></label><label className="wide">Observaciones (opcional)<textarea rows={3} value={customer.note} onChange={e=>setCustomer(v=>({...v,note:e.target.value}))} placeholder="Detalles adicionales para tu pedido"/></label></form>
    <div className="commercial-step"><span>03</span><div><h2>Pago y confirmación</h2><p>Se habilitarán los métodos reales después de integrar el backend de pedidos y pagos.</p></div></div>
    <div className="commercial-payment-hold"><ShieldCheck size={25}/><div><strong>Confirmación aún no habilitada</strong><p>Esta versión no recibe pagos ni genera pedidos. La app y la web utilizarán las mismas reglas verificadas en el administrador.</p></div></div>
  </div><aside className="commercial-checkout-card"><span className="commercial-kicker">TU RESUMEN</span>{cart.map(item=><div className="commercial-summary-row" key={item.key}><span>{item.qty} × {item.name}</span><strong>{soles(item.qty*item.unit)}</strong></div>)}<div className="commercial-summary-row muted"><span>Envío</span><span>Por validar</span></div><div className="commercial-summary-total"><span>Subtotal</span><strong>{soles(total)}</strong></div>{demo&&<p className="commercial-demo-note">Carrito de prueba. No se cobrará ni se registrará un pedido.</p>}<button type="button" className="commercial-button commercial-button--red full" disabled>CONFIRMAR PEDIDO <ArrowRight size={18}/></button><p className="commercial-micro">Disponible después de validar el contrato del administrador y la pasarela de pagos.</p></aside></section></>;
}

export function OrdersPage({ onChat }: {onChat:()=>void}) {
  return <><CommercialHero eyebrow="TUS PEDIDOS" heading="Cada pedido," highlight="en su momento." description="Estamos preparando el seguimiento sincronizado con el mismo administrador que utiliza la aplicación móvil."/>
  <section className="commercial-two-column layout-gutter"><div className="commercial-editorial-block"><span className="commercial-kicker">SEGUIMIENTO INTELIGENTE</span><h2>Sigue tu pedido<br/>sin perder el hilo.</h2><p>El estado de cada compra se consultará directamente desde el sistema de pedidos de Pollos B3, sin mostrar movimientos simulados.</p><div className="commercial-status-preview"><span><ClipboardList size={19}/> Pedido recibido</span><i/><span><Flame size={19}/> En preparación</span><i/><span><Truck size={19}/> En despacho / listo para recojo</span><i/><span><PackageCheck size={19}/> Entregado</span></div></div><div className="commercial-side-note"><span className="commercial-kicker">PEDIDOS EN LÍNEA</span><h3>Todo en un solo lugar.</h3><p>Al conectar el administrador, aquí aparecerán tus compras y el seguimiento seguro por código de pedido.</p><SiteLink className="commercial-button commercial-button--red" to="/carrito">VER MI CARRITO <ArrowRight size={18}/></SiteLink><button className="commercial-text-link" onClick={onChat}>NECESITO AYUDA <MessageCircle size={17}/></button></div></section></>;
}

export function AccountPage({ onChat }: {onChat:()=>void}) {
  const blocks=[{title:'Mis direcciones',description:'Direcciones guardadas y preferencias de entrega.',icon:<MapPin size={25}/>},{title:'Mis favoritos',description:'Tus productos elegidos y pedido habitual.',icon:<Heart size={25}/>},{title:'Mis pedidos',description:'Historial de compras y seguimiento.',icon:<PackageCheck size={25}/>}];
  return <><CommercialHero eyebrow="MI CUENTA" heading="Todo lo tuyo." highlight="En un lugar." description="Una experiencia pensada para que regresar a Pollos B3 sea todavía más fácil."/>
  <section className="commercial-account layout-gutter"><div className="commercial-account-banner"><UserRound size={35} strokeWidth={1}/><div><h2>Tu espacio B3.</h2><p>La identificación y el historial estarán disponibles al conectar la autenticación del administrador central. No se crearán cuentas de prueba con datos reales.</p></div><span>PRÓXIMAMENTE</span></div><div className="commercial-account-grid">{blocks.map(block=><div className="commercial-account-tile" key={block.title}>{block.icon}<h3>{block.title}</h3><p>{block.description}</p></div>)}</div><button onClick={onChat} className="commercial-text-link">CONSULTAR ATENCIÓN <ArrowUpRight size={17}/></button></section></>;
}

export function PromotionsPage(){return <><CommercialHero eyebrow="NOVEDADES / PROMOCIONES" heading="Siempre hay algo" highlight="por descubrir." description="Aquí se mostrarán las campañas, novedades y promociones vigentes que Pollos B3 publique desde administración."/>
  <section className="commercial-two-column layout-gutter"><div className="commercial-editorial-block"><span className="commercial-kicker">SOLO INFORMACIÓN REAL</span><h2>Lo bueno se comparte.</h2><p>Las promociones aparecerán con productos, fechas y precios oficiales cuando estén configuradas y activas. Nada de descuentos ficticios.</p><SiteLink className="commercial-button commercial-button--dark" to="/carta">EXPLORAR CARTA <ArrowUpRight size={18}/></SiteLink></div><div className="commercial-type-panel">B3<span>DESCUBRE MÁS</span></div></section></>}

export function AboutPage(){return <><CommercialHero eyebrow="NOSOTROS / POLLOS B3" heading="Somos B3." highlight="Somos Santa Anita." description="La pollería más viral de Santa Anita. Una experiencia gastronómica que también puedes explorar desde nuestra web."/>
  <section className="commercial-two-column layout-gutter"><div className="commercial-editorial-block"><span className="commercial-kicker">IDENTIDAD B3</span><h2>Un estilo propio.<br/>En cada pantalla.</h2><p>Esta web forma parte de la experiencia digital de Pollos B3: carta interactiva, pedidos en línea y atención conectada a TU VERSO cuando los servicios estén habilitados.</p><SiteLink to="/carta" className="commercial-button commercial-button--red">CONOCE LA CARTA <ArrowRight size={18}/></SiteLink></div><div className="commercial-type-panel">B3<span>SANTA ANITA · PERÚ</span></div></section></>}

export function HelpPage({onChat}:{onChat:()=>void}) {return <><CommercialHero eyebrow="AYUDA / ATENCIÓN" heading="¿Necesitas" highlight="una mano?" description="Estamos preparando un espacio de atención conectado al canal WEB de TU VERSO, sin salir de la página de Pollos B3."/>
  <section className="commercial-two-column layout-gutter"><div className="commercial-editorial-block"><span className="commercial-kicker">ATENCIÓN WEB</span><h2>Una conversación,<br/>sin cambiar de app.</h2><p>Consulta por tus productos, tu compra o tus pedidos. Cuando el canal WEB esté operativo, la conversación llegará a la bandeja de TU VERSO.</p><button onClick={onChat} className="commercial-button commercial-button--red">ABRIR CHAT WEB <MessageCircle size={19}/></button></div><div className="commercial-side-note"><CircleHelp size={33}/><h3>Información antes de pedir</h3><p>Los horarios, locales, precios, disponibilidad y cobertura oficiales se consultarán desde el administrador compartido con la aplicación móvil.</p><SiteLink to="/locales" className="commercial-text-link">CONSULTAR LOCALES <ArrowRight size={17}/></SiteLink></div></section></>}

export function NotFoundPage(){return <section className="commercial-not-found layout-gutter"><span className="commercial-kicker">ERROR 404</span><h1>Nos fuimos<br/><em>por otra ruta.</em></h1><p>Esta página no está disponible.</p><SiteLink to="/" className="commercial-button commercial-button--red">VOLVER AL INICIO <ArrowLeft size={18}/></SiteLink></section>}
