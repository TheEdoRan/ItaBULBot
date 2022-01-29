# #BandaUltraLarga Bot

## [@ItaBULBot](http://telegram.me/itabulbot)

**Attenzione: questo non è un bot ufficiale.**

Sentivo **enormemente** la mancanza di un bot di questo tipo su Telegram.

Per fortuna, qualche tempo fa, il [sito BUL](http://bandaultralarga.italia.it)
è stato rifatto; ho potuto così sfruttare le API per creare questo bot.

### Funzionamento

Il bot fornisce varie informazioni sul progetto **#BUL** per una determinata
regione o città scelta dall'utente, sia per quanto riguarda la fibra ottica,
che per quanto riguarda l'FWA.

Utilizzarlo è molto semplice, basta digitare l'username del bot seguito dal
nome di una città/regione, ad esempio:

```
@itabulbot Roma
@itabulbot Lombardia
```

Essendo inline, il bot funziona in qualsiasi chat.

### Novità ❗️

Ora il bot supporta anche la ricerca per indirizzo ed il funzionamento è il medesimo della ricerca di una città o regione.

Basterà, in questo caso, scrivere in qualsiasi chat un indirizzo compreso di numero civico, come ad esempio:

```
@itabulbot Corso d'Italia, 41, Roma
```

## Ringraziamenti

- Il [sito BUL](http://bandaultralarga.italia.it) per l'idea e per aver reso
  possibile la creazione di questo bot.
- [Antonio](https://github.com/Pitasi), per avermi aiutato con i dati di
  OpenFiber.
- [Telegraf](https://github.com/telegraf/telegraf), il framework utilizzato
  per il bot.
