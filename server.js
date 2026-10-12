import express from 'express';
import webpush from 'web-push';
import cron from 'node-cron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({limit:'100kb'}));
app.use(express.static(__dirname, {extensions:['html']}));
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DATA_FILE || path.join(__dirname,'push-subscriptions.json');
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}
function readDb(){try{return JSON.parse(fs.readFileSync(DB_FILE,'utf8'))}catch{return {subscriptions:[]}}}
function writeDb(db){fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2),'utf8')}
app.get('/api/health',(req,res)=>res.json({ok:true,pushConfigured:!!(VAPID_PUBLIC_KEY&&VAPID_PRIVATE_KEY)}));
app.get('/api/push/public-key',(req,res)=>{
 if(!VAPID_PUBLIC_KEY)return res.status(503).json({error:'Chiavi VAPID non configurate sul server.'});
 res.json({publicKey:VAPID_PUBLIC_KEY});
});
app.post('/api/push/subscribe',(req,res)=>{
 if(!VAPID_PUBLIC_KEY||!VAPID_PRIVATE_KEY)return res.status(503).json({error:'Il backend push non è configurato: imposta le variabili VAPID.'});
 const {subscription,plan}=req.body||{};
 if(!subscription?.endpoint||!subscription?.keys?.p256dh||!subscription?.keys?.auth)return res.status(400).json({error:'Sottoscrizione push non valida.'});
 if(!plan||!Number.isFinite(Number(plan.day))||!Number.isFinite(Number(plan.monthly)))return res.status(400).json({error:'Piano di pagamento non valido.'});
 const db=readDb();const record={endpoint:subscription.endpoint,subscription,plan:{debt:Number(plan.debt)||0,monthly:Number(plan.monthly)||0,day:Math.min(31,Math.max(1,Number(plan.day))),reminders:!!plan.reminders,reminderDays:7,reminderTime:'18:00',timezone:'Europe/Rome'},updatedAt:new Date().toISOString()};
 const i=db.subscriptions.findIndex(x=>x.endpoint===subscription.endpoint);if(i>=0)db.subscriptions[i]=record;else db.subscriptions.push(record);
 writeDb(db);res.json({ok:true});
});
app.post('/api/push/unsubscribe',(req,res)=>{const endpoint=req.body?.endpoint;if(!endpoint)return res.status(400).json({error:'Endpoint mancante'});const db=readDb();db.subscriptions=db.subscriptions.filter(x=>x.endpoint!==endpoint);writeDb(db);res.json({ok:true})});

function dueDateForNow(day, now){
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const endThis=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
 let due=new Date(now.getFullYear(),now.getMonth(),Math.min(day,endThis));
 if(due<today){const y=now.getFullYear(),m=now.getMonth()+1;const endNext=new Date(y,m+1,0).getDate();due=new Date(y,m,Math.min(day,endNext));}
 return due;
}
function dayDiff(a,b){return Math.round((a-b)/86400000)}
async function sendDailyReminders(){
 if(!VAPID_PUBLIC_KEY||!VAPID_PRIVATE_KEY)return;
 const now=new Date();
 const db=readDb();let changed=false;
 for(const rec of db.subscriptions){
  if(!rec.plan?.reminders||!rec.plan.monthly||!rec.plan.day)continue;
  const due=dueDateForNow(rec.plan.day,now);
  const days=dayDiff(due,new Date(now.getFullYear(),now.getMonth(),now.getDate()));
  if(days<0||days>7)continue;
  // Run daily at 18:00 Europe/Rome; one invocation per calendar day.
  const amount=Math.max(0,Number(rec.plan.debt||0));
  const msg={title:days===0?'Le mie rate — rata in scadenza oggi':'Le mie rate — promemoria rata',body:`Hai una rata prevista tra ${days===0?'oggi':days+' giorni'}. Importo mensile impostato: ${Number(rec.plan.monthly).toLocaleString('it-IT',{style:'currency',currency:'EUR'})}.`,url:'/'};
  try{await webpush.sendNotification(rec.subscription,JSON.stringify(msg));}
  catch(err){if(err.statusCode===404||err.statusCode===410){db.subscriptions=db.subscriptions.filter(x=>x.endpoint!==rec.endpoint);changed=true;}else console.error('Push send error',err.statusCode,err.message);}
 }
 if(changed)writeDb(db);
}
// A cron expression is evaluated in Europe/Rome, including DST.
cron.schedule('0 18 * * *',()=>{sendDailyReminders().catch(e=>console.error(e));},{timezone:'Europe/Rome'});
app.get('/api/admin/test-push',async(req,res)=>{
 // Optional test endpoint protected by a secret; don't configure it publicly without a long secret.
 if(!process.env.ADMIN_TEST_TOKEN||req.query.token!==process.env.ADMIN_TEST_TOKEN)return res.status(404).end();
 const db=readDb();let sent=0;for(const rec of db.subscriptions){try{await webpush.sendNotification(rec.subscription,JSON.stringify({title:'Le mie rate — test',body:'Le notifiche push sono configurate correttamente.',url:'/'}));sent++;}catch(e){console.error(e.message)}}
 res.json({ok:true,sent});
});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(PORT,()=>console.log(`Le mie rate server in ascolto sulla porta ${PORT}`));
