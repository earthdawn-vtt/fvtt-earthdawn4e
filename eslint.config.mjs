import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import typedoc from "eslint-plugin-typedoc";
import stylistic from "@stylistic/eslint-plugin";

const sourceFiles = [ "**/*.{js,mjs}" ];

const foundryGlobals = {
  _del:     false,
  _loc:     false,
  _replace: false,

  actors:           false,
  canvas:           false,
  delay:            false,
  ed4e:             true,
  expandObject:     false,
  foundry:          false,
  fromUuid:         false,
  fromUuidSync:     false,
  game:             false,
  getDocumentClass: false,
  globalThis:       false,
  isEmpty:          false,
  isOwned:          false,
  items:            false,
  loadTemplates:    false,
  mergeObject:      false,
  packs:            false,
  renderTemplate:   false,
  socketlib:        false,
  ui:               false,

  ActiveEffect:           false,
  Actor:                  false,
  ActorSheet:             false,
  Actors:                 false,
  ChatMessage:            false,
  Color:                  false,
  Combatant:              false,
  CONFIG:                 false,
  CONST:                  false,
  DataField:              false,
  DataModel:              false,
  Dialog:                 false,
  DiceTerm:               false,
  Die:                    false,
  DragDrop:               false,
  DocumentSheetV2:        false,
  DurationData:           false,
  ED4E_CONSTANTS:         false,
  EdRoll:                 false,
  Folder:                 false,
  FormApplication:        false,
  FormApplicationOptions: false,
  FormDataExtended:       false,
  FormSelectOption:       false,
  Handlebars:             false,
  Hooks:                  false,
  Intl:                   false,
  Item:                   false,
  ItemEd:                 true,
  ItemSheet:              false,
  ItemSheetEd:            true,
  Items:                  false,
  Journal:                false,
  JournalEntry:           false,
  JournalSheet:           false,
  Roll:                   false,
  SchemaField:            false,
  Settings:               false,
  TextEditor:             false,
  Token:                  false,
  Tour:                   false
};

export default defineConfig( [ {
  files: sourceFiles,

  extends: [ js.configs.recommended, typedoc.configs.recommended ],

  languageOptions: {
    ecmaVersion: "latest",
    sourceType:  "module",

    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.jquery,
      ...foundryGlobals,
    }
  },

  plugins: {
    "@stylistic": stylistic, jsdoc
  },

  rules: {
    complexity:             [ "error", { max: 20 } ],
    "max-depth":            [ "error", 5 ],
    "max-nested-callbacks": [ "error", 3 ],
    "max-params":           [ "warn", 5 ],

    "no-alert":              "off",
    "no-await-in-loop":      "off",
    "no-bitwise":            "off",
    "no-console":            "off",
    "no-control-regex":      "off",
    "no-continue":           "off",
    "no-fallthrough":        "off",
    "no-prototype-builtins": "off",
    "no-redeclare":          "off",
    "no-unused-labels":      "off",
    "no-useless-escape":     "off",

    "no-constant-condition": [ "error", { checkLoops: false } ],

    "no-empty": [ "error", { allowEmptyCatch: true } ],

    "no-implicit-coercion": [ "error", { allow: [ "!!" ] } ],

    "no-inner-declarations": [ "error", "both" ],

    "no-irregular-whitespace": [ "error", {
      skipStrings: true, skipComments: false, skipRegExps: true, skipTemplates: true
    } ],

    "no-return-assign": [ "error", "always" ],

    "no-unmodified-loop-condition": "error",

    "no-unused-expressions": [ "error", {
      allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true
    } ],

    "no-unused-vars": [ "error", {
      vars: "all", args: "none", ignoreRestSiblings: true, caughtErrors: "none"
    } ],

    "no-use-before-define": [ "error", {
      variables: false, functions: false, classes: false
    } ],

    "new-cap": [ "error", {
      newIsCap: true, capIsNew: false, properties: false
    } ],

    "no-void": "error",

    "one-var": [ "error", "never" ],

    "prefer-arrow-callback":        "error",
    "prefer-object-spread":         "error",
    "prefer-promise-reject-errors": "error",
    "prefer-regex-literals":        "error",

    "radix":              "error",
    "symbol-description": "error",

    "yoda": [ "error", "never", { onlyEquality: true } ],

    // region Formatting

    "@stylistic/array-bracket-spacing": [ "error", "always" ],

    "@stylistic/arrow-spacing": [ "error", {
      before: true, after: true
    } ],

    "@stylistic/block-spacing": [ "error", "always" ],

    "@stylistic/indent": [ "error", 2, { SwitchCase: 1 } ],

    "@stylistic/key-spacing": [ "error", {
      beforeColon: false, afterColon: true, mode: "minimum", align: "value"
    } ],

    "@stylistic/no-tabs": "error",

    "@stylistic/operator-linebreak": [ "error", "before" ],

    "@stylistic/quotes": [ "error", "double" ],

    "@stylistic/semi": [ "error", "always" ],

    "@stylistic/space-in-parens": [ "error", "always" ],

    "@stylistic/spaced-comment": [ "error", "always", {
      markers: [ "/" ], block:   {
        exceptions: [ "*" ], balanced: true
      }
    } ],

    // endregion

    // region Documentation

    "jsdoc/require-jsdoc": [ "error", {
      checkGetters: true, checkSetters: "no-getter", enableFixer:  false, require:      {
        ArrowFunctionExpression: false,
        ClassDeclaration:        true,
        ClassExpression:         true,
        FunctionDeclaration:     true,
        FunctionExpression:      true,
        MethodDefinition:        true
      }
    } ],

    // endregion
  }
},

{
  files: [ "**/*.quench.mjs" ],

  rules: {
    "max-nested-callbacks": [ "warn", 5 ], "no-unused-expressions": "off"
  }
} ] );
