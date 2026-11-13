import ClassAdvancementDialog from "../../../module/applications/advancement/class-advancement.mjs";

/**
 * In Foundry, select spells and verify that the boxes stay checked and the selected-spell
 * list and summary show the choices; then uncheck the spells and verify they clear.
 * Uses an in-memory form without creating or changing world documents.
 * @param {object} context The Quench test context.
 */
export default ( { describe, it, expect } ) => {
  describe( "Circle advancement spell selection", () => {
    for ( const count of [ 1, 3 ] ) {
      it( `retains selections with ${count} available spells`, async () => {
        const uuids = [ "Item.3978000000000001", "Item.3978000000000002", "Item.3978000000000003" ].slice( 0, count );
        const context = {
          render:         { spellSelection: true, summary: true },
          spellsByLevel:  uuids.map( ( uuid, index ) => ( { level: index + 1, spells: [ uuid ] } ) ),
          selectedSpells: [],
        };
        const form = document.createElement( "form" );
        const render = async () => {
          form.innerHTML = await foundry.applications.handlebars.renderTemplate(
            ClassAdvancementDialog.PARTS.spellSelection.template, context
          );
        };
        await render();
        const inputs = Array.from( form.querySelectorAll( "input[name=\"selectedSpells\"]" ) );
        expect( inputs.map( input => input.value ) ).to.deep.equal( uuids );
        expect( new Set( inputs.map( input => input.id ) ).size ).to.equal( count );
        for ( const input of inputs ) {
          expect( form.querySelector( `label[for="${input.id}"]` ) ).to.exist;
          input.checked = true;
        }
        const dialog = { selectedOption: "", render: () => {}, selectedSpells: new Set() };
        const submit = async () => {
          const data = new foundry.applications.ux.FormDataExtended( form );
          await ClassAdvancementDialog.DEFAULT_OPTIONS.form.handler.call( dialog, {}, form, data );
          context.selectedSpells = Array.from( dialog.selectedSpells );
          await render();
        };
        await submit();
        expect( context.selectedSpells ).to.deep.equal( uuids );
        expect( form.querySelectorAll( "input:checked" ).length ).to.equal( count );
        expect( form.querySelectorAll( ".selected-spells-list li" ).length ).to.equal( count );

        context.spellsGained = dialog.selectedSpells;
        const summary = document.createElement( "div" );
        summary.innerHTML = await foundry.applications.handlebars.renderTemplate(
          ClassAdvancementDialog.PARTS.summary.template, context
        );
        const summaryUuids = Array.from( summary.querySelectorAll( "a[data-uuid]" ), link => link.dataset.uuid.trim() );
        expect( summaryUuids ).to.deep.equal( uuids );

        for ( const input of form.querySelectorAll( "input" ) ) input.checked = false;
        await submit();
        expect( dialog.selectedSpells.size ).to.equal( 0 );
        expect( form.querySelectorAll( "input:checked" ).length ).to.equal( 0 );
        expect( form.querySelector( ".selected-spells-list" ) ).to.equal( null );
      } );
    }
  } );
};