import ItemSheetEd from "./item-sheet.mjs";

export default class ThreadItemSheet extends ItemSheetEd {

  // region Rendering

  /** @inheritDoc */
  async _preparePartContext( partId, contextInput, options ) {
    const context = await super._preparePartContext( partId, contextInput, options );
    switch ( partId ) {
      case "general":
        break;
      case "details":
        break;
      case "effects":
        context.oneActiveEffect = this.item.effects[0];
        break;
    }
    return context;
  }

  /** @inheritDoc */
  async _prepareContext( options ) {
    const context = await super._prepareContext( options );

    context.itemWovenTo = await fromUuid( this.document.system.wovenToUuid );
    context.wovenToThreadItem = context.itemWovenTo?.system?.truePattern?.isThreadItem ?? false;
    context.threadItemLevels = context.itemWovenTo?.system?.truePattern?.threadItemLevels;

    return context;
  }

  // endregion

}