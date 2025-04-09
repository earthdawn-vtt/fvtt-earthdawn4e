The prepare context function of the assign LP prompt collects all relevant actors from the game to provide them with checkboxes in the prompt
- actors which are are actively used by users (configured user of active player)
- actors which are used by players (configured user of inactive player)
- actors which are owned by players but are not configured

**Technical Information:**
A foundry core function (see [prepareContext](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#_prepareContext) for further information)