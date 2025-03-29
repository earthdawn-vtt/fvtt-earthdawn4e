Character Generation is a supportive feature to provide an easy way of creating Actors. The character generation can be started either via a chat command **/chat** or via the **create Actor** button in Foundry itself (only for selecting Characters).

# System Settings

There are a few system settings which influence the character generation:
- Always use the character generation for the actor creation. (by default activated)
- Available attribute points. (by default 25)
- Maximum Ranks (by default 3)
- Maximum Circles of Spells available (by default 2)

In addition to those directly related system settings, there are a few more which influence the character generation:
- Languages (the list of languages available in the game will be shown as configured during the character generation)
- Spells will only be visible if the spellcasting type of the thread weaving talent (with ID of the talent equal to *thread-weaving* - if the config was not changed.)

It is important to mention that the character generation itself does not provide enough items (namegiver, Disciplines, talents, etc.) to run the character generation. For the character generation to work properly, the user needs have access to the items they shall be able to choose from (The user needs at least Observer rights):
- Namegiver
- Disciplines
- Questors
- Talents
- Skills
- Spells

# Character Generation Dialog

## Namegiver

If the user has the rights to create a new actor, a new dialog will appear with a short step-by-step guide. 
The main view also requires the user to choose a namegiver for the character.

## Discipline and Talents (and Questor)

The second tab of the character generation holds the discipline selection (or questor) and after that the distribution of Talent or devotion ranks. 

After the discipline is chosen, the discipline talents and the optional novice talents will appear to distribute the talent ranks.

If the namegiver has the versatility talent (ID *versatility*) it is possible to increase that versatility talent and even drag and drop additional talents onto the dialog to increase those talents as well.

A reset button will reset all distributed ranks. 

### Questor at Character Generation

Since there is no concrete ruleset for the character generation of questors, the character generation for questors is limited to a single rank for one optional devotion. The questor devotion will however be added to the character at rank 1 after the character generation is completed.

## Attributes

After the discipline and talent distribution is completed, the attribute points have to be distributed. 

The attribute overview has a reset button which resets the distributed points similar to the reset button for the talent ranks. 

The base attribute values are defined by the chosen namegiver item.

The + and - buttons add or reduce the relevant attribute by one point for the standard cost of the player's handbook. 

Additionally, this tab provides an overview of the characteristics related to the attributes showing three values per characteristic. The first shows the value it will drop to if the attribute is reduced by one point, the second one shows the current value and the third shows the characteristic value if the attribute value is increased by one.

As by the rules, leftover attribute points will be added to the total karma pool (only for disciplines) of the character.

## Spells

If one of the talents the character has distributed at least one rank in, has the ID **thread-weaving** and a selected spellcasting type (details tab of the talent), spells of that spellcasting type will show up in this tab. The user can "learn" a spell by double-clicking on it. This will move the spell from the left to the right or vice versa. The total amount of spells the actor can learn is equal to its perception step.

First circle spells cost 1 spell point and second circle spells cost 2.

## Skills

The skills tab holds four different sections for the different types of skills (artisan, knowledge, language, and general).

It is required to:
- Add at least one rank to an artisan skill
- Add at least two points to knowledge skills

Read and write will by default have at least 1 rank
Speak language will by default have at least 2 ranks

After those above-mentioned points, the user can distribute 8 free points to any available skill.

## Languages

In this tab, the user can choose from the list of languages set up in the system setting. One language for each rank in either read and write languages. And one language for each rank in speak language.

Talent ranks in speak or read and write language are not available at this point.

## Equipment

In this last tab, the user can choose the equipment for the actor simply by selecting the relevant items. The available equipments are provided by the system itself and can be found in the "Core Equipment - English" compendium in "Earthdawn Content". Further shopping has to be done after character generation is done.

## Finish Character Generation

After all steps of the character generation have been completed, the finish button will create a new actor ready to play.