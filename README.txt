LE MIE RATE — VERSIONE PUSH (iPhone + hosting gratuito)

COSA FA
- Debito iniziale modificabile SOLO in Profilo, non dalla home.
- Storico rate con aggiunta, modifica, eliminazione e backup JSON.
- Web Push via service worker, pianificato dal server ogni giorno alle 18:00 Europe/Rome.
- Il server invia un promemoria ogni giorno nei 7 giorni prima della prossima scadenza mensile.
- Le scadenze sono indicative e non includono interessi/commissioni.

IMPORTANTE SULL'HOSTING GRATUITO
Il progetto usa Node.js + web-push + node-cron. Su hosting gratuito con istanze che vanno in sospensione (per esempio alcuni piani free), il cron potrebbe NON eseguire alle 18:00 se il servizio dorme. Per notifiche puntuali e affidabili usa un servizio gratuito che supporti processi/cron sempre attivi oppure sposta l'invio in un cron esterno che chiama un endpoint protetto. Il piano free può inoltre avere filesystem effimero: push-subscriptions.json potrebbe essere perso a un riavvio. Per uso reale, collega un database persistente gratuito o un disco persistente. Non mettere la chiave VAPID privata nel frontend.

REQUISITI
- Node.js 20+
- Hosting HTTPS per il frontend/backend.
- iPhone con iOS/iPadOS 16.4 o successivo per Web Push da web app aggiunta alla schermata Home.

INSTALLAZIONE LOCALE
1. Estrai il pacchetto e apri un terminale nella cartella.
2. Installa le dipendenze: npm install
3. Genera le chiavi VAPID: npm run vapid
4. Copia la chiave pubblica e privata nell'ambiente:
   macOS/Linux:
     export VAPID_PUBLIC_KEY="chiave_pubblica_generata"
     export VAPID_PRIVATE_KEY="chiave_privata_generata"
     export VAPID_SUBJECT="mailto:tuo-indirizzo@example.com"
   Windows PowerShell:
     $env:VAPID_PUBLIC_KEY="chiave_pubblica_generata"
     $env:VAPID_PRIVATE_KEY="chiave_privata_generata"
     $env:VAPID_SUBJECT="mailto:tuo-indirizzo@example.com"
5. Avvia: npm start
6. Apri http://localhost:3000. Il browser consente service worker su localhost.
Nota: notifiche push reali su iPhone richiedono HTTPS e installazione su schermata Home; localhost serve solo per test da computer.

PUBBLICAZIONE GRATUITA (esempio Render)
1. Crea un repository GitHub privato e carica tutti i file di questo pacchetto (non caricare .env né push-subscriptions.json).
2. Crea un servizio Web su Render collegato al repository. Il file render.yaml descrive il servizio.
3. In Render > Environment imposta:
   VAPID_PUBLIC_KEY = chiave pubblica generata
   VAPID_PRIVATE_KEY = chiave privata generata
   VAPID_SUBJECT = mailto:una-tua-email-valida@example.com
4. Attendi il deploy e verifica https://TUO-SERVIZIO.onrender.com/api/health.
5. Apri la URL HTTPS in Safari su iPhone. Premi Condividi > Aggiungi alla schermata Home.
6. Apri l'icona dalla schermata Home, vai su Profilo, salva importo rata e giorno del mese, poi premi Attiva notifiche e consenti il permesso.
7. Lascia l'app connessa almeno una volta per salvare la sottoscrizione push. Prova il pulsante Attiva notifiche; il server inizierà a inviare alle 18:00 Europe/Rome.

LIMITAZIONI DA SAPERE
- Render Free può sospendere il servizio e non garantisce che il cron in-process parta puntualmente alle 18:00; inoltre il filesystem locale può essere effimero. Per una soluzione gratuita davvero affidabile, si consiglia un backend con database persistente e cron gestito (ad esempio Supabase + Edge Functions/Cron o Cloudflare Workers + Cron Triggers e storage).
- Questa build è pronta come implementazione di riferimento, ma non promette puntualità in un piano hosting che sospende i processi.
- Il server memorizza endpoint e chiavi di autenticazione delle sottoscrizioni push, oltre al piano rata essenziale. Proteggi il repository e le variabili ambiente.
- I dati finanziari dell'app restano localmente nel browser; la configurazione push invia al server importo rata, giorno e dati tecnici della sottoscrizione. Non invia l'intero storico dei pagamenti.
- Non sono previsti pagamenti automatici: l'app è un registro e un promemoria.
