import { ItemDataModel } from "../../abstract.mjs";
import TargetTemplate from "./targeting.mjs";
import ED4E from "../../../config.mjs";

/**
 * Data model template with information on items that are used to represent custom active effects.
 */
export default class MagicTemplate extends ItemDataModel .mixin(
  TargetTemplate 
) {
  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      magicType: new fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        trim:     true,
        choices:  ED4E.spellcastingTypes,
        label:    this.labelKey( "Spell.magicType" ),
        hint:     this.hintKey( "Spell.magicType" )
      } ),
      level: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        integer:  true,
        positive: true,
        label:    this.labelKey( "Spell.circle" ),
        hint:     this.hintKey( "Spell.circle" )
      } ), 
      threadsrequired: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Spell.threadsrequired" ),
        hint:     this.hintKey( "Spell.threadsrequired" )
      } ),
      weavingdifficulty: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Spell.weavingdifficulty" ),
        hint:     this.hintKey( "Spell.weavingdifficulty" )
      } ),
      reattunedifficulty: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Spell.reattunedifficulty" ),
        hint:     this.hintKey( "Spell.reattunedifficulty" )
      } ),
      effect: new fields.StringField( {
        required: true,
        blank:    true,
        initial:  "",
        label:    this.labelKey( "Spell.effect" ),
        hint:     this.hintKey( "Spell.effect" )
      } ),
      concentration: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Spell.concentration" ),
        hint:     this.hintKey( "Spell.concentration" )
      } ),
      binding: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Spell.binding" ),
        hint:     this.hintKey( "Spell.binding" )
      } ),
      spirit: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Spell.spirit" ),
        hint:     this.hintKey( "Spell.spirit" )
      } ),
      summoning: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Spell.summoning" ),
        hint:     this.hintKey( "Spell.summoning" )
      } ),
      resist: new fields.BooleanField( {
        required: true,
        initial:  false,
        label:    this.labelKey( "Spell.resist" ),
        hint:     this.hintKey( "Spell.resist" )
      } ),
      duration: new fields.SchemaField( {
        value: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "0",
          label:    this.labelKey( "Spell.duration.value" ),
          hint:     this.hintKey( "Spell.duration.value" )
        } ),
        uom: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "rd",
          label:    this.labelKey( "Spell.duration.uom" ),
          hint:     this.hintKey( "Spell.duration.uom" )
        } )
      },
      {
        label:    this.labelKey( "Spell.duration" ),
        hint:     this.hintKey( "Spell.duration" )
      } ),
      range: new fields.SchemaField( {
        value: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "0",
          label:    this.labelKey( "Spell.range.value" ),
          hint:     this.hintKey( "Spell.range.value" )
        } ),
        uom: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "yard",
          label:    this.labelKey( "Spell.range.uom" ),
          hint:     this.hintKey( "Spell.range.uom" )
        } )
      },
      {
        label:    this.labelKey( "Spell.range" ),
        hint:     this.hintKey( "Spell.range" )
      } ),
      spellArea: new fields.SchemaField( {
        shape: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "0",
          label:    this.labelKey( "Spell.spellArea.shape" ),
          hint:     this.hintKey( "Spell.spellArea.shape" )
        } ),
        value: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "0",
          label:    this.labelKey( "Spell.spellArea.value" ),
          hint:     this.hintKey( "Spell.spellArea.value" )
        } ),
        uom: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "yard",
          label:    this.labelKey( "Spell.spellArea.uom" ),
          hint:     this.hintKey( "Spell.spellArea.uom" )
        } )
      },
      {
        label:    this.labelKey( "Spell.spellArea" ),
        hint:     this.hintKey( "Spell.spellArea" )
      } ),
      spellIllusion: new fields.SchemaField( {
        illusionType: new fields.StringField( {
          required:   true,
          blank:      false,
          initial:    "figment",
          choice:     ED4E.illusionType,
          label:      this.labelKey( "Spell.illusionType" ),
          hint:       this.hintKey( "Spell.illusionType" )
        } ),
        sensingDifficulty: new fields.NumberField( {
          required: true,
          nullable: false,
          min:      0,
          initial:  0,
          integer:  true,
          label:    this.labelKey( "Spell.sensingDifficulty" ),
          hint:     this.hintKey( "Spell.sensingDifficulty" )
        } )
      },
      {
        label:    this.labelKey( "Spell.spellIllustion" ),
        hint:     this.hintKey( "Spell.spellIllustion" )
      } ),
      spellElement: new fields.SchemaField( {
        elementType: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "",
          label:    this.labelKey( "Spell.elementType" ),
          hint:     this.hintKey( "Spell.elementType" )
        } ),
        elementSubtype: new fields.StringField( {
          required: true,
          blank:    true,
          initial:  "",
          label:    this.labelKey( "Spell.elementSubtype" ),
          hint:     this.hintKey( "Spell.elementSubtype" )
        } )
      },
      {
        label:    this.labelKey( "Spell.spellElement" ),
        hint:     this.hintKey( "Spell.spellElement" )
      } ),
      // @chriss its not working like this
      // extraSuccessesList: [],
      // extraThreadsList: [],
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