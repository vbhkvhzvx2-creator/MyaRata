LE MIE RATE — PWA CORRETTA PER GITHUB PAGES

Questa versione usa URL relativi alla cartella dell'app e il service worker costruisce i percorsi a partire dallo scope effettivo. È adatta a un project site (https://UTENTE.github.io/NOME-REPOSITORY/) se tutti i file vengono pubblicati nella root di quel repository.

PUBBLICAZIONE
1. Apri il repository GitHub che pubblica il sito.
2. Carica/sostituisci nella root del repository TUTTI questi file: index.html, manifest.webmanifest, sw.js, icon-192.png e icon-512.png. Non caricare lo ZIP come unico file.
3. Fai commit. In GitHub apri Settings > Pages e controlla che la sorgente di pubblicazione sia quella giusta (ad esempio Deploy from a branch, branch main, cartella / (root), oppure la sorgente che usi già). Non cambiare impostazioni se il sito funziona già e la sorgente è corretta.
4. Attendi che il deploy Pages risulti completato. Verifica che questi indirizzi si aprano senza 404, sostituendo UTENTE e REPOSITORY: https://UTENTE.github.io/REPOSITORY/ ; https://UTENTE.github.io/REPOSITORY/manifest.webmanifest ; https://UTENTE.github.io/REPOSITORY/sw.js ; https://UTENTE.github.io/REPOSITORY/icon-192.png.
5. Su iPhone tieni premuta e rimuovi la vecchia icona dalla Home. In Safari apri l'URL PUBBLICATO completo, incluso /REPOSITORY/ se è un project site. Premi Condividi > Aggiungi alla schermata Home. Poi apri la nuova icona.

SE COMPARE ANCORA 404
- Se l'URL di Safari funziona ma l'icona apre una pagina GitHub 404, quasi sempre l'icona installata usa il vecchio start_url oppure la nuova versione non è stata pubblicata nel repository/sorgente giusti. Elimina la vecchia icona e reinstallala solo dopo il deploy.
- Se l'URL principale funziona ma uno degli URL di controllo sopra restituisce 404, quel file non è stato caricato nella root pubblicata oppure Pages pubblica una cartella diversa.
- La pagina di GitHub che dice di controllare Settings > Pages è la pagina di errore di GitHub Pages, non un passaggio speciale per installare una PWA.

LIMITI
GitHub Pages ospita solo file statici. Questo pacchetto corregge l'avvio della PWA, ma da solo non abilita le notifiche push programmate dal server. Per push reali serve anche un backend HTTPS configurato e raggiungibile.
