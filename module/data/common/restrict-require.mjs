import EdIdField from "../fields/edid-field.mjs";
import ED4E from "../../config/_module.mjs";
import SparseDataModel from "../abstract/sparse-data-model.mjs";

const { fields } = foundry.data;

/**
 * Base model for storing data that represents a restriction or requirement for learning something, mainly knacks.
 * Intended to be used as an EmbeddedDataField.
 * @abstract
 */
export class ConstraintData extends SparseDataModel {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.Constraint",
  ];

  /* -------------------------------------------- */
  /* Properties                                   */
  /* -------------------------------------------- */

  static get TYPES() {
    // eslint-disable-next-line no-return-assign
    return ConstraintData.#TYPES ??= Object.freeze( {
      [AbilityConstraintData.TYPE]:    AbilityConstraintData,
      [AttributeConstraintData.TYPE]:  AttributeConstraintData,
      [ClassConstraintData.TYPE]:      ClassConstraintData,
      [LanguageConstraintData.TYPE]:   LanguageConstraintData,
      [NamegiverConstraintData.TYPE]:  NamegiverConstraintData,
      [RelationConstraintData.TYPE]:   RelationConstraintData,
      [SpellConstraintData.TYPE]:      SpellConstraintData,
    } );
  }

  static #TYPES;

  static TYPE = "";

  /* -------------------------------------------- */
  /*  Schema                                      */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      type: new fields.StringField( {
        required:        true,
        blank:           false,
        initial:         this.TYPE,
        validate:        value => value === this.TYPE,
        validationError: `must be equal to "${this.TYPE}"`,
      } ),
    };
  }

  get summaryString() {
    return [
      `<em>${ ED4E.constraints[ this.constructor.TYPE ].label }</em>`,
      "&emsp;",
      ...Object.values( this )
    ].join( " " );
  }
}

export class AbilityConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "ability", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      ability: new EdIdField(),
      rank:    new fields.NumberField( {
        required: false,
        integer:  true,
        positive: true,
      } ),
    } );
  }

}

export class AttributeConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "attribute", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      attribute: new fields.StringField( {
        required: true,
        choices:  ED4E.attributes,
        initial:  "str",
      } ),
      value: new fields.NumberField( {
        required: true,
        integer:  true,
        positive: true,
      } ),
    } );
  }

}

export class ClassConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "class", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      class: new EdIdField(),
      level: new fields.NumberField( {
        required: false,
        integer:  true,
        positive: true,
      } ),
    } );
  }

}

export class LanguageConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "language", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      language: new fields.StringField( {
        // this needs to be adjusted? Or will be fine if the config <-> settings interaction is cleared up
        // or, prepare choices during rendering...
        choices:  ED4E.languages,
        initial:  "dwarf",
      } ),
    } );
  }

}

export class NamegiverConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "namegiver", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      namegiver: new EdIdField(),
    } );
  }

}

export class RelationConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "relation", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      relation: new fields.StringField(),
    } );
  }

}

export class SpellConstraintData extends ConstraintData {

  static {
    Object.defineProperty( this, "TYPE", { value: "spell", } );
  }

  /** @inheritdoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      spell: new EdIdField(),
    } );
  }

}
