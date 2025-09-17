import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderSlot } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue@3.5.21_typescript@5.9.2/node_modules/vue/server-renderer/index.mjs';
import { b as useRuntimeConfig } from './server.mjs';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'node:buffer';
import 'node:util';
import 'node:url';
import 'node:net';
import 'node:fs';
import 'node:path';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs';
import '../nitro/nitro.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unified@11.0.5/node_modules/unified/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/remark-parse@11.0.0/node_modules/remark-parse/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/remark-rehype@11.1.2/node_modules/remark-rehype/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/remark-mdc@3.6.0/node_modules/remark-mdc/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/remark-gfm@4.0.1/node_modules/remark-gfm/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/rehype-external-links@3.0.0/node_modules/rehype-external-links/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/rehype-sort-attribute-values@5.0.1/node_modules/rehype-sort-attribute-values/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/rehype-sort-attributes@5.0.1/node_modules/rehype-sort-attributes/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/rehype-raw@7.0.0/node_modules/rehype-raw/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/detab@3.0.2/node_modules/detab/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/micromark-util-sanitize-uri@2.0.1/node_modules/micromark-util-sanitize-uri/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/hast-util-to-string@3.0.1/node_modules/hast-util-to-string/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/github-slugger@2.0.0/node_modules/github-slugger/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ofetch@1.4.1/node_modules/ofetch/dist/node.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/node-mock-http@1.0.3/node_modules/node-mock-http/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unstorage@1.17.1_db0@0.3.2_ioredis@5.7.0/node_modules/unstorage/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unstorage@1.17.1_db0@0.3.2_ioredis@5.7.0/node_modules/unstorage/drivers/fs.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unstorage@1.17.1_db0@0.3.2_ioredis@5.7.0/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unstorage@1.17.1_db0@0.3.2_ioredis@5.7.0/node_modules/unstorage/drivers/lru-cache.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/pathe@2.0.3/node_modules/pathe/dist/index.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ipx@2.1.1_db0@0.3.2_ioredis@5.7.0/node_modules/ipx/dist/index.mjs';
import '../_/renderer.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/vue-bundle-renderer@2.1.2/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unhead@2.0.14/node_modules/unhead/dist/server.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/devalue@5.3.2/node_modules/devalue/index.js';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unhead@2.0.14/node_modules/unhead/dist/utils.mjs';
import 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unhead@2.0.14/node_modules/unhead/dist/plugins.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProseH4",
  __ssrInlineRender: true,
  props: {
    id: {}
  },
  setup(__props) {
    const props = __props;
    const { headings } = useRuntimeConfig().public.mdc;
    const generate = computed(() => {
      var _a;
      return props.id && (typeof (headings == null ? void 0 : headings.anchorLinks) === "boolean" && (headings == null ? void 0 : headings.anchorLinks) === true || typeof (headings == null ? void 0 : headings.anchorLinks) === "object" && ((_a = headings == null ? void 0 : headings.anchorLinks) == null ? void 0 : _a.h4));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<h4${ssrRenderAttrs(mergeProps({
        id: props.id
      }, _attrs))}>`);
      if (props.id && unref(generate)) {
        _push(`<a${ssrRenderAttr("href", `#${props.id}`)}>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</a>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      }
      _push(`</h4>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxtjs+mdc@0.9.5_magicast@0.3.5/node_modules/@nuxtjs/mdc/dist/runtime/components/prose/ProseH4.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ProseH4-DM9vwsFu.mjs.map
