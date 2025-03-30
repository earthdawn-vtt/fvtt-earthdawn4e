import EarthdawnActiveEffectData from "./eae.mjs";

const { NumberField, StringField } = foundry.data.fields;
const { createFormGroup, createSelectInput } = foundry.applications.fields;

/**
 * System data for 'Conditions'.
 * These are created from statuses with option support for levels of severity. Can apply to an actor or item.
 * @property {string} primary     The primary status of this condition.
 * @property {number} level       The level of this condition.
 */
export default class EarthdawnConditionEffectData extends EarthdawnActiveEffectData {

  static metadata = Object.freeze(
    foundry.utils.mergeObject( super.metadata, {
      type: "condition",
    } , {
      inplace: false
    } ),
  );

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject( super.defineSchema(), {
      primary: new StringField( {
        required: true,
        blank:    false,
        label:    this.labelKey( "primary" ),
        hint:     this.hintKey( "primary" ),
      } ),
      level: new NumberField( {
        nullable: true,
        initial:  null,
        integer:  true,
        label:    this.labelKey( "level" ),
        hint:     this.hintKey( "level" ),
      } ),
    } );
  }

  // region Properties

  get hasLevelNames() {
    return CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ]?.levelNames?.length > 0;
  }

  // endregion

  // region Data Preparation


  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.parent.transfer = false;
    this.parent.statuses.add( this.primary );
    this.maxLevel = CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ]?.levels || null;
    if ( !this.maxLevel || ( this.level > this.maxLevel ) ) this.level = this.maxLevel;

    this.parent.name = this.getNameWithLevel( this.level );
  }

  // endregion

  // region Rendering

  levelsToFormGroup() {
    const status = CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ];
    if ( !status || !this.level ) return;

    let input;

    if ( !status.levelNames ) {
      input = this.schema.fields.level.toFormGroup( {
        localize: true,
        hint:     "",
      }, {
        value:    this.level,
      } );
    } else {
      const groupConfig = {};
      groupConfig.label = this.schema.fields.level.label;
      groupConfig.classes = [ "status-level" ];
      groupConfig.input = createSelectInput( {
        type:    "single",
        name:    "system.level",
        options: status.levelNames.reduce( ( acc, value, index ) => {
          if ( index !== 0 ) acc.push( {
            value:    index,
            label:    value,
            selected: index === this.level
          } );
          return acc;
        }, [] ),
        sort: true
      } );
      input = createFormGroup( groupConfig );
    }

    return new Handlebars.SafeString( input.outerHTML ?? "" );
  }

  // endregion

  // region Levels

  /**
   * Increase the level of a status that can either be stacked or has discrete stages.
   * @param {number} [levels]   Amount of levels to increase by. Defaults to 1.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The updated effect or undefined if the level could not be increased.
   */
  async increase( levels = 1 ) {
    const maxLevel = this.maxLevel ?? CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ]?.levels;
    if ( !maxLevel || !( maxLevel > 1 ) || ( this.level === maxLevel ) ) return;

    const newLevel = Math.min( maxLevel, this.level + levels );
    const disabled = this.parent?.isDisabled;
    const diff = newLevel - this.level;
    return this.parent.update( {
      "system.level": newLevel,
      disabled:       false,
    }, {
      statusLevelDifference: disabled ? undefined : diff
    } );
  }

  /**
   * Decrease the level of a status that can either be stacked or has discrete stages.
   * It is the responsibility of the caller to delete the status if it would go below level 1.
   * @returns {Promise<EarthdawnActiveEffect|undefined>} The updated effect or undefined if the level could not be decreased.
   */
  async decrease() {
    const disabled = this.parent?.isDisabled;
    const newLevel = this.level - 1;
    const diff = newLevel - this.level;

    return this.parent.update( {
      "system.level": newLevel,
      disabled:       false,
    }, {
      statusLevelDifference: disabled ? undefined : diff
    } );
  }

  // endregion

  getNameWithLevel( level ) {
    const status = CONFIG.ED4E.STATUS_CONDITIONS[ this.primary ];
    const baseName = this.parent._source.name;
    if ( !status || !status?.levels ) return baseName;

    if ( status.levelNames ) {
      const levelName = status.levelNames[ level ] ?? "";
      return `${baseName} (${levelName})`;
    }

    if ( level === 1 ) return baseName;

    return `${baseName} (${level})`;
  }
}