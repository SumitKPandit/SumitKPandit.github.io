import { defineComponent, unref, useSSRContext } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/index.mjs';
import { ssrRenderAttrs } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/server-renderer/index.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProseScript",
  __ssrInlineRender: true,
  props: {
    src: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    const isDev = false;
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isDev)) {
        _push(`<div${ssrRenderAttrs(_attrs)}> Rendering the <code>script</code> element is dangerous and is disabled by default. Consider implementing your own <code>ProseScript</code> element to have control over script rendering. </div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxtjs+mdc@0.9.5_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseScript.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ProseScript-BsNgA1e2.mjs.map
