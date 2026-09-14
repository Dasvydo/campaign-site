import { chromium } from './node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/* usage: node gates.mjs [page.html] [fonts-dir]
   playwright-core and axe-core resolve from ./node_modules, so run this from
   wherever those are installed. */
const SRC   = resolve(process.argv[2] || 'paper-desk.html');
const FONTS = process.argv[3] || '';

/* paper-desk.html is artifact page content, not a document: no doctype, no
   html element, no head. Without a lang attribute axe reports a html-has-lang
   violation that belongs to the harness rather than to the page, so the shell
   is built here instead of being left to whoever runs this. The real site sets
   lang per locale from content.htmlLang. */
const faces = ['Playfair Display:400:playfair-display-latin-400-normal',
               'Playfair Display:600:playfair-display-latin-600-normal',
               'Playfair Display:700:playfair-display-latin-600-normal',
               'DM Sans:400:dm-sans-latin-400-normal',
               'DM Sans:500:dm-sans-latin-500-normal',
               'DM Sans:700:dm-sans-latin-700-normal'];
const page = readFileSync(SRC,'utf8').replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/g,'');
const localFonts = FONTS ? `<style>${faces.map(f=>{
  const [fam,wt,file] = f.split(':');
  return `@font-face{font-family:'${fam}';font-weight:${wt};font-style:normal;font-display:block;`
       + `src:url('${pathToFileURL(join(resolve(FONTS), file + '.woff2')).href}') format('woff2')}`;
}).join('')}</style>` : '';

const SHELL = join(tmpdir(), 'paper-desk.gates.html');
writeFileSync(SHELL, `<!doctype html><html lang="en"><head><meta charset="utf8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{color-scheme:light}body{margin:0;padding:0;font:14px system-ui,sans-serif}
img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style>
${localFonts}</head><body>\n${page}\n</body></html>`);
const URL = pathToFileURL(SHELL).href;
console.log(`page: ${SRC}${FONTS ? '' : '  (no fonts dir given, falling back to system faces)'}`);

const axe = readFileSync('./node_modules/axe-core/axe.min.js','utf8');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});

// ---- axe-core, WCAG 2.2 AA ----
const pg=await b.newPage({viewport:{width:1280,height:900}});
await pg.goto(URL,{waitUntil:'networkidle'}); await pg.waitForTimeout(1500);
await pg.addScriptTag({content:axe});
const a11y = await pg.evaluate(async()=>{
  const r = await axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
  return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,
    help:v.help, sample:(v.nodes[0]?.html||'').slice(0,110)})), passes:r.passes.length};
});
console.log('=== GATE: axe-core, WCAG 2.2 AA ===');
console.log(`  rules passed: ${a11y.passes}`);
console.log(`  violations:   ${a11y.violations.length}  ${a11y.violations.length===0?'PASS (their bar: 0)':'FAIL'}`);
a11y.violations.forEach(v=>console.log(`   ! [${v.impact}] ${v.id} x${v.n} :: ${v.help}\n       ${v.sample}`));

// ---- open the disclosures and re-run, so hidden content is audited too ----
await pg.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
await pg.waitForTimeout(500);
const a11y2 = await pg.evaluate(async()=>{
  const r = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
  return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length}));
});
console.log(`  with every disclosure open: ${a11y2.length} violations ${a11y2.length===0?'PASS':'FAIL'}`);
a11y2.forEach(v=>console.log(`   ! [${v.impact}] ${v.id} x${v.n}`));
await pg.close();

// ---- Core Web Vitals ----
const pg2=await b.newPage({viewport:{width:1280,height:900}});
await pg2.goto('about:blank');
await pg2.evaluate(()=>{ window.__lcp=0; window.__cls=0; window.__long=0; });
await pg2.addInitScript(()=>{
  window.__lcp=0; window.__cls=0; window.__long=0;
  new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__lcp=e.startTime;})
    .observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value;})
    .observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(l=>{for(const e of l.getEntries()) window.__long += Math.max(0, e.duration-50);})
    .observe({type:'longtask',buffered:true});
});
await pg2.goto(URL,{waitUntil:'load'});
await pg2.waitForTimeout(4000);
const v = await pg2.evaluate(()=>({lcp:window.__lcp, cls:window.__cls, tbt:window.__long,
  dcl: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart}));
console.log('\n=== GATE: Core Web Vitals ===');
const g=(ok,l,val,bar)=>console.log(`  ${ok?'PASS':'FAIL'}  ${l}: ${val}   (their bar: ${bar})`);
g(v.cls===0,'CLS', v.cls.toFixed(4), '0');
g(v.lcp<1000,'LCP', Math.round(v.lcp)+'ms', '< 1000ms');
g(v.tbt<50,'TBT', Math.round(v.tbt)+'ms', '< 50ms');
await pg2.close();

// ---- JS weight ----
const scripts=[...page.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('');
const { gzipSync } = await import('node:zlib');
console.log('\n=== GATE: JS weight ===');
const kb = gzipSync(Buffer.from(scripts)).length/1024;
g(kb<100,'initial JS', kb.toFixed(1)+'KB gzip', '< 100KB gzip');
console.log(`         (raw inline JS ${(scripts.length/1024).toFixed(1)}KB, zero external JS requests)`);

// ---- 60fps under 4x CPU throttle ----
const pg3=await b.newPage({viewport:{width:1280,height:900}});
const cdp=await pg3.context().newCDPSession(pg3);
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await pg3.goto(URL,{waitUntil:'networkidle'}); await pg3.waitForTimeout(1200);
const fps = await pg3.evaluate(async()=>{
  const el=document.querySelector('#demo'); el && el.scrollIntoView();
  let frames=0; const t0=performance.now();
  await new Promise(res=>{ const tick=()=>{frames++; if(performance.now()-t0<2000) requestAnimationFrame(tick); else res();};
    requestAnimationFrame(tick); window.scrollBy(0,1200); });
  return frames/((performance.now()-t0)/1000);
});
console.log('\n=== GATE: animation under 4x CPU throttle ===');
g(fps>=55, 'frame rate', fps.toFixed(1)+'fps', '60fps');
await b.close();
