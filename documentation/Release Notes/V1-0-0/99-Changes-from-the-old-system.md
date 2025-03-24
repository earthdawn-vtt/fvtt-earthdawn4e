# Changes between the old and the new system.

It would be pointless to note down every change done compared to the old system, but some changes are rather important to know because they require a little bit of rethinking.

## Changed and Removed item Types

all new item types are described in the [04-items](./04-Items.md).

### Matrices

Matrices in the old system were a separate item, that is not the case anymore in the new system. Rather than haveing it separated, we added the matrix relevant data and workflows to talents and physical items (armor, equipment, shields and weapons). The first choice is obvious, because by default matrices are talents, the later choice is required to either have the option to work as a matrix thread item. <br>
In addition it will also be possible to create an equipment item and mark it matrix item/Grimoire to support the casting workflow "Grimoire Casting".

### Threads

Threads items do not exist any more. The usage of those where limited in the old system as well, since it was more convinient to just add a new thread directly on the actor itself. <br>

### Attacking

The old system had the attacks triggered by clicking on the equipped weapon. The weapon itself defined the ability type which was required for this attack. The new system has a big focus on usability, therefore we decided that it shall not be dependend on the weapon which attack is used but rather on the ability. We introduced several related settings, which will all play to gether in this.

#### how does it work?

every ability has some settings in the details tab. one of it is "action", which has several options available including attack. If attack is choosen, two additional options appear, **Weapon status** and **Combat type**.<br> 
Weapon status shows a few options which define how the weapon used for this talent shall be handled (e.g in the main hand, in both hands or even at the tail - for T'skrangs). Melee Weapons for example would have Main Hand and Both hands selected to work properly. Second weapon on the other hand would require only the status off hand.<br>
The Combat type has four self explaining options, Melee-, Missile-, Thrown- and unarmed Combat. <br>

in addition to those action settings. the new system does not defines the target defenses based on item names, therefore every item has some target settings in the details tab.

the **Weapon** itself has a few additional settings which round up this configuration. The Weapon details. They which define which armor (physical or mystical) is used to protect against this weapon. Secondly it is possible to define that this weapon only does stun damage instead of leathal damage and finally how the weapon is held (main hand, both hands ).

together these settings allow the user to set up every ability and weapon as they are supposed to. No more need for duplicating weapons if the fighter might switch the weapon between his main and off hand to sometimes use melee weapons or sometimes second weapon. 

These are a lot of settings, but in general you should only be aware of them, since the migration process should take care of it (see [Migration](./90-Migration.md) ). This is rather important to know if you have set up either a lot of additional weapons to cover every attack ability you have, or have some actors with some special attack options. For those please check if everything is set up correctly.

