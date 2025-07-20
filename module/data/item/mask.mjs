import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemDataModel from "../abstract/item-data-model.mjs";

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
 * @property {number} knockdownStep             knock down step modifications
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
      } ), 
      strengthStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      toughnessStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      perceptionStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      willpowerStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      charismaStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      initiativeStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      movement: new fields.SchemaField( {
        walk: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        fly: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        swim: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        burrow: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
        climb: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
        } ),
      } ),
      defenses: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
        social: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          step:     1,
          initial:  0,
          integer:  true,
        } ),
      } ),
      physicalArmor: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      mysticalArmor: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      knockdownStep: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      recoveryTestsResource: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      deathThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      unconsciousThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      woundThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      attacks: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      attackStepsBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      damageStepsBonus: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      challengingRate: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      powers: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
      } ),
    } );
  }
}