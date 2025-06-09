

/**
 * @augments DialogV2
 */
export default class DialogEd extends foundry.applications.api.DialogV2 {

  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes:  [ "ed4e" ],
    position: {
      width:  400,
      height: "auto",
    },
  };

  /**
   * Create a simple dialog for choosing from a list of options, represented as buttons.
   * @param {ItemEd[]|string[]} items The items to choose from, either as ItemEd instances or a list of their UUIDs.
   * @param {string} [buttonClass] The class to apply to the buttons.
   * @param {Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>} [config] Configuration options for the dialog.
   * @returns {Promise<any>} Resolves to the UUID of the selected item. If the dialog was dismissed, and rejectClose is false, the Promise resolves to null.
   */
  static async waitButtonSelect( items, buttonClass, config = {} ) {
    return this.wait( {
      rejectClose: false,
      id:          "ed-button-select-{id}",
      uniqueId:    String( ++foundry.applications.api.ApplicationV2._appId ),
      classes:     [ "ed-button-select" ],
      window:      {
        title:       game.i18n.localize( "ED.Dialogs.Title.buttonSelect" ),
        minimizable: false,
      },
      modal:       false,
      buttons:     this.createItemButtons( items, buttonClass ),
      ...config,
    } );
  }

  /**
   * Create buttons for a list of items, typically used in item selection dialogs.
   * @param {ItemEd[]|string[]} items The items to choose from, either as ItemEd instances or a list of their UUIDs.
   * @param {string} buttonClass - The class to use for the buttons.
   * @returns {DialogV2Button[]} An array of button objects. The action is the item's UUID.
   */
  static createItemButtons( items, buttonClass = "ed-button" ) {
    const itemsList = items?.[0]?.system ? items : items.map( uuid => fromUuidSync( uuid ) );
    return itemsList.map( item => {
      return {
        action:  item.uuid,
        label:   item.name,
        icon:    item.img,
        class:   `button-${ item.system[ buttonClass ] } ${ item.name }`,
        default: false,
      };
    } );
  }

}