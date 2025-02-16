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

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      isPathKnack: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Knack.isPathKnack" ),
        hint:     this.hintKey( "Knack.isPathKnack" ),
      } ),
      standardEffect: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Knack.standardEffect" ),
        hint:     this.hintKey( "Knack.standardEffect" ),
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
    const parentTalent = this.parentActor?.itemTypes.talent.find( ( talent ) => talent.system.edid === this.sourceTalent );
    return parentTalent?.system.level;
  }
  

  /**
   * The final rank of this ability (e.g. attribute + parent talent rank).
   * @type {number}
   */
  get rankFinal() {
    const attributeStep = ( this.parentActor?.system.attributes[this.attribute]?.step ?? 0 );
    return attributeStep ? this.parentRank + attributeStep : 0;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}