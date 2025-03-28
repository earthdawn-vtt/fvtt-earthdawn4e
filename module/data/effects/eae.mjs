import { ActiveEffectDataModel } from "../abstract.mjs";
import EdIdField from "../fields/edid-field.mjs";
import EarthdawnActiveEffectChangeData from "./eae-change-data.mjs";
import EarthdawnActiveEffectDurationData from "./eae-duration.mjs";
import FormulaField from "../fields/formula-field.mjs";
import ED4E from "../../config/_module.mjs";


/**
 * @implements {ActiveEffectData}
 */
export default class EarthdawnActiveEffectData extends ActiveEffectDataModel {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return this.mergeSchema( super.defineSchema(), {
      changes: new fields.ArrayField( new fields.EmbeddedDataField(
        EarthdawnActiveEffectChangeData
      ), {
        label: this.labelKey( "changes" ),
        hint:  this.hintKey( "changes" )
      } ),
      duration: new fields.EmbeddedDataField( EarthdawnActiveEffectDurationData, {
        label: this.labelKey( "duration" ),
        hint:  this.hintKey( "duration" )
      } ),
      executable:       new fields.BooleanField( {
        label:   this.labelKey( "executable" ),
        hint:    this.hintKey( "executable" )
      } ),
      executeOn:        new fields.StringField( {
        required: false,
        choices:  ED4E.eaeExecutionTime,
        label:    this.labelKey( "executeOn" ),
        hint:     this.hintKey( "executeOn" ),
      } ),
      executionScript:  new fields.JavaScriptField( {
        required: false,
        initial:  "/**\n* This scope has the following variables available:\n* - effect: The \`EarthdawnActiveEffect\` document instance this script lives on\n* - parent: The parent document of this effect, either an \`ActorEd\` or an \`ItemEd\`\n*/\n\n",
        label:    this.labelKey( "executionScript" ),
        hint:     this.hintKey( "executionScript" )
      } ),
      level:            new fields.NumberField( {
        nullable: true,
        initial:  null,
        integer:  true,
        validate: ( value, options ) => {
          if ( options.source ) return;
          if ( options.source.statuses.length !== 1 ) throw new Error( "Level can only be set for a single status." );
        },
        label:    this.labelKey( "level" ),
        hint:     this.hintKey( "level" ),
      } ),
      transferToTarget: new fields.BooleanField( {
        initial: false,
        label:   this.labelKey( "transferToTarget" ),
        hint:    this.hintKey( "transferToTarget" )
      } ),
      abilityEdid: new EdIdField( {
        blank:   true,
        initial: "",
        label:   this.labelKey( "abilityEdid" ),
        hint:    this.hintKey( "abilityEdid" )
      } ),
      source: new fields.SchemaField(
        {
          documentOriginUuid: new fields.DocumentUUIDField( {
            label: this.labelKey( "documentOriginUuid" ),
            hint:  this.hintKey( "documentOriginUuid" )
          } ),
          documentOriginType: new fields.StringField( {
            label: this.labelKey( "documentOriginType" ),
            hint:  this.hintKey( "documentOriginType" )
          } )
        },
        {
          label: this.labelKey( "source" ),
          hint:  this.hintKey( "source" )
        }
      )
    } );
  }


  //  region CRUD

  /** @inheritDoc */
  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    if ( changes.system?.changes && !changes.changes ) {
      changes.changes = await this._prepareChangesData( changes.system.changes );
    }
    if ( changes.system?.source?.documentOriginUuid ) {
      changes.system.source.documentOriginType = (
        await fromUuid( changes.system.source.documentOriginUuid )
      )?.type;
    }
  }

  /**
   * Transform the system changes data into the expected format of the base data model. This includes evaluating
   * formula fields.
   * @param {[EarthdawnActiveEffectChangeData]} systemChanges - The system changes data
   * @returns {Promise<EffectChangeData[]>} The prepared changes data
   * @protected
   */
  async _prepareChangesData( systemChanges ) {
    const evalData = await this._getFormulaData();
    return systemChanges.map( change => {
      const { key, value, mode, priority } = change;
      try {
        const finalValue = FormulaField.evaluate( value, evalData );
        return {
          key,
          value: finalValue,
          mode,
          priority
        };
      } catch {
        return change;
      }
    } );
  }

  /**
   * Retrieve the formula data for the formula fields within this effect.
   * @returns {Promise<object>} A promise that resolves to the roll data object of this effect's target.
   * @protected
   */
  async _getFormulaData() {
    if ( this.appliedToAbility ) return ( await fromUuid( this.abilityUuid ) )?.getRollData() ?? {};
    return this.parent?.target?.getRollData() ?? {};
  }

  // endregion


  // region Properties

  /**
   * Is this effect always active, that is, has no limited duration.
   * @type {boolean}
   */
  get permanent() {
    return this.duration.type === "permanent";
  }

  /**
   * Is this effect applied to a separate ability, i.e., does it have `system.ability uuid`.
   * @type {boolean}
   */
  get appliedToAbility() {
    return !!this.abilityUuid;
  }

  /**
   * Is this effect applied to an actor? Defined as either, being an actor effect, or an item effect that is
   * transferred to the target or applied to its actor.
   * @type {boolean}
   */
  get appliedToActor() {
    return this.parent?.isActorEffect || this.transferToTarget || this.parent?.transfer;
  }

  /**
   * Is this effect applied to an item? Defined as being an item effect that is not transferred to the target or applied
   * to a separate ability.
   * @type {boolean}
   */
  get appliedToItem() {
    return ( this.parent?.isItemEffect && !this.transferToTarget && !this.parent?.transfer ) || this.appliedToAbility;
  };

  /**
   * Is this effect created automatically by a document, such as an item or actor effect?
   * @type {boolean}
   */
  get createdAutomatically() {
    return !!this.document;
  }

  /**
   * The document origin of this effect, if it was created by a document. If coming from a compendium pack, this will
   * return the document's index entry.
   * @type {Document | object | null | *}
   */
  get documentOrigin() {
    return fromUuidSync( this.documentOriginUuid );
  }

  // endregion


  // region Data Preparation


  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  // endregion


  // region Executable

  /**
   * Execute the effect's execution script.
   * @param {{}} options - Additional options for executing the script. Currently not used.
   * @returns {Promise} A promise that resolves once the script has been executed.
   */
  async execute( options = {} ) {
    try {
      const fn = new foundry.utils.AsyncFunction(
        "effect",
        "parent",
        "options",
        `{${ this.executionScript }\n}`,
      );
      await fn.call( globalThis, this.parent, this.parent.parent, options );
    } catch ( error ) {
      console.error( error );
    }
  }

  // endregion

}