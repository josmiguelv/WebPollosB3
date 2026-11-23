import type {B3Catalog} from './catalog';
import type {CartItem} from '@/pages/Home';
import {POLLOS_B3_APP_ID} from './mobile-config-adapter';
import {getWebOrderClient, quotePickup, type DeliveryQuoteResponse, type InteractionEntry} from './web-order-transport';

/** Business rules from Android's latest validated order-availability client.
 * Preview products never become real orders; payment is always separate. */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type WebOrderResult = {state:'WAITING_APPROVAL'|'READY_FOR_REVIEW';quote:DeliveryQuoteResponse;interaction?:InteractionEntry};
export type WebOrderInput = {
  data:B3Catalog;cart:CartItem[];mode:'delivery'|'pickup';
  storeId:string;address:string;district:string;reference:string;
  customerName:string;customerPhone:string;
};
export function splitCustomerName(value:string) {
  const parts=value.trim().replace(/\s+/g,' ').split(' ');
  const firstName=parts.shift()??'', lastName=parts.join(' ');
  if(firstName.length<2||lastName.length<2||firstName.length>60||lastName.length>60)
    throw Error('Ingresa tus nombres y apellidos completos.');
  return {firstName,lastName};
}
export function validatePublishedCart(data:B3Catalog,cart:CartItem[]) {
  if(!Number.isSafeInteger(data.revision)||(data.revision??0)<1)
    throw Error('El catálogo del Administrador no está publicado o no pudo actualizarse.');
  if(!cart.length||cart.length>50)throw Error('Selecciona de 1 a 50 productos publicados.');
  const ids=new Set<string>();
  let subtotalCents=0;
  const items=cart.map(item=>{
    if(!UUID.test(item.productId)||!Number.isInteger(item.qty)||item.qty<1||item.qty>99)
      throw Error('Retira productos de demostración o cantidades incorrectas antes de validar.');
    if(ids.has(item.productId))throw Error('No se admiten presentaciones duplicadas de un producto publicado.');
    ids.add(item.productId);
    const product=data.products.find(p=>p.id===item.productId&&p.available!==false);
    if(!product||product.id.startsWith('demo-'))throw Error('Uno de los productos ya no está publicado.');
    if(item.extras.length)throw Error('Los extras seleccionados todavía no están publicados por la API.');
    const cost=product.variants[0]?.price,cents=Math.round(Number(cost)*100);
    if(!Number.isSafeInteger(cents)||cents<0||Math.abs(item.unit-Number(cost))>.01)
      throw Error('El precio publicado cambió. Revisa el carrito.');
    const line=cents*item.qty;subtotalCents+=line;
    if(!Number.isSafeInteger(subtotalCents))throw Error('El subtotal excede el límite del pedido.');
    return {productId:item.productId,quantity:item.qty,name:product.name,line};
  });
  return {items,subtotal:subtotalCents/100,revision:data.revision!};
}
export function buildOrderApprovalForm(
  items:ReturnType<typeof validatePublishedCart>['items'],subtotal:number,
  address:string,district:string,reference:string,
) {
  const value=items.map(i=>i.quantity+' x '+i.name+' — S/ '+(i.line/100).toFixed(2)).join('\n');
  const destination=address+', '+district+(reference?' — '+reference:'');
  const fields=[
    {variable:'Productos',value},
    {variable:'Subtotal',value:'S/ '+subtotal.toFixed(2)},
    {variable:'Dirección y referencia',value:destination},
  ];
  if(value.length>500||destination.length>500||
    fields.some(f=>!f.value.trim()||/[\x00-\x09\x0b-\x1f]/.test(f.value)))
    throw Error('La descripción del pedido supera los límites del formulario (500 caracteres por campo).');
  return {title:'VALIDACIÓN DE PEDIDO',subtitle:'Confirmar disponibilidad para delivery',fields};
}
export async function requestPublishedOrder(input:WebOrderInput):Promise<WebOrderResult> {
  const {items,subtotal,revision}=validatePublishedCart(input.data,input.cart);
  const name=splitCustomerName(input.customerName);
  const phone=input.customerPhone.trim();
  if(!/^9\d{8}$/.test(phone))throw Error('El celular debe tener 9 dígitos y empezar con 9.');
  if(input.mode==='pickup'){
    if(!UUID.test(input.storeId))throw Error('Selecciona un local publicado.');
    const store=input.data.stores.find(s=>s.id===input.storeId&&s.available!==false&&s.pickupEnabled!==false&&s.open!==false);
    if(!store)throw Error('La sede elegida no está disponible para recojo.');
    const quote=await quotePickup({appId:POLLOS_B3_APP_ID,storeId:store.id});
    if(quote.revision!==revision)throw Error('La revisión del catálogo cambió. Actualiza tu pedido.');
    return {state:'READY_FOR_REVIEW',quote};
  }
  const address=input.address.trim(),district=input.district.trim(),reference=input.reference.trim();
  if(address.length<6||address.length>180||district.length<2||district.length>80||reference.length>180)
    throw Error('Completa dirección, distrito y referencia de entrega.');
  const api=await getWebOrderClient();
  const quote=await api.quoteDelivery({appId:POLLOS_B3_APP_ID,address,district,useGps:false});
  if(quote.revision!==revision)throw Error('El Administrador publicó una carta nueva. Actualiza tu carrito.');
  const store=input.data.stores.find(s=>s.id===quote.storeId&&s.available!==false&&s.deliveryEnabled!==false&&s.open!==false);
  if(!store)throw Error('No hay una sede publicada y abierta que cubra la dirección indicada.');
  if(store.consultOrderAvailability!==true)return {state:'READY_FOR_REVIEW',quote};
  const availability=await api.checkAgentAvailability({appId:POLLOS_B3_APP_ID,storeId:store.id});
  if(!availability.available)throw Error('No hay un asesor disponible para confirmar el pedido por Delivery.');
  const form=buildOrderApprovalForm(items,subtotal,address,district,reference);
  const entry=api.prepareInteraction({
    appId:POLLOS_B3_APP_ID,storeId:store.id,catalogRevision:revision,
    items:items.map(({productId,quantity})=>({productId,quantity})),
    address,district,
    customer:{...name,phone,address,district,reference,mode:'delivery'},
    orderForm:form,
  });
  // Two idempotency keys; if the FORM is uncertain, Android's engine forbids a blind resend.
  await api.createInteraction(entry);
  if(entry.messageDelivered!==true)await api.sendInteractionMessage(entry);
  if(entry.messageDelivered!==true)throw Error('Aún no se confirmó la entrega del formulario.');
  return {state:'WAITING_APPROVAL',quote,interaction:entry};
}
export async function readCommercialDecision(entry:InteractionEntry) {
  const api=await getWebOrderClient(),result=await api.pollInteraction(entry);
  if(result.clientStatus==='ACCEPTED'&&result.decision==='ACCEPTED')return 'ACCEPTED' as const;
  if(result.clientStatus==='REJECTED')return 'REJECTED' as const;
  if(['EXPIRED','CANCELLED'].includes(result.clientStatus))return 'EXPIRED' as const;
  return 'WAITING' as const;
}
export async function beginPaymentReview(entry:InteractionEntry):Promise<{expiresAt:string;quote:DeliveryQuoteResponse}> {
  const api=await getWebOrderClient();
  const customer=entry.body.customer as Record<string,unknown> | undefined;
  const quote=await api.quoteDelivery({
    appId:entry.body.appId,storeId:entry.body.storeId,
    address:customer?.address,district:customer?.district,useGps:false,
  });
  if(quote.revision!==entry.body.catalogRevision)
    throw Error('La carta cambió. No se puede avanzar con ese importe.');
  const response=await api.beginPaymentWait(entry);
  return {expiresAt:response.expiresAt,quote};
}
export async function cancelOrderRequest(entry:InteractionEntry) {
  const api=await getWebOrderClient();
  return (await api.cancelInteraction(entry,{reason:'CANCEL'})).status==='CANCELLED';
}
