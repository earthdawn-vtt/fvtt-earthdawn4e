export default ( context ) => {
  const { describe, it, expect, fc } = context;
  const { getDice, get1eDice, get3eDice, getCeDice } = ed4e.dice;

  const editions = [
    {
      name:      "1st Edition",
      func:      get1eDice,
      testCases: [
        [ 1, "1d4 - 2" ],
        [ 5, "1d8" ],
        [ 10, "1d10 + 1d6" ],
        [ 100, "4d20 + 6d10 + 4d8" ]
      ],
    },
    {
      name:      "3rd Edition",
      func:      get3eDice,
      testCases: [
        [ 1, "1d6 - 3" ],
        [ 5, "1d8" ],
        [ 10, "2d8" ],
        [ 100, "13d12 + 1d8 + 1d6" ]
      ],
    },
    {
      name:      "Classic Edition",
      func:      getCeDice,
      testCases: [
        [ 1, "1d4 - 2" ],
        [ 5, "1d8" ],
        [ 10, "1d10 + 1d6" ],
        [ 100, "4d20 + 6d10 + 4d8" ]
      ],
    }
  ];

  describe( "Step Tables", () => {
    editions.forEach( ( { name, func, testCases } ) => {
      describe( name, () => {
        describe( "Sample Steps", () => {
          testCases.forEach( ( [ step, expected ] ) => {
            it( `should return ${ expected } for Step ${ step }`, () => {
              expect( func( step ) ).to.equal( expected );
            } );
          } );
        } );

        describe( "Range Validation (Property-based)", () => {
          it( "should return a valid dice string for all steps in [1, 100]", () => {
            fc.assert(
              fc.property( fc.integer( { min: 1, max: 100 } ), ( step ) => {
                const result = func( step );
                expect( result ).to.be.a( "string" ).and.not.be.empty;
                expect( result ).to.match( /^\d+d\d+/ );
              } )
            );
          } );

          it( "should throw for any step outside [1, 100]", () => {
            fc.assert(
              fc.property(
                fc.oneof( fc.integer( { max: 0 } ), fc.integer( { min: 101 } ) ),
                ( step ) => {
                  expect( () => func( step ) ).to.throw();
                }
              )
            );
          } );
        } );
      } );
    } );
  } );
};
