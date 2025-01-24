The Earthdawn Worflows often have the need to identify specific items of an actor. To avoid having an explicit name reference for every item, the **ed-id** helps by providing items the option to hold a specific id. Every id is a configurable string (see system settings) which, if entered into the items ed-id field, is responsible for triggering specific workflows or be taken into account for specific workflows. Functions and workflows can check all items of an actor for a specific Ed-id and use the item for the process.

### Diagram

No diagram required

### Related User Functions

[UF_Utils-getGlobalItemsByEdid](../User%20Functions/UF_Utils/UF_Utils-getGlobalItemsByEdid.md)

[UF_Utils-getSingleGlobalItemByEdid](../User%20Functions/UF_Utils/UF_Utils-getSingleGlobalItemByEdid.md)

[UF_Utils-validateEdid](../User%20Functions/UF_Utils/UF_Utils-validateEdid.md)


### Related Test Coverage

the tests are available at the workflow of each specific ed id.


