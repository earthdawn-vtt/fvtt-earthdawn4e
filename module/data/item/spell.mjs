import ItemDescriptionTemplate from "./templates/item-description.mjs";
import LearnableTemplate from "./templates/learnable.mjs";
import ED4E from "../../config.mjs";
import LearnSpellPrompt from "../../applications/advancement/learn-spell.mjs";
import { ItemDataModel } from "../abstract.mjs";
import TargetTemplate from "./templates/targeting.mjs";
import DurationField from "../fields/duration-field.mjs";
import RangeField from "../fields/range-field.mjs";



/**
 * Data model template with information on Spell items.
 * @mixes LearnableTemplate
 */
export default class SpellData extends ItemDataModel.mixin(
  ItemDescriptionTemplate,
  LearnableTemplate,
  TargetTemplate
)  {

  /** @inheritDoc */
  static defineSchema() {
    const { StringField, NumberField, SchemaField, SetField } = foundry.data.fields;

    return this.mergeSchema( super.defineSchema(), {
      spellcastingType: new StringField( {
        required: true,
        nullable: true,
        blank:    false,
        trim:     true,
        choices:  ED4E.spellcastingTypes,
        label:    this.labelKey( "Spell.spellcastingType" ),
        hint:     this.hintKey( "Spell.spellcastingType" ),
      } ),
      level: new NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        integer:  true,
        positive: true,
        label:    this.labelKey( "Spell.level" ),
        hint:     this.hintKey( "Spell.level" ),
      } ),
      spellDifficulty:    new SchemaField( {
        reattune: new NumberField( {
          required: true,
          nullable: false,
          min:      ED4E.minDifficulty,
          initial:  ( data ) => { return data.weaving + 5 || ED4E.minDifficulty; },
          integer:  true,
          label:    this.labelKey( "Spell.reattuneDifficulty" ),
          hint:     this.hintKey( "Spell.reattuneDifficulty" ),
        } ),
        weaving: new NumberField( {
          required: true,
          nullable: false,
          min:      ED4E.minDifficulty,
          initial:  ( _ ) => { return this.parent?.parent?.fields?.level?.initial + 4 || ED4E.minDifficulty; },
          integer:  true,
          label:    this.labelKey( "Spell.weavingDifficulty" ),
          hint:     this.hintKey( "Spell.weavingDifficulty" ),
        } ),
      } ),
      threads: new SchemaField( {
        required: new NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Spell.spellThreadsRequired" ),
          hint:     this.hintKey( "Spell.spellThreadsRequired" ),
        } ),
        woven: new NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Spell.spellThreadsWoven" ),
          hint:     this.hintKey( "Spell.spellThreadsWoven" ),
        } ),
        extra: new NumberField( {} ),
      } ),
      effect: new StringField( {
        required: true,
        blank:    true,
        initial:  "",
        label:    this.labelKey( "Spell.effect" ),
        hint:     this.hintKey( "Spell.effect" ),
      } ),
      keywords: new SetField( new StringField( {
        required: true,
        nullable: false,
        blank:    false,
        trim:     true,
        choices:  ED4E.spellKeywords,
        label:    this.labelKey( "Spell.keyword" ),
        hint:     this.hintKey( "Spell.keyword" ),
      } ), {
        required: true,
        nullable: false,
        initial:  [],
        label:    this.labelKey( "Spell.keywords" ),
        hint:     this.hintKey( "Spell.keywords" ),
      } ),
      element: new SchemaField( {
        type: new StringField( {
          required: true,
          nullable: true,
          blank:    false,
          trim:     true,
          choices:  ED4E.elements,
          label:    this.labelKey( "Spell.spellElementType" ),
          hint:     this.hintKey( "Spell.spellElementType" ),
        } ),
        subtype: new StringField( {
          required: true,
          nullable: true,
          blank:    false,
          trim:     true,
          choices:  Object.values(
            ED4E.elementSubtypes
          ).map(
            subtypes => Object.keys( subtypes )
          ).flat(),
          label:    this.labelKey( "Spell.spellElementSubtype" ),
          hint:     this.hintKey( "Spell.spellElementSubtype" ),
        } )
      },
      {
        required: true,
        nullable: true,
        label:    this.labelKey( "Spell.spellElement" ),
        hint:     this.hintKey( "Spell.spellElement" ),
      } ),

      duration: new DurationField( {}, {
        label: this.labelKey( "Spell.duration" ),
        hint:  this.hintKey( "Spell.duration" ),
      } ),
      range:    new RangeField( {}, {
        label: this.labelKey( "Spell.range" ),
        hint:  this.hintKey( "Spell.range" ),
      } ),
      spellArea: new SchemaField( {
        shape: new StringField( {
          required: true,
          blank:    false,
          initial:  "0",
          label:    "ED.Item.Spell.shape"
        } ),
        value: new StringField( {
          required: true,
          blank:    false,
          initial:  "0",
          label:    "ED.Item.Spell.shape"
        } ),
        uom: new StringField( {
          required: true,
          blank:    false,
          initial:  "yard",
          label:    "ED.Item.Spell.uom"
        } )
      },
      {
        label: "ED.Item.Spell.spellArea"
      } ),

      // extraSuccessesList: [],
      // extraThreadsList: [],
    } );
  }


  /**
   * @inheritDoc
   */
  static _validateJoint( value ) {
    if ( value.element.type ) {
      const elemType = value.element.type;
      const elemSubtype = value.element.subtype;

      // subtype is optional
      if ( !elemSubtype ) return undefined;

      if ( !Object.keys( ED4E.elementSubtypes[ elemType ] ).includes( elemSubtype ) )
        throw new Error( game.i18n.format( "ED.Errors.InvalidElementSubtype" ) );
    }

    // continue validation
    return undefined;
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * @description Whether this spell is an illusion and therefore can be sensed.
   * @type {boolean}
   */
  get isIllusion() {
    return this.keywords.has( "illusion" );
  }

  /**
   * @description The difficulty number to dispel this spell.
   * @type {number}
   */
  get dispelDifficulty() {
    return this.level + 10;
  }

  /**
   * @description The difficulty number to sense this spell, if it is an illusion, else undefined.
   * @type { number | undefined }
   */
  get sensingDifficulty() {
    return this.isIllusion ? this.level + 15 : undefined;
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get canBeLearned() {
    return true;
  }

  /**
   * @description The difficulty number to learn this spells. Equals the level of the spell plus 5.
   * @type {number}
   */
  get learningDifficulty() {
    return this.level + 5;
  }

  /** @inheritDoc */
  get requiredLpToLearn() {
    switch ( game.settings.get( "ed4e", "lpTrackingSpellCost" ) ) {
      case "noviceTalent": return ED4E.legendPointsCost[ this.level ];
      case "circleX100": return this.level * 100;
      case "free":
      default: return 0;
    }
  }

  /** @inheritDoc */
  static async learn( actor, item, _ ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cannotLearn" ) );
      return;
    }

    const learn = await LearnSpellPrompt.waitPrompt( {
      actor: actor,
      spell: item,
    } );

    if ( !learn || learn === "cancel" || learn === "close" ) return;

    const learnedItem = ( await actor.createEmbeddedDocuments(
      "Item", [ item.toObject() ]
    ) )?.[0];

    const updatedActor = await actor.addLpTransaction(
      "spendings",
      {
        amount:      learn === "spendLp" ? item.system.requiredLpToLearn : 0,
        description: game.i18n.format(
          "ED.Actor.LpTracking.Spendings",
        ),
        entityType:  learnedItem.type,
        name:       learnedItem.name,
        itemUuid:   learnedItem.uuid,
      },
    );

    if ( foundry.utils.isEmpty( updatedActor ) )
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.addLpTransactionProblems" )
      );

    return learnedItem;
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