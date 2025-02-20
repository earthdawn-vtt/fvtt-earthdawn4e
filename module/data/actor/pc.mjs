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
 * @property {number} value             value is the one shown. baseValue + modifications
 * @property {number} timesIncreased    attribute increases
 */
export default class PcData extends NamegiverTemplate {

  /** @inheritDoc */
  static _systemType = "character";

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
        label:    this.labelKey( "attributeValue" ),
        hint:     this.hintKey( "attributeValue" )
      } ),
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


  // region Data Preparation

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

    // attributes
    this.#prepareAttributes();

    // only document dependent data
    this.#prepareMovement();
    this.#prepareRollResources();

    // attribute dependent data
    this.#prepareCharacteristics();
  }

  /**
   * Apply all active effects that modify attribute values.
   * @private
   */
  #applyAttributeEffects() {
    this.parent?.allApplicableEffects().flatMap( effect =>
      effect.changes.filter( change =>
        change.key.startsWith( "system.attributes" ) && change.key.endsWith( "value" )
      ).map( change => effect.apply( this, change ) )
    );
  }

  #prepareAttributes() {
    this.#applyAttributeEffects();
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
   * @userFunction UF_Pc-prepareArmor
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
   * @userFunction UF_Pc-prepareBloodMagic
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
   * @userFunction UF_Pc-prepareDevotion
   */
  #prepareDevotion() {
    const questor = this.parent?.itemTypes.questor[0];
    if ( questor ) this.devotion.max = questor.system.level * 10;
  }

  /**
   * Prepare the derived health values based on attribute values and items.
   * @private
   * @userFunction UF_Pc-prepareHealth
   */
  #prepareHealth() {
    // attribute based
    this.characteristics.health.unconscious = this.attributes.tou.value * 2;
    this.characteristics.health.woundThreshold = Math.ceil( this.attributes.tou.value / 2 ) + 2;

    // item based

    const durabilityItems = this.parent.items.filter(
      item => [ "discipline", "devotion" ].includes( item.type ) && item.system.durability > 0
    );
    if ( !durabilityItems ) {
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

    const maxDurability = sum( Object.values( durabilityByCircle ) );

    this.characteristics.health.unconscious += maxDurability - this.characteristics.health.bloodMagic.damage;
    // death rating is calculated in derived data as it needs the durabilityBonus which is for active effects
    /*
    this.characteristics.health.death = this.characteristics.health.unconscious + this.attributes.tou.step;
    const maxCircle = Math.max(
      ...durabilityItems.filter(
        item => item.type === "discipline"
      ).map(
        item => item.system.level
      ),
      0
    );
    this.characteristics.health.death += maxDurability + maxCircle - this.characteristics.health.bloodMagic.damage; */
  }

  /**
   * Prepare the derived karma values based on namegiver items and free attribute points.
   * @private
   * @userFunction UF_Pc-prepareKarma
   */
  #prepareKarma() {
    const highestCircle = this.parent?.getHighestClass( "discipline" )?.system.level ?? 0;
    const karmaModifier = this.parent?.namegiver?.system.karmaModifier ?? 0;

    this.karma.max = karmaModifier * highestCircle + this.karma.freeAttributePoints;
  }

  /**
   * Prepare the derived movement values based on namegiver items.
   * @private
   * @userFunction UF_Pc-prepareMovement
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
   * @userFunction UF_Pc-prepareRecoveryTestsResource
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
    /*
    this.#prepareDerivedInitiative();
     */
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
   * Prepare the maximum carrying capacity and the current load carried.
   * @private
   */
  #prepareEncumbrance() {
    this.#prepareCarryingCapacity();
    this.#prepareCarriedLoad();
  }

  // endregion

  /*


  /!**
   * Prepare the base initiative value based on attribute values.
   * @private
   *!/
  #prepareBaseInitiative() {
    this.initiative = this.attributes.dex.step;
  }

  /!**
   * Prepare characteristic values based on items: defenses, armor, health ratings, recovery tests.
   * @private
   *!/
  #prepareDerivedCharacteristics() {
    this.#prepareDerivedHealth();
  }

  /!**
   * Prepare the derived initiative value based on items.
   * @private
   *!/
  #prepareDerivedInitiative() {
    const armors = this.parent.items.filter( item =>
      [ "armor", "shield" ].includes( item.type ) && item.system.itemStatus === "equipped"
    );
    this.initiative -= sum( armors.map( item => item.system.initiativePenalty ) );
  }

  */

  // endregion


  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }

}
