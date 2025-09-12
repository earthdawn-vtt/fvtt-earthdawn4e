/* eslint-disable complexity */
import EdRollOptions from "../data/roll/common.mjs";
import RollPrompt from "../applications/global/roll-prompt.mjs";
import DocumentCreateDialog from "../applications/global/document-creation.mjs";
import LegendPointHistory from "../applications/advancement/lp-history.mjs";
import LpEarningTransactionData from "../data/advancement/lp-earning-transaction.mjs";
import LpSpendingTransactionData from "../data/advancement/lp-spending-transaction.mjs";
import LpTrackingData from "../data/advancement/lp-tracking.mjs";
import { staticStatusId, sum } from "../utils.mjs";
import PromptFactory from "../applications/global/prompt-factory.mjs";
import ClassTemplate from "../data/item/templates/class.mjs";
import DamageRollOptions from "../data/roll/damage.mjs";
import MigrationManager from "../services/migrations/migration-manager.mjs";
import AttackWorkflow from "../workflows/workflow/attack-workflow.mjs";
import { AttributeWorkflow, AttuneMatrixWorkflow, KnockdownWorkflow } from "../workflows/workflow/_module.mjs";
import { getDefaultEdid, getSetting } from "../settings.mjs";
import RollProcessor from "../services/roll-processor.mjs";
import RecoveryWorkflow from "../workflows/workflow/recovery-workflow.mjs";
import SpellcastingWorkflow from "../workflows/workflow/spellcasting-workflow.mjs";
import DialogEd from "../applications/api/dialog.mjs";
import HalfMagicWorkflow from "../workflows/workflow/half-magic-workflow.mjs";
import SubstituteWorkflow from "../workflows/workflow/substitute-workflow.mjs";
import { TOKEN } from "../config/_module.mjs";

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorEd extends Actor {

  _promptFactory = PromptFactory.fromDocument( this );

  /** @inheritDoc */
  static async createDialog( data = {}, { parent = null, pack = null, ...options } = {} ) {
    return DocumentCreateDialog.waitPrompt( data, { documentCls: Actor, parent, pack, options } );
  }

  // region Properties

  /**
   * The class effects, permanent changes from disciplines, questors or paths, if any.
   * @type {EarthdawnActiveEffect[]}
   */
  get classEffects() {
    return this.effects.filter(
      effect => [ "discipline", "path", "questor" ].includes( effect.system.source?.documentOriginType )
    );
  }

  /**
   * How many more improved spell knacks this actor can learn. The maximum is the rank of patterncraft * the number of
   * "Learn Improved Spell" knacks the actor has.
   * @type {number}
   */
  get availableLearnImprovedSpells() {
    const rankPatterncraft = this.getSingleItemByEdid(
      getDefaultEdid( "patterncraft" ), "talent"
    )?.system.level || 0;
    const numLearnImprovedSpellKnack = this.getItemsByEdid(
      getDefaultEdid( "learnImprovedSpells" ), "knackAbility"
    )?.length || 0;
    const numLearnedSpellKnacks = this.itemTypes.spellKnack.length;

    return ( rankPatterncraft * numLearnImprovedSpellKnack ) - numLearnedSpellKnacks;
  }

  /**
   * The class items if this actor has any (has to be of type "character" or "npc" for this).
   * @type {[ItemData]}
   */
  get classes() {
    return this.items.filter( item => item.system instanceof ClassTemplate );
  }

  /**
   * The actor's currently available legend points.
   * @type {number}
   */
  get currentLp() {
    return this.system.lp.current;
  }

  /**
   * The actor's currently available money in silver.
   * @type {number}
   */
  get currentSilver() {
    return 1000;
  }

  /**
   * Returns the discipline items if this actor has any (has to be of type "character" or "npc" for this).
   * @type {Item[]}
   */
  get disciplines() {
    return this.itemTypes.discipline;
  }

  get durabilityItems() {
    return this.items.filter(
      item => [ "discipline", "devotion" ].includes( item.type ) && item.system.durability > 0
    );
  }

  /**
   * Returns the equipped weapons of this actor, if any.
   * @type {ItemEd[]}
   */
  get equippedWeapons() {
    return this.itemTypes["weapon"].filter(
      item => [ "mainHand", "offHand", "twoHands", "tail" ].includes( item.system.itemStatus )
    );
  }

  /**
   * Returns the highest discipline of an actor
   * @type {Item|undefined}
   */ 
  get highestDiscipline() {
    return this.disciplines.reduce( ( highest, discipline ) => {
      if ( !highest || discipline.system.level > highest.system.level ) return discipline;
      return highest;
    }, undefined );
  }

  /**
   * Whether this actor has more than one discipline. Returns `true` if this actor has more than one discipline, `false` otherwise
   * @type {boolean}
   */
  get isMultiDiscipline() {
    return this.disciplines.length > 1;
  }

  /**
   * The lowest circle of all disciplines this actor has.
   * @type {number}
   */
  get minCircle() {
    return Math.min( ...this.disciplines.map( discipline => discipline.system.level ) );
  }

  /**
   * Returns the namegiver item if this actor has one (has to be of type "character" or "npc" for this).
   * @type {Item|undefined}
   */
  get namegiver() {
    return this.itemTypes.namegiver[0];
  }

  /**
   * Returns all reaction items of the given actor.
   * @returns {ItemEd[]} An array of reaction items
   */
  get reactions() {
    return /** @type {ItemEd} */ this.items.filter( item => item.system.rollType === "reaction" );
  }

  /**
   * A mapping of spell IDs to arrays of spell knacks that are linked to that spell.
   * @returns {{string: ItemEd}} A mapping of spell IDs to arrays of spell knacks.
   */
  get spellKnacksBySpellId() {
    const spellKnacks = {};
    for ( const spellKnack of this.itemTypes.spellKnack ) {
      const spellId = this.getSingleItemByEdid( spellKnack.system.sourceItem, "spell" )?.id;
      if ( !spellId ) continue;
      spellKnacks[spellId] ??= [];
      spellKnacks[spellId].push( spellKnack );
    }
    return spellKnacks;
  }

  /**
   * Checks if the actor is wearing any piece of armor that is part of a piecemeal armor set.
   * Piecemeal armor is a type of armor that is made up of several different pieces.
   * Returns true if the actor is wearing at least one piece of piecemeal armor, false otherwise.
   * @type {boolean}
   */
  get wearsPiecemealArmor() {
    return this.itemTypes.armor.some( armor => armor.system.piecemeal.isPiecemeal );
  }

  // endregion

  // region Life Cycle Events

  /** @inheritDoc */
  async _preCreate( data, options, user ) {
    if ( await super._preCreate( data, options, user ) === false ) return false;
    const prototypeToken = TOKEN?.prototypeToken?.[this.type] ?? {};
    await this.updateSource( { prototypeToken } );
  }

  // endregion

  // region Data Preparation

  /**
   * Extended to apply active effects to the item.
   * @inheritDoc
   */
  applyActiveEffects() {
    this.prepareDocumentDerivedData();
    if ( this.system.applyActiveEffects ) this.system.applyActiveEffects();
    else super.applyActiveEffects();
  }

  /**
   * Meant for data/fields that depend on information of embedded documents.
   * Apply transformations or derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   */
  prepareDocumentDerivedData() {
    if ( this.system.prepareDocumentDerivedData ) this.system.prepareDocumentDerivedData();
  }

  // endregion

  // region Getters

  /**
   * @description                       Returns all ammunition items of the given actor
   * @param {string} type               The type of ammunition to get
   * @returns {ItemEd[]}                An array of ammunition items
   */
  getAmmo ( type ) {
    return this.itemTypes.equipment.filter( item => item.system.ammunition.type === type );
  }

  /**
   * Returns an attack ability that matches the combat type and item status of the given weapon, if any.
   * @param {ItemEd} weapon The weapon to get the attack ability for.
   * @returns {ItemData|undefined} The attack ability item, or undefined if none was found.
   */
  getAttackAbilityForWeapon( weapon ) {
    const { wieldingType, weaponType, armorType } = weapon.system;
    return this.items.find(
      item => item.system.rollType === "attack"
        && item.system.rollTypeDetails?.attack?.weaponType === weaponType
        && item.system.rollTypeDetails?.attack?.weaponItemStatus.has( wieldingType )
        && item.system.difficulty?.target === armorType
    );
  }

  /**
   * Returns the discipline item that is associated with the given spell's spellcasting type.
   * @param {keyof typeof import("../config/magic.mjs").spellcastingTypes} spellcastingType The spellcasting type key (from config.spellcastingTypes).
   * @returns {ItemEd|null} The discipline item, or null if none was found.
   */
  getDisciplineForSpellcastingType( spellcastingType ) {
    const threadWeavingTalent = this.getThreadWeavingByCastingType( spellcastingType );
    if ( !threadWeavingTalent ) return null;

    return fromUuidSync( threadWeavingTalent.system.source?.class );
  }

  /**
   * Finds and returns this PC's class of the given type with the highest circle.
   * If multiple, only the first found will be returned.
   * @param {string} type The type of class to be searched for. One of discipline, path, questor.
   * @returns {Item} A discipline item with the highest circle.
   * @private
   */
  getHighestClass( type ) {
    return this.itemTypes[ type ].sort(     // sort descending by circle/rank
      ( a, b ) => a.system.level > b.system.level ? -1 : 1
    )[0];
  }

  /**
   * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
   * Returns an array of items that match a given EDID and optionally an item type.
   * @param {string} edid           The EDID of the item(s) which you want to retrieve
   * @param {string} [type]           Optionally, a type name to restrict the search
   * @returns {ItemEd[]|undefined}    An array containing the found items
   */
  getItemsByEdid( edid, type ) {
    const edidFilter = ( item ) => item.system.edid === edid;
    if ( !type ) return this.items.filter( edidFilter );

    const itemTypes = this.itemTypes;
    if ( !Object.hasOwn( itemTypes, type ) ) throw new Error( `Type ${ type } is invalid!` );

    return itemTypes[type].filter( edidFilter );
  }

  /**
   * Returns an array of items that match a given roll type.
   * @param {string} action The roll type to filter by, e.g. "attack", "spellcasting", etc.
   * @returns {ItemData[]} An array of items that match the given roll type.
   */
  getItemsByAction( action ) {
    return this.items.filter(
      item => item.system.rollType === action
    );
  }

  /**
   * Find all items that have a matrix.
   * @returns {ItemData[]} An array of items that have a matrix.
   */
  getMatrices() {
    return this.items.filter( item => item.system?.hasMatrix );
  }

  /**
   * Taken from the ({@link https://gitlab.com/peginc/swade/-/wikis/Savage-Worlds-ID|SWADE system}).
   * Fetch an item that matches a given EDID and optionally an item type.
   * @param {string} edid         The EDID of the item(s) which you want to retrieve
   * @param {string} [type]         Optionally, a type name to restrict the search
   * @returns {ItemEd|undefined}    The matching item, or undefined if none was found.
   */
  getSingleItemByEdid( edid, type ) {
    return this.getItemsByEdid( edid, type )[0];
  }

  /**
   * Returns the thread weaving ability item for the given spellcasting type.
   * @param {keyof typeof import("../config/magic.mjs").spellcastingTypes} [spellcastingType] The spellcasting type key (from {@link spellcastingTypes}), or none if this actor is a horror or spirit.
   * @returns {ItemEd|null} The thread weaving item, or null if none was found.
   */
  getThreadWeavingByCastingType( spellcastingType ) {
    if ( [ "horror", "spirit" ].includes( this.type ) ) {
      return this.getSingleItemByEdid(
        getSetting( "edidSpellcasting" )
      ) ?? this.itemTypes.power.find( power => power.system.rollType === "spellcasting" );
    }

    return this.getItemsByEdid(
      getSetting( "edidThreadWeaving" ),
    ).find(
      item => spellcastingType === item.system.rollTypeDetails?.threadWeaving?.castingType
    ) ?? this.items.find(
      item => item.system.rollType === "threadWeaving"
        && item.system.rollTypeDetails?.threadWeaving?.castingType === spellcastingType
    );
  }

  // endregion

  // region Checkers

  /**
   * Checks if this actor has at least one matrix that can hold the given spell.
   * @param {ItemEd} spell The spell to check for.
   * @returns {boolean} True if there is at least one matrix that has a level >= the spell's level, false otherwise.
   */
  hasMatrixForSpell( spell ) {
    return this.getMatrices().some(
      matrix => matrix.system.matrix.level >= spell.system.level
    );
  }

  /**
   * @param {('standard'|'blood'|'any')} [type] The type of wounds that is to be checked.
   * @returns {boolean} True if there is a positive amount of wounds of the given type marked on this actor, false otherwise.
   */
  hasWounds( type = "any" ) {
    const hasStandardWounds = this.system.characteristics.health.wounds > 0;
    const hasBloodWounds = this.system.characteristics.health.bloodMagic.wounds > 0;
    switch ( type ) {
      case "standard":
        return hasStandardWounds;
      case "blood":
        return hasBloodWounds;
      case "any":
        return hasStandardWounds || hasBloodWounds;
      default:
        return undefined;
    }
  }

  /**
   * @param {('standard'|'lethal'|'stun'|'blood'|'any')} [type] The type of damage that is to be checked. Standard
   * damage is any of either lethal or stun damage.
   * @returns {boolean} True if there is a positive amount of damage of the given type marked on this actor, false otherwise.
   */
  hasDamage( type = "any" ) {
    const hasLethalDamage = this.system.characteristics.health.damage.standard > 0;
    const hasStunDamage = this.system.characteristics.health.damage.stun > 0;
    const hasBloodDamage = this.system.characteristics.health.bloodMagic.damage > 0;
    switch ( type ) {
      case "standard":
        return hasLethalDamage || hasStunDamage;
      case "lethal":
        return hasLethalDamage;
      case "stun":
        return hasStunDamage;
      case "blood":
        return hasBloodDamage;
      case "any":
        return hasLethalDamage || hasStunDamage || hasBloodDamage;
      default:
        return undefined;
    }
  }

  // endregion

  // region Active Effects

  /**
   * Applies the given active effects to the actor.
   * @param {ActiveEffectData[]} effects The active effects to apply to the actor.
   * @returns {Promise<Document[]|*>} Returns the created active effects.
   */
  async createActiveEffects( effects ) {
    if ( !effects || effects.length === 0 ) return;
    return this.createEmbeddedDocuments( "ActiveEffect", effects );
  }

  /**
   * Groups the given effects by their change keys.
   * @param {EarthdawnActiveEffect[]} [effects] The effects to group by change key. If not given,
   * all effects of this actor are used.
   * @returns {Map<string, object>} A map of change keys to arrays of objects containing the effect, change,
   * source type, source uuid, and value.
   */
  getEffectsByChangeKey( effects ) {
    const effectsByChangeKey = new Map();

    for ( const effect of effects ) {
      for ( const change of effect.changes ) {
        if ( !effectsByChangeKey.has( change.key ) ) {
          effectsByChangeKey.set( change.key, [] );
        }
        effectsByChangeKey.get( change.key ).push( {
          effect,
          change,
          sourceType: effect.system.source?.documentOriginType,
          sourceUuid: effect.system.source?.documentOriginUuid,
          value:      Number( change.value ) || 0
        } );
      }
    }

    return effectsByChangeKey;
  }

  /**
   * @inheritDoc
   * @param {string} statusId           A status effect ID defined in CONFIG.statusEffects
   * @param {object} [options]          Additional options which modify how the effect is created
   * @param {boolean} [options.active]  Force the effect to be active or inactive regardless of its current state
   * @param {boolean} [options.overlay] Display the toggled effect as an overlay
   * @param {number} [options.levels]   A potential level increase.
   */
  async toggleStatusEffect( statusId, { active, overlay = false, levels = 1 } ) {
    // aggressive and defensive stance are mutually exclusive
    if ( statusId === "aggressive" || statusId === "defensive" ) {
      const other = statusId === "aggressive" ? "defensive" : "aggressive";
      if ( this.statuses.has( other ) ) await super.toggleStatusEffect( other, { active: false } );
    }

    // check for effects with levels
    const staticId = staticStatusId( statusId );
    const hasLevels = !!CONFIG.ED4E.STATUS_CONDITIONS[ statusId ]?.levels;
    const effect = this.effects.get( staticId );
    // eslint-disable-next-line no-param-reassign
    active ??= !effect || ( effect && hasLevels );

    if ( active ) {
      if ( effect && hasLevels ) return effect.system.increase( levels );
      else if ( hasLevels && ( levels > 1 ) ) {
        const ActiveEffectCls = foundry.utils.getDocumentClass( "ActiveEffect" );
        const effect = await ActiveEffectCls.fromStatusEffect( statusId );
        const data = foundry.utils.mergeObject( effect.toObject(), {
          _id:             staticId,
          "system.levels": levels,
        } );
        return ActiveEffectCls.create( data, { keepId: true } );
      }
    } else {
      const decrease = effect && hasLevels && ( effect.system.level > 1 );
      if ( decrease ) return effect.system.decrease();
    }
    return super.toggleStatusEffect( statusId, { active, overlay } );
  }

  async updateClassEffectStates() {
    const classEffects = this.classEffects;
    if ( classEffects.length === 0 ) return;

    const effectsByChangeKey = this.getEffectsByChangeKey( classEffects );

    const updates = [];

    for ( const effectData of effectsByChangeKey.values() ) {
      // Separate by source type
      const disciplines = effectData.filter( e => e.sourceType === "discipline" );
      const questors = effectData.filter( e => e.sourceType === "questor" );
      const paths = effectData.filter( e => e.sourceType === "path" );

      // Find the highest discipline bonus
      let highestDisciplineValue = 0;
      let disciplinePathBonuses = new Map(); // Track path bonuses per discipline

      // Calculate discipline base values and associated path bonuses
      for ( const disciplineData of disciplines ) {
        if ( disciplineData.value > highestDisciplineValue ) {
          highestDisciplineValue = disciplineData.value;
        }
      }

      // Add path bonuses to their source disciplines
      for ( const pathData of paths ) {
        const pathItem = await fromUuid( pathData.sourceUuid );
        if ( pathItem?.system.sourceDiscipline ) {
          const sourceDisciplineUuid = pathItem.system.sourceDiscipline;
          if ( !disciplinePathBonuses.has( sourceDisciplineUuid ) ) {
            disciplinePathBonuses.set( sourceDisciplineUuid, 0 );
          }
          disciplinePathBonuses.set( sourceDisciplineUuid,
            disciplinePathBonuses.get( sourceDisciplineUuid ) + pathData.value );
        }
      }

      // Find the discipline with the highest total (base + paths)
      let highestTotalDisciplinePathValue = 0;
      let winningDisciplineUuid = null;

      for ( const disciplineData of disciplines ) {
        const pathBonus = disciplinePathBonuses.get( disciplineData.sourceUuid ) || 0;
        const totalValue = disciplineData.value + pathBonus;
        if ( totalValue > highestTotalDisciplinePathValue ) {
          highestTotalDisciplinePathValue = totalValue;
          winningDisciplineUuid = disciplineData.sourceUuid;
        }
      }

      // Find the highest questor bonus
      let highestQuestorValue = 0;
      let highestQuestorEffect = null;
      for ( const questorData of questors ) {
        if ( questorData.value > highestQuestorValue ) {
          highestQuestorValue = questorData.value;
          highestQuestorEffect = questorData.effect;
        }
      }

      const shouldBeActive = new Set();

      // Only the highest between discipline total and questor applies
      if ( ( highestTotalDisciplinePathValue >= highestQuestorValue ) && winningDisciplineUuid ) {
        // Discipline wins - enable winning discipline and its paths
        for ( const disciplineData of disciplines ) {
          if ( disciplineData.sourceUuid === winningDisciplineUuid ) {
            shouldBeActive.add( disciplineData.effect.id );
          }
        }
        // Enable paths for the winning discipline
        for ( const pathData of paths ) {
          const pathItem = await fromUuid( pathData.sourceUuid );
          if ( pathItem?.system.sourceDiscipline === winningDisciplineUuid ) {
            shouldBeActive.add( pathData.effect.id );
          }
        }
      } else if ( highestQuestorEffect ) {
        // Questor wins
        shouldBeActive.add( highestQuestorEffect.id );
      }

      for ( const effectData of classEffects ) {
        const shouldEnable = shouldBeActive.has( effectData.id );
        if ( effectData.disabled === shouldEnable ) {
          updates.push( {
            _id:      effectData.id,
            disabled: !shouldEnable
          } );
        }
      }
    }

    if ( updates.length > 0 ) {
      await this.updateEmbeddedDocuments( "ActiveEffect", updates );
    }
  }

  // endregion

  // region Damage & Combat

  /**
   * Take the given amount of strain as damage.
   * @param {number} strain             The amount of strain damage to take
   * @param {ItemEd} [strainOrigin]     The ability causing the strain
   * @returns {Promise<{damageTaken: number, knockdownTest: boolean}>} The result of {@link takeDamage}.
   */
  async takeStrain( strain, strainOrigin ) {
    if ( !strain ) throw new Error( "ActorEd.takeStrain: No strain amount provided." );
    return this.takeDamage( strain, {
      isStrain:     true,
      damageType:   "standard",
      ignoreArmor:  true,
      strainOrigin: strainOrigin,
    } );
  }

  /**
   * Only for actors of type Sentient (character, npc, creature, spirits, horror, dragon). Take the given amount of
   * damage according to the parameters.
   * @param {number} amount                                             The unaltered amount of damage this actor should take.
   * @param {object} [options]                                          The following options for taking damage:
   * @param {boolean} [options.isStrain]                                Whether this damage is strain or not.
   * @param {("standard"|"stun")} [options.damageType]                  The type of damage. One of either 'standard' or 'stun'.
   * @param {("physical"|"mystical")} [options.armorType]               The type of armor that protects from this damage, one of either
   *                                                                    'physical', 'mystical', or 'none'.
   * @param {boolean} [options.ignoreArmor]                             Whether armor should be ignored when applying this damage.
   * @param {boolean} [options.naturalArmorOnly]                        Whether only natural armor should be considered when applying this damage (this is only relevant for mystical damage).
   * @param {EdRoll|undefined} [options.damageRoll]                     The roll that caused this damage or undefined if not caused by one.
   * @param {ItemEd} [options.strainOrigin]                             The ability causing the strain
   * @returns {Promise<{damageTaken: number, knockdownTest: boolean}>}
   *                                                                    An object containing:
   *                                                                    - `damageTaken`: the actual amount of damage this actor has taken after armor
   *                                                                    - `knockdownTest`: whether a knockdown test should be made.
   */
  async takeDamage( amount, options = {
    isStrain:         false,
    damageType:       "standard",
    armorType:        "physical",
    ignoreArmor:      false,
    naturalArmorOnly: false,
    damageRoll:       undefined,
    strainOrigin:     undefined
  } ) {
    const { isStrain, damageType, armorType, ignoreArmor, damageRoll, strainOrigin } = options;
    const { armor, health } = this.system.characteristics;
    const armorValue = armor[armorType]?.[options.naturalArmorOnly ? "baseValue" : "value"];
    const damageTaken = amount - ( ignoreArmor || !armorType ? 0 : armorValue );
    const newDamage = health.damage[damageType] + damageTaken;

    const updates = { [`system.characteristics.health.damage.${ damageType }`]: newDamage };

    // First recovery test after taking stun damage can be done with willpower bonus
    if ( damageType === "stun" ) updates["system.characteristics.recoveryTestsResource.stunRecoveryAvailable"] = true;

    if ( damageTaken >= health.woundThreshold && !options.isStrain ) {
      switch ( damageType ) {
        case "standard":
          updates["system.characteristics.health.wounds"] = health.wounds + 1;
          break;
        case "stun":
          updates["system.condition.harried"] = true;
          break;
        // Add more cases here for other damage types
      }
    }

    await this.update( updates );

    let chatFlavor;
    chatFlavor = game.i18n.format( !strainOrigin ? "ED.Chat.Flavor.takeDamage" : "ED.Chat.Flavor.takeStrainDamage", {
      ability: strainOrigin?.name,
      actor:   this.name,
      amount:  damageTaken,
    } );

    let messageData = {
      user:    game.user._id,
      speaker: ChatMessage.getSpeaker( { actor: this.actor } ),
      content: chatFlavor
    };
    if ( ( !damageRoll && isStrain === false ) || ( isStrain && strainOrigin ) ) {
      await ChatMessage.create( messageData );
    }

    const knockdownTest = !this.system.condition.knockedDown && damageTaken >= health.woundThreshold + 5 && !options.isStrain;
    if ( knockdownTest ) await this.knockdownTest( damageTaken );

    return {
      damageTaken,
      knockdownTest,
    };
  }

  async attack( attackType ) {
    const attackWorkflow = new AttackWorkflow(
      this,
      {
        attackType,
      },
    );
    return this.processRoll(
      await attackWorkflow.execute()
    );
  }

  /**
   *
   * @returns {ItemEd|undefined} The weapon that was drawn or undefined if no weapon was drawn.
   */
  async drawWeapon() {
    const weapon = await fromUuid( await this._promptFactory.getPrompt( "drawWeapon" ) );
    if ( weapon ) await weapon.update( { "system.itemStatus": weapon.system.wieldingType } );
    return weapon;
  }

  async switchWeapon( equippedWeapon ) {
    ui.notifications.info( game.i18n.localize( "ED.Notifications.Info.switchWeapon" ) );
    if ( equippedWeapon ) await this._updateItemStates( equippedWeapon, "carried" );
    else this.itemTypes.weapon.forEach( weapon => this._updateItemStates( weapon, "carried" ) );
    return this.drawWeapon();
  }

  /**
   * Returns the knockdown ability item for this actor, if any.
   * @returns {Promise<ItemEd|undefined>} The knockdown ability item, or undefined if none was found.
   */
  async knockdownAbility() {
    const knockdownAbility = await fromUuid(
      await this.getPrompt( "knockdown" )
    );
    return knockdownAbility;
  }
  
  /**
   * Perform a knockdown test for this actor.
   * @param {number} damageTaken The amount of damage that triggered the knockdown test.
   * @param {object} [options] Additional options for the knockdown test.
   * @returns {Promise<EdRoll|null>} The result of the knockdown test roll, or null if the test was not performed.
   */
  async knockdownTest( damageTaken, options = {} ) {
    const knockdownWorkflow = new KnockdownWorkflow(
      this,
      {
        damageTaken
      },
    );
    return knockdownWorkflow.execute();
  }

  async jumpUp( options = {} ) {
    if ( !this.system.condition.knockedDown ) {
      ui.notifications.warn( "LocalizeLabel: You are not knocked down.", { localize: true } );
      return;
    }
    const { attributes } = this.system;
    let devotionRequired = false;
    let strain = 2;
    let jumpUpStep = attributes.dex.step;

    const selectedAbility = await fromUuid(
      await this.getPrompt( "jumpUp" )
    );

    if ( selectedAbility ) {
      const { attribute, level, devotionRequired: devotion, strain: abilityStrain } = selectedAbility.system;
      jumpUpStep = ( attributes[attribute]?.step || jumpUpStep ) + level;
      devotionRequired = !!devotion;
      strain = { base: abilityStrain };
    }

    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.jumpUp", {
      sourceActor: this.name,
      step:        jumpUpStep
    } );

    const difficulty = { base: 6 };
    const jumpUpStepFinal = { base: jumpUpStep };
    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "action",
        rollType:         "jumpUp",
        strain:           strain,
        target:           difficulty,
        step:             jumpUpStepFinal,
        devotionRequired: devotionRequired,
        chatFlavor:       chatFlavor
      },
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );

    this.processRoll( roll );
  }

  // endregion

  // region Inventory

  /**
   *
   * @param {object}    itemToUpdate    The item to update
   * @param {string}    nextStatus      The next status of the item
   * @returns {Promise<ItemEd[]>}       The updated items
   */
  async _updateItemStates( itemToUpdate, nextStatus ) {
    const updates = [];
    const enforceLivingArmor = game.settings.get( "ed4e", "enforceLivingArmor" );
    const originalItemUpdate = { _id: itemToUpdate.id, "system.itemStatus": nextStatus };
    const equippedWeapons = this.itemTypes.weapon.filter(
      weapon => [ "mainHand", "offHand", "twoHands" ].includes( weapon.system.itemStatus )
    );
    const addUnequipItemUpdate = ( itemType, statuses ) => {
      this.itemTypes[itemType].filter(
        item => statuses.includes( item.system.itemStatus )
      ).forEach(
        item => updates.push( { _id: item.id, "system.itemStatus": "carried" } )
      );
    };

    switch ( itemToUpdate.type ) {
      case "armor":
        if ( nextStatus === "equipped" ) {
          // check if namegiver item allows only living armor/shields
          if ( this.namegiver?.system.livingArmorOnly && itemToUpdate.system.isLiving === false && enforceLivingArmor === true ) {
            ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.livingArmorOnly" ) );
            break;
          }
          if ( itemToUpdate.system.piecemeal?.isPiecemeal ) {
            if ( !this.wearsPiecemealArmor ) {
              addUnequipItemUpdate( "armor", [ "equipped" ] );
            } else {
              // A complete set of piecemeal armor can have up to 5 size points. Armor pieces come in three sizes and
              // cost a corresponding number of points: large (3), medium (2), and small (1). A set of piecemeal armor
              // cannot have more than one size of a particular type.
              const equippedArmor = this.itemTypes.armor.filter( armor => armor.system.itemStatus === "equipped" );
              const sameSizePiece = equippedArmor.find( armor => armor.system.piecemeal.size === itemToUpdate.system.piecemeal.size );
              if ( sameSizePiece ) {
                updates.push( { _id: sameSizePiece.id, "system.itemStatus": "carried" } );
              } else {
                // Check if the total size of the equipped armor pieces and the size of the item to update exceeds the
                // maximum allowed size for a piecemeal armor set (5 size points). If it does, break the operation to
                // prevent equipping the item.
                // eslint-disable-next-line max-depth
                if (
                  sum( equippedArmor.map( armor => armor.system.piecemeal.size ) )
                  + itemToUpdate.system.piecemeal.size > 5
                ) {
                  ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.piecemealArmorSizeExceeded" ) );
                  break;
                }
              }
              const equippedNonPiecemealArmor = this.itemTypes.armor.find( armor => armor.system.itemStatus === "equipped" && !armor.system.piecemeal?.isPiecemeal );
              if ( equippedNonPiecemealArmor ) {
                updates.push( { _id: equippedNonPiecemealArmor.id, "system.itemStatus": "carried" } );
              }
            }
          } else {
            // Unequip other armor
            if ( nextStatus === "equipped" ) addUnequipItemUpdate( "armor", [ "equipped" ] );
          }
        }
        updates.push( originalItemUpdate );
        break;
      case "weapon":

        switch ( nextStatus ) {
          case "twoHands": {
            const equippedShield = this.itemTypes.shield.find( shield => shield.system.itemStatus === "equipped" );
            addUnequipItemUpdate( "weapon", [ "mainHand", "offHand", "twoHands" ] );
            if ( !( itemToUpdate.system.isTwoHandedRanged && equippedShield?.system?.bowUsage ) ) addUnequipItemUpdate( "shield", [ "equipped" ] );
            break;
          }
          case "mainHand":
          case "offHand": {
            addUnequipItemUpdate( "weapon", [ nextStatus, "twoHands" ] );
            break;
          }
          case "tail": {
            addUnequipItemUpdate( "weapon", [ "tail" ] );
            break;
          }
        }

        updates.push( originalItemUpdate );
        break;
      case "shield":
        if ( nextStatus === "equipped" ) {
          // check if namegiver item allows only living armor/shields
          if ( this.namegiver?.system.livingArmorOnly && itemToUpdate.system.isLiving === false && enforceLivingArmor === true  ) {
            ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.livingArmorOnly" ) );
            break;
          }
          // Unequip other shields
          addUnequipItemUpdate( "shield", [ "equipped" ] );
          // If there's a bow and the shield allows it, no need to unequip the weapon
          const bowAllowed = equippedWeapons[0]?.system.isTwoHandedRanged && itemToUpdate.system.bowUsage;
          // If there's a two-handed weapon or two one-handed weapons, unequip one
          const unequipSomeWeapon = equippedWeapons.some( weapon => weapon.system.itemStatus === "twoHands" ) || equippedWeapons.length > 1;
          if ( !bowAllowed && unequipSomeWeapon ) {
            // Prefer to unequip off-hand weapon, if available
            const weaponToUnequip = equippedWeapons.find( weapon => weapon.system.itemStatus === "offHand" ) || equippedWeapons[0];
            updates.push( { _id: weaponToUnequip.id, "system.itemStatus": "carried" } );
          }
        }

        updates.push( originalItemUpdate );
        break;
      case "equipment":
      default:
        updates.push( originalItemUpdate );
        break;
    }
    return this.updateEmbeddedDocuments( "Item", updates );
  }

  // endregion
  
  /**
   * Retrieves a specific prompt based on the provided prompt type.
   * This method delegates the call to the `_promptFactory` instance's `getPrompt` method,
   * effectively acting as a proxy to access various prompts defined within the factory.
   * @param {( "recovery" | "takeDamage" | "jumpUp" | "knockdown" )} promptType - The type of prompt to retrieve.
   * @returns {Promise<any>} - A promise that resolves to the specific prompt instance or logic
   * associated with the given `promptType`. The exact return type depends on promptType.
   */
  async getPrompt( promptType ) {
    return this._promptFactory.getPrompt( promptType );
  }

  // region LP Tracking

  /**
   * @description                                 Add a new LP transaction to the actor's system data
   * @param {('earnings'|'spendings')} type       Type of the transaction
   * @param {object} transactionData   Data of the transaction
   * @returns {ActorEd}                           The updated actor data
   * @see                             ../../documentation/User Functions/UF_LpTracking-addLpTransaction.md
   */
  async addLpTransaction( type, transactionData ) {
    const oldTransactions = this.system.lp[type];
    const TransactionModel = type === "earnings" ? LpEarningTransactionData : LpSpendingTransactionData;
    const transaction = new TransactionModel( transactionData );

    return this.update( {
      [`system.lp.${type}`]: oldTransactions.concat( [ transaction ] )
    } );
  }

  /**
   * Triggers a prompt for updating the Legend Point (LP) history of the actor.
   * Updates the LPTrackingData of the actor based on the input from the prompt.
   * @returns {Promise<Actor>} A Promise that resolves to the updated Actor instance.
   * @see ../../documentation/User Functions/UF_LpTracking-legendPointHistory.md
   */
  async legendPointHistory() {
    const lpUpdateData = await LegendPointHistory.waitPrompt(
      new LpTrackingData( this.system.lp.toObject() ),
      { actor: this }
    );
    return this.update( { system: { lp: lpUpdateData } } );
  }

  // endregion

  // region Magic

  /**
   * Cast a spell from a matrix.
   * @param {ItemEd} matrix - The UUID of the matrix to cast the spell from.
   * @param {ItemEd} spell - The UUID of the spell to cast.
   * @returns {Promise<*>} A promise that resolves when the spellcasting workflow execution is complete.
   */
  async castFromMatrix( matrix, spell ) {
    const castingWorkflow = new SpellcastingWorkflow(
      this,
      {
        castingMethod: "matrix",
        matrix,
        spell,
      } );

    return castingWorkflow.execute();
  }

  /**
   * Cast a spell using the spellcasting workflow.
   * @param {ItemEd} spell - The spell to cast.
   * @returns {Promise<*>} A promise that resolves when the spellcasting workflow execution is complete.
   */
  async castSpell( spell ) {
    const castingWorkflow = new SpellcastingWorkflow(
      this,
      {
        spell,
        stopOnWeaving: false,
      }
    );

    return castingWorkflow.execute();
  }

  /**
   * Remove all spells from all matrices of this actor.
   * @returns {Promise<Document|undefined>} The array of changed matrix items, or undefined if nothing changed.
   */
  async emptyAllMatrices() {
    return Promise.all(
      this.getMatrices().map( matrix => matrix.system.removeSpells() )
    );
  }

  /**
   * Perform the karma ritual for this actor to set the current karma points to maximum.
   * Only to be used for namegivers with a discipline.
   * @returns {Promise<ActorEd>} The updated actor instance, or `undefined` if not updated.
   */
  async karmaRitual() {
    return this.update( { "system.karma.value": this.system.karma.max } );
  }

  /**
   * Selects a grimoire to attune a given spell to.
   * @param {ItemEd} [spell] - The spell to attune to a grimoire. If not provided, all grimoires will be selectable.
   * @returns {Promise<Document|null>} A promise that resolves to the selected grimoire item, or null if no grimoire was selected.
   */
  async selectGrimoire( spell ) {
    let availableGrimoires = this.items.filter( item => item.system.isGrimoire );
    if ( spell ) {
      availableGrimoires = availableGrimoires.filter(
        grimoire => grimoire.system.grimoire.spells.has( spell.uuid )
      );
    }

    if ( availableGrimoires.length === 0 ) {
      ui.notifications.error(
        game.i18n.localize( "ED.Notifications.Error.noGrimoiresAvailableToAttune" ),
      );
      return null;

    }

    return fromUuid(
      await DialogEd.waitButtonSelect(
        availableGrimoires,
        "ed-button-select-grimoire",
        {
          title: game.i18n.localize( "ED.Dialogs.Title.selectGrimoireToAttune" ),
        },
      ),
    );
  }

  /**
   * Reattunes spells by executing an attunement workflow with the provided matrix.
   * @param {string} [matrixUuid] - Optionally the uuid of a matrix that should be focused in the prompt.
   * @returns {Promise<any>} A promise that resolves when the attunement workflow execution is complete.
   */
  async reattuneSpells( matrixUuid ) {
    const attuneMatrixWorkflow = new AttuneMatrixWorkflow(
      this,
      {
        firstMatrix: matrixUuid,
      },
    );

    return attuneMatrixWorkflow.execute();
  }

  // endregion

  // region Rolls

  /**
   * @description                       Attribute Roll.
   * @param {string} attributeId        The 3-letter id for the attribute (e.g. "per").
   * @returns {Promise<any>}            A promise that resolves when the attunement workflow execution is complete.
   */
  async rollAttribute( attributeId ) {

    const attributeWorkflow = new AttributeWorkflow(
      this,
      {
        attributeId: attributeId,
      }
    );
    return attributeWorkflow.execute();
  }

  /**
   * @description                       Half magic Roll.
   * @param {string} attributeId        The 3-letter id for the attribute (e.g. "per").
   * @returns {Promise<any>}            A promise that resolves when the attunement workflow execution is complete.
   */
  async rollHalfMagic( attributeId ) {
    const halfMagicWorkflow = new HalfMagicWorkflow(
      this,
      {
        attributeId: attributeId,
      }
    );
    return halfMagicWorkflow.execute();
  }

  /**
   * @description                       Substitute Roll.
   * @param {string} attributeId        The 3-letter id for the attribute (e.g. "per").
   * @returns {Promise<any>}            A promise that resolves when the attunement workflow execution is complete.
   */
  async rollSubstitute( attributeId ) {
    const substituteWorkflow = new SubstituteWorkflow(
      this,
      {
        attributeId: attributeId,
      }
    );
    return substituteWorkflow.execute();
  }

  /**
   * @summary                     Equipment rolls are a subset of Action test resembling non-attack actions like Talents, skills etc.
   * @description                 Roll an Equipment item. use {@link RollPrompt} for further input data.
   * @param {ItemEd} equipment    Equipment must be of type EquipmentTemplate & TargetingTemplate
   * @param {object} options      Any additional options for the {@link EdRoll}.
   * @returns {Promise<EdRoll>}   The processed Roll.
   */
  async rollEquipment( equipment, options = {} ) {
    const arbitraryStep = equipment.system.usableItem.arbitraryStep;
    const difficulty = equipment.system.getDifficulty();
    if ( !difficulty ) {
      throw new Error( "ED | ActorEd.rollEquipment | Ability is not part of Targeting Template, please call your Administrator!" );
    }

    const difficultyFinal = { base: difficulty };
    const chatFlavor = game.i18n.format( "ED.Chat.Flavor.rollEquipment", {
      sourceActor: this.name,
      equipment:   equipment.name,
      step:        arbitraryStep
    } );

    const arbitraryFinalStep = { base: arbitraryStep };
    const edRollOptions = EdRollOptions.fromActor(
      {
        testType:         "action",
        rollType:         "arbitrary",
        strain:           0,
        target:           difficultyFinal,
        step:             arbitraryFinalStep,
        devotionRequired: false,
        chatFlavor:       chatFlavor
      },
      this
    );
    const roll = await RollPrompt.waitPrompt( edRollOptions, options );
    return this.processRoll( roll, { rollToMessage: true } );
  }

  /**
   * @description                     The sequence that is rotated
   * @param {object}    itemId        Id of the item to rotate the status of
   * @param {boolean}   backwards     Whether to rotate the status backwards
   * @returns {Promise<ItemEd[]>}       The updated items
   */
  async rotateItemStatus( itemId, backwards = false ) {
    const item = this.items.get( itemId );
    const nextStatus = backwards ? item.system.previousItemStatus : item.system.nextItemStatus;
    return this._updateItemStates( item, nextStatus );
  }

  async rollRecovery( recoveryMode ) {
    const recoveryWorkflow = new RecoveryWorkflow(
      this,
      {
        recoveryMode: recoveryMode,
      },
    );
    return recoveryWorkflow.execute();
  }

  /**
   * Rolls unarmed damage for this actor.
   * @param {object} [rollOptionsData] Additional data for the roll options, such as extra dice or chat flavor.
   * @param {object} [rollOptionsData.attackRoll] The attack roll triggering this damage roll. Necessary to determine
   * bonus steps from extra successes.
   * @returns {Promise<EdRoll>} The processed damage roll.
   * @see {@link DamageRollOptions} for more information on the roll options.
   */
  async rollUnarmedDamage( rollOptionsData = {} ) {
    const roll = await RollPrompt.waitPrompt(
      DamageRollOptions.fromActor(
        {
          damageSourceType: "unarmed",
          sourceDocument:   this,
          extraDice:        {},
          chatFlavor:       game.i18n.format( "ED.Chat.Flavor.rollUnarmedDamage", {sourceActor: this.name} ),
          ...rollOptionsData,
        },
        this,
      ),
      {
        rollData: this,
      }
    );

    return this.processRoll( roll, { rollToMessage: true } );
  }

  /** @inheritDoc */
  getRollData() {
    let rollData;
    rollData = { ...super.getRollData() };
    if ( this.system.getRollData ) Object.assign( rollData, this.system.getRollData() );

    rollData.flags = { ...this.flags };
    rollData.name = this.name;

    return rollData;
  }

  /**
   * Evaluate a Roll and process its data in this actor. This includes (if applicable):
   * <ul>
   *     <li>taking strain damage</li>
   *     <li>reducing resources (karma, devotion)</li>
   *     <li>recover from damage</li>
   * </ul>
   * @param {EdRoll} roll The prepared Roll.
   * @param {object} [options] Options for processing the roll.
   * @returns {EdRoll}    The processed Roll.
   */
  async processRoll( roll, options = {} ) {
    if ( !roll ) {
      // No roll available, do nothing.
      return;
    }

    return RollProcessor.process( roll, this, options );
  }

  // endregion

  /**
   * Use a resource (karma, devotion) by deducting the amount. This will always happen, even if not enough is available.
   * Look out for the return value to see if that was the case.
   * @param {"karma"|"devotion"|"recovery"} resourceType The type of resource to use. One of either "karma" or "devotion".
   * @param {number} amount                   The amount to use of the resource.
   * @returns {boolean}                       Returns `true` if the full amount was deducted (enough available), 'false'
   *                                          otherwise.
   */
  async useResource( resourceType, amount ) {
    const available = this.system[resourceType].value;
    await this.update( { [`system.${ resourceType }.value`]: ( available - amount ) } );
    return amount <= available;
  }

  // region Migrations
  static migrateData( source ) {
    // Skip migration for partial updates or non-complete documents
    // A complete document should have fundamental properties like name, type, etc.
    const isPartialUpdate = !source.name || 
                          !source.type || 
                          ( source.system && Object.keys( source.system ).length <= 2 );
                          
    // Skip if this looks like a partial update rather than a complete document
    if ( isPartialUpdate ) {
      return source;
    }
    // Step 1: Apply Foundry's core migration
    const newSource = super.migrateData( source );

    // Step 2: Apply our comprehensive migration system to the already-migrated source
    const migrationResult = MigrationManager.migrateDocument( newSource, "Actor" );

    // Step 3: ALSO modify the original source...
    if ( migrationResult.system ) {
      source.system = migrationResult.system;
    }

    if ( migrationResult.type ) {
      source.type = migrationResult.type;
    }

    if ( migrationResult.img ) {
      source.img = migrationResult.img;
    }
    
    // Step 4: Return the final migrated result
    return migrationResult;
  }
  // endregion
}
