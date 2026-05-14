import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import * as ITEMS from "../../config/items.mjs";

/**
 * Data model template with information on equipment items.
 * @property {boolean} consumable check if item will be consumed on usage
 * @property {string} ammunition which type of ammo it is.
 */
export default class EquipmentData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      consumable: new fields.BooleanField( {
        required: true,
      } ),
      ammunition: new fields.SchemaField( {
        type: new fields.StringField( {
          required: true,
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ITEMS.ammunitionType,
        } ),
      } ),
      bundleSize: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      equipmentMacro: new fields.DocumentUUIDField( {
        type:     "Macro",
        embedded: false,
      } )
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Equipment",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.Item.equipment,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

  // region Methods

  /**
   * Execute the macro attached to an equipment Item, if available.
   * @param {object} scope        Additional variables that should be passed to the macro scope.
   * @returns {Promise<unknown>|void} A promise containing a created {@link foundry.documents.ChatMessage}
   *                                  (or `undefined`) if a chat macro or the return value if a script macro.
   *                                  A void return is possible if the user is not permitted to execute macros
   *                                  or a script macro execution fails.
   * @throws {Error}               If the macro document referenced by this item does not exist.
   */
  async executeEquipmentMacro( scope = {} ) {
    const macro = /** @type {foundry.documents.Macro} */ await fromUuid( this.equipmentMacro );
    return macro.execute( { actor: this.containingActor, item: this.parentDocument, ...scope } );
  }

  // endregion

}