import ED4E from "../../../config/_module.mjs";
import SystemDataModel from "../../abstract/system-data-model.mjs";

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

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Target",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      difficulty: new foundry.data.fields.SchemaField( {
        target: new foundry.data.fields.StringField( {
          nullable: true,
          blank:    true,
          required: false,
          initial:  "",
          choices:  ED4E.targetDifficulty,
        } ),
        group: new foundry.data.fields.StringField( {
          nullable: true,
          blank:    true,
          initial:  "",
          choices:  ED4E.groupDifficulty,
        } ),
        fixed: new foundry.data.fields.NumberField( {
          required: false,
          nullable: true,
          min:      0,
          integer:  true,
        } ),
      } ),
    } );
  }

  /**
   * Returns a short string representation of the difficulty setting.
   * A number for fixed difficulties, a string for target and additional icon
   * for group difficulties.
   * @type {string}
   */
  get difficultyLabel() {
    let difficulty = this.difficulty;
    let label = "";

    if ( difficulty.fixed > 0 ) {
      return difficulty.fixed.toString();
    }

    if ( difficulty.target ) {
      label += ED4E.ACTIONS.targetDifficulty[ difficulty.target ]?.abbreviation;
    }
    if ( difficulty.group ) {
      label += ` ${ this.groupDifficultyIcon }`;
    }
    return label;
  }

  /**
   * Returns an HTML string with font awesome icons representing the group difficulty.
   * Empty string if no group difficulty is set.
   * @type {string}
   */
  get groupDifficultyIcon() {
    let groupDifficulty = this.difficulty?.group;
    if ( !groupDifficulty ) return "";

    const icons = ED4E.SYSTEM.icons.GroupDifficulty;
    const group = `<i class="fas ${icons.group}"></i>`;
    const highest = `<i class="fas ${icons.highest}"></i>`;
    const lowest = `<i class="fas ${icons.lowest}"></i>`;
    const x = `<i class="fas ${icons.x}"></i>`;
    switch ( groupDifficulty ) {
      case "highestOfGroup":
        return `${group} ${highest}`;
      case "highestX":
        return `${group} ${highest} ${x}`;
      case "lowestOfGroup":
        return `${group} ${lowest}`;
      case "lowestX":
        return `${group} ${lowest} ${x}`;
      default:
        return "";
    }
  }


  /**
   *
   * @returns {number} return
   */
  getDifficulty() {
    let difficulty;
    let currentTarget = game.user.targets.first()?.actor;
    let currentTargets = [ ...game.user.targets.map( ( t ) => t.actor ) ];
    let numTargets = game.user.targets.size;
    let targetDifficultySetting = this.difficulty.target;
    let groupDifficultySetting = this.difficulty.group;
    let fixedDifficultySetting = this.difficulty.fixed;

    if ( numTargets <= 0 || !targetDifficultySetting ) {
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
          baseDifficulty = currentTarget?.system.characteristics.defenses[targetDifficultySetting]?.value ?? 0;
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