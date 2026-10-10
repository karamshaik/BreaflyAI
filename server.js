// Minimal server: serves the site and keeps the API key off the browser.
// Run: ANTHROPIC_API_KEY=your_key node server.js   (Node 18+)
const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
  if(req.method==='POST'&&req.url==='/api/ai'){
    if(!process.env.ANTHROPIC_API_KEY){res.writeHead(503);return res.end('{}')}
    let b='';for await(const c of req)b+=c;
    try{
      const {prompt}=JSON.parse(b);
      const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:process.env.MODEL||'claude-haiku-5-5',max_tokens:1200,temperature:0.2,messages:[{role:'user',content:String(prompt).slice(0,30000)}]})});
      const j=await r.json();
      if(!r.ok){res.writeHead(502);return res.end('{}')}
      res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({text:j.content.map(x=>x.text||'').join('')}));
    }catch(e){res.writeHead(500);res.end('{}')}
    return;
  }
  const f=path.join(__dirname,req.url==='/'?'index.html':req.url.split('?')[0]);
  if(!f.startsWith(__dirname)||!fs.existsSync(f)){res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'content-type':types[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(res);
}).listen(3000,()=>console.log('http://localhost:3000'));
