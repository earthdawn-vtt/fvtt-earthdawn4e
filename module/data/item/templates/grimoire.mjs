import SystemDataModel from "../../abstract.mjs";
import { getSetting } from "../../../settings.mjs";

const { fields } = foundry.data;

export default class GrimoireTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Grimoire",
  ];

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      grimoire: new fields.SchemaField( {
        spells: new fields.SetField(
          new fields.DocumentUUIDField( {
            type:     "Item",
            embedded: false,
          } ), {
            required:        true,
            initial:         [],
          } ),
        owner: new fields.DocumentUUIDField( {
          type:     "Actor",
        } ),
      },{
        nullable: true,
        initial:  null,
      } ),
    } );
  }

  // region Properties

  get isGrimoire() {
    return this.edid === getSetting( "edidGrimoire" );
  }

  get isOwnGrimoire() {
    return this.grimoire?.owner === this.containingActor?.uuid;
  }

  // endregion

  // region Life Cycle Events

  /**
   * Prepares the grimoire data for creation or update.
   * @param {object} data The data to prepare, see {@link _preCreate} and {@link _preUpdate}.
   */
  _prepareGrimoireData( data ) {
    const edidGrimoire = getSetting( "edidGrimoire" );

    if ( this._isBecomingGrimoire( data, edidGrimoire ) ) {
      this._setDefaultGrimoireData( data );
    } else if ( this._isLosingGrimoire( data, edidGrimoire ) ) {
      this._clearGrimoireData( data );
    }
  }

  /**
   * Checks if the item is becoming a grimoire with creation or update.
   * @param {object} data The data to check, see {@link _preCreate} and {@link _preUpdate}.
   * @param {string} edidGrimoire The EDID that defines a grimoire.
   * @returns {boolean} True if the item is becoming a matrix, false otherwise.
   */
  _isBecomingGrimoire( data, edidGrimoire ) {
    return data.system?.edid === edidGrimoire && this.edid !== edidGrimoire;
  }

  /**
   * Sets the default grimoire data for a new grimoire.
   * @param {object} data The data to set, see {@link _preCreate} and {@link _preUpdate}.
   */
  _setDefaultGrimoireData( data ) {
    data.system.grimoire ??= {
      spells: new Set(),
      owner:  null,
    };
  }

  /**
   * Checks if the item is losing its grimoire status with creation or update.
   * @param {object} data The data to check, see {@link _preCreate} and {@link _preUpdate}.
   * @param {string} edidGrimoire The EDID that defines a grimoire.
   * @returns {boolean} True if the item is losing its grimoire status, false otherwise.
   */
  _isLosingGrimoire( data, edidGrimoire ) {
    return (
      this.edid === edidGrimoire
      && typeof data.system?.edid === "string"
      && data.system.edid !== edidGrimoire
    );
  }

  /**
   * Clears the grimoire data when the item is no longer a grimoire.
   * @param {object} data The data to clear, see {@link _preCreate} and {@link _preUpdate}.
   */
  _clearGrimoireData( data ) {
    data.system.grimoire = null;
  }

  // endregion

}