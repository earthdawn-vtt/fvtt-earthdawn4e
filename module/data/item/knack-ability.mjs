import ActionMigration from "./migration/old-system-V082/action.mjs";
import AttributeMigration from "./migration/old-system-V082/attribute.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";
import DifficultyMigration from "./migration/old-system-V082/difficulty.mjs";
import AbilityTemplate from "./templates/ability.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";

/**
 * Data model template with information on Knack items.
 * @property {string} sourceTalent          talent the knack is derived from
 * @property {string} restrictions          restrictions of the knack
 * @property {object} requirements          requirement of the knack
 * @property {boolean} standardEffect       standard effect used
 */
export default class KnackAbilityData extends AbilityTemplate.mixin(
  KnackTemplate,
  ItemDescriptionTemplate
)  {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.KnackAbility",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      isPathKnack: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
      standardEffect: new fields.BooleanField( {
        required: true,
        initial:  false,
      } ),
    } );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onCreate( data, options, user ) {
    if ( ( await super._preCreate( data, options, user ) ) === false ) return false;

    // assign the source talent
  }

  /**
   * The final rank of the parent ability.
   * @type {number}
   */
  get parentRank() {
    const parentTalent = this.containingActor?.itemTypes.talent.find( ( talent ) => talent.system.edid === this.sourceTalent );
    return parentTalent?.system.level;
  }
  
  /**
   * The final rank of this ability (e.g. attribute + parent talent rank).
   * @type {number}
   */
  get rankFinal() {
    const attributeStep = ( this.containingActor?.system.attributes[this.attribute]?.step ?? 0 );
    return attributeStep ? this.parentRank + attributeStep : 0;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source, itemContext = null ) {

    // Collect all migration changes
    const allChanges = [];
    const allChangeDetails = {};

    // Migrate action (doesn't return changes)
    ActionMigration.migrateData( source );
    
    // Migrate Attributes - collect changes
    const attributeResult = AttributeMigration.migrateData( source, itemContext );
    
    if ( attributeResult?.changes?.length > 0 ) {
      allChanges.push( ...attributeResult.changes );
      Object.assign( allChangeDetails, attributeResult.changeDetails || {} );
    }
    
    // Migrate description (doesn't return changes)
    DescriptionMigration.migrateData( source );
    
    // Migrate minDifficulty (doesn't return changes)
    DifficultyMigration.migrateData( source );

    // will change with the real Knack migration only for purposes of getting the journal log to work
    source.restrictions = [];
    source.requirements = [];

    // Return combined migration results
    return {
      changes:       allChanges,
      changeDetails: allChangeDetails
    };
  }
}