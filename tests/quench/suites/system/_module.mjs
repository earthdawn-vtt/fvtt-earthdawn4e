/**
 * System test suite.
 */
export default ( context ) => {
  const { describe, it, expect } = context;
  describe( "System", () => {
    it( "should be initialized", () => {
      expect( game.ed4e ).to.be.an( "object" );
    } );

    it( "should initialize language settings with translated names", () => {
      const field = game.settings.settings.get( "ed4e.languages" ).type;
      const defaults = Array.from( field.getInitialValue( {} ) );
      const expected = [ "dwarf", "elf", "human", "obsidiman", "ork", "troll", "tskrang", "windling" ]
        .map( key => _loc( `ED.Languages.${key}` ) );

      expect( defaults ).to.have.members( expected );
      expect( defaults.some( value => value.startsWith( "ED.Languages." ) ) ).to.equal( false );
    } );
  } );
};
