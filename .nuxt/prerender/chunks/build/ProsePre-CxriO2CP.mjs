import _sfc_main$1 from './ProseCode-BZv1mp2R.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, renderSlot, useSSRContext } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/index.mjs';
import { ssrRenderComponent, ssrRenderClass, ssrRenderStyle, ssrRenderSlot } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/server-renderer/index.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProsePre",
  __ssrInlineRender: true,
  props: {
    code: {
      type: String,
      default: ""
    },
    language: {
      type: String,
      default: null
    },
    filename: {
      type: String,
      default: null
    },
    highlights: {
      type: Array,
      default: () => []
    },
    meta: {
      type: String,
      default: null
    },
    class: {
      type: String,
      default: null
    },
    style: {
      type: [String, Object],
      default: null
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProseCode = _sfc_main$1;
      _push(ssrRenderComponent(_component_ProseCode, mergeProps({
        code: __props.code,
        language: __props.language,
        filename: __props.filename,
        highlights: __props.highlights,
        meta: __props.meta
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<pre class="${ssrRenderClass(_ctx.$props.class)}" style="${ssrRenderStyle(__props.style)}"${_scopeId}>`);
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            _push2(`</pre>`);
          } else {
            return [
              createVNode("pre", {
                class: _ctx.$props.class,
                style: __props.style
              }, [
                renderSlot(_ctx.$slots, "default")
              ], 6)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+content@2.13.4_db0@0.3.2_ioredis@5.7.0_magicast@0.3.5_nuxt@3.19.2_@parcel+watcher_7e7971975ff5eb694dd433e304c853bb/node_modules/@nuxt/content/dist/runtime/components/Prose/ProsePre.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ProsePre-CxriO2CP.mjs.map
