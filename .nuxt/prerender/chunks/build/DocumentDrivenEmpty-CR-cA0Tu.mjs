import { defineComponent, h, useSSRContext } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/index.mjs';

const _sfc_main = defineComponent({
  name: "DocumentDrivenEmpty",
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  render({ value }) {
    return h("div", void 0, [
      h("p", "Document is empty"),
      h("p", `Add content to it by opening ${value._source}/${value._file} file.`)
    ]);
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+content@2.13.4_db0@0.3.2_ioredis@5.7.0_magicast@0.3.5_nuxt@3.19.2_@parcel+watcher_7e7971975ff5eb694dd433e304c853bb/node_modules/@nuxt/content/dist/runtime/components/DocumentDrivenEmpty.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=DocumentDrivenEmpty-CR-cA0Tu.mjs.map
