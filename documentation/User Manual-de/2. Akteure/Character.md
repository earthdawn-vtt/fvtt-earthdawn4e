Das Earthdawn System für Foundry VTT unterscheidet zwischen insgesamt 10 unterschiedlichen Akteur Typen, der erste und wichtigste dieser Typen ist der Charakter. <br>
Das erstellen von Akteuren ist für Spieler in der Grundkonfiguration von Foundry nicht erlaubt, die Charaktererstellung benötigt dies jedoch um anschließend einen Akteur anzulegen. Wir empfehlen den Spielern zumindest vorübergehend die Rechte für das erstellen von Akteuren zu geben, um die Charaktererstellung nutzen zu können.<br>
--> issue #??? <br>

## Charaktererstellung

### Hinweis für den Gamemaster user
Die Charaktererstellung benötigt das Recht, Akteure anlegen zu dürfen, welches in den Foundry Grundkonfigurationen für Spieler deaktiviert ist. Wir empfehlen bis zur umsetzung von #??? den Spielern zumindest vorübergehend dieses Recht zu erteilen.<br>
Des Weiteren benötigen die Benutzer auch Zugriff auf die *Items* die für die Charaktererstellung nötig sind. Dabei handelt es sich um Disziplinen, Talente, Fertigkeiten, Zauber und Namensgeber (ggf. auch Questoren und Weihekräfte). Die Spieler müssen mindestens das **Observer** Recht für diese Items haben um darauf zugreifen zu können. Es können auch die entsprechenden Kompendien als ganzes freigegeben werden.<br> 
Der Gamemaster hat zusätzlich noch die Möglichkeit einige Einstellungen für die Charaktererstellung in den System Einstellungen unter "Earthdawn" zu setzten:
- Anzahl der Attributspunkte (Standardmäßig 25)
- Maximaler Talent-/Fertigkeitsrang (Standardmäßig 3)
- Maximaler Kreis für Zauber (Standardmäßig 2)
- Die Verfügbaren Sprachen 

### Generierung
Durch das erzeugen eines neuen Akteurs vom Typ Charakter und der bestätigung, dass die Charaktererstellung benutzt werden soll, oder dem Chatbefehl **/char** wird die Charaktererstellung gestartet.<br>
Die Charaktererstellung führt den Benutzer durch die einzelnen Schritte, die auch im Spielerhandbuch beschrieben sind. 
1. Auswahl des Namensgebers
2. Auswahl der Berufung (wir unterstützen sowohl Adepten als auch Questoren) und der dazugehörigen Talentränge.<br> 
Talentränge können auch auf Optionale und ggr. Namensgebertalente verteilt werden.
3. Verteilung von Attributspunkten (hier wird jeweils die Werteveränderung der Charakteristiken angezeigt wenn das Attribut erhöht oder reduziert wird.)<br>
Nicht verteilte Attributpunkte werden 1:1 in Bonus karma punkte umgewandelt.<br>
4. Wenn der Charakter ein Fadenwebentalent während des zweiten Schrittes gewählt hat, das zum Zaubern verwendet wird, können nun die Zaubersprüche ausgewählt werden.
5. In diesem Schritt werden die Fertigkeitsränge verteilt. Lesen und Schreiben sowie Fremdsprachen sind jeweils mit 1 bzw. 2 Rängen vorbelegt (diese können nicht reduziert werden). Es sind die standardprüfungen aktiv, dass mindestens 2 Ränge in Wissenstalente und mindestens 1 Rang in ein Kunsthandwerk verteilt werden müssen.<br>
6. Anhand der Fertigkeitsränge in Fremdsprachen und Lesen und Schreiben können nun sprachen ausgewählt werden. (dieser Schritt ist optional)
7. zum Abschluss können noch Ausrüstungsgegenstände ausgewählt werden die jeder charakter standardmäßig besitzt. Das weitere einkaufen unterliegt jeder Spielgruppe und kann nach der Charaktererstellung erledigt werden (dieser Schritt ist optional)
Nach Abschluss der Charaktererstellung wird ein neuer Akteur vom typ Charakter erstellt und dem Benutzer als besitzter zugewiesen. 

### Der letzte Schliff
Bis #1702 umgesetzt ist, muss der Name des Charakters nach der Erstellung noch gesetzt und anschließend auch für den Token angepasst werden.<br>
Auch das Token- und Akteurbild müssen geändert werden, was bestimmte Foundry Core Berechtigungen benötigt.

## Charakterbogen

Der Charakterbogen besteht aus 6 Teilen.<br>
Der erste Teil ist das Header-Element dieses ist für die Akteur konfiguration zuständig und unterscheidet sich nicht vom Foundry Core.<br>
Der zweite Teil enthält sowohl den Namen, das Charakterbild, als auch die meisten Charakteristiken
- Widerstände (Physisch, Mystisch, Sozial)
- Rüstung (Physisch, Mystisch) 
- Gesundheitsschwellen (Wundschwelle, Bewußtlosigkeitsschwelle, Todesschwelle)
- Schaden (Tödlicher-, Betäubungs- und Blutmagieschaden)
- Wunden (Normale und Blutwunden)
Der dritte Teil ist eine Navigation der einzelnen Tabs (die einzelnen Tabs werden weiter unten beschrieben)
- Allgemein
- Talente
- Fertigkeiten
- Weihekräfte (falls vorhanden)
- Zauber (falls vorhanden)
- Ausrüstung
- Effekte
- Reputation
- Legende
Der Vierte Teil ist der jeweils aktive Tab (siehe weiter unten)
Der fünfte und letzte Teil beinhaltet einige nützliche Button (Erholung, Aufspringen, Niederschlag)<br>
Im Folgenden werden die Systemspezifischen Punte genauer beschrieben.

### Kopfzeile des Bogens

Die Kopfzeile ... gibt es hier was???

### Charakterbild

Das Charakterbild kann durch einfaches klicken auf das Bild geändert werden. Hierzu sind jedoch die Rechte nötig um auf den Fileserver zugreifen zu können. <br>

### Charakteristiken

Die Charakteristiken eines Charakters werdnen größten Teils automatisch berechnet und sind auch nicht manuell überschreibbar, kann jedoch durch Ausrüstung oder Effekte verändert werden. Es gibt folgende Charakteristiken in dieser Sektion:
- Physische Widerstandskraft
- Mystische Widerstandskraft
- Soziale Widerstandskraft
- Physische Rüstung
- Mystische Rüstung
- Todesschwelle
- Bewußtlosigkeitsschwelle
- Verwundungsschwelle
- Bewegung
<br>
Des Weiteren gibt es noch zwei Charakteristiken die etwas spezieller sind. Schaden und Wunden. Diese beiden Charakteristiken können manuell angepasst werden **ist das so?** und Schaden wird in drei Subkategorien unterteilt. Körperlicher-, Betäubungs- und Blutmagieschaden. Für Wunden gibt es normale und Blutmagie wunden.<br>
mittels der kleinen +/- Symbole an jeder Charakteristik ist es möglich einen Aktiven Effekt zu erzeugen, der den Wert senkt oder erhöht. Diese Effekte sind im Tab Effekte zu sehen.

**Mach einen PR für Bewegung** 
Zeige nur zuFuss als bewegung an, der rest als Tooltip udn auch nur wenn die Bewegung != 0 ist. Sparrt viel platz

