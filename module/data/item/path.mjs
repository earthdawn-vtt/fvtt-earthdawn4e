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

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Path",
  ];

  // endregion

  // region Static Methods

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

  /** @inheritDoc */
  async _mapExistingEffects() {
    const sourceDiscipline = /** @type {ItemEd} */ await fromUuid( this.sourceDiscipline );

    const mapped = {};

    for ( const effect of this.containingActor.classEffects ) {
      this._validateSingleChange( effect, "existing" );

      const key = effect.changes[0].key;
      const value = Number( effect.changes[0].value ) || 0;
      const sourceType = effect.system.source?.documentOriginType;
      const effectSourceItem = /** @type {ItemEd} */ await fromUuid( effect.system.source?.documentOriginUuid );


      if ( !mapped[key] ) {
        mapped[key] = {
          totalValue:        0,
          effects:           [],
          disciplineEffects: [],
          pathEffects:       []
        };
      }

      mapped[key].totalValue += value;
      mapped[key].effects.push( effect );

      // Categorize effects by their source type and discipline relationship
      if ( sourceType === "discipline" ) {
        // Check if this discipline effect belongs to our path's source discipline
        if ( effectSourceItem?.system.edid === sourceDiscipline?.system.edid ) {
          mapped[key].disciplineEffects.push( {effect, value} );
        }
      } else if ( sourceType === "path" ) {
        // Check if this path effect belongs to the same discipline as our path
        if ( effectSourceItem?.system?.sourceDiscipline === this.sourceDiscipline ) {
          mapped[key].pathEffects.push( {effect, value} );
        }
      }
    }

    return mapped;
  }

  /** @inheritDoc */
  async _determineEffectChanges( newEffects, existingEffects ) {
    // existingEffects is the object prepared in _mapExistingEffects
    // its format is not determined yet and depends on how this function would
    // work best

    // For each new effect, find effects with same change key that belong the
    // discipline that this path belongs to. Take the effect with the highest
    // value. Add that value and the current effect's value together. Also look
    // for other paths in the containing actor that belong to the same
    // discipline and see if they have effects with the same key. If so, add
    // their values as well.
    // If there is no effect with the same key, just take the current new
    // effect's value.
    // Check in the existing effects if there is an effect with the same key.
    // If so, if the existing value is lower than the new value, add the existing
    // effect to the array of effects to be deleted and add the current new effect
    // and the found corresponding discipline and path effect to the array of
    // effects to be created.
    // If the existing value is higher than the new value, do nothing.
    // If there is no existing effect with the same key, add the current new effect
    // and the found corresponding discipline effect, if any, to the array of
    // effects to be created.

    const effectsToAdd = [];
    const effectsToRemove = [];

    for ( const newEffect of newEffects ) {
      this._validateSingleChange( newEffect, "new" );

      const key = newEffect.changes[0].key;
      const newValue = Number( newEffect.changes[0].value ) || 0;
      const existing = existingEffects[key];

      // Calculate the combined value for this path's discipline effects
      let combinedValue = newValue;

      // Compare with existing total value
      if ( existing ) {

        // Add the highest discipline effect value for the same key from our source discipline
        if ( existing.disciplineEffects?.length > 0 ) {
          const highestDisciplineValue = Math.max( ...existing.disciplineEffects.map( e => e.value ) );
          combinedValue += highestDisciplineValue;
        }

        // Add values from other paths that belong to the same discipline
        if ( existing.pathEffects?.length > 0 ) {
          const pathEffectsFromSameDiscipline = existing.pathEffects.filter( pathEffect => {
            const pathItem = fromUuidSync( pathEffect.effect.system.source?.documentOriginUuid );
            return pathItem?.system?.sourceDiscipline === this.sourceDiscipline;
          } );

          // Add all path effect values from the same discipline
          combinedValue += pathEffectsFromSameDiscipline.reduce( ( sum, pathEffect ) => sum + pathEffect.value, 0 );
        }

        if ( existing.totalValue < combinedValue ) {
          // Remove all existing effects for this key
          effectsToRemove.push( ...existing.effects );

          // Add the new effect
          effectsToAdd.push( newEffect );

          // Re-add discipline effects from our source discipline
          if ( existing.disciplineEffects?.length > 0 ) {
            const highestDisciplineEffect = existing.disciplineEffects.reduce( ( highest, current ) =>
              current.value > highest.value ? current : highest
            ).effect;
            effectsToAdd.push( highestDisciplineEffect );
          }

          // Re-add path effects from the same discipline (excluding the current path)
          if ( existing.pathEffects?.length > 0 ) {
            const pathEffectsFromSameDiscipline = existing.pathEffects.filter( pathEffect => {
              const pathItem = fromUuidSync( pathEffect.effect.system.source?.documentOriginUuid );
              return pathItem?.system?.sourceDiscipline === this.sourceDiscipline &&
                     pathItem?.uuid !== this.parent.uuid;
            } );

            pathEffectsFromSameDiscipline.forEach( pathEffect => {
              effectsToAdd.push( pathEffect.effect );
            } );
          }
        }
        // If existing value is higher or equal, do nothing
      } else {
        // No existing effect with this key
        effectsToAdd.push( newEffect );

        // Look for discipline effects with the same key from our source discipline
        // We need to check all discipline items on the actor
        const disciplineItems = this.containingActor.items.filter( item =>
          item.type === "discipline" && item.system.edid === this.sourceDiscipline
        );

        disciplineItems.forEach( discipline => {
          const disciplineEffects = this.containingActor.effects.filter( effect =>
            effect.system.source?.documentOriginUuid === discipline.uuid &&
            effect.changes?.[0]?.key === key
          );

          if ( disciplineEffects.length > 0 ) {
            // Take the highest value discipline effect
            const highestDisciplineEffect = disciplineEffects.reduce( ( highest, current ) => {
              const currentValue = Number( current.changes[0].value ) || 0;
              const highestValue = Number( highest.changes[0].value ) || 0;
              return currentValue > highestValue ? current : highest;
            } );
            effectsToAdd.push( highestDisciplineEffect );
          }
        } );
      }
    }

    return { effectsToAdd, effectsToRemove };
  }

  // endregion

  // endregion
}