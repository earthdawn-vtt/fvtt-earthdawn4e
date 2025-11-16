import NamegiverTemplate from "./templates/namegiver.mjs";
import { getArmorFromAttribute, getAttributeStep, getDefenseValue, getSingleGlobalItemByEdid, mapObject, sum, sumProperty } from "../../utils.mjs";
import CharacterGenerationPrompt from "../../applications/actor/character-generation-prompt.mjs";
import LpTrackingData from "../advancement/lp-tracking.mjs";
import ActorEd from "../../documents/actor.mjs";
import ED4E from "../../config/_module.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import { getSetting } from "../../settings.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

const fUtils = foundry.utils;

/**
 * System data definition for PCs.
 * @mixin
 * @property {number} initialValue      initial Value will only be affected by character generation
 * @property {number} value             value is the one shown. baseValue + modifications
 * @property {number} timesIncreased    attribute increases
 */
export default class PcData extends NamegiverTemplate {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    const superSchema = super.defineSchema();
    this.mergeSchema( superSchema.attributes.model.fields,  {
      initialValue: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  10,
        integer:  true,
        positive: true
      } ),
      timesIncreased: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        max:      3,
        step:     1,
        initial:  0,
        integer:  true
      } ),
      value: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
        positive: true,
      } ),
    } );

    this.mergeSchema( superSchema, {
      durabilityBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        initial:  0,
        integer:  true,
      } ),
      lp: new foundry.data.fields.EmbeddedDataField(
        LpTrackingData,
        {
          required: true,
          initial:  new LpTrackingData()
        },
      ),
    } );
    return superSchema;
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Actor.Pc",
  ];

  /** @inheritDoc */
  static metadata = Object.freeze( fUtils.mergeObject(
    super.metadata,
    {
      type: "pc",
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Getters

  /**
   * Get the field paths for all attribute values.
   * @type {string[]}
   */
  get _attributeValueKeys() {
    return Object.keys( ED4E.attributes ).map( key => `system.attributes.${ key }.value` );
  }

  /**
   * Get the durability bonus based on the highest durability item. Includes the durability bonus from active effects,
   * e.g. from group threads.
   * @type {number}
   */
  get #durabilityUnconsciousness(){
    const durabilityItems = this.parent.durabilityItems;
    if ( !durabilityItems.length ) return 0;

    const durabilityByCircle = {};
    const maxLevelDurabilityItem = durabilityItems.reduce(
      ( max, item ) => (
        item.system.level > max.system.level
        || ( item.system.level === max.system.level && item.system.durability > max.system.durability )
      ) ? item : max,
      { system: { level: 0 } }
    );
    const maxLevel = maxLevelDurabilityItem?.system?.level ?? 0;

    // Iterate through levels from 1 to the maximum level
    for ( let currentLevel = 1; currentLevel <= maxLevel; currentLevel++ ) {
      // Find the maximum durability for the current level
      durabilityByCircle[currentLevel] = durabilityItems.reduce( ( max, item ) => {
        return ( currentLevel <= item.system.level && item.system.durability > max )
          ? item.system.durability
          : max;
      }, 0 );
    }
    return sum( Object.values( durabilityByCircle ) ) + ( this.durabilityBonus * maxLevelDurabilityItem.system.durability );
  }

  // endregion

  // region Character Generation

  /**
   *
   * @returns {Promise<ActorEd|void>} The newly created actor or `undefined` if the generation was canceled.
   */
  static async characterGeneration () {
    const generation = await CharacterGenerationPrompt.waitPrompt();
    if ( !generation ) return;

    const attributeData = mapObject(
      await generation.getFinalAttributeValues(),
      ( attribute, value ) => [ attribute, {initialValue: value} ]
    );
    const additionalKarma = generation.availableAttributePoints;

    const newActor = await ActorEd.create( {
      name:   generation.name,
      type:   "character",
      system: {
        attributes: attributeData,
        karma:      {
          freeAttributePoints: additionalKarma
        },
        languages: generation.languages
      }
    } );

    const namegiverDocument = await generation.namegiverDocument;
    const classDocument = await generation.classDocument;
    const allAbilityDocuments = await generation.abilityDocuments;

    // Filter abilities: include if level > 0 OR if it's an other ability (includes namegiver talents)
    const abilities = allAbilityDocuments
      .filter( documentData =>
        documentData.system.level > 0 || documentData.system.talentCategory === "other"
      )
      .map(
        documentData => {
          if ( documentData.type !== "specialAbility" ) {
            documentData.system.source ??= {};
            documentData.system.source.class ??= classDocument.uuid;
          }
          return documentData;
        }
      );

    if ( classDocument.type === "questor" ) {
      const edidQuestorDevotion = getSetting( "edidQuestorDevotion" );

      if ( !abilities.find( item => item.system.edid === edidQuestorDevotion ) ) {

        let questorDevotion = await getSingleGlobalItemByEdid( edidQuestorDevotion, "devotion" );
        questorDevotion ??= await Item.create( ED4E.documentData.Item.devotion.questor );

        await questorDevotion.update( {
          system: {
            edid:  edidQuestorDevotion,
            level: 1,
          },
        } );

        abilities.push( questorDevotion );
      }
    }
    const spellDocuments = await generation.spellDocuments;

    const equipmentUUIDs = await generation.equipment;
    const equipmentDocuments = [];

    for ( const uuid of equipmentUUIDs ) {
      if ( uuid !== null ) {
        const equipmentDocument = await fromUuid( uuid );
        if ( equipmentDocument ) {
          equipmentDocuments.push( equipmentDocument.toObject() );
        }
      }
    }

    await newActor.createEmbeddedDocuments( "Item", [
      namegiverDocument,
      classDocument,
      ...abilities,
      ...spellDocuments,
      ...equipmentDocuments
    ] );

    const disciplineAfterCreation = newActor.disciplines[0];
    if ( disciplineAfterCreation ) {
      for ( const talent of newActor.itemTypes.talent ) {
        if ( talent.system.source.class === classDocument.uuid ) await talent.update( {
          "system.source": {
            "class":   disciplineAfterCreation.uuid,
            "atLevel": 1
          }
        } );
      }
    }

    // set the class level to 1 no matter of the compendium items level
    const classAfterCreation = newActor.classes[0];
    await classAfterCreation.update( {
      system: {
        level: 1,
      },
    } );

    // If this is a questor class, set the questorDevotion field to the devotion UUID
    if ( classAfterCreation.type === "questor" ) {
      const edidQuestorDevotion = getSetting( "edidQuestorDevotion" );
      const questorDevotionItem = newActor.items.find( item =>
        item.type === "devotion" && item.system.edid === edidQuestorDevotion
      );

      if ( questorDevotionItem ) {
        await classAfterCreation.update( {
          "system.questorDevotion": questorDevotionItem.uuid
        } );
      }
    }

    await newActor.sheet.render( true, {focus: true} );

    return newActor;
  }

  // endregion

  // region LP Tracking

  /**
   * Increase an attribute value of this actor.
   * @param {keyof typeof ED4E.attributes} attribute  The attribute to increase in the 3-letter abbreviation form as
   *                                                  used in {@link ED4E.attributes}.
   * @param {"free"|"spendLp"} [useLp]                Whether to use legend points for the increase. If `undefined`,
   *                                                  a prompt will be shown.
   * @param {boolean} [onCircleIncrease]              Whether this increase is due to a circle increase, i.e.
   *                                                  the cost is according to the given setting.
   * @returns {Promise<void>}
   */
  async increaseAttribute( attribute, useLp, onCircleIncrease = false ) {
    const actor = this.parent;
    const attributeField = this.attributes[attribute];
    if ( !actor || !attributeField ) throw new Error(
      `ED4E | Cannot increase attribute "${attribute}" for actor "${actor.name}" (${actor.id}).`
    );

    const currentIncrease = attributeField.timesIncreased;
    if ( currentIncrease >= 3 ) {
      ui.notifications.warn(
        game.i18n.localize( `X.Localize: Cannot increase attribute "${attribute}" for actor "${actor.name}" (${actor.id}). Maximum increase reached.` )
      );
      return;
    }

    const attributeEnhanceStep = getAttributeStep( attributeField.value + 1 ) > attributeField.step ? attributeField.step + 1 : attributeField.step;
    const rule = game.settings.get( "ed4e", "lpTrackingAttributes" );
    const lpCost = onCircleIncrease && rule === "freePerCircle" ? 0 : ED4E.legendPointsCost[currentIncrease + 1 + 4];
    const increaseValidationData = {
      requiredLp:  actor.currentLp >= lpCost,
      maxLevel:    currentIncrease < 3,
      hasDamage:   !actor.hasDamage( "standard" ),
      hasWounds:   !actor.hasWounds( "standard" )
    };

    // placeholder, will be localized based on the selected rules for attribute increases
    const content = `
    <p>${ game.i18n.format( "ED.Dialogs.Legend.Rules.attributeIncreaseShortRequirements", {trainingsTimeAttribute: attributeEnhanceStep, learningTime: attributeField.step, trainingCost: attributeField.step * 10 } ) }</p>
    ${ Object.entries( increaseValidationData ).map( ( [ key, value ] ) => {
    return `<div class="flex-row">${ key }: <i class="fa-solid ${ value ? "fa-hexagon-check" : "fa-hexagon-xmark" }"></i></div>`;
  } ).join( "" ) }
    `;

    let spendLp = useLp;
    spendLp ??= await DialogEd.wait( {
      id:          "attribute-increase-prompt",
      uniqueId:    String( ++foundry.applications.api.ApplicationV2._appId ),
      classes:     [ "ed4e", "attribute-increase-prompt" ],
      window:      {
        title:       "ED.Dialogs.Title.attributeIncrease",
        minimizable: false
      },
      modal:       false,
      content,
      buttons: [
        PromptFactory.freeButton,
        PromptFactory.spendLpButton,
        PromptFactory.cancelButton
      ],
      rejectClose: false
    } );

    const attributeUpdate = await actor.update( {
      [`system.attributes.${attribute}.timesIncreased`]: currentIncrease + 1
    } );
    const lpTransaction = await actor.addLpTransaction(
      "spendings",
      {
        amount:      spendLp === "spendLp" ? lpCost : 0,
        entityType:  "attribute",
        name:        ED4E.attributes[attribute].label,
        description: game.i18n.format( "ED.Actor.LpTracking.Spendings.attributeIncrease", {
          name:           ED4E.attributes[attribute].label,
          timesIncreased: currentIncrease + 1
        } ),
        value:       {
          before: currentIncrease,
          after:  currentIncrease + 1,
        },
      }
    );

    if ( !attributeUpdate || !lpTransaction ) {
      // rollback
      await actor.update( {
        [`system.attributes.${attribute}.timesIncreased`]: currentIncrease,
      } );
      throw new Error(
        `ED4E | Cannot increase attribute "${ attribute }" for actor "${ actor.name }" (${ actor.id }). Actor update unsuccessful.`
      );
    }
  }

  // endregion

  // region Data Preparation

  applyActiveEffects() {
    this._applySelectedActiveEffects(
      this._attributeValueKeys,
      { ignore: true },
    );
  }

  // region Base Data Preparation

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.#prepareBaseAttributes();
  }

  /**
   * Prepare the attribute values and apply their active effects.
   * @private
   */
  #prepareBaseAttributes() {
    for ( const attributeData of Object.values( this.attributes ) ) {
      attributeData.value = attributeData.initialValue + attributeData.timesIncreased;
    }
  }

  // endregion

  // region Document Derived Data Preparation

  /** @inheritDoc */
  prepareDocumentDerivedData() {

    // the order of operations here is crucial since the derived data depend on each other

    // base effects for attribute values and durability bonus
    this.#applyBaseEffects();

    // attributes
    this.#prepareAttributes();

    // only document dependent data
    this.#prepareMovement();
    this.#prepareRollResources();

    // attribute dependent data
    this.#prepareCharacteristics();
    this.#prepareKnockdown();
  }

  /**
   * Apply all active effects that modify attribute values.
   * Apply durability bonus effect to use for unconsciousness rating.
   * @private
   */
  #applyBaseEffects() {
    this._applySelectedActiveEffects( [
      ...this._attributeValueKeys,
      "system.durabilityBonus"
    ] );
  }

  /**
   * Prepare the attribute steps based on their values and the active effects.
   * @private
   */
  #prepareAttributes() {
    for ( const attributeData of Object.values( this.attributes ) ) {
      attributeData.step = getAttributeStep( attributeData.value );
    }
  }

  /**
   * Prepare characteristic values based on
   *  - attributes:
   *    - defenses
   *    - armor
   *    - some health ratings (without death rating)
   *    - recovery tests.
   *  - items
   *    - defenses
   *    - armor
   *    - health ratings
   *    - recovery tests
   * @private
   */
  #prepareCharacteristics() {
    this.#prepareDefenses();
    this.#prepareArmor();
    this.#prepareBloodMagic();
    this.#prepareHealth();
    this.#prepareRecoveryTestResource();
  }

  /**
   * Prepare the armor values based on attribute values and items.
   * @private
   */
  #prepareArmor() {
    // attribute based
    this.characteristics.armor.physical.baseValue = 0;
    this.characteristics.armor.mystical.baseValue = getArmorFromAttribute( this.attributes.wil.value );

    // item based
    const armorItems = this.parent.itemTypes.armor.filter( item => item.system.equipped );
    this.characteristics.armor.physical.value = this.characteristics.armor.physical.baseValue;
    this.characteristics.armor.mystical.value = this.characteristics.armor.mystical.baseValue;
    for ( const armor of armorItems ) {
      this.characteristics.armor.physical.value += armor.system.physical.armor + armor.system.physical.forgeBonus;
      this.characteristics.armor.mystical.value += armor.system.mystical.armor + armor.system.mystical.forgeBonus;
    }
  }

  /**
   * Prepare the blood magic damage based on items.
   * @private
   */
  #prepareBloodMagic() {
    const bloodDamageItems = this.parent.items.filter(
      item => ( item.system.hasOwnProperty( "bloodMagicDamage" ) &&  item.type !== "path" && item.system.equipped )
        || ( item.system.hasOwnProperty( "bloodMagicDamage" ) &&  item.type === "path" )
    );
    const bloodDamage = sumProperty( bloodDamageItems, "system.bloodMagicDamage" );
    this.characteristics.health.bloodMagic.damage += bloodDamage;
  }

  /**
   * Prepare the defense values based on attribute values and items.
   * @private
   */
  #prepareDefenses() {
    // attribute based
    for ( const defenseType of Object.keys( this.characteristics.defenses ) ) {
      this.characteristics.defenses[defenseType].baseValue = getDefenseValue(
        this.attributes[ED4E.defenseAttributeMapping[defenseType]].value
      );
    }

    // item based
    const shieldItems = this.parent.itemTypes.shield.filter( item => item.system.equipped );

    // Calculate sum of defense bonuses, defaults to zero if no shields equipped
    const physicalBonus = sumProperty( shieldItems, "system.defenseBonus.physical" );
    const mysticalBonus = sumProperty( shieldItems, "system.defenseBonus.mystical" );

    this.characteristics.defenses.physical.value = this.characteristics.defenses.physical.baseValue + physicalBonus;
    this.characteristics.defenses.mystical.value = this.characteristics.defenses.mystical.baseValue + mysticalBonus;
    this.characteristics.defenses.social.value = this.characteristics.defenses.social.baseValue;
  }

  /**
   * Prepare the derived devotion values based on questor items.
   * @private
   */
  #prepareDevotion() {
    const questor = this.parent?.itemTypes.questor[0];
    if ( questor ) this.devotion.max = questor.system.level * 10;
  }

  /**
   * Prepare the derived health values based on attribute values and items.
   * @private
   */
  #prepareHealth() {
    // attribute based
    this.characteristics.health.unconscious = this.attributes.tou.value * 2;
    this.characteristics.health.woundThreshold = Math.ceil( this.attributes.tou.value / 2 ) + 2;

    // item based

    this.characteristics.health.unconscious += this.#durabilityUnconsciousness - this.characteristics.health.bloodMagic.damage;
    // death rating is calculated in derived data as it needs the durabilityBonus which
    // depends on active effects
  }

  /**
   * Prepare the derived karma values based on namegiver items and free attribute points.
   * @private
   */
  #prepareKarma() {
    const highestCircle = this.parent?.getHighestClass( "discipline" )?.system.level ?? 0;
    const karmaModifier = this.parent?.namegiver?.system.karmaModifier ?? 0;

    this.karma.max = karmaModifier * highestCircle + this.karma.freeAttributePoints;
  }

  /**
   * Prepare the knockdown step based on the strength attribute.
   * @private
   */
  #prepareKnockdown() {
    this.knockdownStep = this.attributes.str.step;
  }
  /**
   * Prepare the derived movement values based on namegiver items.
   * @private
   */
  #prepareMovement() {
    const namegiver = this.parent?.namegiver;
    if ( !namegiver ) return;

    Object.entries( namegiver.system.movement ).forEach(
      ( [ movementType, value ] ) => { this.characteristics.movement[movementType] = value; }
    );
  }

  /**
   * Prepare the derived recovery test resource values based on attribute values.
   * @private
   */
  #prepareRecoveryTestResource() {
    this.characteristics.recoveryTestsResource.max = Math.ceil( this.attributes.tou.value / 6 );
  }

  /**
   * Prepare the derived karma and devotion values based on items.
   * @private
   */
  #prepareRollResources() {
    this.#prepareKarma();
    this.#prepareDevotion();
  }

  // endregion

  // region Derived Data Preparation

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.#prepareEncumbrance();
    this.#prepareInitiative();
    this.#prepareDerivedHealth();
    this.#prepareRecovery();
    this.#applyDerivedActiveEffects();
  }

  #applyDerivedActiveEffects() {
    this._applySelectedActiveEffects( [
      "system.encumbrance.value",
      "system.encumbrance.max",
      "system.encumbrance.bonus",
      "system.initiative",
      "system.characteristics.health.death",
      "this.characteristics.recoveryTestsResource.step",
    ] );
  }

  /**
   * Prepare the derived load carried based on relevant physical items on this actor. An item is relevant if it is
   * either equipped or carried but not owned, i.e. on the person. In this case, the  namegiver size weight multiplier
   * will be applied as well.
   * @private
   */
  #prepareCarriedLoad() {

    // relevant items are those with a weight property and are either equipped or carried
    const relevantItems = this.parent.items.filter( item =>
      item.system.hasOwnProperty( "weight" )
      && ( item.system.itemStatus === "equipped" || item.system.itemStatus === "carried" )
    );

    const carriedWeight = relevantItems.reduce( ( accumulator, currentItem ) => {
      return accumulator
        + (
          currentItem.system.weight.value
          * (
            ( currentItem.system.amount ?? 1 )
            / ( currentItem.system.bundleSize > 1 ? currentItem.system.bundleSize : 1 )
          )
        );
    }, 0 );

    this.encumbrance.value = carriedWeight;

    // calculate encumbrance status
    const encumbrancePercentage = carriedWeight / this.encumbrance.max;
    if ( encumbrancePercentage <= 1.0 ) {
      this.encumbrance.status = "notEncumbered";
    } else if ( encumbrancePercentage < 1.5 ) {
      this.encumbrance.status = "light";
    } else if ( encumbrancePercentage <= 2.0 ) {
      this.encumbrance.status = "heavy";
    } else if ( encumbrancePercentage > 2.0 ) {
      this.encumbrance.status = "tooHeavy";
    }
  }

  /**
   * Prepare the carrying capacity based on the strength attribute and its possible bonus ( e.g.
   * the dwarf namegiver ability ).
   * @private
   */
  #prepareCarryingCapacity() {
    const strengthValue = this.attributes.str.value + this.encumbrance.bonus;
    const strengthFifth = Math.ceil( strengthValue / 5 );

    this.encumbrance.max = -12.5 * strengthFifth ** 2
      + 5 * strengthFifth * strengthValue
      + 12.5 * strengthFifth
      + 5;
  }

  /**
   * Prepare the unconsciousness and death rating based on the durability unconscious rating,
   * toughness and the highest discipline circle.
   */
  #prepareDerivedHealth() {
    this.characteristics.health.death = this.characteristics.health.unconscious + this.attributes.tou.step;

    const maxCircle = Math.max(
      ...this.parent.itemTypes.discipline.map(
        item => item.system.level
      ),
      0
    );

    this.characteristics.health.death += maxCircle - this.characteristics.health.bloodMagic.damage;
  }

  /**
   * Prepare the maximum carrying capacity and the current load carried.
   * @private
   */
  #prepareEncumbrance() {
    this.#prepareCarryingCapacity();
    this.#prepareCarriedLoad();
  }

  /**
   * Prepare the initiative value based on attribute values and items.
   * @private
   */
  #prepareInitiative() {
    // attribute based
    this.initiative = this.attributes.dex.step;

    // item based
    const penaltyEquipment = this.parent.items.filter( item =>
      [ "armor", "shield" ].includes( item.type ) && item.system.equipped
    );
    this.initiativePenalty = sum( penaltyEquipment.map( item => item.system.initiativePenalty ) );
    this.initiative -= this.initiativePenalty;
  }

  /**
   * Prepare the recovery test resource based on the toughness step.
   * @private
   */
  #prepareRecovery() {
    this.characteristics.recoveryTestsResource.step = this.attributes.tou.step;
  }

  // endregion

  // endregion

}
