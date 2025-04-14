# Physical Items

this chapter covers everything relevant for items of type **armor**, **equipments**, **shields** and **weapons** further mentioned as *physical items*. 

## Commonalities

### Base Parameter

all physical items have a set of values which are identical on all sub types:
* price and denomination
* weight
* availability
* amount
* blood magic damage
* usable item (yes/no)
  * arbitrary Step
  * action
  * recovery action
  * difficulty
    * target difficulty
    * group difficulty 
    * fixed difficulty
* item equip status  

all these above mentioned values are available for all items. Some of them, are only visible if other fields are activated, as indicated in the indentation above.

#### Price and Denomination

Only manual fields without any Use case at the moment

#### weight

The weight field usually is a manual entry field. 

There is one use case though, which enables user to adapt the weight of an item to their namegiver race (if that namegiver race has a weight modifier). The detailed information about this functionality can be found in this use case [UC_PhysicalItems-changeItemWeight](../Use%20Cases/UC_PhysicalItems-changeItemWeight.md)


#### availability

Only manual fields without any Use case at the moment

#### amount

Only manual fields without any Use case at the moment

#### blood magic damage

Blood magic damage is a manual entry field which is used to add blood magic damage from items to the actor. 
if a physical item is equipped, the blood magic damage value will be substracted from the death- and unconcious rating

*NOTE* has to be changed see #860 https://github.com/patrickmohrmann/earthdawn4eV2/issues/860

#### usable item (yes/no)

if usable item is active, this item becomes **rollable** which means, that clicking on the now appearing dice symbol in front of the item name on the actor item list, will trigger a roll. This roll will has roll data based on the following fields:
 * arbitrary Step
  * action
  * recovery action
  * difficulty
    * target difficulty
    * group difficulty calculation
    * fixed difficulty

for further information about rollable items, see the use case [UC_PhysicalItems-rollableItems](../Use%20Cases/UC_PhysicalItems-rollableItems.md)


#### arbitrary Step

A manual entry field for rollable items, this value represents a step number which can based on further settings be used in addition or instead of other steps to create a roll. For further information on when and how the arbitrary step is used, see the use case [UC_PhysicalItems-rollableItems](../Use%20Cases/UC_PhysicalItems-rollableItems.md)


#### action

Only manual fields without any Use case at the moment. It is so far only meant to indicate which type of action is needed to save some time for the users to look this up.

#### recovery action

The recovery Value has several options which are not implemented at the moment.

#### difficulty

the difficulty settings are blocked behind the usable item option, except for weapon items, where these settings are available by default. there are three options available:
* target difficulty
* group difficulty
* fixed difficulty

these options will be explained further below and their usage is described in the use case [UC_PhysicalItems-difficultyCalculation](../Use%20Cases/UC_PhysicalItems-difficultyCalculation.md).


#### target difficulty

four options are available:
* blank (no difficulty)
* physical defense
* mystical defense
* social defense

for the explicit influence of this value please see [UC_PhysicalItems-difficultyCalculation](../Use%20Cases/UC_PhysicalItems-difficultyCalculation.md).

#### group difficulty

five options are availabel:
* blank (no group difficulty)
* highest difficulty
* lowest difficulty
* highest difficulty + number of targets
* lowest difficulty + number of targets

for the explicit influence of this value please see [UC_PhysicalItems-difficultyCalculation](../Use%20Cases/UC_PhysicalItems-difficultyCalculation.md).

#### fixed difficulty

This field is used to enter a fixed difficulty.

for the explicit influence of this value please see [UC_PhysicalItems-difficultyCalculation](../Use%20Cases/UC_PhysicalItems-difficultyCalculation.md).

#### item equipment status  

the item equipment status of an item is required if an item shall affect the actor data and abilities.

Characteristics will be changed only if the item is equipped or hold in one or two hands.

Abilities like the melee weapons talent will use the weapon equipped in the main or both hands.

all these different options are descibed in the use case [UC_PhysicalItems-itemStatus](../Use%20Cases/UC_PhysicalItems-itemStatus.md)


## Differences

### Armor

### Equipments

### Shields

### Weapons

