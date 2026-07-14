---
title: Active Effects
group: English
category: System
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Earthdawn Active Effects</title>
  <link rel="stylesheet" href="../wiki.css">
</head>
<body>
  <main>
    <section class="doc-card">
      <article class="doc-content">
<h1>Earthdawn Active Effects</h1>
<div>
  <p>Most things in the Earthdawn system rely on <a href="https://foundryvtt.com/article/active-effects/" target="_blank">Foundry Active Effects</a>. They were significantly customized to meet the system's requirements.
  </p>
  <section>
    <h2>Basics of the Effect Document</h2>
    <div>
      <p>The Effect document sheet has four tabs:</p>
      <ol>
        <li>General</li>
        <li>Duration</li>
        <li>Adjustments</li>
        <li>Script</li>
      </ol>
      <h3>General Tab</h3>
      <div>
        <p>
          In the General tab, the following information can be entered:
        <ul>
          <li>Effect image</li>
          <li>Effect name</li>
          <li>Statuses</li>
          <li>Assignment</li>
          <li>Description</li>
        </ul>
        <p>
          There is little to explain for image, name, and description. Statuses are currently a simple selection;
          support for multiple stacked statuses is not implemented yet. At the moment, for example, you can only select
          half cover or partial movement restriction.
        </p>
        <p>The assignment is essential to apply effects correctly. For effects on items, it is very important
          to distinguish whether the effect is for the item itself or for an actor. For an actor effect,
          either "Apply Effect to Target" or "Transfer Effect to Target" must be selected.
          For an effect that applies only to the item, these options must be disabled.
        </p>
      </div>
    </div>
  </section>
  <section>
    <h2>Assignment Functions of Active Effects</h2>
    <div>
      <p>All talents, powers, and spells that have an Earthdawn Active Effect create a button
        in chat when rolled. Clicking this button assigns the effect to the currently targeted tokens.
      </p>
      <p>Effects react to extra successes and may increase their duration or impact.</p>
    </div>
  </section>
  <section>
    <h2>Recommended Additional Modules</h2>
    <div>
      <p>The following modules are recommended in addition to the system. They are not mandatory, but they provide
        significant value.
      </p>
      <ul>
        <li><a href="https://foundryvtt.com/packages/visual-active-effects" target="_blank">Visual Active Effects</a></li>
        <li><a href="https://foundryvtt.com/packages/times-up" target="_blank">Times Up</a></li>
      </ul>
    </div>
  </section>
  <section>
    <h2></h2>
    <div>
      <p></p>
    </div>
  </section>
</div>
      </article>
    </section>
  </main>
</body>
</html>
