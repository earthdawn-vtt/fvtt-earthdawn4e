import ClassTemplate from "./templates/class.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ED4E from "../../config/_module.mjs";
import { linkForUuidSync } from "../../utils.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";

const { isEmpty } = foundry.utils;

/**
 * Data model template with information on discipline items.
 * @property {number} durability durability value
 */
export default class DisciplineData extends ClassTemplate.mixin(
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Discipline",
  ];

  /** @inheritDoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      durability: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
      // identifier for additional disciplines
      order: new fields.NumberField( {
        required: true,
        nullable: false,
        min:      1,
        initial:  1,
        positive: true,
        integer:  true,
      } ),
    } );
  }

  /* -------------------------------------------- */
  /*  LP Tracking                                 */
  /* -------------------------------------------- */

  /** @inheritDoc */
  get increaseData() {
    const nextLevel = this.level + 1;
    let talentRequirements = [];

    switch ( game.settings.get( "ed4e", "lpTrackingCircleTalentRequirements" ) ) {
      case "disciplineTalents": {
        talentRequirements.push( ...this._talentRequirementsStandard );
        break;
      }
      case "allTalents": {
        talentRequirements.push( ...this._talentRequirementsOptional );
        break;
      }
      case "allTalentsHouseRule": {
        talentRequirements.push( ...this._talentRequirementsHouseRule );
        break;
      }
    }

    return {
      learn:            this.level === 0,
      nextLevel,
      nextLevelData:    this.advancement.levels.find( l => l.level === nextLevel ),
      nextTalentLpCost: ED4E.legendPointsCost[ nextLevel + ED4E.lpIndexModForTier[ this.currentTier ] ],
      talentRequirements,
    };
  }

  /**
   * @inheritDoc
   */
  get increaseRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.disciplineIncreaseShortRequirements" );
  }

  /** @inheritDoc */
  get increaseValidationData() {
    if ( !this.isActorEmbedded ) return undefined;

    const { learn, nextTalentLpCost, talentRequirements } = this.increaseData;
    const validationData = {
      [ED4E.validationCategories.resources]:               [
        {
          name:      "ED.Dialogs.Legend.Validation.availableLp",
          value:     this.requiredLpForIncrease,
          fulfilled: this.requiredLpForIncrease <= this.containingActor.currentLp,
        },
        {
          name:      "ED.Dialogs.Legend.Validation.availableMoney",
          value:     this.requiredMoneyForIncrease,
          fulfilled: this.requiredMoneyForIncrease <= this.parent.actor.currentSilver,
        },
      ],
      [ED4E.validationCategories.talentsRequirement]: talentRequirements,
    };
    if ( !learn ) validationData[ED4E.validationCategories.newAbilityLp] = [
      {
        name:      "ED.Dialogs.Legend.Validation.talentOptionLp",
        value:     this.requiredLpForIncrease,
        fulfilled: nextTalentLpCost <= this.containingActor.currentLp,
      },
    ];
    return validationData;
  }

  /** @inheritDoc */
  get learnRules() {
    return game.i18n.localize( "ED.Dialogs.Legend.Rules.disciplineLearnShortRequirements" );
  }

  /** @inheritDoc */
  get requiredMoneyForIncrease() {
    return ED4E.disciplineTeacherCost[ this.level + 1 ];
  }

  /**
   * Get all talents from the discipline associated with this item.
   * @type {ItemEd[]}
   */
  get talentsFromDiscipline() {
    return this.containingActor.itemTypes.talent.filter(
      talent => talent.system.source.class === this.parent.uuid
    );
  }

  get _talentRequirementsStandard() {
    const nextLevel = this.level + 1;
    const disciplineTalents = this.getTalentsByCategory( "discipline" );
    const unfulfilledTalents = disciplineTalents.filter( talent => talent.system.level < nextLevel );
    const fulfilled = unfulfilledTalents.length === 0;
    const requirementValue = game.i18n.format(
      `ED.Dialogs.Legend.Validation.${
        fulfilled
          ? "talentsRequirementFulfilled"
          : "talentsRequirementFailed"
      }`,
      {
        requiredLevel:      nextLevel,
        unfulfilledTalents: unfulfilledTalents.map(
          talent => linkForUuidSync( talent.uuid )
        ).join( "\n" ),
      }
    );
    return [
      {
        name:      ED4E.circleTalentRequirements[
          game.settings.get( "ed4e", "lpTrackingCircleTalentRequirements" )
        ],
        value:     requirementValue,
        fulfilled,
      }
    ];
  }

  get _talentRequirementsOptional() {
    const nextLevel = this.level + 1;
    const allCorrespondingTalents = this.talentsFromDiscipline.filter(
      talent => talent.system.talentCategory !== "free"
    );

    // check if there is a talent from the current circle on the new level
    const talentsFromCurrentCircle = allCorrespondingTalents.filter(
      talent => talent.system.source.atLevel === this.level
    );
    const hasTalentFromCurrentCircle = talentsFromCurrentCircle.some(
      talent => talent.system.level === nextLevel
    );

    // check if there are enough talents on the minimum rank
    const talentsOnMinRank = allCorrespondingTalents.filter(
      talent => talent.system.level >= nextLevel <= 11 ? nextLevel : nextLevel - 1
    );
    const numTalentsOnMinRank = talentsOnMinRank.length;
    const numTalentsRequired = nextLevel + 3;
    const hasEnoughTalents = numTalentsOnMinRank >= numTalentsRequired;

    return [
      {
        name:      "ED.Dialogs.Legend.Validation.hasTalentFromCurrentCircle",
        value:     game.i18n.format(
          hasTalentFromCurrentCircle
            ? "ED.Dialogs.Legend.Validation.talentFromCurrentCircleOnNewLevel"
            : "ED.Dialogs.Legend.Validation.noTalentFromCurrentCircleOnNewLevel",
          { nextLevel },
        ),
        fulfilled: hasTalentFromCurrentCircle,
      },
      {
        name:      "ED.Dialogs.Legend.Validation.hasTalentsOnMinRank",
        value:     game.i18n.format(
          hasEnoughTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOnMinRank"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOnMinRank",
          {
            required: numTalentsRequired,
            current:  numTalentsOnMinRank,
            nextLevel,
          }
        ),
        fulfilled: hasEnoughTalents,
      },
    ];
  }

  get _talentRequirementsHouseRule() {
    const nextLevel = this.level + 1;
    const tierInfos = {
      novice:     this.getTalentsByTier( "novice" ),
      journeyman: this.getTalentsByTier( "journeyman" ),
      warden:     this.getTalentsByTier( "warden" ),
      master:     this.getTalentsByTier( "master" ),
    };
    const minTalentsPerTier = {
      novice:     Math.min( this.level + 4, 8 ),
      journeyman: Math.min( this.level >= 6 ? this.level - 5 : 0, 4 ),
      warden:     Math.min( this.level >= 10 ? this.level - 9 : 0, 4 ),
      master:     Math.min( this.level >= 14 ? this.level - 13 : 0, 2 ),
    };

    const hasRequiredNoviceTalents = tierInfos.novice.length >= minTalentsPerTier.novice;
    const hasRequiredJourneymanTalents = tierInfos.journeyman.length >= minTalentsPerTier.journeyman;
    const hasRequiredWardenTalents = tierInfos.warden.length >= minTalentsPerTier.warden;
    const hasRequiredMasterTalents = tierInfos.master.length >= minTalentsPerTier.master;

    const hasTalentFromCurrentCircle = this.talentsFromDiscipline.some(
      talent =>
        talent.system.source.atLevel === this.level
        && talent.system.level === nextLevel
    );

    return [
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredNoviceTalents",
        value: game.i18n.format(
          hasRequiredNoviceTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.novice, current: tierInfos.novice.length, nextLevel }
        ),
        fulfilled: hasRequiredNoviceTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredJourneymanTalents",
        value: game.i18n.format(
          hasRequiredJourneymanTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.journeyman, current: tierInfos.journeyman.length, nextLevel }
        ),
        fulfilled: hasRequiredJourneymanTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredWardenTalents",
        value: game.i18n.format(
          hasRequiredWardenTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.warden, current: tierInfos.warden.length, nextLevel }
        ),
        fulfilled: hasRequiredWardenTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasRequiredMasterTalents",
        value: game.i18n.format(
          hasRequiredMasterTalents
            ? "ED.Dialogs.Legend.Validation.enoughTalentsOfTier"
            : "ED.Dialogs.Legend.Validation.notEnoughTalentsOfTier",
          { required: minTalentsPerTier.master, current: tierInfos.master.length, nextLevel }
        ),
        fulfilled: hasRequiredMasterTalents,
      },
      {
        name:  "ED.Dialogs.Legend.Validation.hasTalentFromCurrentCircle",
        value: game.i18n.format(
          hasTalentFromCurrentCircle
            ? "ED.Dialogs.Legend.Validation.talentFromCurrentCircleOnNewLevel"
            : "ED.Dialogs.Legend.Validation.noTalentFromCurrentCircleOnNewLevel",
          { nextLevel }
        ),
        fulfilled: hasTalentFromCurrentCircle,
      },
    ];
  }

  /**
   * Get all talents associated with this discipline that are of the given category.
   * @param {keyof typeof ED4E.talentCategory} category   The category to filter for.
   * @returns {ItemEd[]}                                  The talents of the given category.
   */
  getTalentsByCategory( category ) {
    return this.talentsFromDiscipline.filter( talent => talent.system.talentCategory === category );
  }

  /**
   * Get all talents associated with this discipline that are of the given tier.
   * @param {keyof typeof ED4E.tier} tier   The tier to filter for.
   * @returns {ItemEd[]}                    The talents of the given tier.
   */
  getTalentsByTier( tier ) {
    return this.talentsFromDiscipline.filter( talent => talent.system.tier === tier );
  }

  /**
   * Whether this discipline is a spellcasting discipline.
   * Automatically determined by checking if the discipline has a casting type.
   * @type {boolean}
   */
  get isSpellcasting() {
    return !!this.getCastingType();
  }

  /** @inheritDoc */
  static async learn( actor, item, createData = {} ) {
    if ( isEmpty( actor.disciplines && actor.itemTypes.questor ) ) {
      ui.notifications.warn( game.i18n.localize( "ED.Notifications.Warn.firstClassViaCharGen" ) );
    }

    const disciplineCreateData = foundry.utils.mergeObject(
      createData,
      {
        "system.level": 0,
        "system.order": actor.disciplines.length + 1,
      }
    );

    const learnedDiscipline = await super.learn( actor, item, disciplineCreateData );
    if ( !learnedDiscipline ) throw new Error(
      "Error learning discipline item. Could not create embedded Items."
    );

    learnedDiscipline.system.increase();

    return learnedDiscipline;
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */  /** @inheritDoc */
  static migrateData( source ) {
    // Skip migration if already properly migrated (has levels)
    if ( source?.advancement?.levels?.length > 0 ) {
      return;
    }

    // Migrate basic description data
    migrateLegacyDescription( source );
    
    // Migrate tier-based talent pools
    migrateTierTalentPools( source );
    
    // Create default levels and migrate circle-specific talents
    migrateCircleLevels( source );

    /**
     * Migrate legacy description format.
     * @param {object} source - The source data object
     */
    function migrateLegacyDescription( source ) {
      if ( typeof source?.description === "string" && source?.description !== undefined ) {
        source.description = source.description + source.descriptionGameInfo;
        DescriptionMigration.migrateData( source );
      }
    }

    /**
     * Migrate tier-based talent pools from legacy format.
     * @param {object} source - The source data object
     */
    function migrateTierTalentPools( source ) {
      if ( !source?.descriptionNovice ) return;

      const novicePoolTalents = parseTalentLinks( source.descriptionNovice );
      let journeymanPoolTalents = parseTalentLinks( source.descriptionJourneyman );
      journeymanPoolTalents = journeymanPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) );
      let wardenPoolTalents = parseTalentLinks( source.descriptionWarden );
      wardenPoolTalents = wardenPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) && !journeymanPoolTalents.includes( talent ) );
      let masterPoolTalents = parseTalentLinks( source.descriptionMaster );
      masterPoolTalents = masterPoolTalents.filter( talent => !novicePoolTalents.includes( talent ) && !journeymanPoolTalents.includes( talent ) && !wardenPoolTalents.includes( talent ) );
      
      source.advancement ??= {};
      source.advancement.abilityOptions ??= {};
      
      // Assign talent pools to their respective tiers
      assignTalentsToTier( source, "novice", novicePoolTalents );
      assignTalentsToTier( source, "journeyman", journeymanPoolTalents );
      assignTalentsToTier( source, "warden", wardenPoolTalents );
      assignTalentsToTier( source, "master", masterPoolTalents );
    }

    /**
     * Assign talents to a specific tier.
     * @param {object} source - The source data object
     * @param {string} tier - The tier name
     * @param {string[]} talents - Array of talent UUIDs
     */
    function assignTalentsToTier( source, tier, talents ) {
      for ( const talent of talents ) {
        source.advancement.abilityOptions[tier] ??= [];
        source.advancement.abilityOptions[tier].push( talent );
      }
    }

    /**
     * Create default levels and migrate circle-specific talents.
     * @param {object} source - The source data object
     */
    function migrateCircleLevels( source ) {
      if ( !source ) return;

      // Skip if levels already exist - never overwrite existing level data
      if ( source.advancement?.levels?.length > 0 ) {
        return; // Already has levels, don't overwrite
      }

      // Check for legacy description fields - only migrate if we have them
      const legacyFields = Object.keys( source ).filter( key => key.startsWith( "descriptionCircle" ) );
      if ( legacyFields.length === 0 ) {
        return;
      }

      source.advancement ??= {};
      source.advancement.levels = [];
      
      const tierByCircle = ED4E.levelTierMapping.discipline;
      
      // Create 15 levels
      for ( let i = 1; i <= 15; i++ ) {
        const levelData = createLevelData( i, tierByCircle[i] );
        migrateLevelTalents( source, levelData, i );
        source.advancement.levels.push( levelData );
      }
    }



    /**
     * Create level data structure.
     * @param {number} level - The level number
     * @param {string} tier - The tier name
     * @returns {object} Level data object
     */
    function createLevelData( level, tier ) {
      return {
        level,
        tier,
        abilities: {
          class:   [],
          free:    [],
          special: []
        },
        effects:      [],
        resourceStep: level < 13 ? 4 : 5,
      };
    }

    /**
     * Migrate talents for a specific level from circle descriptions.
     * @param {object} source - The source data object
     * @param {object} levelData - The level data object to populate
     * @param {number} circleNumber - The circle number
     */
    function migrateLevelTalents( source, levelData, circleNumber ) {
      const circleDescriptionKey = `descriptionCircle${circleNumber}`;
      if ( source[circleDescriptionKey] ) {
        const classTalents = parseTalentLinks( source[circleDescriptionKey] );
        levelData.abilities.class = validateAndFilterTalents( classTalents, circleNumber );
      }
    }

    /**
     * Validate talent UUIDs and return only valid ones.
     * @param {string[]} talentUuids - Array of talent UUIDs to validate
     * @param {number} circleNumber - The circle number for error reporting
     * @returns {string[]} - Array of valid talent UUIDs
     */
    function validateAndFilterTalents( talentUuids, circleNumber ) {
      const validTalents = [];
      for ( const talent of talentUuids ) {
        const item = fromUuidSync( talent );
        if ( item ) {
          validTalents.push( item.uuid );
        } else { 
          // Add migration error info to description
          source.description ??= {};
          source.description.value ??= "";
          source.description.value += `<h3>Circle${circleNumber}</h3><p><strong>unsolved migration objects:</strong></p><p> ${talent}</p>`;
        }
      }
      return validTalents;
    }

    /**
     * Parse talent links from description text.
     * @param {string} input   The input string containing talent links.
     * @returns {string[]}     Array of parsed talent UUIDs.
     */    function parseTalentLinks( input ) {
      // Remove HTML tags and quotes
      let clean = input.replace( /<[^>]+>/g, "" ).replace( /"/g, "" ).trim();

      // Split by '@' and filter out empty entries
      let parts = clean.split( "@" ).filter( Boolean );

      return parts.map( part => {
        let cleanPart = part;
        // Remove everything in {} including the brackets
        cleanPart = cleanPart.replace( /\{[^}]*\}/g, "" );
        // Replace [<compendium>.<collection>. with .<compendium>.<collection>.Item.
        cleanPart = cleanPart.replace(
          /\[([^.]+\.[^.]+\.)/,
          ( match, p1 ) => "." + p1 + "Item."
        );
        // Remove all ]
        cleanPart = cleanPart.replace( /\]/g, "" );
        // Remove trailing commas and whitespace
        cleanPart = cleanPart.replace( /,\s*$/, "" ).trim();
        // Remove \n and &nbsp;
        cleanPart = cleanPart.replace( /\n/g, "" ).replace( /&nbsp;/g, "" );
        return cleanPart;
      } );
    }


  }
}