/**
 * System test suite.
 */
export default ( context ) => {
  const { describe, it, expect } = context;
  describe("System", () => {
    it("should be initialized", () => {
      expect(game.ed4e).to.exist;
    });
  });
};
