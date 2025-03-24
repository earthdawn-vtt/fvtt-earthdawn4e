# Introduction

## The Whys and Hows

Why is a complete change of the system required, might be the first question you find asking yourself when you stumble across this information. The Answer is pretty simple but has muliple layers to it. 

### The code

The code of the old system was created without the help of any professional help, therefore it is far away from almost any best practice. This does not seam to be a problem at first if everything is working, but it acutally is. <br>
- The code was very hard to extend. Adding new features or even finding a bug took tremendeous time and usually requierd a lot of refactoring of the code. 
- The core code of Foundry changed and it would have taken a huge amount of time to change the code to be future proven. 
- The old code did not allow easy access for people to support the system and contribute some code to it. The new system has a modern structure and documentation.

### The UI

<i>...The UI looks like something from the 90s...</i> Even though that hurts, I very much know that it is true. Having someone really taking the UI to a next level instead of myself trying to figure it out is a huge benefit for every user. Redoing the system made it much easier to redo the design for the UI as well.

### Disappearing Team Members

Over time some of the system developers left the group and took some of their knowledge and ideas with them. Since we didn't followed a good documentation approach with the first system, it would have been hard to try to figure out what they thought and why they did things.

## Enough History, whats in the new system

Im ersten Release haben wir uns ganz auf das wiederherstellen der bereits existierenden Funktionalitäten fokusiert. Zusammen mit einem guten Migrationskonzept, sollte es allen Benutzern möglich sein, die neue Systemversion zu laden und direkt weiterzuspielen wo sie vorher aufgehört haben. Die einzelnen Funktionalitäten sind in den folgenden Kapiteln aufgeführt. Innerhalb dieser wiederherstellung existierender Funktionalitäten haben wir gleichzeitig darauf geachtet, die Funktionalitäten zu überarbeiten, so dass es viele kleine Änderungen gibt die im ersten Moment gar nicht auffallen, weshalb ich jedoch empfehle die Release notes zu lesen. Für eine kurze Übersicht über die einzelnen Funktionen gibt es die [100-FunktionsÜbersicht](../feature-overview.md).