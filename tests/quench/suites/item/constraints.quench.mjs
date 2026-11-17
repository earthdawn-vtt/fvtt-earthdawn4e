/**
 * Test Instructions
 * Render the shared constraint input partial for every registered constraint type and
 * editable schema field, using two entries per type. Check input paths and initial
 * values, edit one entry of each type, and serialize and recreate the Item. Render
 * again to check that edited values survive and the other entries remain unchanged.
 * Run this for requirements and restrictions on all three knack types.
 * This tests the shared partial in isolation, not the surrounding configuration dialog,
 * world database persistence, or the sheet submission handler. Items stay in memory.
 */
import { ConstraintData } from "../../../../module/data/common/restrict-require.mjs";

const samples = {
  ability: [
    { ability: "talent-melee-weapons", rank: 5 },
    { ability: "talent-unarmed-combat", rank: 7 },
    { ability: "talent-avoid-blow", rank: 3 },
  ],
  attribute: [
    { attribute: "dex", value: 13 },
    { attribute: "str", value: 15 },
    { attribute: "per", value: 11 },
  ],
  class: [
    { class: "discipline-warrior", level: 4 },
    { class: "discipline-wizard", level: 6 },
    { class: "discipline-thief", level: 2 },
  ],
  language:  [ { language: "dwarf" }, { language: "human" }, { language: "ork" } ],
  namegiver: [ { namegiver: "namegiver-dwarf" }, { namegiver: "namegiver-human" }, { namegiver: "namegiver-ork" } ],
  relation:  [ { relation: "friend" }, { relation: "ally" }, { relation: "rival" } ],
  spell:     [ { spell: "spell-mind-dagger" }, { spell: "spell-earth-darts" }, { spell: "spell-astral-spear" } ],
};

/**
 * Render all entries through the shared input partial without creating a world Item.
 * @param {Item} item The in-memory knack.
 * @param {string} keyPath The requirements or restrictions field.
 * @returns {Promise<HTMLFormElement>} The rendered form.
 */
async function renderForm( item, keyPath ) {
  const form = document.createElement( "form" );
  for ( const [ key, data ] of Object.entries( item.system[ keyPath ] ) ) {
    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/ed4e/templates/form/input/base-constraint.hbs",
      { data, fields: data.schema.fields, fieldPath: "system." + keyPath + "." + key, config: CONFIG.ED4E },
    );
    form.insertAdjacentHTML( "beforeend", html );
  }
  return form;
}

/**
 * Check every editable field against its model value and reject missing or duplicate paths.
 * @param {Function} expect The Quench assertion helper.
 * @param {HTMLFormElement} form The rendered form.
 * @param {Item} item The in-memory knack.
 * @param {string} keyPath The requirements or restrictions field.
 */
function checkInputs( expect, form, item, keyPath ) {
  const names = [];
  for ( const [ key, data ] of Object.entries( item.system[ keyPath ] ) ) {
    for ( const field of Object.values( data.schema.fields ) ) {
      if ( field.name === "type" ) continue;
      const name = "system." + keyPath + "." + key + "." + field.name;
      const input = form.elements.namedItem( name );
      expect( input, name ).to.exist;
      expect( input.value, name ).to.equal( String( data[ field.name ] ) );
      names.push( name );
    }
  }
  expect( Array.from( form.elements, input => input.name ) ).to.have.members( names );
}

/**
 * Register the generic constraint input form cases.
 * @param {object} context The Quench test context.
 */
export default ( { describe, it, expect } ) => {
  describe( "Constraint input forms", () => {
    for ( const type of [ "knackAbility", "knackKarma", "knackManeuver" ] ) {
      for ( const keyPath of [ "requirements", "restrictions" ] ) {
        it( "round-trips all constraint types and editable fields for " + type + " " + keyPath, async () => {
          expect( Object.keys( samples ) ).to.have.members( Object.keys( ConstraintData.TYPES ) );
          const entries = {};
          for ( const [ constraintType, [ initial, , other ] ] of Object.entries( samples ) ) {
            entries[ constraintType + "1" ] = { type: constraintType, ...initial };
            entries[ constraintType + "2" ] = { type: constraintType, ...other };
          }
          const item = new Item( { name: "Constraint form test", type, system: { [ keyPath ]: entries } } );
          const form = await renderForm( item, keyPath );
          checkInputs( expect, form, item, keyPath );
          const expected = {};
          for ( const [ constraintType, [ , edited ] ] of Object.entries( samples ) ) {
            const key = constraintType + "1";
            const data = item.system[ keyPath ][ key ];
            const fields = Object.keys( data.schema.fields ).filter( name => name !== "type" );
            expect( Object.keys( edited ), constraintType ).to.have.members( fields );
            for ( const field of fields ) {
              form.elements.namedItem( "system." + keyPath + "." + key + "." + field ).value = String( edited[ field ] );
            }
            expected[ key ] = { ...data.toObject(), ...edited };
            const otherKey = constraintType + "2";
            expected[ otherKey ] = item.system[ keyPath ][ otherKey ].toObject();
          }
          const submitted = new foundry.applications.ux.FormDataExtended( form ).object;
          item.updateSource( foundry.utils.expandObject( submitted ) );
          const reopened = new Item( item.toObject() );
          for ( const [ key, data ] of Object.entries( expected ) ) {
            expect( reopened.system[ keyPath ][ key ].toObject(), key ).to.deep.equal( data );
          }
          checkInputs( expect, await renderForm( reopened, keyPath ), reopened, keyPath );
        } );
      }
    }
  } );
};
