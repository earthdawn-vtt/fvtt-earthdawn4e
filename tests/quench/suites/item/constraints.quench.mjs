/**
 * Regression tests for the knack constraint configuration form (#4010).
 * @param {object} context The Quench test context.
 */
export default ( { describe, it, expect } ) => {
  describe( "Knack constraint configuration", () => {
    for ( const type of [ "knackAbility", "knackKarma", "knackManeuver" ] ) {
      for ( const keyPath of [ "requirements", "restrictions" ] ) {
        it( `loads and round-trips distinct ability values for ${ type } ${ keyPath }`, async () => {
          const item = new Item( {
            name:   "Constraint regression",
            type,
            system: {
              [ keyPath ]: {
                ability1: { type: "ability", ability: "talent-melee-weapons", rank: 5 },
                ability2: { type: "ability", ability: "talent-avoid-blow", rank: 3 },
              },
            },
          } );
          const context = {
            keyPath,
            constraints: item.system[ keyPath ],
            config:      CONFIG.ED4E,
          };
          const template = "systems/ed4e/templates/configs/constraints-config.hbs";
          const form = document.createElement( "form" );
          form.innerHTML = await foundry.applications.handlebars.renderTemplate( template, context );
          const prefix = `system.${ keyPath }`;
          const ability = form.elements.namedItem( `${ prefix }.ability1.ability` );
          const rank = form.elements.namedItem( `${ prefix }.ability1.rank` );
          const otherAbility = form.elements.namedItem( `${ prefix }.ability2.ability` );
          const otherRank = form.elements.namedItem( `${ prefix }.ability2.rank` );

          expect( ability, "first ability input has its full document path" ).to.exist;
          expect( rank, "rank input has its full document path" ).to.exist;
          expect( otherAbility, "second entry has a distinct path" ).to.exist;
          expect( ability.value ).to.equal( "talent-melee-weapons" );
          expect( rank.value ).to.equal( "5" );
          expect( otherAbility.value ).to.equal( "talent-avoid-blow" );
          expect( otherRank.value ).to.equal( "3" );
          expect( form.querySelector( "[name$=\".type\"]" ) ).to.equal( null );

          ability.value = "talent-unarmed-combat";
          rank.value = "7";
          const data = new foundry.applications.ux.FormDataExtended( form ).object;
          item.updateSource( foundry.utils.expandObject( data ) );
          const reopened = new Item( item.toObject() );
          expect( reopened.system[ keyPath ].ability1.ability ).to.equal( "talent-unarmed-combat" );
          expect( reopened.system[ keyPath ].ability1.rank ).to.equal( 7 );
          expect( reopened.system[ keyPath ].ability2.ability ).to.equal( "talent-avoid-blow" );
          expect( reopened.system[ keyPath ].ability2.rank ).to.equal( 3 );

          form.innerHTML = await foundry.applications.handlebars.renderTemplate( template, {
            ...context,
            constraints: reopened.system[ keyPath ],
          } );
          expect( form.elements.namedItem( `${ prefix }.ability1.ability` ).value ).to.equal( "talent-unarmed-combat" );
          expect( form.elements.namedItem( `${ prefix }.ability1.rank` ).value ).to.equal( "7" );
        } );
      }
    }
  } );
};
