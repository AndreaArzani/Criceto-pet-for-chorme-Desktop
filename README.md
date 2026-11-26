# 🐹 Criceto virtuale

Un criceto animato che appare su ogni pagina web e insegue il cursore del mouse.
Disponibile come **estensione per Chrome/Firefox** oppure come **userscript per Tampermonkey**.

## Funzionalità

- Sempre visibile come overlay su qualsiasi pagina `http`/`https`
- Insegue il cursore in modo fluido: cammina da vicino, corre da lontano e si ferma quando il cursore sta fermo
- Animazioni: camminata, corsa, riposo (respira e sbatte le palpebre), sonno dopo 10 secondi di quiete
- Click sul criceto: salta e fa uscire dei cuoricini
- `Alt` + `Maiusc` + `H` per nasconderlo o mostrarlo
- Leggero: l'animazione gira solo mentre si muove, nessuna richiesta di rete, nessun dato raccolto

## Struttura

```
.
├── criceto-extension/
│   ├── manifest.json     # estensione (Manifest V3, Chrome e Firefox)
│   └── hamster.js        # codice del criceto
├── criceto.user.js       # stesso codice con intestazione Tampermonkey
└── README.md
```

## Installazione

### Opzione A: Tampermonkey (la più rapida)

1. Installa [Tampermonkey](https://www.tampermonkey.net/) nel tuo browser.
2. Su Chrome/Edge recenti attiva la **Modalità sviluppatore** in `chrome://extensions`.
3. Nella dashboard di Tampermonkey crea un nuovo script, incolla il contenuto di `criceto.user.js` e salva (`Ctrl+S`).
4. Ricarica una pagina qualsiasi.

### Opzione B: estensione

**Chrome / Edge**

1. Apri `chrome://extensions` e attiva la **Modalità sviluppatore**.
2. Clicca **Carica estensione non pacchettizzata** e scegli la cartella `criceto-extension`.

**Firefox**

1. Apri `about:debugging#/runtime/this-firefox`.
2. Clicca **Carica componente aggiuntivo temporaneo…** e scegli `criceto-extension/manifest.json`.
3. L'installazione temporanea sparisce al riavvio del browser. Per renderla permanente serve far firmare l'estensione su addons.mozilla.org oppure usare Firefox Developer Edition.

Dopo l'installazione ricarica le pagine già aperte.

## Configurazione

In cima a `hamster.js` (e a `criceto.user.js`) ci sono le impostazioni:

| Costante        | Significato                                          | Default |
| --------------- | ---------------------------------------------------- | ------- |
| `SIZE`          | Dimensione del criceto in px                         | `64`    |
| `STOP_DISTANCE` | Distanza a cui si ferma dal cursore                  | `70`    |
| `MAX_SPEED`     | Velocità massima (px al secondo)                     | `340`   |
| `RUN_SPEED`     | Oltre questa velocità corre invece di camminare      | `200`   |
| `SLEEP_AFTER`   | Millisecondi di quiete prima di addormentarsi        | `10000` |

Se modifichi `hamster.js`, ricopia le modifiche anche in `criceto.user.js` (cambia solo l'intestazione).

## Limiti

- Non funziona su pagine interne del browser (`chrome://`, `about:`, Chrome Web Store, visualizzatore PDF).
- Funziona solo dentro il browser, non sul desktop.

## Privacy

Il codice non effettua richieste di rete e non legge né salva dati: vive in uno Shadow DOM e reagisce solo ai movimenti del mouse e al click sul criceto.
