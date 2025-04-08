This function intercepts the core foundry method of onDropItem to check if the item has a learnable function in its data model (like knacks or spells do) if that is the case, the learn function is triggered, before the item is added to the document.

**Technical Information:**
A foundry core function (see [defaultOptions](https://foundryvtt.com/api/classes/client.ActorSheet.html#_onDropItem) for further information)