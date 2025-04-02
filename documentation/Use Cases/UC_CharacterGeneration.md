# Character Generation

<Description>
{% include content from "Functional Specification/character-generation.md}

### Diagram
```mermaid

flowchart TD
 subgraph s1["Discipline / Questor"]
        n2["Choose Discipline/Questor"]
        n4["Discipline"]
        n5["Questor"]
        n6["Choose Devotion (1 Rank)"]
        n8["Choose Talents (8 Ranks)"]
        n9["Choose 1 Optional talent"]
        n10["Choose Discipline Talents"]
        n11["Choose Namegiver Talents"]
        n15["Points Spent"]
        n7["Namegiver has Talent (Astral Sight, Versatility)"]
        n20["Next Step (Attribute)"]
  end
 subgraph s2["Attributes"]
        n13["Choose Attribute Points"]
        n16["All Points spent?"]
        n17["unspend points become Karma points"]
        n18["Points Spent"]
        n21["Next Step"]
  end
 subgraph s4["Spells"]
        n23["Choose Spells"]
        n25["Next Step"]
  end
 subgraph s5["Skills"]
        n24["Choose Skills"]
        n26["Free Skill Points"]
        n27["2 Knowledge Ranks (Spend by default)"]
        n28["1 Artisan Rank"]
        n29["2 Speak Languages (Spend by default)"]
        n30["1 Write Language"]
        n31["Spend 8 Ranks"]
        n32["Points spend?"]
  end
 subgraph s6["Languages"]
        n33["Choose languages (Optional)"]
        n34["Written languages"]
        n35["Spoken Languages"]
        n36["Languages Chosen"]
  end
 subgraph s7["Equipment"]
        n37["Choose Equipment (Optional)"]
        n39["Finish Character Generation"]
  end
 subgraph s8["Namegiver"]
        n1["Choose namegiver"]
        n38["Next Step"]
  end
    A(["Start Character Generation"]) --> n1
    n1 --> n38
    n2 --> n5 & n4
    n5 --> n6
    n4 --> n8
    n8 --> n9 & n10 & n11
    n7 --> n11
    n10 --> n15
    n9 --> n15
    n11 --> n15
    n6 --> n15
    n15 --> n20
    n13 --> n16
    n16 --> n17 & n18
    n20 --> n13
    n18 --> n21
    n21 --> n22["Spellcaster Discipline?"]
    n22 -- Yes --> n23
    n22 -- No --> n24
    n23 --> n25
    n25 --> n24
    n24 --> n26 & n31
    n26 --> n27 & n28 & n29 & n30
    n31 --> n32
    n28 --> n32
    n27 --> n32
    n29 --> n32
    n30 --> n32
    n32 --> n33
    n33 --> n34 & n35
    n35 --> n36
    n34 --> n36
    n36 --> n37
    n38 --> n7 & n2
    n17 --> n21
    n37 --> n39
    n2@{ shape: diam}
    n7@{ shape: diam}
    n16@{ shape: diam}
    n22@{ shape: diam}


    
```

### Related User Functions

[UF_CharacterGeneration-characterGeneration](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-characterGeneration.md) <br>
[UF_CharacterGeneration-activateTab](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-activateTab.md) <br>
[UF_CharacterGeneration-changeTab](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-changeTab.md) <br> 
[UF_CharacterGeneration-constructor](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-constructor.md) <br>
[UF_CharacterGeneration-defaultOptions](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-defaultOptions.md) <br>
[UF_CharacterGeneration-displayValidationError](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-displayValidationError.md) <br>
[UF_CharacterGeneration-errorMessages](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-errorMessages.md) <br>
[UF_CharacterGeneration-finishGeneration](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-finishGeneration.md) <br>
[UF_CharacterGeneration-getEquipmentItems](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-getEquipmentItems.md) <br>
[UF_CharacterGeneration-nextTab](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-nextTab.md) <br>
[UF_CharacterGeneration-onChangeAttributeModifier](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onChangeAttributeModifier.md) <br>
[UF_CharacterGeneration-onChangeRank](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onChangeRank.md) <br>
[UF_CharacterGeneration-onClickSpell](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onClickSpell.md) <br>
[UF_CharacterGeneration-onFormSubmission](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onFormSubmission.md) <br>
[UF_CharacterGeneration-onReset](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onReset.md) <br>
[UF_CharacterGeneration-onSelectEquipment](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onSelectEquipment.md) <br>
[UF_CharacterGeneration-onSelectTalentOption](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-onSelectTalentOption.md) <br>
[UF_CharacterGeneration-parts](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-parts.md) <br>
[UF_CharacterGeneration-prepareContext](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-prepareContext.md) <br>
[UF_CharacterGeneration-preparePartContext](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-preparePartContext.md) <br>
[UF_CharacterGeneration-prepareTabsContext](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-prepareTabsContext.md) <br>
[UF_CharacterGeneration-previousTab](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-previousTab.md) <br>
[UF_CharacterGeneration-resetOptionalPoints](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-resetOptionalPoints.md) <br>
[UF_CharacterGeneration-tabs](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-tabs.md) <br>
[UF_CharacterGeneration-validateAttributes](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-validateAttributes.md) <br>
[UF_CharacterGeneration-validateClass](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-validateClass.md) <br>
[UF_CharacterGeneration-validateClassRanks](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-validateClassRanks.md) <br>
[UF_CharacterGeneration-validateCompletion](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-validateCompletion.md) <br>
[UF_CharacterGeneration-validateNamegiver](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-validateNamegiver.md) <br>
[UF_CharacterGeneration-validateSkills](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-validateSkills.md) <br>
[UF_CharacterGeneration-waitPrompt](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-waitPrompt.md)<br>
[UF_CharacterGeneration-hasNextStep](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-hasNextStep.md)<br>
[UF_CharacterGeneration-hasPreviousTab](../User%20Functions/UF_CharacterGeneration/UF_CharacterGeneration-hasPreviousTab.md)<br>

### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Character Generation 1 - none Caster | [[Test] - Character Generation 1 - none Caster ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1549) |
| Character Generation 2 - Caster | [[Test] - Character Generation 2 - Caster](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1550) |
| Character Generation 3 - Questor | [[Test] - Character Generation 3 - Questor](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1551) |
| Character Generation 4 - Namegiver Talents | [[Test] - Character Generation 4 - Namegiver Talents](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1552) |
| Character Generation 5 - Reset Options | [[Test] - Character Generation 5 - Reset Options ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1553) |
| Character Generation 6 - only minimum options | [[Test] - Character Generation 6 - only minimum options](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1554) |



