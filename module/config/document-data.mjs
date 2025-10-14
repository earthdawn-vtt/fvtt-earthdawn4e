import { preLocalize } from "../utils.mjs";


export const documentData = {
  ActiveEffect: {
    base: {
      manualOverride: {
        name:        "ED.ActiveEffect.CreateData.nameManualOverride",
        description: "ED.ActiveEffect.CreateData.descriptionManualOverride",
        type:        "eae",
        system:      {
          duration: {
            type: "permanent",
          },
        },
      },
    },
  },
  Item:         {
    skill: {
      languageSpeak: {
        name:   "ED.Item.CreateData.nameSpeakLanguage",
        type:   "skill",
        system: {
          description: { value: "ED.SpeakLanguage Skill Description" },
          // edid needs to be set on creation since settings are not ready on init
          // edid: game.settings.get( "ed4e", "edidLanguageSpeak" ),
          attribute:   "per",
        },
      },
      languageRW: {
        name:   "ED.Item.CreateData.nameReadWriteLanguage",
        type:   "skill",
        system: {
          description: { value: "ED.ReadWriteLanguage Skill Description" },
          // edid needs to be set on creation since settings are not ready on init
          // edid: game.settings.get( "ed4e", "edidLanguageRW" ),
          attribute:   "per",
        },
      },
    },
    devotion: {
      questor: {
        name:   "ED.Item.CreateData.nameQuestorDevotion",
        type:   "devotion",
        system: {
          description: { value: "ED.Devotion.Questor Description" },
          // edid needs to be set on creation since settings are not ready on init
          // edid: game.settings.get( "ed4e", "edidQuestorDevotion" ),
          attribute:   "cha",
          action:      "sustained",
          difficulty:  {fixed: 10},
          tier:        "journeyman",
        },
      },
    },
  },
};
preLocalize( "documentData.ActiveEffect.base.manualOverride", { keys: [ "name", "description", ], } );
preLocalize( "documentData.Item.skill.languageSpeak", { key: "name" } );
preLocalize( "documentData.Item.skill.languageSpeak.system.description", { key: "value" } );
preLocalize( "documentData.Item.skill.languageRW", { key: "name" } );
preLocalize( "documentData.Item.skill.languageRW.system.description", { key: "value" } );
preLocalize( "documentData.Item.devotion.questor", { key: "name" } );
preLocalize( "documentData.Item.devotion.questor.system.description", { key: "value" } );

export const startingEquipment = {
  adventuresPack: {
    name: {
      de: "Abenteuerpaket",
      en: "Adventure's Kit>",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.QoFs74sBrsKYBYla",
      en: "Compendium.ed4e.core-items-english.Item.ChlB1OC6AQlp3oyj",
    },
  },
  backpack: {
    name: {
      de: "Rucksack",
      en: "Backpack",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.pRHY0FtscONOTBx3",
      en: "Compendium.ed4e.core-items-english.Item.eJMPAkYJZS27MSWO",
    },
  },
  bedroll: {
    name: {
      de: "Schlafsack",
      en: "Bedroll",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.bj6QLFwZ3RqRmvuK",
      en: "Compendium.ed4e.core-items-english.Item.gn1aAtPYJJEkDESL",
    },
  },
  flintAndSteel: {
    name: {
      de: "Feuerstein & Stahl",
      en: "Flint & Steel",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.VYDU8AYjbfqt8hGM",
      en: "Compendium.ed4e.core-items-english.Item.sANrGj1jZJeXKrHH",
    },
  },
  torch: {
    name: {
      de: "Fackel",
      en: "Torch",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.qyLwljtWgScvpZn2",
      en: "Compendium.ed4e.core-items-english.Item.gGMJqLCpM4tBQzX9",
    },
  },
  waterskin: {
    name: {
      de: "Wasser- oder Weinschlauch",
      en: "Waterskin",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.d2dzfa6mPibJKEO1",
      en: "Compendium.ed4e.core-items-english.Item.NdIZiXzonRNHqTYf",
    },
  },
  sackLarge: {
    name: {
      de: "Großer Sack",
      en: "Sack, large",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.jGbxX7PKvQwHtnL1",
      en: "Compendium.ed4e.core-items-english.Item.YtxceiyTFpiWlPp5",
    },
  },
  artisanToolsCarving: {
    name: {
      de: "Künstlerwerkzeug (Schnitzen)",
      en: "Artisan Tools (Carving)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.38QuMhtR3djGN5qA",
      en: "Compendium.ed4e.core-items-english.Item.pKTOraTpHPgtk2BF",
    },
  },
  artisanToolsEmbroidery: {
    name: {
      de: "Künstlerwerkzeug (Sticken&Nähen)",
      en: "Artisan Tools (Embroidery/Sewing)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.DEOGtob4q6LNTNib",
      en: "Compendium.ed4e.core-items-english.Item.wLmtnFm3AJnXUThF",
    },
  },
  artisanToolsForging: {
    name: {
      de: "Künstlerwerkzeug (Schmieden)",
      en: "Artisan Tools (Forging)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.r7msZUtOhwy7xJLX",
      en: "Compendium.ed4e.core-items-english.Item.tAvZXpaY4uF0qUmF",
    },
  },
  artisanToolsPainting: {
    name: {
      de: "Künstlerwerkzeug (Malerei)",
      en: "Artisan Tools (Painting)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.HqLVNxAy2zmaKcJ9",
      en: "Compendium.ed4e.core-items-english.Item.rn2jotHdGEfYTwKq",
    },
  },
  artisanToolsSculpting: {
    name: {
      de: "Künstlerwerkzeug (Bildhauerei)",
      en: "Artisan Tools (Sculpting)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.IvQIzwPm2sQPEGWb",
      en: "Compendium.ed4e.core-items-english.Item.VMvTL6inPht8N5Sp",
    },
  },
  dagger: {
    name: {
      de: "Dolch",
      en: "Dagger",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.9sTzuUGNIgIJaVEu",
      en: "Compendium.ed4e.core-items-english.Item.VftlPHz6zAJqHgnB",
    },
  },
  knife: {
    name: {
      de: "Messer",
      en: "Knife",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.Nxc41za4gALuz1SL",
      en: "Compendium.ed4e.core-items-english.Item.JjNpz0S4TatlUgOX",
    },
  },
  grimoire: {
    name: {
      de: "Grimoire",
      en: "Grimoire",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.DJJ4XVTJybLGuA6w",
      en: "Compendium.ed4e.core-items-english.Item.3YEhvAkdbmd6xfV3",
    },
  },
  travelorsGarbBreeches: {
    name: {
      de: "Reisekleidung (Hose)",
      en: "Traveler's Garb (Breeches)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.iWgU0JKCKC2NjzJi",
      en: "Compendium.ed4e.core-items-english.Item.GaC3r4sglSmU9F0B",
    },
  },
  travelorsGarbRobe: {
    name: {
      de: "Reisekleidung (Gewand)",
      en: "Traveler's Garb (Robe)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.JZJoTOckUCiAwE2q",
      en: "Compendium.ed4e.core-items-english.Item.HAwAcmh8NSECYXVK",
    },
  },
  bootsSoft: {
    name: {
      de: "Weiche Stiefel",
      en: "Boots, soft",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.PHMxb31tiLLQC1NZ",
      en: "Compendium.ed4e.core-items-english.Item.YYcA7gxpr5SnMZgs",
    },
  },
  shirt: {
    name: {
      de: "Hemd",
      en: "Shirt",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.AfSPCXYdvZLT47VR",
      en: "Compendium.ed4e.core-items-english.Item.krdcWXGfq9iOOQWD",
    },
  },
  belt: {
    name: {
      de: "Gürtel",
      en: "Belt",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.MWRKfzNdbFE953tC",
      en: "Compendium.ed4e.core-items-english.Item.UJZ3QzCjO4aBlA13",
    },
  },
  robe: {
    name: {
      de: "Robe (Leinen)",
      en: "Robe",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.IcXlmZcdsBz9KKct",
      en: "Compendium.ed4e.core-items-english.Item.9K6Rnq370zCc2kLg",
    },
  },
  breeches: {
    name: {
      de: "Hose",
      en: "Breeches",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.Z9KaKS8TFj6M5ixA",
      en: "Compendium.ed4e.core-items-english.Item.UZUUpFwTs18qKC65",
    },
  },
  cloakTravelers: {
    name: {
      de: "Reiseumhang",
      en: "Cloak, Travelers",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.z9cEPE63TKyht1Ij",
      en: "Compendium.ed4e.core-items-english.Item.n3XE3IV2TZtyqLBz",
    },
  },
  rationTrail: {
    name: {
      de: "Trockenproviant (1 Woche)",
      en: "Rations, Trail (1 Week)",
    },
    uuid: {
      de: "Compendium.ed4e.core-items-deutsch.Item.vGdo76Of1ypkIN6g",
      en: "Compendium.ed4e.core-items-english.Item.wRLl9FhLR67YgOqA",
    },
  },
};