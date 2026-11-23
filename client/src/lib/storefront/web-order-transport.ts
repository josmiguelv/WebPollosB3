import { getB3MobileApiBase } from './api-base';

/**
 * Browser transport for the verified Android order availability client.
 * Its S2S credentials remain on the Administrator backend; this bridge only
 * calls the public, customer-scoped /api/v1/mobile endpoints.
 */
type JSONValue = Record<string, unknown>;
export type InteractionEntry = {
  interactionId: string | null;
  idempotencyKey: string;
  messageIdempotencyKey: string;
  messageDelivered?: boolean;
  messageDeliveryUncertain?: boolean;
  messageDeliveryBlocked?: boolean;
  body: JSONValue & {storeId: string; appId: string; catalogRevision: number};
  status: string;
  paymentExpiresAt?: string;
};
export type DeliveryQuoteResponse = {
  storeId: string; storeName?: string; revision: number;
  mode: 'delivery' | 'pickup'; deliveryFeePen: number;
  paymentMethods: string[]; distanceSource?: string;
};
export type PollResult = {
  decision: 'ACCEPTED' | 'REJECTED' | null;
  clientStatus: string;
  status: string; storeId: string;
};
export interface B3MobileOrderClient {
  quoteDelivery(data: JSONValue): Promise<DeliveryQuoteResponse>;
  checkAgentAvailability(data: {appId: string;storeId: string}): Promise<{available: boolean;status: string}>;
  prepareInteraction(data: JSONValue): InteractionEntry;
  createInteraction(entry: InteractionEntry): Promise<JSONValue>;
  sendInteractionMessage(entry: InteractionEntry): Promise<JSONValue>;
  readInteraction(): InteractionEntry | null;
  pollInteraction(entry: InteractionEntry): Promise<PollResult>;
  cancelInteraction(entry: InteractionEntry, options: {reason: 'CANCEL'|'MODIFY'}): Promise<JSONValue>;
  beginPaymentWait(entry: InteractionEntry): Promise<{status:string;expiresAt:string}>;
}
type BridgeRequest = JSONValue & {
  requestId: string; operation: string; appId?:string;storeId?:string;
  interactionId?:string;accessKey?:string;idempotencyKey?:string;body?:JSONValue;
};
type OrderWindow = Window & {
  AndroidBridge?: {orderAvailabilityRequest: (raw: string) => void};
  B3OrderAvailability?: B3MobileOrderClient;
  b3OrderAvailabilityNativeResponse?: (raw: string) => void;
};
const orderWindow = () => window as OrderWindow;
const endpoint = (): string => import.meta.env.DEV
  ? '/b3-mobile-api'
  : getB3MobileApiBase();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertUuid(value: unknown): string {
  if(typeof value !== 'string' || !uuidPattern.test(value)) throw Error('Identificador de solicitud inválido.');
  return value;
}
function requestAddress(input: BridgeRequest) {
  const id = input.interactionId === undefined ? '' : assertUuid(input.interactionId);
  const qp = new URLSearchParams();
  if(input.appId) qp.set('appId',input.appId);
  if(input.storeId) qp.set('storeId',input.storeId);
  const path = input.operation==='HEALTH' ? '/health/ready'
    : input.operation==='HEALTH_LIVE' ? '/health/live'
    : input.operation==='AGENT_AVAILABILITY' ? '/stores/' + assertUuid(input.storeId) + '/agent-availability'
    : input.operation==='DELIVERY_QUOTE' ? '/fulfillment/resolve'
    : input.operation==='INTERACTION_CREATE' ? '/interactions'
    : input.operation==='INTERACTION_MESSAGE' ? '/interactions/' + id + '/message'
    : input.operation==='INTERACTION_STATUS' ? '/interactions/' + id + '/status'
    : input.operation==='INTERACTION_CANCEL' ? '/interactions/' + id + '/cancel'
    : input.operation==='INTERACTION_PAYMENT' || input.operation==='INTERACTION_PAYMENT_STATUS'
      ? '/interactions/' + id + '/payment'
    : null;
  if(!path) throw Error('Operación de pedidos no autorizada para el navegador.');
  const method = ['HEALTH','HEALTH_LIVE','AGENT_AVAILABILITY','INTERACTION_STATUS','INTERACTION_PAYMENT_STATUS'].includes(input.operation)
    ? 'GET' : 'POST';
  const query = method==='GET' && qp.size>0 ? '?' + qp.toString() : '';
  const headers: Record<string,string> = {Accept:'application/json'};
  if(method==='POST') headers['Content-Type']='application/json';
  if(input.idempotencyKey) headers['Idempotency-Key']=assertUuid(input.idempotencyKey);
  if(input.accessKey) headers['X-Order-Access-Key']=assertUuid(input.accessKey);
  const body = method==='POST'
    ? JSON.stringify(input.body ?? (input.operation==='INTERACTION_CANCEL'
      ? {appId:input.appId,storeId:input.storeId,reason:input.reason}
      : {appId:input.appId,storeId:input.storeId})) : undefined;
  return {url:endpoint()+path+query,method,headers,body};
}
async function forwardBridgeRequest(input: BridgeRequest) {
  const request = requestAddress(input);
  const response = await fetch(request.url,{
    method: request.method,
    headers: request.headers,
    body: request.body,
    credentials:'omit',
    cache:'no-store',
    redirect:'error',
  });
  let data: unknown = {};
  try { data = await response.json(); } catch { /* HTTP error is still returned */ }
  return {requestId:input.requestId,status:response.status,data};
}
let loading: Promise<B3MobileOrderClient> | null = null;
/** Script has no native Android dependency until an operation is requested.
 * Explicit opt-in happens in the checkout, never on load of the public Carta.
 */
export function getWebOrderClient(): Promise<B3MobileOrderClient> {
  if(loading) return loading;
  loading = new Promise<B3MobileOrderClient>((resolve,reject) => {
    const target = orderWindow();
    const deliver = (result: JSONValue) => {
      target.b3OrderAvailabilityNativeResponse?.(JSON.stringify(result));
    };
    target.AndroidBridge = {
      orderAvailabilityRequest(raw) {
        let req: BridgeRequest;
        try { req = JSON.parse(raw) as BridgeRequest; }
        catch { return; }
        if(!req || typeof req.requestId !== 'string') return;
        void forwardBridgeRequest(req).then(deliver).catch(() => {
          // No response body or credentials are ever logged.
          deliver({requestId:req.requestId,error:'CONNECTION_FAILED'});
        });
      },
    };
    if(target.B3OrderAvailability){resolve(target.B3OrderAvailability);return;}
    const script = document.createElement('script');
    script.src = '/b3-order-availability-android.js';
    script.async = true;
    script.onload = () => target.B3OrderAvailability
      ? resolve(target.B3OrderAvailability)
      : reject(Error('No se pudo inicializar el contrato de pedidos.'));
    script.onerror = () => reject(Error('No se pudo cargar el módulo de pedidos.'));
    document.head.appendChild(script);
  }).catch(error=>{loading=null;throw error;});
  return loading;
}

/** Recojo se cotiza en el Administrador, sin inventar tarifas ni crear un FORM. */
export async function quotePickup(input:{appId:string;storeId:string}): Promise<DeliveryQuoteResponse> {
  assertUuid(input.storeId);
  const response=await fetch(endpoint()+'/fulfillment/resolve',{
    method:'POST',credentials:'omit',redirect:'error',cache:'no-store',
    headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({appId:input.appId,mode:'pickup',storeId:input.storeId}),
  });
  if(!response.ok)throw Error('No fue posible validar el recojo (HTTP '+response.status+').');
  const data=await response.json() as DeliveryQuoteResponse;
  if(data.mode!=='pickup'||data.storeId!==input.storeId||
     !Number.isSafeInteger(data.revision)||!Array.isArray(data.paymentMethods))
    throw Error('La respuesta del Administrador no corresponde a esta sede.');
  return data;
}
