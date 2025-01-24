this function is first validates if the equipment is fitting in one hand or requies two, based on the namegiver size values.

There are four sub functions inside this user function, one for armor, one for equipments, one for shields and one for weapons.

in general they all do the same, they check if the next equip-status in line is available for the item type. If that is the case the equiped status rotates toward that status. If that status is not available, the next status in line will be checked and so on. 

some item types have equip-status which only allow one item to be in this status. if that is the case, all other items of this status will become carried.


## special cases:
**piecemeal armor.** Usually only one piece of armor can only be equipped. if an armor is piecmeal it is possible to wear several piecemeal armor items in parallel.

**Shields and Bows.** some shields can be worn together with a Bow.

**tail.** if the namegiver has the tailattack checked. this status is possible to equip a weapon to as well. this status can be reached after the off-hand status.

**main and off hand.** if a main hand is already equipped, the next status will be off hand for a weapon which smaller than two handed.

**two-handed weapons.** all bows, crossbows or weapons with a size greater or equal to the minimal two handed weapon size will unequipp all other weapons and or shields (except tail weapons or shields for bow usage - see above)

**Weapon size:** if a weapon is either to small in size (lower than the namegivers minimal one handed weapon size) or to big (greater than the namegivers maximum two handed size) the weapon cannot be equipped. a Warning will inform the user about the problem with the size.
