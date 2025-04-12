import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on shield items.
 * @property {number} defenseBonusPhysical    physical defense bonus
 * @property {number} defenseBonusMystical    mystical defense bonus
 * @property {number} initiativePenalty     initiative penalty
 * @property {number} shatterThreshold      shatter threshold
 * @property {boolean} broken           broken condition
 */
export default class ShieldData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Shield",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      defenseBonus: new fields.SchemaField( {
        physical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Shields.defenseBonusPhysical" ),
          hint:     this.hintKey( "Shields.defenseBonusPhysical" )
        } ),
        mystical: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Shields.defenseBonusMystical" ),
          hint:     this.hintKey( "Shields.defenseBonusMystical" )
        } ),
      } ),
      initiativePenalty: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Shields.initiativePenalty" ),
        hint:     this.hintKey( "Shields.initiativePenalty" )
      } ),
      shatterThreshold: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Shields.shatterThreshold" ),
        hint:     this.hintKey( "Shields.shatterThreshold" )
      } ),
      broken: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Shields.broken" ),
        hint:     this.hintKey( "Shields.broken" )
      } ),
      isLiving: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Shields.livingArmor" ),
        hint:     this.hintKey( "Shields.livingArmor" )
      } ),
      bowUsage: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Shields.bowUsage" ),
        hint:     this.hintKey( "Shields.bowUsage" )
      } ),
    } );
  }
  /* -------------------------------------------- */
  /*  Migrations                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    super.migrateData( source );
    // specific migration functions
  }
}