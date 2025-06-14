import { ED4E } from "../../../../earthdawn4e.mjs";
import { getSetting } from "../../../settings.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";
import DialogEd from "../../../applications/api/dialog.mjs";
import AttuneWorkflow from "../../../workflows/workflow/attune-workflow.mjs";


const { fields } = foundry.data;

export default class MatrixTemplate extends SystemDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.Matrix",
  ];

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      matrix: new fields.SchemaField( {
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
        }, {
          required:        true,
        } ),
        activeSpell: new fields.DocumentUUIDField( {
          type:     "Item",
          embedded: true,
          required: true,
          nullable: true,
          initial:  null,
        } ),
      }, {
        nullable:        true,
        initial:         null,
      } ),
    } );
  }

  // region Properties

  /**
   * Whether this item has a matrix.
   * @type {boolean}
   */
  get hasMatrix() {
    return this.edid === getSetting( "edidSpellMatrix" );
  }

  /**
   * Is this matrix broken and therefore cannot be used?
   * @type {boolean}
   */
  get matrixBroken() {
    return this.matrix?.damage >= this.matrix?.deathRating;
  }

  /**
   * Can the matrix hold threads?
   * @type {boolean}
   */
  get matrixCanHoldThread() {
    return this.matrix?.threads?.hold?.max > 0;
  }

  /**
   * Whether the matrix has a more than one spell attuned.
   * @type {boolean}
   */
  get matrixHasMultipleSpells() {
    return this.matrix?.spells?.size > 1;
  }

  /**
   * The amount of damage that is prevented when attacked.
   * @type {number}
   */
  get matrixMysticArmor() {
    let armorValue = this.containingActor?.system.characteristics.armor.mystical.value || 0;
    if ( this.matrix?.matrixType === "armored" ) armorValue += this.matrix?.level;
    return armorValue;
  }

  /**
   * Is this matrix a shared matrix?
   * @type {boolean}
   */
  get matrixShared() {
    return this.matrix?.matrixType === "shared";
  }

  /**
   * The currently attuned spell, or the first one if there are multiple. Null if none are attuned.
   * @type { ItemEd | null }
   */
  get matrixSpell() {
    return fromUuidSync( this.matrix?.spells?.first() );
  }

  /**
   * The UUID of the currently attuned spell, or the first one if there are multiple. Null if none are attuned.
   * @type {string | null}
   */
  get matrixSpellUuid() {
    return this.matrix?.spells?.first() || null;
  }

  // endregion

  // region Life Cycle Events

  /**
   * Prepares the matrix data for creation or update.
   * @param {object} data The data to prepare, see {@link _preCreate} and {@link _preUpdate}.
   */
  _prepareMatrixData( data ) {
    const edidMatrix = getSetting( "edidSpellMatrix" );

    if ( !this.matrixHasMultipleSpells && this.matrixSpellUuid && !this.matrix.activeSpell ) {
      // If the matrix has only one spell attuned, only that one
      data.system.matrix ??= {};
      data.system.matrix.activeSpell = this.matrixSpellUuid;
    }

    if ( this._isBecomingMatrix( data, edidMatrix ) ) {
      this._setDefaultMatrixData( data );
    } else if ( this._isLosingMatrix( data, edidMatrix ) ) {
      this._clearMatrixData( data );
    } else if ( this._isMatrixTypeChanging( data ) ) {
      this._updateMatrixTypeData( data );
    }
  }

  /**
   * Checks if the item is becoming a matrix with creation or update.
   * @param {object} data The data to check, see {@link _preCreate} and {@link _preUpdate}.
   * @param {string} edidMatrix The EDID that defines a matrix.
   * @returns {boolean} True if the item is becoming a matrix, false otherwise.
   */
  _isBecomingMatrix( data, edidMatrix ) {
    return data.system?.edid === edidMatrix && this.edid !== edidMatrix;
  }

  /**
   * Sets the default matrix data for a new matrix.
   * @param {object} data The data to set, see {@link _preCreate} and {@link _preUpdate}.
   */
  _setDefaultMatrixData( data ) {
    data.system.matrix ??= {
      matrixType:  "standard",
      deathRating: this._lookupMatrixDeathRating(),
      threads:     {
        hold: {
          value: this._lookupMatrixMaxHoldThread(),
          max:   this._lookupMatrixMaxHoldThread(),
        },
      },
    };
  }

  /**
   * Checks if the item is losing its matrix status with creation or update.
   * @param {object} data The data to check, see {@link _preCreate} and {@link _preUpdate}.
   * @param {string} edidMatrix The EDID that defines a matrix.
   * @returns {boolean} True if the item is losing its matrix status, false otherwise.
   */
  _isLosingMatrix( data, edidMatrix ) {
    return (
      this.edid === edidMatrix
      && typeof data.system?.edid === "string"
      && data.system?.edid !== edidMatrix
    );
  }

  /**
   * Prepares the change data to clear the matrix data from the item.
   * @param {object} data The data to clear, see {@link _preCreate} and {@link _preUpdate}.
   */
  _clearMatrixData( data ) {
    data.system.matrix = null;
  }

  /**
   * Checks if the matrix type is changing.
   * @param {object} data The data to check, see {@link _preCreate} and {@link _preUpdate}.
   * @returns {boolean} True if the matrix type is changing, false otherwise.
   */
  _isMatrixTypeChanging( data ) {
    return (
      String( data.system?.matrix?.matrixType ) !== String( this.matrix?.matrixType ) &&
      data.system?.matrix?.matrixType in ED4E.matrixTypes
    );
  }

  /**
   * Updates the change data to reflect the new matrix type.
   * @param {object} data The data to update, see {@link _preCreate} and {@link _preUpdate}.
   */
  _updateMatrixTypeData( data ) {
    const matrixType = data.system?.matrix?.matrixType;
    data.system.matrix.deathRating = this._lookupMatrixDeathRating( matrixType );
    data.system.matrix.threads.hold.value = this._lookupMatrixMaxHoldThread( matrixType );
    data.system.matrix.threads.hold.max = this._lookupMatrixMaxHoldThread( matrixType );
  }

  // endregion

  // region Methods

  /**
   * Checks if the matrix is attuned to a specific spell.
   * @param {string} spellUuid The UUID of the spell to check.
   * @returns {boolean} True if the matrix is attuned to the spell, false otherwise.
   */
  isSpellAttuned( spellUuid ) {
    if ( this.matrixShared ) {
      return this.matrix?.spells?.has( spellUuid );
    } else {
      return this.matrixSpellUuid === spellUuid;
    }
  }

  /**
   * Remove the given spells from the matrix, or all if none are given
   * @param {string[]} [spellsToRemove] The uuids of the spells to remove, or undefined, empty or null to remove all.
   * @returns {Promise<Document | undefined>} The updated matrix item, or undefined if not updated
   */
  async removeSpells( spellsToRemove ) {
    const removeList = Array.from( spellsToRemove || this.matrix.spells );
    const newSpells = this.matrix.spells.filter( spell => !removeList.includes( spell ) );
    return this.parent?.update( {
      "system.matrix.spells": newSpells,
    } );
  }

  /**
   * Looks up the death rating of the matrix based on its type.
   * @param {string} matrixType The type of the matrix to look up, as defined in {@link ED4E.matrixTypes}.
   * @returns {number|undefined} The death rating of the matrix, or undefined if not found.
   */
  _lookupMatrixDeathRating( matrixType = "standard" ) {
    return ED4E.matrixTypes[ matrixType ].deathRating;
  }

  /**
   * Looks up the maximum thread hold of the matrix based on its type.
   * @param {string} matrixType The type of the matrix to look up, as defined in {@link ED4E.matrixTypes}.
   * @returns {number|undefined} The maximum thread hold of the matrix, or undefined if not found.
   */
  _lookupMatrixMaxHoldThread( matrixType = "standard" ) {
    return ED4E.matrixTypes[ matrixType ].maxHoldThread;
  }

  // region Spellcasting

  /**
   * Checks if threads can be woven into the matrix's spell.
   * @returns {boolean} False if the matrix is broken, true otherwise.
   */
  canWeave() {
    return !this.matrixBroken;
  }

  /**
   * Gets the currently active spell for the matrix.
   * @returns {Promise<Document|null>} The active spell document, or null if no active spell could be set.
   */
  async getActiveSpell() {
    if ( !this.matrix.activeSpell ) await this.selectActiveSpell();
    return fromUuid( this.matrix.activeSpell );
  }

  /**
   * Whether there are currently threads being woven into the matrix.
   * @returns {boolean} True if the containing spell is actively being woven threads to, false otherwise.
   */
  matrixIsWeaving() {
    return fromUuidSync( this.matrix?.activeSpell )?.system?.isWeaving || false;
  }

  /**
   * Selects the active spell for the matrix.
   * @returns {Promise<boolean>} True if the active spell was successfully selected, false otherwise.
   */
  async selectActiveSpell() {
    let newActiveSpell;
    if ( this.matrixHasMultipleSpells ) {
      newActiveSpell = await fromUuid( await DialogEd.waitButtonSelect( this.matrix.spells ) );
      if ( !newActiveSpell ) {
        ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.noActiveSpellSelected" ) );
        return false;
      }
    } else if ( this.matrixSpell ) {
      newActiveSpell = this.matrixSpell;
    } else {
      // Not attuned, try to attune a spell
      const attuneWorkflow = new AttuneWorkflow(
        this.containingActor,
        { firstMatrix: this.uuid },
      );

      // If the attune workflow is successful, try to select the active spell again
      return ( await attuneWorkflow.execute() ) ? this.selectActiveSpell() : false;
    }

    const updated = await this.parent?.update( {
      "system.matrix.activeSpell": newActiveSpell
    } );

    return !!updated;
  }

  // endregion

  // endregion

}