import AbilityRollOptions from "./ability.mjs";

export default class AttackRollOptions extends AbilityRollOptions {

  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      weaponUuid:        new fields.DocumentUUIDField( {
        type:     "Item",
        embedded: true,
      } ),
    } );
  }

  /** @inheritDoc */
  async getFlavorTemplateData( context ) {
    const newContext = await super.getFlavorTemplateData( context );

    newContext.targets = await Promise.all( this.target.tokens.map( tokens => fromUuid( tokens ) ) );
    newContext.reactionsByTarget = await this._getDefendantReactions();
    newContext.maneuvers = await this._getManeuvers();

    return newContext;
  }

  async _getDefendantReactions() {
    const reactionsByTarget = {};
    for ( const targetedTokenUuid of this.target.tokens ) {
      const targetedActor = ( await fromUuid( targetedTokenUuid ) ).actor;
      if ( targetedActor ) {
        const reactions = targetedActor.items.filter(
          item => (
            item.system.rollType === "reaction" )
            && ( item.system.rollTypeDetails?.reaction?.defenseType === "physical"
            )
        );
        if ( reactions ) reactionsByTarget[targetedActor.name] = reactions;
      }
    }
    return reactionsByTarget;
  }

  async _getManeuvers() {
    const actor = await fromUuid( this.rollingActorUuid );
    return actor.itemTypes.knackManeuver;
    // TODO: this needs to be filtered by available number of successes in the ChatMessage "getHTML" method, we don't have a possibly modifier number of successes anywhere else than in the ChatMessages DataModel
  }
}