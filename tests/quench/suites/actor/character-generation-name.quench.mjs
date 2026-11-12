import DocumentCreateDialog from "../../../../module/applications/global/document-creation.mjs";
import CharacterGenerationPrompt from "../../../../module/applications/actor/character-generation-prompt.mjs";
import CharacterGenerationData from "../../../../module/data/other/character-generation.mjs";
import { SYSTEM_ID, SYSTEM_TYPES } from "../../../../module/constants/constants.mjs";

/**
 * Opens the actor creation dialog, changes its name input without firing a change event,
 * and clicks Create. Checks that the rendered wizard shows the entered name or the default
 * for blank input. Uses empty document collections and prevents persistent Actor creation.
 * Run only in a world explicitly approved for development tests.
 * @param {object} context The Quench test context.
 * @param {Function} context.describe Define a test suite.
 * @param {Function} context.it Define a test case.
 * @param {Function} context.expect The Chai assertion function.
 */
export default ( { describe, it, expect } ) => {
  describe( "Actor dialog to character wizard", () => {
    for ( const name of [ "Bob", "" ] ) {
      it( name ? "preserves the live form name despite a stale cache" : "uses the actor default for a blank name", async () => {
        const originalGet = game.settings.get;
        const originalConfirm = DocumentCreateDialog._showCharGenPrompt;
        const originalWait = CharacterGenerationPrompt.waitPrompt;
        const originalCreate = Actor.implementation.create;
        let dialog;
        let wizard;
        let timer;
        let completeAction;
        const completed = new Promise( resolve => { completeAction = resolve; } );

        try {
          // Override only this read, never the persisted world setting.
          /** @type {typeof game.settings.get} */
          game.settings.get = function( namespace, key ) {
            if ( namespace === SYSTEM_ID && key === "autoOpenCharGen" ) return true;
            return originalGet.call( this, namespace, key );
          };
          DocumentCreateDialog._showCharGenPrompt = async () => true;
          // Guard against accidental persistent Actor creation, even on failure.
          Actor.implementation.create = async () => {
            completeAction( { error: new Error( "The name handoff test must not create an Actor." ) } );
            return null;
          };
          // Bypass normal prompt initialization; render the real wizard with empty collections.
          // This avoids importing compendia or creating missing language skill Items.
          CharacterGenerationPrompt.waitPrompt = async ( data ) => {
            try {
              wizard = new CharacterGenerationPrompt( data ?? new CharacterGenerationData(), {}, {
                namegivers:  [], disciplines: [], questors:    [], skills:      [], spells:      [],
                equipment:   { armor: [], equipment: [], shields: [], weapons: [] },
              } );
              await wizard.render( { force: true } );
              completeAction( { data } );
            } catch ( error ) {
              completeAction( { error } );
            }
            return null; // Cancel generation before any document can be created.
          };

          dialog = new DocumentCreateDialog( {
            name: "Cached name", type: SYSTEM_TYPES.Actor.pc,
          }, { documentCls: Actor } );
          await dialog.render( { force: true } );
          const input = dialog.form.elements.namedItem( "name" );
          expect( input ).to.exist;
          // No change/blur event: the Create action must read the form itself.
          input.value = name;
          expect( dialog.createData.name ).to.equal( "Cached name" );
          const button = dialog.form.querySelector( "[data-action=\"createDocument\"]" );
          expect( button ).to.exist;
          button.click();

          const result = await Promise.race( [
            completed,
            new Promise( ( _, reject ) => {
              timer = setTimeout( () => reject( new Error( "Character generation was not reached." ) ), 5000 );
            } ),
          ] );
          if ( result.error ) throw result.error;
          const expectedName = name || Actor.implementation.defaultName( { type: SYSTEM_TYPES.Actor.pc } );
          expect( result.data ).to.be.instanceOf( CharacterGenerationData );
          expect( result.data.name ).to.equal( expectedName );
          expect( wizard.form.elements.namedItem( "name" ).value ).to.equal( expectedName );
        } finally {
          clearTimeout( timer );
          // Restore shared methods before UI cleanup, even after a failed assertion.
          game.settings.get = originalGet;
          DocumentCreateDialog._showCharGenPrompt = originalConfirm;
          CharacterGenerationPrompt.waitPrompt = originalWait;
          Actor.implementation.create = originalCreate;
          if ( wizard ) await wizard.close();
          if ( dialog ) await dialog.close();
        }
      } ).timeout( 10000 );
    }
  } );
};
