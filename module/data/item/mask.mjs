import { ItemDataModel } from "../abstract.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on mask items.
 * @property {number} dexterityStep             dexterity step modifications
 * @property {number} strengthStep              strength step modifications
 * @property {number} toughnessStep             toughness step modifications
 * @property {number} perceptionStep            perception step modifications
 * @property {number} willpowerStep             willpower step modifications
 * @property {number} charismaStep              charisma step modifications
 * @property {number} initiativeStep            initiative step modifications
 * @property {object} movement                  movement group object
 * @property {number} movement.walk             movement type walk modifications
 * @property {number} movement.fly              movement type fly modifications
 * @property {number} movement.swim             movement type swim modifications
 * @property {number} movement.burrow           movement type burrow modifications
 * @property {number} movement.climb            movement type climb modifications
 * @property {number} physicalDefense           physical defense modifications
 * @property {number} mysticalDefense             mystical defense modifications
 * @property {number} socialDefense             social defense modifications
 * @property {number} physicalArmor             physical armor modifications
 * @property {number} mysticArmor               mystic armor modifications
 * @property {number} knockDownStep             knock down step modifications
 * @property {number} recoveryTestsResource             recovery tests modifications
 * @property {number} deathThreshold            death threshold modifications
 * @property {number} unconsciousThreshold      unconscious threshold modifications
 * @property {number} woundThreshold            wound threshold modifications
 * @property {number} attackStepsBonus          attack steps modifications
 * @property {number} damageStepsBonus          damage steps modification
 * @property {number} challengingRate           changes to the challenging rate
 * @property {object} powers                    array of powers
 */
export default class MaskData extends ItemDataModel.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Mask",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      dexterityStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.dexterityStep"
      } ), 
      strengthStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.strengthStep"
      } ),
      toughnessStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.toughnessStep"
      } ),
      perceptionStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.perceptionStep"
      } ),
      willpowerStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.willpowerStep"
      } ),
      charismaStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.charismaStep"
      } ),
      initiativeStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.initiativeStep"
      } ),
      movement: new fields.SchemaField( {
        walk: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    "ED.Item.Masks.walk"
        } ),
        fly: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    "ED.Item.Masks.fly"
        } ),
        swim: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    "ED.Item.Masks.swim"
        } ),
        burrow: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    "ED.Item.Masks.burrow"
        } ),
        climb: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    "ED.Item.Masks.climb"
        } ),
      },
      {
        label: "ED.Item.Masks.movement"
      } ),
      defenses: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.Actor.Characteristics.defensePhysical"
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.Actor.Characteristics.defenseMystical"
        } ),
        social: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
          label:    "ED.Actor.Characteristics.defenseSocial"
        } ),
      } ),
      physicalArmor: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.physicalArmor"
      } ),
      mysticArmor: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.mysticArmor"
      } ),
      knockDownStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.knockDownStep"
      } ),
      recoveryTestsResource: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.recoveryTestsResource"
      } ),
      deathThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.deathThreshold"
      } ),
      unconsciousThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.unconsciousThreshold"
      } ),
      woundThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.woundThreshold"
      } ),
      attacks: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.attacks"
      } ),
      attackStepsBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.attackStepsBonus"
      } ),
      damageStepsBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.damageStepsBonus"
      } ),
      challengingRate: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    "ED.Item.Masks.challengingRate"
      } ),
      powers: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
        label:    "ED.Item.Masks.powers"
      } ),
    } );
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