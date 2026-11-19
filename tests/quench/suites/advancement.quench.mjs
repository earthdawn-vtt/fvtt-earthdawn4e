import ClassAdvancementDialog from "../../../module/applications/advancement/class-advancement.mjs";
import LearnSpellPrompt from "../../../module/applications/advancement/learn-spell.mjs";

/**
 * Advance a test Actor through the real item-learning workflow using choices from the rendered form.
 * Check that the chosen option, circle abilities and spells are added, and other spells are not.
 * Only user decisions are automated; all test documents are deleted afterward.
 * @param {object} context The Quench test context.
 */
export default ( { describe, it, expect } ) => {
  describe( "Circle advancement", () => {
    for ( const count of [ 1, 2 ] ) {
      it( `adds the selected option, circle abilities and ${count} selected spells to the Actor`, async () => {
        const sources = [];
        let actor;
        const originalAdvancementPrompt = ClassAdvancementDialog.waitPrompt;
        const originalSpellPrompt = LearnSpellPrompt.waitPrompt;
        try {
          for ( const name of [ "Circle ability", "Optional ability", "Free ability" ] ) {
            sources.push( await Item.create( {
              name:   `Quench ${name}`,
              type:   "talent",
              system: { edid: `quench-${name.toLowerCase().replaceAll( " ", "-" )}`, level: 1 },
            } ) );
          }
          const [ circleAbility, optionalAbility, freeAbility ] = sources;
          const spells = [];
          for ( let index = 0; index < ( count === 1 ? 1 : 3 ); index++ ) {
            const spell = await Item.create( {
              name:   `Quench spell ${index + 1}`,
              type:   "spell",
              system: { edid: `quench-spell-${index + 1}`, level: 1, spellcastingType: "wizardry" },
            } );
            sources.push( spell );
            spells.push( spell );
          }
          const chosenSpells = spells.slice( 0, count );
          actor = await Actor.create( { name: "Quench circle advancement", type: "character" } );
          const [ discipline ] = await actor.createEmbeddedDocuments( "Item", [ {
            name:   "Quench discipline",
            type:   "discipline",
            system: {
              edid:        "quench-discipline",
              level:       1,
              advancement: {
                abilityOptions: { novice: [ optionalAbility.uuid ] },
                levels:         {
                  1: { identifier: "circle-1", level: 1, tier: "novice" },
                  2: {
                    identifier:   "circle-2", level:        2, tier:         "novice", resourceStep: 4,
                    abilities:    { class: [ circleAbility.uuid ], free: [ freeAbility.uuid ], special: [] },
                  },
                },
              },
            },
          } ] );

          // Supply user choices through the real templates and form handler, keeping learning and persistence real.
          ClassAdvancementDialog.waitPrompt = async classItem => {
            let resolve;
            const result = new Promise( callback => { resolve = callback; } );
            const dialog = new ClassAdvancementDialog( classItem, { resolve } );
            dialog.render = () => {};
            const context = {
              render:               { optionChoice: true, spellSelection: true },
              config:               CONFIG.ED4E,
              abilityOptionsByTier: { novice: [ optionalAbility.uuid ] },
              spellsByLevel:        [ { level: 1, spells: spells.map( spell => spell.uuid ) } ],
              selectedSpells:       [],
            };
            const form = document.createElement( "form" );
            for ( const part of [ "optionChoice", "spellSelection" ] ) {
              form.innerHTML += await foundry.applications.handlebars.renderTemplate(
                ClassAdvancementDialog.PARTS[part].template, context
              );
            }
            const chosenUuids = new Set( [ optionalAbility.uuid, ...chosenSpells.map( spell => spell.uuid ) ] );
            for ( const input of form.querySelectorAll( "input" ) ) input.checked = chosenUuids.has( input.value );
            await ClassAdvancementDialog.DEFAULT_OPTIONS.form.handler.call(
              dialog, {}, form, new foundry.applications.ux.FormDataExtended( form )
            );
            await ClassAdvancementDialog._complete.call( dialog );
            return result;
          };
          LearnSpellPrompt.waitPrompt = async () => "free";

          await discipline.system.increase();

          expect( discipline.system.level ).to.equal( 2 );
          const expected = [ circleAbility, optionalAbility, freeAbility, ...chosenSpells ];
          const learnedItems = actor.items.filter( item => item.id !== discipline.id );
          expect( learnedItems.map( item => item.system.edid ) ).to.have.members(
            expected.map( item => item.system.edid )
          );
          expect( learnedItems.length ).to.equal( expected.length );
          expect( actor.itemTypes.spell.length ).to.equal( count );
          expect( actor.items.find( item => item.system.edid === optionalAbility.system.edid ).system.talentCategory )
            .to.equal( "optional" );
          expect( actor.items.find( item => item.system.edid === freeAbility.system.edid ).system.level )
            .to.equal( 2 );
        } finally {
          ClassAdvancementDialog.waitPrompt = originalAdvancementPrompt;
          LearnSpellPrompt.waitPrompt = originalSpellPrompt;
          try {
            await actor?.delete();
          } finally {
            await Item.deleteDocuments( sources.map( item => item.id ) );
          }
        }
      } );
    }
  } );
};
