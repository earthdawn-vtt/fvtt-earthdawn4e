import NamegiverTemplate from "./templates/namegiver.mjs";
import { getArmorFromAttribute, getAttributeStep, getDefenseValue, getSingleGlobalItemByEdid, mapObject, sum, sumProperty } from "../../utils.mjs";
import CharacterGenerationPrompt from "../../applications/actor/character-generation-prompt.mjs";
import LpTrackingData from "../advancement/lp-tracking.mjs";
import ActorEd from "../../documents/actor.mjs";
import ED4E from "../../config.mjs";
import PromptFactory from "../../applications/global/prompt-factory.mjs";
import { getSetting } from "../../settings.mjs";
const { DialogV2 } = foundry.applications.api;

/**
 * System data definition for PCs.
 * @mixin
 * @property {number} initialValue      initial Value will only be affected by charactergeneration
 * @property {number} baseValue         unmodified value calculated from times increased and initial value
 * @property {number} value             value is the one shown. baseValue + modifications
 * @property {number} timesIncreased    attribute increases
 */
export default class PcData extends NamegiverTemplate {

  /** @inheritDoc */
  static _systemType = "character";

  static {
    this._EAE_EXCLUDE_KEYS = [
      "system.attributes.dex.initialValue",
      "system.attributes.str.initialValue",
      "system.attributes.tou.initialValue",
      "system.attributes.per.initialValue",
      "system.attributes.wil.initialValue",
      "system.attributes.cha.initialValue",
      "system.attributes.dex.baseValue",
      "system.attributes.str.baseValue",
      "system.attributes.tou.baseValue",
      "system.attributes.per.baseValue",
      "system.attributes.wil.baseValue",
      "system.attributes.cha.baseValue",
      "system.attributes.dex.valueModifier",
      "system.attributes.str.valueModifier",
      "system.attributes.tou.valueModifier",
      "system.attributes.per.valueModifier",
      "system.attributes.wil.valueModifier",
      "system.attributes.cha.valueModifier",
      "system.attributes.dex.timesIncreased",
      "system.attributes.str.timesIncreased",
      "system.attributes.tou.timesIncreased",
      "system.attributes.per.timesIncreased",
      "system.attributes.wil.timesIncreased",
      "system.attributes.cha.timesIncreased",
      "system.lp",
    ];
    this.initEAE();
  }

  /* -------------------------------------------- */

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
      baseValue: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  10,
        integer:  true,
        positive: true
      } ),
      valueModifier: new fields.NumberField( {
        required: true,
        step:     1,
        initial:  0
      } ),
      value: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        step:     1,
        initial:  1,
        integer:  true,
        positive: true,
        label:    this.labelKey( "attributeValue" ),
        hint:     this.hintKey( "attributeValue" )
      } ),
      timesIncreased: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        max:      3,
        step:     1,
        initial:  0,
        integer:  true
      } )
    } );

    this.mergeSchema( superSchema, {
      durabilityBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        step:     1,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "durabilityBonus" ),
        hint:     this.hintKey( "durabilityBonus" ),
      } ),
      lp: new foundry.data.fields.EmbeddedDataField(
        LpTrackingData,
        {
          required: true,
          initial:  new LpTrackingData()
        }

      )
    } );
    return superSchema;
  }

  /* -------------------------------------------- */
  /*  Character Generation                        */
  /* -------------------------------------------- */

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
      name:   "Rename me! I was just created",
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
    const abilities = ( await generation.abilityDocuments ).map(
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

    const actorApp = newActor.sheet.render( true, {focus: true} );
    // we have to wait until the app is rendered to activate a tab
    requestAnimationFrame( () => actorApp.activateTab( "actor-notes-tab" ) );

    return newActor;
  }

  /* -------------------------------------------- */
  /*  Legend Building (LP)                        */
  /* -------------------------------------------- */

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
    <p>${ game.i18n.localize( "ED.Rules.attributeIncreaseShortRequirements" ) }</p>
    ${ Object.entries( increaseValidationData ).map( ( [ key, value ] ) => {
    return `<div class="flex-row">${ key }: <i class="fa-solid ${ value ? "fa-hexagon-check" : "fa-hexagon-xmark" }"></i></div>`;
  } ).join( "" ) }
    `;

    let spendLp = useLp;
    spendLp ??= await DialogV2.wait( {
      id:          "attribute-increase-prompt",
      uniqueId:    String( ++globalThis._appId ),
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
    const lpTransaction = actor.addLpTransaction(
      "spendings",
      {
        amount:      spendLp === "spendLp" ? lpCost : 0,
        description: game.i18n.format( "ED.Actor.LpTracking.Spendings", {} ),
        entityType:  "attribute",
        name:        ED4E.attributes[attribute].label,
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


  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.#prepareBaseAttributes();
    this.#prepareBaseCharacteristics();
    this.#prepareBaseInitiative();
    this.#prepareBaseCarryingCapacity();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.#prepareDerivedCharacteristics();
    this.#prepareDerivedInitiative();
    this.#prepareDerivedEncumbrance();
    this.#prepareDerivedKarma();
    this.#prepareDerivedDevotion();
  }

  /* -------------------------------------------- */

  /**
   * Prepare calculated attribute values and corresponding steps.
   * @private
   */
  #prepareBaseAttributes() {
    for ( const attributeData of Object.values( this.attributes ) ) {
      attributeData.baseValue = attributeData.initialValue + attributeData.timesIncreased;
      attributeData.value = attributeData.baseValue + attributeData.valueModifier;
      attributeData.baseStep = getAttributeStep( attributeData.value );
      attributeData.step = attributeData.baseStep;
    }
  }

  /**
   * Prepare characteristic values based on attributes: defenses, armor, health ratings, recovery tests.
   * @private
   */
  #prepareBaseCharacteristics() {
    this.#prepareBaseDefenses();
    this.#prepareBaseArmor();
    this.#prepareBaseHealth();
    this.#prepareBaseRecoveryTestsRecource();
  }

  /**
   * Prepare the defense values based on attribute values.
   * @private
   */
  #prepareBaseDefenses() {
    const defenseAttributeMapping = {
      physical: "dex",
      mystical: "per",
      social:   "cha"
    };
    for ( const defenseType of Object.keys( this.characteristics.defenses ) ) {
      this.characteristics.defenses[defenseType].baseValue = getDefenseValue(
        this.attributes[defenseAttributeMapping[defenseType]].value
      );
    }
  }

  /**
   * Prepare the base armor values based on attributes values.
   * @private
   */
  #prepareBaseArmor() {
    this.characteristics.armor.physical.baseValue = 0;
    this.characteristics.armor.mystical.baseValue = getArmorFromAttribute( this.attributes.wil.value );
  }

  /**
   * Prepare the base health ratings based on attribute values.
   * @private
   */
  #prepareBaseHealth() {
    this.characteristics.health.unconscious = this.attributes.tou.value * 2;
    this.characteristics.health.death = this.characteristics.health.unconscious + this.attributes.tou.step;
    this.characteristics.health.woundThreshold = Math.ceil( this.attributes.tou.value / 2 ) + 2;
  }

  /**
   * Prepare the base initiative value based on attribute values.
   * @private
   */
  #prepareBaseInitiative() {
    this.initiative = this.attributes.dex.step;
  }

  /**
   * Prepare the available recovery tests based on attribute values.
   * @private
   * @userFunction        UF_Pc-prepareBaseRecoveryTestsRecource
   */
  #prepareBaseRecoveryTestsRecource() {
    this.characteristics.recoveryTestsResource.max = Math.ceil( this.attributes.tou.value / 6 );
  }

  /**
   * Prepare the base carrying capacity based on attribute values.
   * @private
   */
  #prepareBaseCarryingCapacity() {
    const strengthValue = this.attributes.str.value + this.encumbrance.bonus;
    const strengthFifth = Math.ceil( strengthValue / 5 );

    this.encumbrance.max = -12.5 * strengthFifth ** 2
      + 5 * strengthFifth * strengthValue
      + 12.5 * strengthFifth
      + 5;
  }

  /* -------------------------------------------- */

  /**
   * Prepare characteristic values based on items: defenses, armor, health ratings, recovery tests.
   * @private
   */
  #prepareDerivedCharacteristics() {
    this.#prepareDerivedArmor();
    this.#prepareDerivedBloodMagic();
    this.#prepareDerivedDefenses();
    this.#prepareDerivedHealth();
    this.#prepareDerivedMovement();
  }

  /**
   * Prepare the derived armor values based on items.
   * @private
   * @userFunction UF_Pc-prepareDerivedArmor
   */
  #prepareDerivedArmor() {
    const armorItems = this.parent.items.filter( item => item.type === "armor" && item.system.itemStatus === "equipped" );
    this.characteristics.armor.physical.value = this.characteristics.armor.physical.baseValue;
    this.characteristics.armor.mystical.value = this.characteristics.armor.mystical.baseValue;
    if ( armorItems ) {
      for ( const armor of armorItems ) {
        this.characteristics.armor.physical.value += armor.system.physical.armor + armor.system.physical.forgeBonus;
        this.characteristics.armor.mystical.value += armor.system.mystical.armor + armor.system.mystical.forgeBonus;
      }
    }
  }

  /**
   * Prepare the derived blood magic damage based on items.
   * @private
   * @userFunction UF_Pc-prepareDerivedBloodMagic
   */
  #prepareDerivedBloodMagic() {
    const bloodDamageItems = this.parent.items.filter(
      ( item ) => ( item.system.hasOwnProperty( "bloodMagicDamage" ) &&  item.type !== "path" && item.system.itemStatus === "equipped" ) ||
        ( item.system.hasOwnProperty( "bloodMagicDamage" ) &&  item.type === "path" )
    );
    // Calculate sum of defense bonuses, defaults to zero if no shields equipped
    const bloodDamage = sumProperty( bloodDamageItems, "system.bloodMagicDamage" );
    this.characteristics.health.bloodMagic.damage += bloodDamage;
  }

  /**
   * prepare the derived defense values based on items.
   * @private
   * @userFunction UF_Pc-prepareDerivedDefenses
   */
  #prepareDerivedDefenses() {
    const shieldItems = this.parent.items.filter(
      item => item.type === "shield" && item.system.itemStatus === "equipped"
    );
    // Calculate sum of defense bonuses, defaults to zero if no shields equipped
    const physicalBonus = sumProperty( shieldItems, "system.defenseBonus.physical" );
    const mysticalBonus = sumProperty( shieldItems, "system.defenseBonus.mystical" );

    this.characteristics.defenses.physical.value = this.characteristics.defenses.physical.baseValue + physicalBonus;
    this.characteristics.defenses.mystical.value = this.characteristics.defenses.mystical.baseValue + mysticalBonus;
    this.characteristics.defenses.social.value = this.characteristics.defenses.social.baseValue;
  }

  /**
   * Prepare the base health ratings based on items.
   * @private
   * @userFunction UF_Pc-prepareDerivedHealth
   */
  #prepareDerivedHealth() {
    const durabilityItems = this.parent.items.filter(
      item => [ "discipline", "devotion" ].includes( item.type ) && item.system.durability > 0
    );
    if ( !durabilityItems?.length ) {
      console.log(
        `ED4E | Cannot calculate derived health data for actor "${this.parent.name}" (${this.parent.id}). No items with durability > 0.`
      );
      return;
    }

    const durabilityByCircle = {};
    const maxLevel = Math.max( ...durabilityItems.map( item => item.system.level ) );

    // Iterate through levels from 1 to the maximum level
    for ( let currentLevel = 1; currentLevel <= maxLevel; currentLevel++ ) {
      // Find the maximum durability for the current level
      durabilityByCircle[currentLevel] = durabilityItems.reduce( ( max, item ) => {
        return ( currentLevel <= item.system.level && item.system.durability > max )
          ? item.system.durability
          : max;
      }, 0 );
    }

    const maxCircle = Math.max(
      ...durabilityItems.filter(
        item => item.type === "discipline"
      ).map(
        item => item.system.level
      ),
      0
    );

    const maxDurability = sum( Object.values( durabilityByCircle ) );

    this.characteristics.health.unconscious += maxDurability - this.characteristics.health.bloodMagic.damage;
    this.characteristics.health.death += maxDurability + maxCircle - this.characteristics.health.bloodMagic.damage;
  }

  /**
   * Prepare the derived initiative value based on items.
   * @private
   */
  #prepareDerivedInitiative() {
    const armors = this.parent.items.filter( item =>
      [ "armor", "shield" ].includes( item.type ) && item.system.itemStatus === "equipped"
    );
    this.initiative -= sum( armors.map( item => item.system.initiativePenalty ) );
  }

  /**
   * Prepare the derived load carried based on relevant physical items on this actor. An item is relevant if it is
   * either equipped or carried but not owned, i.e. on the person. In this case, the  namegiver size weight multiplier
   * will be applied as well.
   * @private
   */
  #prepareDerivedEncumbrance() {
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
   * Prepare the derived movement values based on namegiver items.
   * @private
   * @userFunction UF_Pc-prepareDerivedMovement
   */
  #prepareDerivedMovement() {
    const namegiver = this.#getNamegiver();
    if ( namegiver ) {
      for ( const movementType of Object.keys( namegiver.system.movement ) ) {
        this.characteristics.movement[movementType] = namegiver.system.movement[movementType];
      }
    }
  }

  /**
   * Prepare the derived karma values based on namegiver items and free attribute points.
   * @private
   */
  #prepareDerivedKarma() {
    const highestCircle = this.#getHighestClass( "discipline" )?.system.level ?? 0;
    const karmaModifier = this.parent.items.filter( item => item.type === "namegiver" )[0]?.system.karmaModifier ?? 0;

    this.karma.max = karmaModifier * highestCircle + this.karma.freeAttributePoints;
  }

  /**
   * Prepare the derived devotion values based on questor items.
   * @private
   */
  #prepareDerivedDevotion() {
    const questor = this.parent.items.filter( item => item.type === "questor" )[0];
    if ( questor ) {
      this.devotion.max = questor.system.level * 10;
    }
  }

  /* -------------------------------------------- */

  /**
   * Finds and returns this PC's class of the given type with the highest circle.
   * If multiple, only the first found will be returned.
   * @param {string} type The type of class to be searched for. One of discipline, path, questor.
   * @returns {Item} A discipline item with the highest circle.
   * @private
   */
  #getHighestClass( type ) {
    return this.parent.items.filter(
      item => item.type === type
    ).sort(     // sort descending by circle/rank
      ( a, b ) => a.system.level > b.system.level ? -1 : 1
    )[0];
  }

  /**
   * Returns the items of the given type on this PC.
   * @param {string} type The item type.
   * @returns {Item|undefined} The items of the given type, if available, `undefined` otherwise.
   */
  #getItemsByType( type ) {
    return this.parent.items.filter( ( item ) => item.type === type );
  }

  /**
   * Returns the namegiver of this PC, which should always be unique, i.e. only one namegiver item is available.
   * @returns {Item|undefined} The namegiver item, if available, `undefined` otherwise.
   */
  #getNamegiver() {
    return this.#getItemsByType( "namegiver" )[0];
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
