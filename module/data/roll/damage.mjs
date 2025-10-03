import EdRollOptions from "./common.mjs";
import ED4E, { ACTORS, COMBAT, ENVIRONMENT } from "../../config/_module.mjs";
import { createContentAnchor } from "../../utils.mjs";


/**
 * Base roll options initialization data for all types of damage rolls.
 * @typedef {object} BaseDamageRollOptionsInitializationData
 * @property {string} damageSourceType The type of damage source used for {@link DamageRollOptions~damageSourceType}.
 * @property {ItemEd} [replacementAbility] The ability that will replace the attribute step used for the base damage step.
 * Examples include "Crushing Blow", "Down Strike", or "Flame Arrow".
 * This does not include talents like "Body Control" or "Claw Shape", which create a weapon and
 * should instead be passed as a weapon item.
 * Can be omitted if `replacementAbilityUuid` in {@link DamageRollOptions} is provided.
 * @property {ItemEd[]} [increaseAbilities] Abilities that increase the damage step.
 * Can be omitted if `increaseAbilityUuids` in {@link DamageRollOptions} is provided.
 */

/**
 * Roll options initialization data for arbitrary damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} ArbitraryDamageInitializationData
 * @property {"arbitrary"} damageSourceType Discriminator for arbitrary damage source.
 * @property {Document} [sourceDocument] If given, will try to get the base damage step via `document.system.damageTotal`.
 */

/**
 * Roll options initialization data for drowning damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} DrowningDamageInitializationData
 * @property {"drowning"} damageSourceType Discriminator for drowning damage source.
 * @property {number} [drowningRound=1] The round of drowning to roll damage for. Determines the step number for the
 * roll.
 */

/**
 * Roll options initialization data for falling damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} FallingDamageInitializationData
 * @property {"falling"} damageSourceType Discriminator for falling damage source.
 * @property {number} [fallingHeight] The height of the fall in yards.
 * Determines the step number for the roll, but not the number of rolls (heights >10 yards must repeat).
 */

/**
 * Roll options initialization data for fire damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} FireDamageInitializationData
 * @property {"fire"} damageSourceType Discriminator for fire damage source.
 * @property {string} fireType The type of fire source. Must be one of the values defined in
 * {@link module:config~ENVIRONMENT~fireDamage}.
 */

/**
 * Roll options initialization data for poison damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} PoisonDamageInitializationData
 * @property {"poison"} damageSourceType Discriminator for poison damage source.
 * @property {ItemEd} sourceDocument Item of type "poison". The poison's effect damage step is used as the base
 * damage step.
 */

/**
 * Roll options initialization data for power damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} PowerDamageInitializationData
 * @property {"power"} damageSourceType Discriminator for power damage source.
 * @property {ItemEd} sourceDocument Item of type "power". The power's damage step is used as the base
 * damage step.
 */

/**
 * Roll options initialization data for spell damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} SpellDamageInitializationData
 * @property {"spell"} damageSourceType Discriminator for spell damage source.
 * @property {ItemEd} sourceDocument Item of type "spell".
 * @property {ActorEd} caster The actor that cast the spell. The caster's Willpower step is used as the base
 * @property {ItemEd} [willpower] The willpower ability of the spell's caster, if used for the damage roll.
 */

/**
 * Roll options initialization data for suffocation damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} SuffocationDamageInitializationData
 * @property {"suffocation"} damageSourceType Discriminator for suffocation damage source.
 * @property {number} [suffocationRound=1] The round of suffocation to roll damage for. Determines the step number for
 * the roll.v
 */

/**
 * Roll options initialization data for unarmed damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} UnarmedDamageInitializationData
 * @property {"unarmed"} damageSourceType Discriminator for unarmed damage source.
 * @property {ActorEd} sourceDocument Actor of type "sentient". The attacker’s Strength step is used as the base
 * damage step.
 * @property {EdRoll} [attackRoll] The attack roll that caused the damage. This is used to determine
 * the bonus to the damage step from extra successes.
 */

/**
 * Roll options initialization data for warping damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} WarpingDamageInitializationData
 * @property {"warping"} damageSourceType Discriminator for warping damage source.
 * @property {ItemEd} sourceDocument Item of type "spell". The spell’s circle is used as the base damage step.
 * @property {string} [astralSpacePollution="safe"] The type of astral space pollution to use for modifying the
 * step of warping damage.
 */

/**
 * Roll options initialization data for weapon damage roll.
 * @typedef {BaseDamageRollOptionsInitializationData} WeaponDamageInitializationData
 * @property {"weapon"} damageSourceType Discriminator for weapon damage source.
 * @property {ItemEd} sourceDocument Item of type "weapon". The weapon’s total damage step is used as the base
 * damage step.
 * @property {EdRoll} [attackRoll] The attack roll that caused the damage. This is used to determine
 * the bonus to the damage step from extra successes.
 */

/**
 * Union of all possible damage roll initialization options.
 * @typedef {
 *   ArbitraryDamageInitializationData |
 *   DrowningDamageInitializationData |
 *   FallingDamageInitializationData |
 *   FireDamageInitializationData |
 *   PoisonDamageInitializationData |
 *   SpellDamageInitializationData |
 *   SuffocationDamageInitializationData |
 *   UnarmedDamageInitializationData |
 *   WarpingDamageInitializationData |
 *   WeaponDamageInitializationData
 * } EdDamageRollOptionsInitializationData
 */


/**
 * Roll options for damage rolls.
 * @augments { EdRollOptions }
 * @property { string } damageSourceType The type of damage source (e.g., weapon, spell). Must be one of the values
 * defined in {@link module:config~COMBAT~damageSourceConfig}.
 * @property { string|null } [armorType=""] The type of armor to consider when calculating damage. Must be one of the values
 * defined in {@link module:config~ACTORS~armor}.
 * @property { string } [damageType="standard"] The type of damage to roll. Must be one of the values defined in
 * {@link module:config~COMBAT~damageType}.
 * @property { boolean } [ignoreArmor=false] Whether to ignore armor when calculating damage.
 * @property { boolean } [naturalArmorOnly=false] Whether to only consider natural armor when calculating damage.
 * @property { string } [sourceUuid=null] The UUID of the source item or actor that caused the damage, if applicable.
 * @property { string } [replacementAbilityUuid=null] The UUID of an ability that will replace the attribute step used for
 * the base damage step. Examples include "Crushing Blow", "Down Strike", or "Flame Arrow".
 * Note: This does not include talents like "Body Control" or "Claw Shape", which technically create a weapon and
 * therefore should be passed as a weapon item.
 * @property { string[] } [increaseAbilityUuids=[]] An array of UUIDs of abilities that increase the damage step.
 * @property { object } [element] The element and subtype of the damage, if applicable.
 * @property { string } [element.type] The type of element (e.g., fire, water). Must be one of the values defined in
 * {@link module:config~MAGIC~elements}.
 * @property { string } [element.subtype] The subtype of the element (e.g., acid, cold). Must be one of the values defined in
 * {@link module:config~MAGIC~elementSubtypes}.
 */
export default class DamageRollOptions extends EdRollOptions {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Other.DamageRollOptions",
  ];

  /** @inheritdoc */
  static TEST_TYPE = "effect";

  /** @inheritdoc */
  static ROLL_TYPE = "damage";

  /** @inheritdoc */
  static GLOBAL_MODIFIERS = [
    "allDamage",
    ...super.GLOBAL_MODIFIERS,
  ];

  static _SYSTEM_KEYS_BASE_STEP = {
    poison:    "effect.damageStep",
    power:     "damageStep",
    unarmed:   "attributes.str.step",
    warping:   "level",
    weapon:    "damageTotal",
  };

  // endregion

  // region Static Methods

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      damageSourceType:       new fields.StringField( {
        required: true,
        choices:  COMBAT.damageSourceConfig,
      } ),
      armorType:              new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        initial:  "",
        choices:  ACTORS.armor,
      } ),
      damageType:             new fields.StringField( {
        initial:  "standard",
        choices:  COMBAT.damageType,
      } ),
      ignoreArmor:            new fields.BooleanField( {
        initial:  false,
      } ),
      naturalArmorOnly:       new fields.BooleanField( {
        initial:  false,
      } ),
      sourceUuid:             new fields.DocumentUUIDField( {} ),
      replacementAbilityUuid: new fields.DocumentUUIDField( {} ),
      increaseAbilityUuids:   new fields.ArrayField( new fields.DocumentUUIDField( {} ), {} ),
      element:                new fields.SchemaField(
        {
          type: new fields.StringField( {
            required: false,
            choices:  ED4E.elements,
          } ),
          subtype: new fields.StringField( {
            required: false,
            choices:  ED4E.elementSubtypes,
          } ),
        },
        {
          required: false,
        }
      ),
    } );
  }

  /**
   * @inheritDoc
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The data to initialize the roll options with.
   */
  static fromData( data, options = {} ) {
    data.sourceUuid ??= data.sourceDocument?.uuid;

    data.armorType ??= this._prepareArmorType( data );
    data.damageType ??= this._prepareDamageType( data );
    data.ignoreArmor ??= this._prepareIgnoreArmor( data );
    data.naturalArmorOnly ??= this._prepareNaturalArmorOnly( data );
    data.element ??= this._prepareElement( data );

    return /** @type { DamageRollOptions } */ super.fromData( data, options );
  }

  /**
   * @inheritDoc
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The data to initialize the roll options with.
   */
  static fromActor( data, actor, options = {} ) {
    return /** @type { DamageRollOptions } */ super.fromActor( data, actor, options );
  }

  // endregion

  // region Data Initialization

  /** @inheritDoc */
  _getChatFlavorData() {
    return {
      damageSource: this.sourceUuid ?
        createContentAnchor( fromUuidSync( this.sourceUuid ) ).outerHTML
        : COMBAT.damageSourceConfig[ this.damageSourceType ].label,
      armorType:    ACTORS.armor[ this.armorType ] || "",
    };
  }

  /**
   * @inheritDoc
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the step data.
   */
  static _prepareStepData( data ) {
    if ( !foundry.utils.isEmpty( data.step ) ) return data.step;

    if ( [ "drowning", "falling", "fire", "suffocation", ].includes( data.damageSourceType ) ) {
      return this._getStepFromEnvironment( data );
    }

    return this._getStepFromSource( data );
  }

  /**
   * Calculates the damage step for drowning based on the round of drowning.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the step data.
   * The `drowningRound` property is used to determine the step number.
   * @returns {number} The calculated damage step for drowning.
   */
  static _calculateDrowningStep( data ) {
    return ENVIRONMENT.drowningBaseDamageStep + (
      ENVIRONMENT.drowningDamageStepIncrease * ( Math.max( data.drowningRound - 1 || 0, 0 ) )
    );
  }

  /**
   * Calculates the damage step for suffocation based on the round of suffocation.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the step data.
   * The `suffocationRound` property is used to determine the step number.
   * @returns {number} The calculated damage step for suffocation.
   */
  static _calculateSuffocationStep( data ) {
    return ENVIRONMENT.suffocationBaseDamageStep + (
      ENVIRONMENT.suffocationDamageStepIncrease * ( Math.max( data.suffocationRound - 1 || 0, 0 ) )
    );
  }

  /**
   * Gets the step data based on the environmental damage type.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the step data.
   * @returns {RollStepData} The step data object containing the base step.
   */
  static _getStepFromEnvironment( data ) {
    switch ( data.damageSourceType ) {
      case "drowning":
        return {
          base: this._calculateDrowningStep( data ),
        };
      case "falling":
        return {
          base: ENVIRONMENT.fallingDamage.lookup( data.fallingHeight || 0 )?.damageStep || 1,
        };
      case "fire":
        return {
          base: ENVIRONMENT.fireDamage[ data.fireType ]?.damageStep || 1,
        };
      case "suffocation":
        return {
          base: this._calculateSuffocationStep( data ),
        };
      default:
        throw new Error( `Invalid damage source type: ${data.damageSourceType}` );
    }
  }

  /**
   * Gets the step data based on a source document.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the step data.
   * The `sourceDocument` or `sourceUuid` property is used to retrieve the source document.
   * @returns {RollStepData} The step data object containing the base step.
   */
  static _getStepFromSource( data ) {
    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    if ( !sourceDocument ) {
      throw new Error( `No source document found for damage source type: ${data.damageSourceType}` );
    }

    return {
      base:      this._getBaseStepFromSource( sourceDocument, data ),
      modifiers: this._getModifiersFromSource( sourceDocument, data ),
    };
  }

  /**
   * Gets the base step for the damage roll based on the damage source type and associated source document.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { ItemEd | ActorEd } sourceDocument The source document that caused the damage.
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * @returns { number } The base step for the damage roll.
   */
  static _getBaseStepFromSource( sourceDocument, data ) {
    let baseStep;
    const systemKey = this._SYSTEM_KEYS_BASE_STEP[ data.damageSourceType ];

    switch ( data.damageSourceType ) {
      case "arbitrary": {
        baseStep = sourceDocument.system.damageTotal || 1;
        break;
      }
      case "spell": {
        const caster = data.caster || fromUuidSync( data.rollingActorUuid );
        baseStep = sourceDocument.system.getEffectDetailsRollStepData( {
          caster,
          willpower: data.willpower
        } ).base;
        break;
      }
      case "poison":
      case "power":
      case "unarmed":
      case "warping":
      case "weapon": {
        baseStep = foundry.utils.getProperty( sourceDocument.system, systemKey );
        break;
      }
      default:
        throw new Error( `Invalid damage source type: ${data.damageSourceType}` );
    }

    if ( !baseStep ) {
      throw new Error( `No base step defined for damage source type: ${data.damageSourceType}` );
    }

    const replacementAbility = data.replacementAbility || fromUuidSync( data.replacementAbilityUuid );
    if ( replacementAbility ) {
      baseStep = replacementAbility.system.rankFinal;
    }

    return baseStep;
  }

  /**
   * Retrieves modifiers for the step of the damage roll based on the damage source type and associated source document.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { ItemEd | ActorEd } sourceDocument The source document that caused the damage.
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * @returns { RollModifiers | undefined } The modifiers for the step of the damage roll, or undefined if no
   * modifiers are found.
   */
  static _getModifiersFromSource( sourceDocument, data ) {
    if ( [ "arbitrary", "poison", ].includes( data.damageSourceType ) ) {
      return undefined;
    }

    if ( [ "unarmed", "weapon" ].includes( data.damageSourceType ) ) {
      const modifiers = {};
      const increaseAbilities = data.increaseAbilities || ( data.increaseAbilityUuids || [] ).map( uuid => fromUuidSync( uuid ) );

      if ( increaseAbilities.length > 0 ) {
        for ( const ability of increaseAbilities ) {
          if ( !ability ) throw new Error( "DamageRollOptions | _getModifiersFromSource: One of the increase abilities could not be found." );
          if ( ability?.system?.rankFinal ) {
            modifiers[ability.name] = ability.system.rankFinal;
          }
        }
      }

      const extraSuccesses = data.attackRoll?.numExtraSuccesses || 0;
      modifiers[game.i18n.localize( "ED.Rolls.Modifiers.bonusDamageFromExtraSuccesses" )] = extraSuccesses * COMBAT.bonusDamagePerExtraSuccess;

      return modifiers;
    }

    if ( data.damageSourceType === "spell" ) {
      const caster = data.caster || fromUuidSync( data.rollingActorUuid );

      return sourceDocument.system.getEffectDetailsRollStepData( {
        caster,
        willpower: data.willpower
      } ).modifiers;
    }

    if ( data.damageSourceType === "warping" ) {
      return {
        [this._pollutionData.label]: this._pollutionData.rawMagic.damageModifier,
      };
    }

    return undefined;
  }

  /**
   * @inheritDoc
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the strain data.
   */
  static _prepareStrainData( data ) {
    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );

    switch ( data.damageSourceType ) {
      case "arbitrary":
      case "drowning":
      case "falling":
      case "fire":
      case "poison":
      case "suffocation":
      case "warping":
        return null;
      case "power":
      case "spell":
      case "unarmed":
      case "weapon":
        return {
          base: sourceDocument?.system?.strain || 0,
        };
      default:
        throw new Error( `Invalid damage source type: ${data.damageSourceType}` );
    }
  }

  /**
   * Used when initializing this data model. Retrieves the armor type based on the `damageSourceType`.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the armor type.
   * @returns { string | null } The armor type to use for the damage roll as defined in {@link module:config~ACTORS~armor}.
   */
  static _prepareArmorType( data ) {
    if ( data.armorType ) return data.armorType;

    const armorType = COMBAT.damageSourceConfig[ data.damageSourceType ]?.armorType;
    if ( armorType !== undefined ) {
      return armorType;
    }

    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    return this._getArmorTypeFromSource( data.damageSourceType, sourceDocument );
  }

  /**
   * Gets armor type for damage source types that require source document analysis.
   * @param { string } damageSourceType The damage source type as defined in {@link module:config~COMBAT~damageSourceConfig}.
   * @param { ItemEd } sourceDocument The source document that caused the damage.
   * @returns { string | null } The armor type as defined in {@link module:config~ACTORS~armor}.
   */
  static _getArmorTypeFromSource( damageSourceType, sourceDocument ) {
    switch ( damageSourceType ) {
      case "power":
        return sourceDocument.system.damage?.armorType ?? "";
      case "spell":
        return sourceDocument.system.effect.details.damage?.armorType ?? "";
      case "weapon":
        return sourceDocument.system.armorType ?? "";
      default:
        throw new Error( `Invalid damage source type: ${ damageSourceType }` );
    }
  }

  /**
   * Used when initializing this data model. Retrieves the damage type based on the `damageSourceType`.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the damage type.
   * @returns {"standard"|"stun"} The damage type to use for the damage roll as defined
   * in {@link module:config~COMBAT~damageType}.
   * @private
   */
  static _prepareDamageType( data ) {
    if ( data.damageType ) return data.damageType;

    const damageType = COMBAT.damageSourceConfig[ data.damageSourceType ]?.damageType;
    if ( damageType !== undefined ) {
      return damageType;
    }

    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    return this._getDamageTypeFromSource( data.damageSourceType, sourceDocument );
  }

  /**
   * Gets the damage type for damage source types that require source document analysis.
   * @param { string } damageSourceType The damage source type as defined in {@link module:config~COMBAT~damageSourceConfig}.
   * @param { ItemEd } sourceDocument The source document that caused the damage.
   * @returns {"standard"|"stun"} The damage type as defined in {@link module:config~COMBAT~damageType}.
   */
  static _getDamageTypeFromSource( damageSourceType, sourceDocument ) {
    switch ( damageSourceType ) {
      case "power":
        return sourceDocument.system.damage?.type ?? "standard";
      case "spell":
        return sourceDocument.system.effect.details.damage.damageType;
      case "weapon":
        return sourceDocument.system.damage.type;
      default:
        throw new Error( `Invalid damage source type: ${ damageSourceType }` );
    }
  }

  /**
   * Used when initializing this data model. Retrieves whether to ignore armor based on the `damageSourceType`.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine whether to ignore armor.
   * @returns {boolean} Whether to ignore armor when applying damage.
   */
  static _prepareIgnoreArmor( data ) {
    if ( data.ignoreArmor ) return data.ignoreArmor;

    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    const ignoreArmor = this._getIgnoreArmorFromSource( data.damageSourceType, sourceDocument );
    if ( ignoreArmor !== undefined ) return ignoreArmor;

    if ( data.damageSourceType in COMBAT.damageSourceConfig ) {
      return COMBAT.damageSourceConfig[ data.damageSourceType ].ignoreArmor;
    } else {
      throw new Error( `Invalid damage source type: ${data.damageSourceType}` );
    }
  }

  /**
   * Gets whether to ignore armor for damage source types that require source document analysis.
   * @param { string } damageSourceType The damage source type as defined in {@link module:config~COMBAT~damageSourceConfig}.
   * @param { ItemEd } sourceDocument The source document that caused the damage.
   * @returns {boolean|undefined} Whether to ignore armor, or undefined if not applicable.
   */
  static _getIgnoreArmorFromSource( damageSourceType, sourceDocument ) {
    switch ( damageSourceType ) {
      case "power":
        return sourceDocument.system.damage?.ignoreArmor || false;
      default:
        return undefined;
    }
  }

  /**
   * Used when initializing this data model. Retrieves whether to only consider natural armor based on
   * the `damageSourceType`.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine whether to only consider natural armor.
   * @returns {boolean} Whether to only consider natural armor when applying damage.
   */
  static _prepareNaturalArmorOnly( data ) {
    if ( data.naturalArmorOnly ) return data.naturalArmorOnly;

    return data.damageSourceType === "warping";
  }

  /**
   * Used when initializing this data model. Retrieves the element and subtype of the damage based on the
   * `damageSourceType` and `sourceDocument`.
   * @template { EdDamageRollOptionsInitializationData } T
   * @param { T & Partial<DamageRollOptions> } data The input data object
   * with information to automatically determine the element and subtype.
   * @returns { object | undefined } The element and subtype of the damage, or undefined if not applicable.
   */
  static _prepareElement( data ) {
    if ( data.element ) return data.element;

    const sourceDocument = data.sourceDocument || fromUuidSync( data.sourceUuid );
    if ( data.damageSourceType === "spell" ) {
      if ( sourceDocument.system.element ) {
        return {
          type:    sourceDocument.system.element.type,
          subtype: sourceDocument.system.element.subtype,
        };
      }
    } else if ( data.damageSourceType === "fire" ) {
      return {
        type: "fire",
      };
    }

    return undefined;
  }

  // No need for target difficulty since damage rolls are effect tests

  // endregion

  // region Rendering

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.hasAssignedCharacter = !!game.user.character;

    const item = fromUuidSync( this.replacementAbilityUuid ?? this.sourceUuid );
    newContext.damageSourceHeader = item ?
      createContentAnchor( item ).outerHTML
      : COMBAT.damageSourceConfig[ this.damageSourceType ].label;

    return newContext;
  }

  // endregion

}