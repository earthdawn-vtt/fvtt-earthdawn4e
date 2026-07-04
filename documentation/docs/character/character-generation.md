---
title: Character Generation
group: English
category: Character
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Character Generation</title>
  <link rel="stylesheet" href="../wiki.css" />
</head>
<body>
  <main>
    <section class="doc-card">
      <article class="doc-content">
        <p>The Earthdawn system for Foundry VTT offers a comprehensive character generation flow to help players start quickly.</p>
        <p>Character generation is split into multiple steps:</p>
        <ol>
            <li>Select Namegiver</li>
            <li>Select Vocation and distribute talent ranks</li>
            <li>Distribute attribute points</li>
            <li>Select spells (optional)</li>
            <li>Distribute skill ranks</li>
            <li>Select languages</li>
            <li>Select starting equipment</li>
        </ol>

        <h2>Requirements</h2>
        <div>
            <p>To create a character in the Earthdawn system, the following requirements apply.</p>
            <p>First, players need permission to create an actor in the world. By default, only the GM can do this. To grant this permission to players,
                open <em lang="en">User Permission Configuration</em> in Foundry VTT system settings and
                enable <em lang="en">Create Actor</em>. If the GM does not want to keep this option enabled permanently,
                the setting should be reset after character generation. <br><strong>Warning: This permission allows players to create any number of actors,
                    and in public worlds this must not remain enabled carelessly.</strong></p>
            <img src="../../assets/manual/german/char-gen-permission-setting.png">
            <p>The next important requirement is that players have access (at least Observer access) to the corresponding compendium packs or items in
                the world. This means that automatic character generation only works when players can access the items required for it
                (for example Namegivers, Disciplines, Talents, Skills, Spells, and so on).</p>
            <img src="../../assets/manual/german/char-gen-compendium-permissions.png">
            <p>If both requirements are met, players can start character generation either from <em>Create Actor</em> in
                the Actor Directory or via the chat command <code>/char</code>.</p>
        </div>
        <p> </p>
    
        <h2>Character Generation Configuration (Information for GMs)</h2>
        <div>
            <p>Character generation has several configurable system settings:</p>
            <h3>Character Generation Enabled?</h3>
            <p>This configuration is enabled by default. As a result, whenever an actor of type <em>Character</em> is created, character generation starts automatically.
                If this configuration is disabled, character generation must be started manually with the chat command <code>/char</code>.</p>
            <h3>Available Attribute Points</h3>
            <p>This setting defines how many attribute points are available during character generation. The default is 25 points, as defined in the Player's Guide.</p>
            <h3>Maximum Ranks</h3>
            <p>This setting defines how many ranks can be distributed to talents or skills. By default, maximum rank is set to 3.</p>
            <h3>Maximum Spell Circle</h3>
            <p>This configuration defines which spells are available during character generation by limiting spell circle.
                By default, the maximum circle is set to 2.</p>
            <img src="../../assets/manual/german/char-gen-system-settings.png" style="display: block; width: auto; max-width: 100%; margin: 0 auto; clear: both">
        </div>
        <p> </p>
    
        <h2>Character Generation in Detail</h2>
        <div>
            <p>When started, a dialog opens where character generation takes place. At the bottom, buttons guide you through each step.
                The <em>Finish</em> button only becomes active once all required steps are completed.
                After clicking it, the dialog closes and the new actor is created.</p>
            <h3>Namegiver</h3>
            <p>In the first step, select the character's Namegiver from the menu in the lower part of the dialog.</p>
            <h3>Vocation</h3>
            <p>In the second step, first choose the vocation type. Should it be Adept (default) or Questor? You can switch between both options
                and will then see the corresponding choices (Disciplines or Questors).</p>
            <h4>Disciplines</h4>
            <p>If you choose Adept, you can select a Discipline. Each Discipline contains Discipline talents, optional talents, and possibly free talents.
                You can then distribute talent ranks to Discipline talents and one optional talent.</p>
            <h5>Namegiver Talents</h5>
            <p>Some Namegivers have their own talents (Humans have Versatility and Windlings have Astral Sight). These talents can receive ranks in addition to
                Discipline and Optional talents.</p>
            <h4>Questor</h4>
            <p>If you want to play a Questor, you can select one option from the available list. Then you can choose a devotion power and assign one rank
                to that power. The Questor devotion power is automatically created after character generation and set to rank 1.</p>
            <h3>Attributes</h3>
            <p>In the third step, attribute points are distributed among attributes. Distribution is done via the + and - buttons beside each attribute.
                This also updates the character's characteristics automatically. The lower part of the dialog shows both the current value and the resulting characteristic
                value for each increase or decrease. Unspent attribute points are granted as bonus karma points.</p>
            <h3>Spells</h3>
            <p>If you selected a Discipline that uses spells, this is where you choose spells. Simply click each spell to select it.</p>
            <h3>Skills</h3>
            <p>In the next step, choose the character's skills. At least one rank must be assigned to an Artisan skill, 2 ranks to Knowledge skills, and 3 ranks
                to Language skills. Language skills are preselected and can only be improved, not reduced or removed.
                In addition, 8 free skill ranks are available for free distribution.</p>
            <p>To distribute ranks, click the + or - icon beside each skill as in other steps.</p>
            <h3>Languages</h3>
            <p>In the next step, determine the character's languages. You can select as many languages as you have ranks in
                <em>Read and Write</em> and <em>Foreign Languages</em>.</p>
            <h3>Equipment</h3>
            <p>In the final step, you receive the character's starting equipment. These are the items corresponding to basic equipment from the
                <em>Character Generation</em> chapter of the Player's Guide. Additional equipment must be added manually after character generation.</p>
        </div>
      </article>
    </section>

  </main>
</body>
</html>
