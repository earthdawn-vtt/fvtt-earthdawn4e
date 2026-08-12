---
title: Legendenpunkte
group: Deutsch
category: Legende
---
# Grundlagen

Legendenpunkte (LP) sind ein zentrales Element des Earthdawn-Systems und ermöglichen es Charakteren, ihre Fähigkeiten zu verbessern. Das Earthdawn-System für Foundry VTT hat umfangreiche Möglichkeiten zur Verwaltung von Legendenpunkten.

## Legendenpunkte des Charakters

Die Legendenpunkte eines Charakters können im Tab „Legende“ eingesehen werden. Dort ist eine Übersicht über die erhaltenen, ausgegebenen und freien Legendenpunkte sowie den Status.

![Legendenpunkte-Button](../../../assets/manual/german/legend-point-history-button.png)

## Legendenpunkte verdienen und Verlauf

Zuallererst benötigen Charaktere Legendenpunkte. Diese können auf zwei Arten hinzugefügt werden: manuell über die Legendenpunkteübersicht oder mittels des `/lp` Chat-Befehls.

### Legendenpunkteübersicht

Die Legendenpunkteübersicht zeigt alle relevanten Informationen zu den Legendenpunkten eines Charakters an. Hier können Spielende neue Legendenpunkte hinzufügen und alle Transaktionen einsehen, bearbeiten oder rückgängig machen.

#### Erhaltene Legendenpunkte

Diese Übersicht zeigt eine Liste aller erhaltenen Legendenpunkte an. Neu errungene Legendenpunkte können mittels des Buttons „Legendenpunkt hinzufügen“ hinzugefügt werden. Jeder Eintrag ist zusätzlich zu den Legendenpunkten mit einem Datum und einer Beschreibung versehen.

![Erhaltene Legendenpunkte](../../../assets/manual/german/legend-point-history-earned.png)

#### Legendenpunkteausgaben

Alle Legendenpunktausgaben werden in dieser Übersicht angezeigt. Die Ausgabe kann nach Datum, nach Namen oder nach Typ (Attribute, Talente, Zauber etc.) sortiert werden.

![Legendenpunkteausgaben](../../../assets/manual/german/legend-point-history-spent.png)

#### Chronologische Sicht & Zurücksetzen

Die letzte Ansicht ist eine Kombination der ersten beiden (erhaltene und ausgegebene Legendenpunkte). Die Ansicht ist rein chronologisch, besitzt jedoch hinter jedem Eintrag ein Pfeilsymbol. Wird dieses angeklickt, so werden dieser und **alle** neueren Einträge gelöscht.

**Achtung:** Diese Funktion setzt aktuell noch keine Werte, die mit dieser Transaktion verbunden sind, zurück, sondern löscht nur die Einträge in dieser Liste.

![Chronologische Sicht](../../../assets/manual/german/legend-point-history-chronological.png)

### /lp Chat-Befehl

![Legendenpunkte zuweisen](../../../assets/manual/german/assign-lp-prompt.png)

Die andere Möglichkeit, einem Charakter Legendenpunkte zu geben, ist der Chat-Befehl `/lp`. Dieser öffnet einen Dialog, in dem alle Charaktere angezeigt werden, die einer spielenden Person zugewiesen sind (per Konfiguration oder Zugriffsrechte). Die Spielleitung kann diesen Befehl ausführen, Charaktere auswählen und Legendenpunkte sowie eine Beschreibung hinzufügen. Mit Bestätigung des Dialogs wird bei jedem ausgewählten Charakter ein Legendenpunkte-Eintrag mit der angegebenen Beschreibung hinzugefügt.

## Legendenpunkte ausgeben

Legendenpunkte können für die folgenden Items ausgegeben werden:

- Talent-, Fertigkeits-, Weihekraft-Ränge erhöhen
- Attribute erhöhen
- Zauber erlernen
- Kniffe erlernen (Kniffe, Karma-Kniffe, Spezialmanöver und Zauberkniffe)
- Permanente Fäden zu Strukturen

Die Kosten für die einzelnen Verbesserungen variieren je nach Typ, entsprechend den Werten aus dem Spielerhandbuch. Entscheidende Parameter wie bei Fähigkeiten die Stufe (Novize, Geselle, Hüter oder Meister) haben immer eine gleichnamige Option im Item selbst.

Fähigkeiten und Attribute können im Editiermodus mittels des „Pfeil-nach-oben“-Buttons in der jeweiligen Übersichtsliste erhöht werden. Jedes Mal, wenn dieser Button gedrückt wird, erscheint ein Dialog, der über die Kosten und Bedingungen informiert.

Kniffe und Zauber werden per Drag & Drop auf den Charakter gezogen und lösen somit die Funktion aus. Auch hier gibt es jedes Mal einen Dialog, der über die entsprechenden Umstände oder Möglichkeiten informiert.

Permanente Fäden lösen durch das Aktivieren des nächsten Fadenranges die Lern-Funktion aus.

![Talent erhöhen](../../../assets/manual/german/increase-talent.png)

## Disziplinen, Pfade und Questoren (Berufungen)

Es gibt neben den oben genannten Möglichkeiten, Legendenpunkte auszugeben, auch noch weitere Optionen, den Charakter zu verbessern. Das Erhöhen des Disziplinkreises, das Erlernen neuer Disziplinen, das Beitreten zu einem Pfad oder die Bindung an eine Passion als Questor erfordern keine Legendenpunkte. Für die dazugehörigen Talente, Weihekräfte und Kniffe gilt das Gleiche wie oben beschrieben.

Diese Berufungen lassen sich alle im Editiermodus steigern. Ähnlich den Fähigkeiten taucht auch hier ein Dialog auf, der über die Umstände oder Möglichkeiten informiert.

![Disziplinen, Pfade und Questoren](../../../assets/manual/german/increase-vocation.png)

Pfade und Questoren haben eine Fähigkeit, die in direktem Bezug zur Berufung steht und die mindestens einen Rang besitzen muss, der dem neuen Rang des Pfades oder des Questors entspricht. Ist dies nicht der Fall, bietet das System die Möglichkeit, die entsprechende Fähigkeit gleich mitzusteigern.

Wenn eine Disziplin erhöht wird, die ein Fadenwebentalent besitzt, das zum Zaubern genutzt wird, so erscheint noch eine Option, einen neuen Zauber zu erlernen.

### Kreisaufstieg mit der Hausregel „Alle Talente“

Die Einstellung "Mindestanforderungen Talente bei Kreisaufstieg" bietet **Alle Talente für Kreisaufstieg (Hausregel)**. Dabei handelt es sich um eine angepasste, nach Tiers aufgeteilte Version der optionalen Regel **„Using All Talents To Advance“** aus dem Spielerhandbuch. Die vollständige Regel ist im Spielerhandbuch beschrieben.

Die Hausregel unterscheidet sich in folgenden Punkten von der Regel im Spielerhandbuch:

- Statt einer Gesamtzahl wird eine Mindestanzahl für die Kategorien Novize, Geselle, Hüter und Meister verlangt.
- Die Anforderungen für die einzelnen Kategorien beginnen in unterschiedlichen Kreisen und haben jeweils eine Obergrenze.
- Für die Anforderungen an eine Kategorie wird nur geprüft, ob die Talente vorhanden sind. Der im Spielerhandbuch genannte Mindestrang wird dabei nicht verlangt.

Die Bedingung, dass ein im aktuellen Kreis erlerntes Talent auf den Rang des neuen Kreises erhöht werden muss, bleibt bestehen. Es werden alle Talente berücksichtigt, die der Disziplin zugeordnet sind, einschließlich optionaler Talente.


