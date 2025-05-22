/* -------------------------------------------- */
/* Step Roll                                    */

/* -------------------------------------------- */
/*
/!**
 * @description function to combine all roll relevant information
 * @param { number } step Step of the roll
 * @param { object } karma used Karma and Karma step
 * @param { number } karma.use amount of Karma used
 * @param { number } karma.step karma step
 * @param { object } devotion used devotion and devotion step
 * @param { number } devotion.use amount of devotion used
 * @param { number } devotion.step devotion step
 * @param { object } extraDice additional dice: for each additional dice a step is relevant
 * @param { object } terms ?=?=? @chris?
 * @param { object } labels ?=?=? @chris?
 * @param { template } template roll prompt template (hbs file)
 * @param { string } title title of the roll
 * @param { object } dialogOptions options???
 * @param { object } chatMessage containing the information to hand over to the chat
 * @param { object } messageData containing the information shown in the message ... isn't this the same as chatMessage @chris???
 * @param { string } flavor combined information to be visible in the chat message
 *!/
export async function rollStep( {
                                    step,
                                    karma = {
                                        use: 0,
                                        step: 0
                                    },
                                    devotion = {
                                        use: 0,
                                        step: 0
                                    },
                                    extraDice = {
                                        terms: [],
                                        labels: []
                                    },
                                    template,
                                    title,
                                    dialogOptions,
                                    chatMessage,
                                    messageData,
                                    flavor
                                } ) {
} */

export class KarmaDice extends DiceTerm {
  constructor( step ) {
    super();
  }
}