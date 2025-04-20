import ClassTemplate from "./templates/class.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import DisciplineData from "./discipline.mjs";
import ED4E from "../../config/_module.mjs";
import { createContentLink, getSingleGlobalItemByEdid } from "../../utils.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

/**
 * Data model template with information on path items.
 * @property {string} sourceDiscipline source discipline related to the path
 */
export default class PathData extends ClassTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Path",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      sourceDiscipline: new fields.ForeignDocumentField( DisciplineData, {
        idOnly: true,
        label:    this.labelKey( "Class.sourceDiscipline" ),
        hint:     this.hintKey( "Class.sourceDiscipline" )
      } ),
      bloodMagicDamage: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  2,
        integer:  true,
        label:    this.labelKey( "Class.bloodMagicDamage" ),
        hint:     this.hintKey( "Class.bloodMagicDamage" )
      } ),
      pathKnack: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        type:     "Item",
        label:           this.labelKey( "Class.pathKnack" ),
        hint:            this.hintKey( "Class.pathKnack" ),
      } ),
      pathTalent: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        type:     "Item",
        label:           this.labelKey( "Class.pathTalent" ),
        hint:            this.hintKey( "Class.pathTalent" ),
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get increaseData() {
    const nextLevel = this.level + 1;

    const actor = this.containingActor;
    if ( !actor ) return null;
    const pathTalent = actor.items.find( item => item.type === "talent" && item.system.edid === this.edid );

    return {
      learn:              this.level === 0,
      nextLevel,
      nextLevelData:      this.advancement.levels.find( l => l.level === nextLevel ),
      nextTalentLpCost:   ED4E.legendPointsCost[ nextLevel + ED4E.lpIndexModForTier[ this.currentTier ] ],
      talentRequirements: pathTalent
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Rules.pathIncreaseShortRequirements" );
  }

  /** @inheritDoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const {  talentRequirements } = this.increaseData;
    const validationData = {
      [ED4E.validationCategories.talentsRequirement]: [
        {
          name:      "ED.Dialogs.Legend.Validation.pathTalent",
          value:     talentRequirements.name,
          fulfilled: talentRequirements.level >= this.level,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.requiredPathRank",
          value:     talentRequirements.system.level,
          fulfilled: talentRequirements.level >= this.level,
        },
      ]
    };
    return validationData;
  }

  /** @inheritDoc */
  get learnRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.pathLearnShortRequirements" );
  }
  
  /** @inheritDoc */
  static async learn( actor, item, createData ) {
    if ( !item.system.canBeLearned ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.Legend.cannotLearn" ) );
      return;
    }

    const pathKnack = await getSingleGlobalItemByEdid( item.system.edid, "knackAbility" );
    const pathKnackLink = pathKnack ? 
      createContentLink( pathKnack.uuid, pathKnack.name ) 
      : game.i18n.localize( "ED.Dialogs.Legend.pathKnackNotFound" );
    const pathTalent = await getSingleGlobalItemByEdid( item.system.edid, "talent" );
    const pathTalentLink = pathTalent ? 
      createContentLink( pathTalent.uuid, pathTalent.name ) 
      : game.i18n.localize( "ED.Dialogs.Legend.pathKnackNotFound" );

    if ( !pathKnack || !pathTalent ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.Legend.cannotLearn" ) );
      return;
    }


    let learnedPathTalent;
    if ( !actor.items.find( talent => talent.type === "talent" && talent.system.edid === item.system.edid ) ) {
      const content = ` 
      <p>${game.i18n.format( "ED.Dialogs.Legend.learnPathTalentPrompt", {pathTalent: item.name,} ) }</p>
      <p>${ pathTalentLink }</p>
      `;

      const learn = await DialogEd.confirm( {
        rejectClose: false,
        content:     await TextEditor.enrichHTML( content ),
      } );
      if ( !learn ) return;

      if ( learn ) {
        learnedPathTalent = await pathTalent.system.constructor.learn( actor, pathTalent );
      }
    }

    let learnedPathKnack;
    if ( !actor.items.find( knack => knack.type === "knackAbility" && knack.system.edid === item.system.edid ) ) {
      const content = ` 
      <p>${game.i18n.format( "ED.Dialogs.Legend.learnPathKnackPrompt", {pathKnack: item.name,} ) }</p>
      <p>${ pathKnackLink }</p>
      `;

      const learn = await DialogEd.confirm( {
        rejectClose: false,
        content:     await TextEditor.enrichHTML( content ),
      } );
      if ( !learn ) return;

      if ( learn ) {
        learnedPathKnack = await pathKnack.system.constructor.learn( actor, pathKnack );
      }
    }

    const pathItemData = item.toObject();
    pathItemData.system.level = 0;
    pathItemData.system.pathTalent = learnedPathTalent?.uuid;
    pathItemData.system.pathKnack = learnedPathKnack?.uuid;

    const learnedPath = ( await actor.createEmbeddedDocuments( "Item", [ pathItemData ] ) )?.[0];
    if ( !learnedPath ) throw new Error(
      "Error learning path item. Could not create embedded Items."
    );

    learnedPath.system.increase();

    return learnedPath;
  }

  /** @inheritDoc */
  async increase() {
    if ( !this.isActorEmbedded ) return;
  
    const nextLevel = this.level + 1;
    const pathTalent = await fromUuid( this.pathTalent );
    if ( pathTalent.system.level < nextLevel ) {
      const content =  `
          <p>
            ${game.i18n.format( "ED.Dialogs.Legend.increasePathTalentPrompt" )}
          </p>
          <p>
            ${createContentLink( pathTalent.uuid, pathTalent.name )}
          </p>
        `;
      const increasePathTalent = await DialogEd.confirm( {
        rejectClose: false,
        content:     await TextEditor.enrichHTML( content ),
      } );
      if ( increasePathTalent ) {
        await pathTalent.system.increase();
      }
    }

    const updatedPath = await super.increase();
    if ( updatedPath?.system.level !== nextLevel ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.Legend.classIncreaseProblems" )
      );
      return;
    }
  
    return this.parent;
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