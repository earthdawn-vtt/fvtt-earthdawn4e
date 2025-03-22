import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

/**
 * Data model template with information on "class"-like items: paths, disciplines, and questors.
 * @property {number} physicalArmor                     Physical Armor
 * @property {number} mysticalArmor                     Mystical Armor
 * @property {number} forgeBonusPhysical                Forge Bonus for Physical Armor
 * @property {number} forgeBonusMystical                Forge Bonus for Mystical Armor
 * @property {number} initiativePenalty                 Initiative Penalty
 * @property {object} piecemeal                         piecemeal armor Object
 * @property {boolean} piecemeal.isPiecemeal            selector if armor is piecemeal or not
 * @property {number} piecemeal.size                    piecemeal Armor size value can be 1, 2 or 3
 */
export default class ArmorData extends PhysicalItemTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      physical: new fields.SchemaField( {
        armor: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Armor.physicalArmor" ),
          hint:     this.hintKey( "Armor.physicalArmor" )
        } ),
        forgeBonus: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Armor.forgeBonusPhysical" ),
          hint:     this.hintKey( "Armor.forgeBonusPhysical" )
        } ),
      } ),
      mystical: new fields.SchemaField( {
        armor: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Armor.mysticalArmor" ),
          hint:     this.hintKey( "Armor.mysticalArmor" )
        } ),
        forgeBonus: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Armor.forgeBonusMystical" ),
          hint:     this.hintKey( "Armor.forgeBonusMystical" )
        } ),
      } ),
      initiativePenalty: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Armor.initiativePenalty" ),
        hint:     this.hintKey( "Armor.initiativePenalty" )
      } ),
      isLiving: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Armor.living" ),
        hint:     this.hintKey( "Armor.living" )
      } ),
      piecemeal: new fields.SchemaField( {
        isPiecemeal: new fields.BooleanField( {
          required: true,
          initial:  false,
          label:    this.labelKey( "Armor.piecemealArmor" ),
          hint:     this.hintKey( "Armor.piecemealArmor" )
        } ),
        size: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          max:      3,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Armor.piecemealArmorSize" ),
          hint:     this.hintKey( "Armor.piecemealArmorSize" )
        } ),
      }, {
        required: true,
        nullable: false,
        label:    this.labelKey( "Armor.piecemealArmor" ),
        hint:     this.hintKey( "Armor.piecemealArmor" )
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  Getters                       */
  /* -------------------------------------------- */

  /* -------------------------------------------- */
  /*  Migrations                        */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    const oldAvialabilities = [ "availabilityEveryday", "availabilityAverage", "availabilityUnusual", "availabilityRare", "availabilityVeryRare", "Everyday", "Average", "Unusual", "Rare", "VeryRare" ];
    const newAvialabilities = [ "everyday", "average", "unusual", "rare", "veryRare", "everyday", "average", "unusual", "rare", "veryRare" ];
    if ( oldAvialabilities.includes( source.availability ) ) {
      source.availability = newAvialabilities[oldAvialabilities.indexOf( source.availability )];
    }

    // Migrate Armor values
    // let physicalArmor = 0;
    // let mysticalArmor = 0;
    // let forgeBonusPhysical = 0;
    // let forgeBonusMystical = 0;

    // if ( source.Aphysicalarmor ) physicalArmor = source.Aphysicalarmor;
    // if ( source.Amysticalarmor ) mysticalArmor = source.Amysticalarmor;
    // if ( source.timesForgedPhysical ) forgeBonusPhysical = source.timesForgedPhysical;
    // if ( source.timesForgedMystical ) forgeBonusMystical = source.timesForgedMystical;

    if ( source.Aphysicalarmor ) {
      if ( source.timesForgedPhysical ) {
        source.physical = {
          armor:      source.Aphysicalarmor,
          forgeBonus: source.timesForgedPhysical
        };
      } else {
        source.physical = {
          armor:      source.Aphysicalarmor,
        };
      }
    }

    if ( source.Amysticarmor ) {
      if ( source.timesForgedMystical ) {
        source.mystical = {
          armor:      source.Amysticarmor,
          forgeBonus: source.timesForgedMystical
        };
      } else {
        source.mystical = {
          armor:      source.Amysticarmor,
        };
      }
    }
    
    // Migrate Initiative Penalty
    if ( source.armorPenalty ) {
      source.initiativePenalty = source.armorPenalty;
    }

    // Migrate Weight
    if ( source.weight && source.weight > 0 ) {
      let weightMultiplier = 1;
      let calculatedWeight = false;
      if ( source.weight.multiplier ) weightMultiplier = source.weight.multiplier;
      if ( source.weight.calculated ) calculatedWeight = source.weight.calculated;
      source.weight= {
        value:      source.weight,
        multiplier: weightMultiplier,
        calculated: calculatedWeight,
      };
    }

    // Migrate description
    if ( typeof source.description === "string" ) {
      source.description = { value: source.description };
    }

  }
}