Every physical item (armor, equipment, shield or weapon) has a status which defines the equipped state.
the following states are possible:
* owned
* carried
* equipped
* main hand
* off hand
* two hands
* tail 

armor, equipment and shields have the first three status options available, where the equipped status triggers calculations for:
* encumbrance
* Armor 
* defense 
* initiative 

weapons on the other hand have all 7 states available. the 7th status is limited only to namegivers with a tail though. 
based on the equipped status for the weapon, this weapon will be used for attack (or similar actions) which require a weapon. Melee weapons for example will check if there is a two handed weapon, if not it will take the main hand equipped weapon to attack. Second weapon on the other hand can only work if there is a weapon in the off hand etc. 

there are several special situation where one or the other status can work along side one another if the items have special values (see special cases in [UF_PhysicalItems-updateItemStates](../User%20Functions/UF_Physicalitems/UF_Physicalitems-updateItemStates.md))

the equipment status can be changed using several mouse click options.
* left-click & right-click (see [UF_PhysicalItems-rotateItemStatus](../User%20Functions/UF_Physicalitems/UF_Physicalitems-rotateItemStatus.md))
* shift-left-click (see [UF_PhysicalItems-carry](../User%20Functions/UF_Physicalitems/UF_Physicalitems-carry.md))
* middle-click (see [UF_PhysicalItems-deposit](../User%20Functions/UF_Physicalitems/UF_Physicalitems-deposit.md))

### Diagram

#### Rotate status
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue

    ###################### status #######################

    triggerAction3: rotate forward
    triggerAction4: rotate backwards

    userFunction1: rotate

    shortStatusOwned: owned
    shortStatusCarried: carried
    shortStatusEquipped: equipped

    noTailWeaponOwned: owned
    noTailWeaponCarried: carried
    noTailWeaponMainHand: main hand
    noTailWeaponOffHand: off hand
    noTailWeaponTwoHanded: Two handed

    weaponOwned: owned
    weaponCarried: carried
    weaponMainHand: main hand
    nweaponOffHand: off hand
    weaponTwoHanded: Two handed
    weaponTail: tail

    ####################### Decisions #######################

    state itemTypeDecision <<choice>>
    state tailOption <<choice>>

    ######################## Colorations ######################

    triggerAction3:::fromOutside
    triggerAction4:::fromOutside

    userFunction1:::userFunction

    ##################### StateDiagram ########################


    state weapon_status_with_Tail {
        weaponOwned
        weaponOwned --> weaponCarried
        weaponCarried --> weaponMainHand
        weaponMainHand --> nweaponOffHand
        nweaponOffHand --> weaponTwoHanded
        weaponTwoHanded --> weaponTail
        weaponTail --> weaponOwned
    }

    state weapon_status_without_Tail {
        noTailWeaponOwned
        noTailWeaponOwned --> noTailWeaponCarried
        noTailWeaponCarried --> noTailWeaponMainHand
        noTailWeaponMainHand --> noTailWeaponOffHand
        noTailWeaponOffHand --> noTailWeaponTwoHanded
        noTailWeaponTwoHanded --> noTailWeaponOwned
    }

    state no_weapon_status {
        shortStatusOwned
        shortStatusOwned --> shortStatusCarried
        shortStatusCarried --> shortStatusEquipped
        shortStatusEquipped --> shortStatusOwned
    }

[*] --> triggerAction3
[*] --> triggerAction4
    triggerAction3 --> userFunction1
    triggerAction4 --> userFunction1: revers the arrow <br> direction in status boxes
    userFunction1 --> itemTypeDecision

    itemTypeDecision --> no_weapon_status: armor, shield or equipment
    itemTypeDecision --> tailOption: namegiver having tail
    tailOption --> weapon_status_with_Tail: yes
    tailOption --> weapon_status_without_Tail: no

    no_weapon_status --> [*]
    weapon_status_with_Tail --> [*]
    weapon_status_without_Tail --> [*]
```

#### deposit status
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange

    ###################### status #######################

    triggerAction1: deposit

    userFunction2: deposit

    depositOwned: owned
    depositCarried: carried
    depositEquipped: equipped
    depositMainHand: main hand
    depositOffHand: off hand
    depositTwoHanded: Two handed
    depositTail: tail

    ####################### Decisions #######################

    ######################## Colorations ######################

    triggerAction1:::fromOutside

    userFunction2:::userFunction

    ##################### StateDiagram ########################

    state deposit_item {
    depositCarried --> depositOwned
    depositEquipped --> depositOwned
    depositMainHand --> depositOwned
    depositOffHand --> depositOwned
    depositTwoHanded --> depositOwned
    depositTail --> depositOwned
    }

    [*] --> triggerAction1
    triggerAction1 --> userFunction2
    userFunction2 --> deposit_item
    deposit_item --> [*]
```

#### carry status
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange

    ###################### status #######################

    triggerAction2: carry

    userFunction3: carry

    carryOwned: owned
    carryEquipped: equipped
    carryMainHand: main hand
    carryOffHand: off hand
    carryTwoHanded: two handed
    carryTail: tail
    carryCarried: carried


    ####################### Decisions #######################

    ######################## Colorations ######################

    triggerAction2:::fromOutside

    userFunction3:::userFunction

    ##################### StateDiagram ########################


    state carry_item {  
    carryOwned --> carryCarried
    carryEquipped --> carryCarried
    carryMainHand --> carryCarried
    carryOffHand --> carryCarried
    carryTwoHanded --> carryCarried
    carryTail --> carryCarried
    }

    [*] --> triggerAction2
    triggerAction2 --> userFunction3
    userFunction3 --> carry_item
    carry_item --> [*]
```

### Related User Functions

[UF_PhysicalItems-deposit](../User%20Functions/UF_Physicalitems/UF_Physicalitems-deposit.md)

[UF_PhysicalItems-carry](../User%20Functions/UF_Physicalitems/UF_Physicalitems-carry.md)

[UF_PhysicalItems-onChangeItemStatus](../User%20Functions/UF_Physicalitems/UF_Physicalitems-onChangeItemStatus.md)

[UF_PhysicalItems-updateItemStates](../User%20Functions/UF_Physicalitems/UF_Physicalitems-updateItemStates.md)

[UF_PhysicalItems-rotateItemStatus](../User%20Functions/UF_Physicalitems/UF_Physicalitems-rotateItemStatus.md)


### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
| Test case | [TC_YYYYYY-XXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/) |
