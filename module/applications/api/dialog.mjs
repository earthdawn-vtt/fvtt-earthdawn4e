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
   * @param {Array<ItemEd|string|DialogV2Button>} items The items to choose from. Can be a mixed array of:
   *   - ItemEd instances
   *   - UUID strings
   *   - Regular strings (used as button actions)
   *   - Complete DialogV2Button objects
   * @param {string} [buttonClass] The class to apply to the buttons (only used for ItemEd objects).
   * @param {Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions>} [config] Configuration options for the dialog.
   * @returns {Promise<any>} Resolves to the selected action/UUID. If the dialog was dismissed, and rejectClose is false, the Promise resolves to null.
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
   * @param {Array<ItemEd|string|DialogV2Button>} items The items to choose from. Can be a mixed array of:
   *   - ItemEd instances
   *   - UUID strings
   *   - Regular strings (used as button actions)
   *   - Complete DialogV2Button objects
   * @param {string} buttonClass - The class to use for the buttons (only used for ItemEd objects).
   * @returns {DialogV2Button[]} An array of button objects.
   */
  static createItemButtons( items, buttonClass = "ed-button" ) {
    // If items is null or empty, return empty array
    if ( !items || !items.length ) return [];

    // Process each item individually based on its type
    return items.map( item => {
      // DialogV2Button object (any object with action and label)
      if ( item?.action !== undefined && item?.label !== undefined ) {
        return {
          action:  item.action,
          label:   item.label,
          icon:    item.icon || null,
          class:   item.class || "",
          default: item.default || false
        };
      }

      // ItemEd instance
      if ( item?.system ) {
        return {
          action:  item.uuid,
          label:   item.name,
          icon:    item.img,
          class:   `button-${item.system[buttonClass]} ${item.name}`,
          default: false
        };
      }

      // UUID string
      if ( typeof item === "string" && item.includes( "." ) ) {
        const resolvedItem = fromUuidSync( item );
        if ( resolvedItem?.system ) {
          return {
            action:  resolvedItem.uuid,
            label:   resolvedItem.name,
            icon:    resolvedItem.img,
            class:   `button-${resolvedItem.system[buttonClass]} ${resolvedItem.name}`,
            default: false
          };
        }
      }

      // Regular string
      if ( typeof item === "string" ) {
        return {
          action:  item,
          label:   item,
          icon:    null,
          class:   "",
          default: false
        };
      }

      // Fallback for unrecognized formats
      console.warn( "Unexpected item format in createItemButtons:", item );
      return {
        action:  String( item ),
        label:   String( item ),
        icon:    null,
        class:   "",
        default: false
      };
    } );
  }
}