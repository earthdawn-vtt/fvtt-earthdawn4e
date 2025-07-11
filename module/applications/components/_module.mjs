import AdoptedStyleSheetMixin from "./adopted-stylesheet-mixin.mjs";
import CheckboxElement from "./checkbox.mjs";
import SlideToggleElement from "./slide-toggle.mjs";

window.customElements.define( "ed4e-checkbox", CheckboxElement );
window.customElements.define( "slide-toggle", SlideToggleElement );

export {
  AdoptedStyleSheetMixin,
  CheckboxElement,
  SlideToggleElement
};
