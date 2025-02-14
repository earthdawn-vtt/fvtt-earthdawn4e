Character Generation is a supportive feature to provide an easy way of creating Actors. The character generation can be started either via a chat command **/chat** or via the **create Actor** button in foundry itself (only for selecting Characters).

# System Settings

there are a few system settings which influence the character generation:
- always use the character generation for the actor creation. (by default activated)
- Availabel attribute points. (by default 25)
- Maximum Ranks (by default 3)
- Maximum Circles of Spells available (by default 2)

in addition to those directly related system settings, there are a few more which influence the character generation:
- languages (the list of languages available in the game will be shown as configured during the character generation)
- spells will only be visible if the spellcasting type of the thread weaving talent (with edid of the talent equal to *thread-weaving* - if the config was not changed.)

it is important to mention, that the character generation itself does not provide enough items (namegiver, Disciplines, talents etc.) to run the charcter generation. For the character generation to work properly, the user need access to the items they shall be able to choose from:
- Namegiver
- disciplines
- questors
- talents (in case of the versatility talent is made use of additional talents from the start)
- skills
- spells

# Character Generation Dialog

## Namegiver

if the user has the rights to create a new actor, a new Dialog will appeare with a short step by step guide. 
The main view also requires the user to choose a namegiver for the character.

## Discipline and Talents (and Questor)

the second tab of the character generation holds the discipline selection (or questor) and after that the distribution of Talent or devotion ranks. 

After the Discipline is choosen, the discipline Talents and the optional novice talents will appear to distribute the talent ranks.

if the namegiver has the versatility talent (edid *versatility*) it is possible to increase that versatility talent and even drag and drop additional talents onto the dialog to increase those talents as well.

a reset button will reset all distributed ranks. 

### Questor at character Generation

since there is no concrete ruleset for the character generation of questors, the character generation for questors is limited to a single rank for one optional devotion. The questor devotion will however be added to the character at rank 1 after the character generation is completed.

## Attributes

After the discipline and talent distribution is completed, the attribute points have to be distributed. 

the attribute overview has a reset button which, resets the distributed points similar to the reset button for the talent ranks. 

the base attribute values are defined by the choosen namegiver item.

the + and - buttons add or reduce the relevant attribute by one point for the standard cost of the players handbook. 

Additionaly this tab provides an overview of the characteristics related to the attributes showing three values per characteristics. The first shows the value it will drop to if the attribute is reduced by one point, the second one shows the current value and the thrid shows the characteristic value if the attribute value is increased by one.

as by the rules, left over attribute points will be added to the total karma pool (only for disciplines) of the character.

## Spells

If one of the talents the Character has distributed at least one rank in, has the edid **thread-weaving** and a selected spellcasting Type (details tab of the talent), spells of that spellcasting type will show up in this tab. the user can "learn" a spell by double clicking on it. This will move the spell from the left to the right or vice versa. The total amount of spells the acter can learn is equal to its perception step.

first circle spells cost 1 spell point and second circle spells cost 2.

## Skills

the skills tab holds four different sections for the different type of skills (artisan, knowledge, language and general).

it is required to:
- add at least one rank to an artisan skill
- add at least two points knowledge skills

read and write will by default have at least 1 rank
speak language will by default have at least 2 ranks

after those above mentioned points, the user can distribute 8 free points to any available skill.

## Languages

in this tab the user can choose from the list of languages set up in the system setting. one language for each rank in either read and write langues. and one language for each rank in speak language.

Talent ranks in speak or read and write language are not avialble at this point.

## Equipment

In this last tab, the user can choose the equipment for the actor simply by selecting the relevant items.

## finish character Generation

after all steps of the character generation have been completed. the finish button will create a new actor ready to play.