import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SpellData from "./spell.mjs";
import { getSingleGlobalItemByEdid } from "../../utils.mjs";
import KnackTemplate from "./templates/knack-item.mjs";

/**
 * Data model template with information on Spell items.
 */
export default class SpellKnackData extends SpellData.mixin(
  ItemDescriptionTemplate,
  KnackTemplate,
)  {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.SpellKnack",
  ];

  // endregion

  // region Static Methods

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      bloodMagic: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      linkable: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      strain: new fields.NumberField( {
        required: true,
        min:      0,
        integer:  true,
        initial:  0,
      } ),
    } );
  }

  // endregion

  // region Life Cycle Events

  /** @inheritDoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;

    if ( this._isChangingSourceItem( data ) ) {
      await this._copySourceSpellData( data );
      this.updateSource( data );
    }
  }

  /** @inheritDoc */
  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    if ( this._isChangingSourceItem( changes ) ) {
      await this._copySourceSpellData( changes );
    }
  }

  /**
   * Writes the data of the source spell into `data` for fields that are not provided in `data`.
   * Does nothing if no source spell is found.
   * @param {object} data The data being provided for creating or updating the spell knack.
   * @returns {Promise<void>}
   */
  async _copySourceSpellData( data ) {
    const actor = this.containingActor;
    const sourceSpell = actor
      ? await actor.getSingleItemByEdid( data.system.sourceItem, "spell" )
      : await getSingleGlobalItemByEdid( data.system.sourceItem, "spell" );
    if ( !sourceSpell ) return;

    foundry.utils.mergeObject(
      data.system,
      sourceSpell.system.toObject( true ),
      {
        inplace:          true,
        insertKeys:       true,
        insertValues:     true,
        overwrite:        true,
        performDeletions: false,
      }
    );

    // Ensure edid is not changed
    data.system.edid = this.edid;
  }

  // endregion

}