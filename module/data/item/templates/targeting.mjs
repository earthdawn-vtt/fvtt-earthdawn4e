import SystemDataModel from "../../abstract.mjs";
import ED4E from "../../../config.mjs";

/**
 * Data model template with information on Ability items.
 * @property {string} action action type
 * @property {string} attribute attribute
 * @property {string} tier talent tier
 * @property {number} strain strain
 * @property {number} level rank
 * @mixin
 */
export default class TargetTemplate extends SystemDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      difficulty: new foundry.data.fields.SchemaField( {
        target: new foundry.data.fields.StringField( {
          nullable: false,
          blank:    false,
          initial:  "none",
          choices:  ED4E.targetDifficulty,
          label:    this.labelKey( "Target.target" ),
          hint:     this.hintKey( "Target.target" )
        } ),
        group: new foundry.data.fields.StringField( {
          nullable: false,
          blank:    false,
          initial:  "none",
          choices:  ED4E.groupDifficulty,
          label:    this.labelKey( "Target.group" ),
          hint:     this.hintKey( "Target.group" )
        } ),
        fixed: new foundry.data.fields.NumberField( {
          required: false,
          nullable: true,
          min:      0,
          integer:  true,
          label:    this.labelKey( "Target.fixed" ),
          hint:     this.hintKey( "Target.fixed" )
        } ),
      } ),
    } );
  }

  /**
   *  
   * @returns {number} return
   * @userFunction              UC_Actions-getDifficulty
   */
  getDifficulty() {
    let difficulty;
    let currentTarget = game.user.targets.first()?.actor;
    let currentTargets = [ ...game.user.targets.map( ( t ) => t.actor ) ];
    let numTargets = game.user.targets.size;
    let targetDifficultySetting = this.difficulty.target;
    let groupDifficultySetting = this.difficulty.group;
    let fixedDifficultySetting = this.difficulty.fixed;

    if ( numTargets <= 0 || targetDifficultySetting === "none" ) {
      difficulty = ( fixedDifficultySetting > 0 ) ? fixedDifficultySetting : game.settings.get( "ed4e", "minimumDifficulty" );
    } else {
      let baseDifficulty;
      let additionalTargetDifficulty = 0;
      // noinspection FallThroughInSwitchStatementJS
      switch ( groupDifficultySetting ) {
        case "highestX":
          additionalTargetDifficulty = numTargets - 1;
        case "highestOfGroup":
          baseDifficulty = TargetTemplate._getAggregatedDefense( currentTargets, targetDifficultySetting, Math.max );
          break;
        case "lowestX":
          additionalTargetDifficulty = numTargets - 1;
        case "lowestOfGroup":
          baseDifficulty = TargetTemplate._getAggregatedDefense( currentTargets, targetDifficultySetting, Math.min );
          break;
        default:
          baseDifficulty = currentTarget?.system.characteristics.defenses[targetDifficultySetting].value ?? 0;
      }
      difficulty = baseDifficulty + additionalTargetDifficulty;
    }

    return Math.max( difficulty, game.settings.get( "ed4e", "minimumDifficulty" ) );
  }


  /**
   * @param { Array } targets array of all targets
   * @param { string } targetDefenseType defense
   * @param { any } aggregate ???
   * @returns { number} return
   * @userFunction              UC_Actions-getAggregatedDefense
   */
  static _getAggregatedDefense( targets, targetDefenseType, aggregate = Math.max ) {
    return targets.length > 0 ? aggregate( ...targets.map( ( t ) => t.system.characteristics.defenses[targetDefenseType].value ) ) : 0;
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