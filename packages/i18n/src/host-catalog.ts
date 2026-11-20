import { assertCompatibleMessage, formatMessage, type MessageValues } from './index';
import { LocaleContextSchema, type LocaleContext } from './locale';

export type HostMessages = Readonly<Record<string,string>>;
/** Instance-scoped asynchronous catalogs for hosts that do not ship all three languages eagerly. */
export function createHostCatalog(initial: LocaleContext, source: HostMessages) {
  const sourceContext=LocaleContextSchema.parse(initial);
  const base = Object.freeze({...source});
  for (const value of Object.values(base))assertCompatibleMessage(value,value);
  let current = { context:sourceContext, messages:base, fallbacks:[] as string[] };
  let active: AbortController | undefined;
  return {
    snapshot: () => ({ context:{...current.context}, fallbacks:[...current.fallbacks] }),
    text(key: string, values?: MessageValues) {
      if (!Object.hasOwn(current.messages,key)) throw new RangeError('Unknown message: '+key);
      return formatMessage(current.fallbacks.includes(key) ? {...current.context, language:sourceContext.language} : current.context,current.messages[key]!,values);
    },
    async change(context: LocaleContext, load: (tag:string, signal:AbortSignal)=>Promise<HostMessages | undefined>) {
      context=LocaleContextSchema.parse(context);
      active?.abort();
      const request = new AbortController(); active=request;
      try {
        const tags=[...new Set([context.language, ...(context.formatLocale.split('-')[0]===context.language ? [context.formatLocale]:[])])];
        const layers=await Promise.all(tags.map(tag=>load(tag,request.signal)));
        if(request.signal.aborted)return false;
        if(layers.every(layer=>layer===undefined))throw new Error('No host catalog available for '+context.language);
        const merged={...base}, translated=new Set<string>();
        for(const layer of layers)for(const [key,value] of Object.entries(layer??{})) {
          if(!Object.hasOwn(base,key))throw new TypeError('Unknown host translation: '+key);
          if(!value?.trim())throw new TypeError('Empty host translation: '+key);
          merged[key]=value; translated.add(key);
        }
        // Validate ICU syntax and argument types before exchanging the entire projection.
        for(const key of translated)assertCompatibleMessage(base[key]!,merged[key]!);
        current={context:{...context},messages:Object.freeze(merged),fallbacks:Object.keys(base).filter(key=>!translated.has(key))};
        return true;
      } catch(error) { if(request.signal.aborted)return false; throw error; }
      finally { if(active===request)active=undefined; }
    },
    dispose() { active?.abort(); active=undefined; },
  };
}
