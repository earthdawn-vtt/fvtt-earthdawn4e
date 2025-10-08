import ClassTemplate from "./templates/class.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import { createContentLink, getSingleGlobalItemByEdid } from "../../utils.mjs";
import DialogEd from "../../applications/api/dialog.mjs";

/**
 * Data model template with information on path items.
 * @property {string} sourceDiscipline ED-ID for source discipline related to the path
 */
export default class PathData extends ClassTemplate.mixin(
  ItemDescriptionTemplate
) {

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      sourceDiscipline: new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
      bloodMagicDamage: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  2,
        integer:  true,
      } ),
      pathKnack: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        type:     "Item",
      } ),
      pathTalent: new fields.DocumentUUIDField( {
        required: true,
        nullable: true,
        type:     "Item",
      } ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Path",
  ];

  // endregion

  // region Properties

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

  /** @inheritDoc */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.pathIncreaseShortRequirements" );
  }

  /** @inheritDoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const {  talentRequirements } = this.increaseData;
    return {
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
  }

  /** @inheritDoc */
  get learnRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.pathLearnShortRequirements" );
  }

  // endregion

  // region LP Tracking

  // region LP Learning

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    const pathKnack = await getSingleGlobalItemByEdid( item.system.edid, "knackAbility" );
    const pathKnackLink = pathKnack ? 
      createContentLink( pathKnack.uuid, pathKnack.name ) 
      : game.i18n.localize( "ED.Dialogs.Legend.pathKnackNotFound" );
    const pathTalent = await getSingleGlobalItemByEdid( item.system.edid, "talent" );
    const pathTalentLink = pathTalent ? 
      createContentLink( pathTalent.uuid, pathTalent.name ) 
      : game.i18n.localize( "ED.Dialogs.Legend.pathKnackNotFound" );

    if ( !pathKnack || !pathTalent ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.cannotLearn" ) );
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
        content:     await foundry.applications.ux.TextEditor.enrichHTML( content ),
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
        content:     await foundry.applications.ux.TextEditor.enrichHTML( content ),
      } );
      if ( !learn ) return;

      if ( learn ) {
        learnedPathKnack = await pathKnack.system.constructor.learn( actor, pathKnack );
      }
    }

    const pathCreateData = foundry.utils.mergeObject(
      createData,
      {
        "system.level":      0,
        "system.pathTalent": learnedPathTalent?.uuid,
        "system.pathKnack":  learnedPathKnack?.uuid,
      }
    );

    const learnedPath = await super.learn( actor, item, pathCreateData );
    if ( !learnedPath ) throw new Error(
      "Error learning path item. Could not create embedded Items."
    );

    learnedPath.system.increase();

    return learnedPath;
  }

  // endregion

  // region LP Increase

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
        content:     await foundry.applications.ux.TextEditor.enrichHTML( content ),
      } );
      if ( increasePathTalent ) {
        await pathTalent.system.increase();
      }
    }

    const updatedPath = await super.increase();
    if ( updatedPath?.system.level !== nextLevel ) {
      ui.notifications.warn(
        game.i18n.localize( "ED.Notifications.Warn.classIncreaseProblems" )
      );
      return;
    }
  
    return this.parent;
  }

  // endregion

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign( rollData, super.getTemplatesRollData() );
    return Object.assign( rollData, {} );
  }

  // endregion

}