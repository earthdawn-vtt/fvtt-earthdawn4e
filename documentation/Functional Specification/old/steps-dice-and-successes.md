# Steps, Dice and Successes

Earthdawn uses Steps as a base for almost every roll. each Step results in a combination of different dice these tables are called Step Tables. [UC_Settings-stepTables](../Use%20Cases/UC_Settings-stepTables.md)

every Earthdawn related roll will calculated the final step of the roll and look up the related dice combination from that table.

All dice in Earthdawn can explode, which means they will be rolled again if the highest result of a dice was rolled. All rolled dices will add their number to the final result.

if all (at least two) dice have rolled a one, the result will be an automatic fail called **Rule of one**

there are two types of tests in Earthdawn. the **Action Test** and the **Effect Test**. 

Effect Tests result in the simple dice result.

Action Tests on the other hand always require a Difficulty number. The rolled result will be compared to the difficulty number and if the number is reached the Action test is successful. In addition, for every 5 points above the difficulty number, the action test receives an additional success.

The handling and evaluation of the roll data and results is handled by the [UC_EdRoll](../Use%20Cases/UC_EdRoll.md), The results will be shown in the chat messages which will be handled by the foundry core method [roll.toMessage](https://foundryvtt.com/api/classes/foundry.dice.Roll.html#toMessage) 

