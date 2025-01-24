this function adds to the [Foundry Core Function _preCreate](https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preCreate). 

In addition to the foundry core functionality, there is a check, if an item needs validation before its creation or not. this check is influenced by [UF_ActorItems-createEmbeddedDocuments](../User%20Functions/UF_ActorItems/UF_ActorItems-createEmbeddedDocuments.md).

another check will validate if the item is a talent with the "versatility" edid, to automatically change the talent category accordingly.

if further validation is required a Dialog will request user interaction.