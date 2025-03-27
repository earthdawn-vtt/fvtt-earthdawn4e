Tests in Earthdawn are considered to be one of two types. Either an **Action Test** or an **Effect Test**. With a virtual Table top in mind, there is also the option to just have an **arbitrary Test** which could be either. All three types are classified by the rollType configuration, which is based on the abilities, items or settings of such. Talents-, Skills- and Devotions tests are by default allways Action tests, Recovery and Damage Tests on the other hand are usually Effect tests. Arbitrary tests are neither of the above, but just rolls of a certain step number.
## Effect Tests

Effect Tests cover the following tests:
* damage
* effect
* Initiative
* recovery

Effect test don't have a difficulty number and do not require success or failure information as well as extra successes. The total amount of the roll is the result.

### Diagram
```mermaid
stateDiagram-v2
    classDef fromOutside font-style:italic,font-weight:bold,fill:lightyellow
    classDef foundryCore font-style:italic,font-weight:bold,fill: lightgreen
    classDef userFunction font-style:italic,font-weight:bold,fill:lightblue
    classDef userFunctionReturn font-style:italic,font-weight:bold,fill:aqua
    classDef dialog font-style:italic,font-weight:bold,fill:orange

    ###################### status #######################

    triggerAction1: Initiate Test

    userFunction1: UF_Rolls-rollAttackDamage
    userFunction2: UF_Rolls-rollWeaponDamage
    userFunction3: UF_Rolls-rollSpellEffect
    userFunction4: UF_Rolls-rollPowerEffect
    userFunction5: UF_Rolls-rollInitiative
    userFunction6: UF_Rolls-rollrecovery

    state1: Damage Test
    state2: Effect Test
    state3: Initiative Test
    state4: Recovery Test

    ####################### Decisions #######################

    state DECISION1 <<choice>>

    ######################## Colorations ######################

    triggerAction1:::fromOutside

    userFunction1:::userFunction
    userFunction2:::userFunction
    userFunction3:::userFunction
    userFunction4:::userFunction
    userFunction5:::userFunction
    userFunction6:::userFunction

    ##################### StateDiagram ########################

    [*] --> triggerAction1
    triggerAction1 --> DECISION1: which rollType?
    DECISION1 --> state1
    DECISION1 --> state2
    DECISION1 --> state3
    DECISION1 --> state4
    state1 --> userFunction1
    state1 --> userFunction2
    state2 --> userFunction3
    state2 --> userFunction4
    state3 --> userFunction5
    state4 --> userFunction6

    userFunction1 --> [*]
    userFunction2 --> [*]   
    userFunction3 --> [*]
    userFunction4 --> [*]
    userFunction5 --> [*]
    userFunction6 --> [*]
```

### Related User Functions

[UF_Rolls-explodingDice](../User%20Functions/UF_Rolls/UF_Rolls-explodingDice.md)

[UF_Rolls-rollWeaponDamage](../User%20Functions/UF_Rolls/UF_Rolls-rollWeaponDamage.md) --> not yet implemented

[UF_Rolls-rollAttackDamage](../User%20Functions/UF_Rolls/UF_Rolls-rollAttackDamage.md) --> not yet implemented

[UF_Rolls-rollSpellEffect](../User%20Functions/UF_Rolls/UF_Rolls-rollSpellEffect.md) --> not yet implemented

[UF_Rolls-rollPowerEffect](../User%20Functions/UF_Rolls/UF_Rolls-rollPowerEffect.md) --> not yet implemented

[UF_Rolls-rollInitiative](../User%20Functions/UF_Rolls/UF_Rolls-rollInitiative.md) --> not yet implemented

[UF_Rolls-rollRecovery](../User%20Functions/UF_Rolls/UF_Rolls-rollRecovery.md)


### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Recovery of Stun damage | [[Test] - Recover stun damage](https://github.com/patrickmohrmann/earthdawn4eV2/issues/918) |
| Recovery of physical damage | [[Test] - Recover physical Damage](https://github.com/patrickmohrmann/earthdawn4eV2/issues/919) |
| Recovery of stun and physical damage | [[Test] - Recover stun and physical damage](https://github.com/patrickmohrmann/earthdawn4eV2/issues/920) |
| recovery of full night rest | [[Test] - Recover full night rest](https://github.com/patrickmohrmann/earthdawn4eV2/issues/921) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |
| XXXXXXXX | [[Test] - XXXXXXXX](https://github.com/patrickmohrmann/earthdawn4eV2/issues/YYYYY) |


