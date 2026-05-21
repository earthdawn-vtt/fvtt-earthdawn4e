/**
 * Actor creation tests.
 * @param root0
 * @param root0.describe
 * @param root0.it
 * @param root0.expect
 */
export default ( { describe, it, expect } ) => {
  describe( "Actor Creation", () => {
    it( "should create a basic PC actor", async () => {
      const actor = await Actor.create( {
        name: "Test PC",
        type: "character"
      } );
      expect( actor ).to.exist;
      expect( actor.type ).to.equal( "character" );
      await actor.delete();
    } );

    it( "should create a basic NPC actor", async () => {
      const actor = await Actor.create( {
        name: "Test NPC",
        type: "npc"
      } );
      expect( actor ).to.exist;
      expect( actor.type ).to.equal( "npc" );
      await actor.delete();
    } );
  } );
};
