# Guideline

This Guideline provieds an overview of the documentation and provides the rules which shall be applied to it.

## Release Notes

The release notes provide an overview of all changes done to the system. Release notes will be created for every version. 

### Versioning

the release notes follow the system versioning

VX.Y.Z
V = Version
X = major release
Y = minor release
Z = Bug fix releases / Foundry upgrade

a new minor release will set the bug fix release / foundry upgrade to 0, and a new major release will set all other to 0.

#### Major release

a main release has a certain Topic in mind (e.g. Token vision) the features in this release will all be related to that main topic

#### Minor releases

minor releases contain upgrades to the Topic of the main release. Features pointed out by the community after using the new feature for example

#### Bug fix releases / Foundry upgrade

Bug fix releases are for sever bugs which cannot wait for the next major or minor release. <br>
If a new Foundry Core version is released, a separate release might be required which is not containing any new features. 

### Version Changes

Version changes to the system require a specific documentation. the following Chapters provide a description and one example for that specific type. All issues of one type will be grouped together (e.g. all Breaking changes, then all New Features etc.)

#### Breaking Changes

Breaking Changes are system changes which will change or disable previous system functionality behavior. 

**Template**
- Change
- Reason
- Current Behavior
- new Behavior
- Potential issues and how to solve them

#### New Features

New Features bring new functionality to the system without interfering with current functionality.

**Template**
- Major Release Topic
- New Feature
- how does it work
- Required tasks to enable this feature

#### Fixed Bugs

Fixed bugs will contain a list of all bugs fixed in this release

**Template**
- #ISSUEID - Bug name

#### Known Bugs

Known bugs will contain a list of all current Bugs in the system 

**Template**
- #ISSUEID - Bug name

## Manual

There will be two different types of manuals available. The first is to be found in the github repository, accessable for everyone. The second manual is an ingame Journal Compendium for the usage during the gaming session. Each Manual is separated into two parts. A Game Master section and a Player section. The Game Master section containing all information about the system setup, configurations etc. 

### System Manual for Game Master

Every chapter in the Game Master Manual is dedicated to one general Topic ( Actors, items, Workflows etc.) each Journal/page describes one specific Topic and how it is used. It is mandatory to note down every open Bug which is in the version directly at the related point in the manual

### System Manual for Player

Every chapter in the Player Manual is dedicated to one general Topic ( Actor Sheet, Rolls, Token interaction etc. ). each Journal/page describes one specific Topic and how it is used. It is mandatory to note down every open Bug which is in the version directly at the related point in the manual

## Functional Specification

The Functional Specification holds the content of the system Manuals and extents them by adding flow diagrams if necessary. The Functionality is further cut down into use cases (see below). Every use case has a connection to a set of user functions, and test cases (see also below). 

### Use Cases


A use case is a specific function or workflow. it contains a diagram (sometimes it does not if the use case does not require one), a list of connected user functions and a list of test cases.
every time a code change is made, the user function attached to the changed function leads to one or more Use cases. The touched use case itself provides a list of potential tests to cover that the functionality of the use case is still provided by the changes.
#### User Functions

Every user function contains a brief description about its functionality. This description is - if necessary - separated into a description and a technical part.

#### Test Cases


Every test case is a - as of now - a github issue with a description how to execute the test manually in the system together with a description of prerequisites and the goal to archive by this test.

## Coding and Documentation

the following chapter is about the responsibility of developers to document the code and make sure validation is triggered.

### Labels

every use case and every user function has its own label in github with the same name. <br>
Use Cases shall usually be assigned to a Story, Bug or Refactoring during creation (it is not final but provides a good starting point).
During the development process every changed code function requires the developer to add the user function of that function or method to the issue they are working on. <br>
This allows the developer and/or tester to easily find the tests related to that functionality by checking for the use cases the user function is linked to and set the milestone (or other tag) on the test itself. This ensures, that every functionality which is touched will be tested before the release.

### Tests

With every release it is mandatory to create and update tests according to the created or changed use cases. Every test is a separate GitHub issue of type Test (a template is provided). <br>

## Testing

Testing is a crucial part of software development and this is no exception to it. 

### GitHub usage

Every Release version has its own Project in the repository with the identical version numbering as the released version.<br>

This will be done by the GitHub API (WIP).<br>

