---
title: Threads and Patterns
category: English
group: Magic
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Threads and Patterns</title>
  <link rel="stylesheet" href="../wiki.css">
</head>
<body>
  <main>
    <section class="doc-card">
      <div class="doc-topbar">
        <a class="doc-home-link" href="../index.md">Back to Table of Contents</a>
      </div>
      <article class="doc-content">
<h1>Threads and Patterns</h1>
<div>
  <div>
    <p>This chapter explains how magical threads work outside of spellcasting.</p>
  </div>
  <section>
    <h2>Patterns</h2>
    <div>
      <p>
        The Earthdawn system currently supports true patterns on items and actors. True patterns
        can only be created in Edit mode. For actors, you can create a true magical
        pattern in the "Connections" tab. For items (equipment, armor, shields, and weapons), add it via the
        "True Pattern" tab.
      </p>
      <p>
        True patterns on items are hidden from players by default. The GM can choose
        to make the pattern visible to players. Use the small "eye icon"
        <i class="fa-light fa-xs fa-eye-slash" inert=""></i> on the true pattern to toggle visibility.
        For all additional functions, the true pattern must be visible to players.
      </p>
    </div>
    <h3>Core Functions of True Patterns</h3>
    <div>
      <p>
        True patterns have three core functions: Item History, Research, and Thread Weaving. There is
        one action button for each in the corresponding true pattern while in Play mode. These functions are
        currently supported automatically only if the actor itself has the required abilities (Item History,
        Research, and Thread Weaving).
      </p>
      <p>For true patterns of actors, only Thread Weaving is currently supported.</p>
      <h4>Item History</h4>
      <div>
        <p>
          The Item History function allows players with the Item History talent to investigate an item's
          pattern. For this, the corresponding talent must have the <code>ed-id</code>
          <em lang="en">item-history</em>.
        </p>
        <p>
          On a successful test, the number of ranks (as tabs) becomes visible in the item. Each success in
          the Item History test reveals one rank of the true pattern.
        </p>
        <p>
          Similar to the true pattern itself, part of each rank remains hidden from players
          (see Research and Thread Weaving).
        </p>
      </div>
      <h4>Research</h4>
      <div>
        <p>Not implemented yet.</p>
      </div>
      <h4>Thread Weaving</h4>
      <div>
        <p>
          The Thread Weaving function allows players to weave a thread to the true pattern. On a
          successful test, an entry is created in the "Links" tab with a link to the thread's origin.
        </p>
      </div>
    </div>
  </section>
  <section>
    <h2>Thread Items</h2>
    <div>
      <p>
        Thread items are one possible form of pattern items. They include the usual values of a
        pattern item:
      </p>
      <ul>
        <li>Mystic Defense</li>
        <li>Maximum number of threads</li>
        <li>Step</li>
        <li>Link to woven threads</li>
      </ul>
      <p>Ranks have the following options:</p>
      <ul>
        <li>Key Knowledge question</li>
        <li>Key Knowledge answer</li>
        <li>Deed</li>
        <li>Effect description</li>
        <li>Earthdawn Active Effect link</li>
        <li>Ability link</li>
      </ul>
      <p>
        If the Item History test was successful, additional ranks are unlocked accordingly.
        Players first see only the question for the required key knowledge.
      </p>
      <p>
        Unlocking the answer and effect, the deed, and linked objects is only possible for the GM.
      </p>
      <p>
        <strong>Note:</strong> Like many other functions in the Earthdawn Foundry system, this feature relies heavily
        on "Earthdawn Active Effects." Automatic assignment of effects from true patterns to
        actors is not implemented yet. Therefore, GM and players currently need to create effects manually or
        activate them in the true pattern.
      </p>
    </div>
    <h2>Increasing Thread Ranks</h2>
    <div>
      <p>
        After a thread has been woven to an item initially, thread ranks can be increased directly on the actor in Edit mode
        (see <a href="../legend/advancements.md">Advancements</a>).
      </p>
    </div>
  </section>
  <section>
    <h2>Group Patterns</h2>
    <div>
      <p>
        A group pattern requires an item that serves as a focus for actor threads. As GM, create
        an item in the world. Then grant all players "Owner" rights on that item,
        so they can weave threads to it. The item itself stays in the world,
        but it can also be added to each character.
      </p>
      <p>
        If the item remains in the world, all characters can weave threads to the same item.
        This creates a clear overview and keeps the group connection visible.
      </p>
      <p>
        The item should have at least "number of players * 5" thread capacity. This is required so each
        actor can weave 5 threads to the group's true pattern (according to the rulebook).
      </p>
      <p>
        Woven threads can be found in the "Links" tab and can also be improved there.
      </p>
      <p>
        Similar to thread items, players and GM must manage the effects themselves here as well.
      </p>
    </div>
  </section>
</div>
      </article>
    </section>
  </main>
</body>
</html>
