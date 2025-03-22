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
  // eslint-disable-next-line complexity
  static migrateData( source ) {
    const oldTargetDefense = [ "", "physicaldefense", "mysticaldefense", "socialdefense" ];
    const newTargetDefense = [ "", "physical", "mystical", "social" ];
    const oldGroupDifficulty = [ "", "defenseLow", "defenseLowPlus", "defenseHigh", "defenseHighPlus" ];
    const newGroupDifficulty = [ "", "lowestOfGroup", "lowestX", "highestOfGroup", "highestX" ];
    const oldAttributes = [ "", "dexterityStep", "strengthStep", "toughnessStep", "perceptionStep", "willpowerStep", "charismaStep", "initiativeStep" ];
    const newAttributes = [ "", "dex", "str", "tou", "per", "wil", "cha", "" ];
    const oldActions = [ "", "Standard", "Simple", "Free", "Sustained" ];
    const newActions = [ "", "standard", "simple", "free", "sustained" ];
    
    // Migrate action (ok)
    if ( oldActions.includes( source.action ) ) {
      source.action = newActions[oldActions.indexOf( source.action )];
    }
  
    // Migrate defense target (ok)
    if ( oldTargetDefense.includes( source.defenseTarget ) || oldGroupDifficulty.includes( source.defenseGroup ) ) {
      source.difficulty = {
        target: newTargetDefense[oldTargetDefense.indexOf( source.defenseTarget )],
        group:  newGroupDifficulty[oldGroupDifficulty.indexOf( source.defenseGroup )]
      };
    }

    // set rollType for recovery (ok)
    if ( source.healing > 0 ) {
      if ( source.rollType === undefined ) {
        source.rollType = "recovery";
      }
    } 
  
    // Migrate attribute (ok)
    if ( oldAttributes.includes( source.attribute ) ) {
      if ( source.attribute === "initiativeStep" ) {
        source.rollType = "initiative";
      } 
      source.attribute = newAttributes[oldAttributes.indexOf( source.attribute )];
    }

    // Migrate description
    if ( typeof source.description === "string" ) {
      source.description = { value: source.description };
    }

    // Migrate restrictions
    // restrictions and requirements are currently not done
    source.restrictions = [];
    source.requirements = [];
    
  }
}