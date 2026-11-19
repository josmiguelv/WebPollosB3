import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CreditCard, Minus, Plus, ShieldCheck, ShoppingBag, Store, Truck, X } from 'lucide-react';
import { soles } from '@/lib/storefront/catalog';
import type { B3Catalog } from '@/lib/storefront/catalog';
import type { CartItem, Delivery } from './Home';
import './carta-compra.css';

type Step = 'cart' | 'delivery' | 'contact' | 'payment';
const steps: Step[] = ['cart','delivery','contact','payment'];
type Props = {cart:CartItem[];total:number;data:B3Catalog|null;delivery:Delivery;demo:boolean;setQty:(key:string,qty:number)=>void;setDelivery:(delivery:Delivery)=>void;onClose:()=>void};
const labels: Record<Step,string> = {cart:'Mi pedido',delivery:'Entrega o recojo',contact:'Tus datos',payment:'Resumen y pago'};
export function CartaCompra({cart,total,data,delivery,demo,setQty,setDelivery,onClose}:Props) {
  const [step,setStep] = useState<Step>('cart');
  const [mode,setMode] = useState<'delivery'|'pickup'>(delivery.mode);
  const [address,setAddress] = useState(delivery.address);
  const [reference,setReference] = useState('');
  const [storeId,setStoreId] = useState(delivery.storeId);
  const [person,setPerson] = useState({name:'',phone:'',email:'',note:''});
  const [payment,setPayment] = useState('');
  const reduced = useReducedMotion();
  const index = steps.indexOf(step);
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  const stores = (data?.stores || []).filter(s=>s.available!==false && s.pickupEnabled!==false);
  const store = stores.find(s=>s.id===storeId);
  const validDestination = mode==='delivery' ? address.trim().length>=5 : !!store;
  const validContact = person.name.trim().length>=3 && /^[+]?[0-9 -]{8,16}$/.test(person.phone.trim()) && (!person.email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(person.email));
  const valid = step==='cart' ? count>0 : step==='delivery' ? validDestination : step==='contact' ? validContact : false;
  const next = () => {
    if(!valid || index>=3) return;
    if(step==='delivery') setDelivery({mode,address:mode==='delivery'?[address.trim(),reference.trim()].filter(Boolean).join(' · '):'',storeId:mode==='pickup'?storeId:''});
    setStep(steps[index+1]);
  };
  const back = () => { if(index===0) onClose(); else setStep(steps[index-1]); };
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[step]);
  return <section className="b3-ci-buyflow" aria-label="Compra dentro de Carta">
    <header className="b3-ci-buyflow-head">
      <button type="button" aria-label="Volver" onClick={back}><ArrowLeft size={22}/></button>
      <div><small>POLLOS B3 · TU PEDIDO</small><h1>{labels[step]}</h1></div>
      <button type="button" aria-label="Cerrar y regresar a Carta" onClick={onClose}><X size={21}/></button>
    </header>
    <div className="b3-ci-buyflow-progress" aria-label={'Paso '+(index+1)+' de 4'}>{steps.map((s,i)=><span key={s} className={i<=index?'active':''}/>)}</div>
    <div className="b3-ci-buyflow-main">
      <AnimatePresence mode="wait" initial={false}><motion.div key={step} initial={reduced?false:{opacity:0,x:14}} animate={{opacity:1,x:0}} exit={reduced?undefined:{opacity:0,x:-10}} transition={{duration:reduced?0:.18}}>
      {step==='cart'&&<>
        <p className="b3-ci-buyflow-note">{count?'Revisa tu pedido antes de continuar.':'Todavía no has elegido productos de la carta.'}</p>
        {cart.map(item=>{
          const photo=data?.products.find(p=>p.id===item.productId)?.imageUrl;
          return <article className="b3-ci-buyflow-item" key={item.key}>
            <div className="b3-ci-buyflow-thumb">{photo?<img src={photo} alt="" loading="lazy"/>:<span>B3</span>}</div>
            <div className="b3-ci-buyflow-item-text"><h2>{item.name}</h2><p>{item.variant}</p>{item.extras.length>0&&<small>{item.extras.join(' · ')}</small>}<strong>{soles(item.qty*item.unit)}</strong></div>
            <div className="b3-ci-buyflow-quantity"><button type="button" aria-label={'Quitar '+item.name} onClick={()=>setQty(item.key,item.qty-1)}><Minus size={15}/></button><b>{item.qty}</b><button type="button" aria-label={'Sumar '+item.name} onClick={()=>setQty(item.key,item.qty+1)}><Plus size={15}/></button></div>
          </article>;
        })}
        {!cart.length&&<div className="b3-ci-buyflow-empty"><ShoppingBag size={42}/><p>Descubre tu próximo antojo.</p><button onClick={onClose}>Volver a la carta <ArrowRight size={16}/></button></div>}
        {!!cart.length&&<button className="b3-ci-buyflow-clear" onClick={()=>cart.forEach(item=>setQty(item.key,0))}>Vaciar pedido</button>}
      </>}
      {step==='delivery'&&<>
        <p className="b3-ci-buyflow-note">Elige la modalidad. La sede, cobertura y tarifa se calcularán en el backend antes de aceptar pedidos reales.</p>
        <div className="b3-ci-buyflow-modes" role="group" aria-label="Modalidad">
          <button type="button" className={mode==='delivery'?'selected':''} aria-pressed={mode==='delivery'} onClick={()=>setMode('delivery')}><Truck size={24}/><b>Delivery</b><small>A tu dirección</small></button>
          <button type="button" className={mode==='pickup'?'selected':''} aria-pressed={mode==='pickup'} onClick={()=>setMode('pickup')}><Store size={24}/><b>Recojo</b><small>En el local</small></button>
        </div>
        {mode==='delivery'?<div className="b3-ci-buyflow-fields">
          <label>Dirección<input autoComplete="street-address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Calle, número y distrito"/></label>
          <label>Referencia (opcional)<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Piso, casa o referencia"/></label>
          <p>El costo del reparto y la cobertura todavía están pendientes de validación.</p>
        </div>:<div className="b3-ci-buyflow-fields">
          <label>Local de recojo<select value={storeId} onChange={e=>setStoreId(e.target.value)}><option value="">Selecciona un local</option>{stores.map(s=><option key={s.id} value={s.id}>{s.name} — {s.address}</option>)}</select></label>
          {!stores.length&&<p>Los locales oficiales aparecerán cuando se conecte el administrador.</p>}
        </div>}
      </>}
      {step==='contact'&&<>
        <p className="b3-ci-buyflow-note">Completa tus datos para revisar la experiencia de compra. Esta vista no envía información ni crea cuentas.</p>
        <div className="b3-ci-buyflow-fields">
          <label>Nombre y apellido<input autoComplete="name" value={person.name} onChange={e=>setPerson(v=>({...v,name:e.target.value}))} placeholder="Nombre completo"/></label>
          <label>Celular<input autoComplete="tel" inputMode="tel" value={person.phone} onChange={e=>setPerson(v=>({...v,phone:e.target.value}))} placeholder="Número de contacto"/></label>
          <label>Correo electrónico (opcional)<input type="email" autoComplete="email" value={person.email} onChange={e=>setPerson(v=>({...v,email:e.target.value}))} placeholder="correo@ejemplo.com"/></label>
          <label>Observaciones (opcional)<textarea rows={3} value={person.note} onChange={e=>setPerson(v=>({...v,note:e.target.value}))} placeholder="Indicaciones adicionales"/></label>
        </div>
      </>}
      {step==='payment'&&<>
        <p className="b3-ci-buyflow-note">Vista de revisión; la confirmación y los cobros todavía no están habilitados.</p>
        <div className="b3-ci-buyflow-summary"><h2>Tu selección</h2>
          {cart.map(item=><div key={item.key}><span>{item.qty} × {item.name}</span><b>{soles(item.qty*item.unit)}</b></div>)}
          <div><span>Modalidad</span><b>{mode==='delivery'?'Delivery':'Recojo'}</b></div>
          <div><span>Destino</span><b>{mode==='delivery'?address:store?.name||'No seleccionado'}</b></div>
          <div><span>Reparto</span><b>Por validar</b></div>
        </div>
        <h2 className="b3-ci-buyflow-method-title">Método de pago previsto</h2>
        <div className="b3-ci-buyflow-methods">{['Yape','Plin','Tarjeta','Pago al recibir'].map(m=><button key={m} type="button" aria-pressed={payment===m} className={payment===m?'selected':''} onClick={()=>setPayment(m)}><CreditCard size={18}/>{m}{payment===m&&<Check size={17}/>}</button>)}</div>
        <div className="b3-ci-buyflow-warning"><ShieldCheck size={23}/><div><b>Pedidos y pagos deshabilitados</b><p>No se confirmará ningún pedido hasta conectar el administrador compartido y validar productos, entrega y método de pago.</p></div></div>
      </>}
      </motion.div></AnimatePresence>
    </div>
    <footer className="b3-ci-buyflow-footer">
      <div><span>Subtotal estimado</span><strong>{soles(total)}</strong></div>
      {demo&&<small>Precios demostrativos, no oficiales.</small>}
      {step==='payment'?<button disabled type="button">Confirmar pedido <ShieldCheck size={18}/></button>:<button type="button" disabled={!valid} onClick={next}>{step==='cart'?'Continuar compra':step==='delivery'?'Continuar con mis datos':'Revisar y pagar'} <ArrowRight size={18}/></button>}
      <small>Entrega y disponibilidad sujetas a validación del administrador.</small>
    </footer>
  </section>;
}
