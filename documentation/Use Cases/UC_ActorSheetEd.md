<Description>

### Diagram
```mermaid
flowchart TD

    n1["Common Actor Sheet"]
    subgraph s1["Actions"]
        n2["expand Card"]
        n3["create effect"]
        n4["delete effect"]
        n5["display effect"]
        n6["edit effect"]
        n7["edit item"]
        n8["delete item"]
        n9["display item to the chat"]
        n10["edit image"]
  end

    n1 --> n2
    n1 --> n3
    n1 --> n4
    n1 --> n5
    n1 --> n6
    n1 --> n7
    n1 --> n8
    n1 --> n9
    n1 --> n10
```

### Related User Functions

[UF_ActorSheetEd-addSheetTabs](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-addSheetTabs.md) <br>
*[UF_ActorSheetEd-defaultOptions](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-defaultOptions.md) <br>
[UF_ActorSheetEd-onCardExpand](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onCardExpand.md) <br>
?[UF_ActorSheetEd-onCreateChild](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onCreateChild.md) <br>
?[UF_ActorSheetEd-onDeleteChild](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onDeleteChild.md) <br>
?[UF_ActorSheetEd-onEditChild](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onEditChild.md) <br>
[UF_ActorSheetEd-onDisplayChildToChat](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onDisplayChildToChat.md) <br>
[UF_ActorSheetEd-onEditImage](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onEditImage.md) <br>
[UF_ActorSheetEd-onitemEdit](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onitemEdit.md) <br>
[UF_ActorSheetEd-onItemDelete](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onItemDelete.md) <br>
[UF_ActorSheetEd-onDisplayItem](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-onDisplayItem.md) <br>
*[UF_ActorSheetEd-prepareContext](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-prepareContext.md) <br>
*[UF_ActorSheetEd-renderHTML](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-renderHTML.md) <br>
[UF_ActorSheetEd-tabOrderSheet](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-tabOrderSheet.md) <br>
*[UF_ActorSheetEd-tabs](../User%20Functions/UF_ActorSheetEd/UF_ActorSheetEd-tabs.md) <br>

### Related Test Coverage

| Test Coverage | Related Documentation |
|---------------|-----------------------|
| Common Actor Sheet 1 - Active Effects Controls | [[Test] - Common Actor Sheet 1 - ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1593) |
| Common Actor Sheet 2 - Item Controls | [[Test] - Common Actor Sheet 2 - ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1594) |
| Common Actor Sheet 3 - edit Image | [[Test] - Common Actor Sheet 3 - ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1595) |
| Common Actor Sheet 4 - expand Item | [[Test] - Common Actor Sheet 4 - ](https://github.com/patrickmohrmann/earthdawn4eV2/issues/1596) |




