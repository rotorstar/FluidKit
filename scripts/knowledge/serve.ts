import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { safeFile } from './files';
import { BUNDLES } from './config';

export function createKnowledgeServer(audience:'engineering'|'public',port:number,root=process.cwd()){
  const bundle=resolve(root,'knowledge',audience);
  const types:Record<string,string>={'.html':'text/html; charset=utf-8','.md':'text/markdown; charset=utf-8','.json':'application/json; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'};
  return createServer(async(request,response)=>{
    if(!['GET','HEAD'].includes(request.method??'')){response.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(request.headers.host??'')){response.writeHead(403).end();return;}
    try{
      // Inspect the raw path before WHATWG URL normalization can hide traversal.
      const raw=(request.url??'/').split('?')[0]!;
      const file=await safeFile(bundle,raw==='/'?'/handbook.html':raw);
      const type=types[extname(file)];if(!type)throw new Error('Unsupported file');
      const data=await readFile(file);
      response.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"});response.end(request.method==='HEAD'?undefined:data);
    }catch{response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Datei nicht gefunden.');}
  });
}
if(process.argv[1]?.endsWith('/serve.ts')){
  const name=process.argv[2]??'public';if(!BUNDLES.includes(name as 'public'|'engineering'))throw new Error('Audience muss public oder engineering sein.');
  const audience=name as 'public'|'engineering',port=Number(process.argv[3]??(audience==='public'?3050:3051));
  if(!Number.isSafeInteger(port)||port<1024||port>65535)throw new Error('Ungültiger Port.');
  createKnowledgeServer(audience,port).listen(port,'127.0.0.1',()=>console.info(`${audience}: http://127.0.0.1:${port}`));
}
