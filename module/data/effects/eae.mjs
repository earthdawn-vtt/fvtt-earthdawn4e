import EdIdField from "../fields/edid-field.mjs";
import EarthdawnActiveEffectChangeData from "./eae-change-data.mjs";
import EarthdawnActiveEffectDurationData from "./eae-duration.mjs";
import FormulaField from "../fields/formula-field.mjs";
import ED4E from "../../config/_module.mjs";
import ActiveEffectDataModel from "../abstract/active-effect-data-model.mjs";
import { mapObject } from "../../utils.mjs";


/**
 * @implements {ActiveEffectData}
 */
export default class EarthdawnActiveEffectData extends ActiveEffectDataModel {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    return this.mergeSchema( super.defineSchema(), {
      changes: new fields.ArrayField( new fields.EmbeddedDataField(
        EarthdawnActiveEffectChangeData
      ) ),
      duration:   new fields.EmbeddedDataField( EarthdawnActiveEffectDurationData ),
      executable:       new fields.BooleanField(),
      executeOn:        new fields.StringField( {
        required: false,
        choices:  ED4E.eaeExecutionTime,
      } ),
      executionScript:  new fields.JavaScriptField( {
        required: false,
        gmOnly:   true,
        initial:  "/**\n* This scope has the following variables available:\n* - effect: The \`EarthdawnActiveEffect\` document instance this script lives on\n* - parent: The parent document of this effect, either an \`ActorEd\` or an \`ItemEd\`\n*/\n\n",
      } ),
      transferToTarget: new fields.BooleanField( {
        initial: false,
      } ),
      abilityEdid: new EdIdField( {
        blank:   true,
        initial: "",
      } ),
      source: new fields.SchemaField(
        {
          documentOriginUuid: new fields.DocumentUUIDField(),
          documentOriginType: new fields.StringField()
        } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.ActiveEffect.Eae",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: "eae",
    }, {
      inplace: false
    },
  ) );

  // endregion

  //  region Life Cycle Events

  /** @inheritDoc */
  async _preUpdate( changes, options, user ) {
    if ( await super._preUpdate( changes, options, user ) === false ) return false;

    await this._prepareSystemData( changes );
  }

  /**
   * Prepare the system data for creation or update. This includes setting up the source, preparing the changes data,
   * and ensuring the document origin type is set if the document origin uuid is set.
   * @param {object} data - The data being created or updated
   * @returns {Promise<void>}
   */
  async _prepareSystemData( data ) {
    if ( data.system?.changes && !data.changes ) {
      data.changes = await this._prepareChangesData( data.system.changes );
    }
    if ( data.system?.duration && !data.duration ) {
      data.duration = await this._prepareDurationData( data.system.duration );
    }
    if ( !this.source && this.parent?.actor ) {
      const containingActor = await fromUuid( this.parent.actor.uuid );

      data.system ??= {};
      data.system.source = {
        documentOriginUuid: containingActor.uuid,
        documentOriginType: containingActor.type
      };
    }
    if ( data.system?.source?.documentOriginUuid && !data.system.source.documentOriginType ) {
      data.system.source.documentOriginType = (
        await fromUuid( data.system.source.documentOriginUuid )
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
        const change = {};
        if ( key ) change.key = key;
        if ( Number.isNumeric( finalValue ) ) change.value = finalValue;
        if ( mode ) change.mode = mode;
        if ( Number.isNumeric( priority ) ) change.priority = priority;
        return change;
      } catch {
        return change;
      }
    } );
  }


  async _prepareDurationData( systemDuration ) {
    const evalData = await this._getFormulaData();
    return mapObject(
      systemDuration,
      ( fieldName, fieldValue ) => {
        if ( !( EarthdawnActiveEffectDurationData.schema.fields[fieldName] instanceof FormulaField ) ) return [ fieldName, fieldValue ];
        try {
          const finalValue = FormulaField.evaluate( fieldValue, evalData );
          return [ fieldName, Number.isNumeric( finalValue ) ? finalValue : fieldValue ];
        } catch {
          return [ fieldName, fieldValue ];
        }
      }
    );
  }

  /**
   * Retrieve the formula data for the formula fields within this effect.
   * @returns {Promise<object>} A promise that resolves to the roll data object of this effect's target.
   * @protected
   */
  async _getFormulaData() {
    if ( this.appliedToAbility ) return ( await fromUuid( this.abilityUuid ) )?.getRollData() ?? {};
    if ( this.parent?.isItemEffect ) return ( await fromUuid( this.source.documentOriginUuid ) )?.getRollData() ?? {};
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
    return fromUuidSync( this.source.documentOriginUuid );
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