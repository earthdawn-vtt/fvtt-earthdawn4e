import BaseMessageData from "./base-message.mjs";
import { SYSTEM_TYPES } from "../../constants/constants.mjs";
import SpellcastingWorkflow from "../../workflows/workflow/spellcasting-workflow.mjs";
import { MetricData } from "../common/metrics.mjs";

/**
 * @import { ThreadWeavingMessageSystemData } from "./_types.mjs";
 */

/**
 * The data model for a chat message representing a thread weaving roll that precedes the casting
 * of a spell.
 * @augments {BaseMessageData<ThreadWeavingMessageSystemData>}
 * @see {@link ThreadWeavingMessageSystemData} The system data model for thread weaving message data.
 */
export default class ThreadWeavingMessageData extends BaseMessageData {

  // region Schema

  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return this.mergeSchema( super.defineSchema(), {
      castingMethod: new fields.StringField( {
        required: false,
        blank:    false,
        choices:  Object.keys( SpellcastingWorkflow.CASTING_WORKFLOW_TYPES ),
      } ),
      matrix:           new fields.DocumentUUIDField(),
      grimoire:         new fields.DocumentUUIDField(),
      numThreadsWoven: new fields.NumberField( {
        min:     0,
        integer: true,
      } ),
      extraThreads: new fields.TypedObjectField(
        new fields.TypedSchemaField( MetricData.TYPES, {
        } ),
        {
          required: true,
          nullable: true,
          initial:  null,
        }
      ),
    } );
  }

  // endregion

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.General.ThreadWeavingMessage",
  ];

  static DEFAULT_OPTIONS = {
    actions: {
      castSpell:       this._onCastSpell,
      continueWeaving: this._onCastSpell,
    },
  };

  /** @inheritDoc */
  static metadata = Object.freeze( foundry.utils.mergeObject(
    super.metadata,
    {
      type: SYSTEM_TYPES.ChatMessage.threadWeaving,
    }, {
      inplace: false
    },
  ) );

  // endregion

  // region Properties

  /**
   * The Actor that is rolling the thread weaving.
   * @type {ActorEd|null}
   */
  get caster() {
    return fromUuidSync( this.roll.options.rollingActorUuid );
  }

  /**
   * The spell being cast during the thread weaving.
   * @type {ItemEd|null}
   */
  get spell() {
    return fromUuidSync( this.roll.options.spellUuid );
  }

  // endregion

  // region Event Handlers

  /**
   * @type {ApplicationClickAction}
   * @this {ThreadWeavingMessageData}
   */
  static async _onCastSpell( event, button ) {
    event.preventDefault();

    const castingMethod = this.castingMethod;
    const matrix = await fromUuid( this.matrix );
    const grimoire = await fromUuid( this.grimoire );

    const spell = await this._prepareSpell();

    await this.caster.castSpell(
      spell,
      {
        workflowOptions: { castingMethod, matrix, grimoire, },
      },
    );
  }

  /**
   * Prepare the spell for casting, ensuring the woven threads are correctly set.
   * @returns {Promise<ItemEd>} The prepared spell.
   * @protected
   */
  async _prepareSpell() {
    const spell = this.spell;
    const extraThreads = this.extraThreads || [];
    if ( spell.system.threads.woven !== this.numThreadsWoven ) {
      return spell.update( {
        system: {
          "isWeaving":     true,
          "threads.woven": this.numThreadsWoven,
          "threads.extra": { ...extraThreads },
        },
      },
      );
    }
    return spell;
  }

  // endregion

}