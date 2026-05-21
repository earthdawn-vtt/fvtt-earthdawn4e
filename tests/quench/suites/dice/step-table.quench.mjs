export default ( { describe, it, expect } ) => {
  const { get3eDice } = ed4e.dice;

  describe( "Step Tables", () => {
    describe( "3rd Edition", () => {
      it( "should return correct dice for Step 1", () => {
        expect( get3eDice( 1 ) ).to.equal( "1d6 - 3" );
      } );

      it( "should return correct dice for Step 5", () => {
        expect( get3eDice( 5 ) ).to.equal( "1d8" );
      } );

      it( "should return correct dice for Step 10", () => {
        expect( get3eDice( 10 ) ).to.equal( "2d8" );
      } );

      it( "should return correct dice for Step 100", () => {
        expect( get3eDice( 100 ) ).to.equal( "13d12 + 1d8 + 1d6" );
      } );

      it( "should throw for invalid steps (Step 0)", () => {
        expect( () => get3eDice( 0 ) ).to.throw();
      } );

      it( "should throw for invalid steps (Step 101)", () => {
        expect( () => get3eDice( 101 ) ).to.throw();
      } );
    } );
  } );
};
