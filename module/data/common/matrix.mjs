import { SparseDataModel } from "../abstract.mjs";
import { ED4E } from "../../../earthdawn4e.mjs";


const { fields } = foundry.data;

export default class MatrixData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.Matrix",
  ];

  /** @inheritdoc */
  static defineSchema() {
    return {
      matrixType: new fields.StringField( {
        required:        true,
        blank:           false,
        initial:         "standard",
        choices:         ED4E.matrixTypes,
      } ),
      level: new fields.NumberField( {
        required:        true,
        initial:         1,
        integer:         true,
        positive:        true,
        max:             10,
      } ),
      damage: new fields.NumberField( {
        required:        true,
        initial:         0,
        integer:         true,
        min:             0,
      } ),
      deathRating: new fields.NumberField( {
        required:        true,
        initial:         1,
        integer:         true,
        positive:        true,
      } ),
      spells:   new fields.SetField(
        new fields.DocumentUUIDField( {
          type:     "Item",
          embedded: true,
        } ), {
          required:        true,
          initial:         [],
        } ),
      threads: new fields.SchemaField( {
        hold:  new fields.SchemaField( {
          value: new fields.NumberField( {
            required:        true,
            initial:         0,
            integer:         true,
            min:             0,
          } ),
          max:   new fields.NumberField( {
            required:        true,
            initial:         0,
            integer:         true,
            min:             0,
          } ),
        }, {
          required:        true,
        } ),
        woven: new fields.NumberField( {
          required:        true,
          initial:         0,
          integer:         true,
          min:             0,
        } ),
      }, {
        required:        true,
      } ),
    };
  }

  static asEmbeddedDataField() {
    return new foundry.data.fields.EmbeddedDataField(
      this,
      {
        required:        false,
      }
    );
  }

  // region Properties

  /**
   * Is this matrix broken and therefore cannot be used?
   * @type {boolean}
   */
  get broken() {
    return this.damage >= this.deathRating;
  }

  /**
   * Can the matrix hold threads?
   * @type {boolean}
   */
  get canHoldThread() {
    return this.threads.maxHold > 0;
  }

  /**
   * The amount of damage that is prevented when attacked.
   * @type {number}
   */
  get mysticArmor() {
    let armorValue = this.containingActor?.system.characteristics.armor.mystical.value || 0;
    if ( this.matrixType === "armored" ) armorValue += this.level;
    return armorValue;
  }

  /**
   * The currently attuned spell, or the first one if there are multiple. Undefined if none are attuned.
   * @type {undefined | Document | object | null}
   */
  get spell() {
    const spellUuid = this.spells.first();
    if ( !spellUuid ) return undefined;
    return fromUuidSync( spellUuid );
  }

  // endregion

  // region Life Cycle Events

  async _preCreate( data, options, user ) {
    if ( ( await super._preCreate( data, options, user ) ) === false ) return false;

    const deathRating = ED4E.matrixTypes[ this.matrixType ].deathRating;
    const maxHoldThread = ED4E.matrixTypes[ this.matrixType ].maxHoldThread;

    this.updateSource( {
      deathRating,
      threads: {
        hold: {
          max: maxHoldThread,
        },
      },
    } );
  }

  // endregion

}