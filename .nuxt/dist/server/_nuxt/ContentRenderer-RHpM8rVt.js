import { defineComponent, useSlots, h, watch, useSSRContext } from "vue";
import _sfc_main$1 from "./ContentRendererMarkdown-CTBSs1sJ.js";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "./index-fFli1Lw9.js";
import "./node-yHY0X6Y7.js";
import "vue/server-renderer";
import "./preview-BtMzuS7u.js";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/cookie-es@2.0.0/node_modules/cookie-es/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "../server.mjs";
import "node:http";
import "node:https";
import "node:zlib";
import "node:stream";
import "node:buffer";
import "node:util";
import "node:url";
import "node:net";
import "node:fs";
import "node:path";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import "#internal/nuxt/paths";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/@unhead+vue@2.0.14_vue@3.5.21_typescript@5.9.2_/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = defineComponent({
  name: "ContentRenderer",
  props: {
    /**
     * The document to render.
     */
    value: {
      type: Object,
      required: false,
      default: () => ({})
    },
    /**
     * Whether or not to render the excerpt.
     * @default false
     */
    excerpt: {
      type: Boolean,
      default: false
    },
    /**
     * The tag to use for the renderer element if it is used.
     * @default 'div'
     */
    tag: {
      type: String,
      default: "div"
    }
  },
  setup(props) {
    watch(
      () => props.excerpt,
      (newExcerpt) => {
        if (newExcerpt && !props.value?.excerpt) {
          console.warn(`No excerpt found for document content/${props?.value?._path}.${props?.value?._extension}!`);
          console.warn("Make sure to use <!--more--> in your content if you want to use excerpt feature.");
        }
      },
      {
        immediate: true
      }
    );
  },
  /**
   * Content empty fallback
   * @slot empty
   */
  render(ctx) {
    const slots = useSlots();
    const { value, excerpt, tag } = ctx;
    const markdownAST = excerpt ? value?.excerpt : value?.body;
    if (!markdownAST?.children?.length && slots?.empty) {
      return slots.empty({ value, excerpt, tag, ...this.$attrs });
    }
    if (slots?.default) {
      return slots.default({ value, excerpt, tag, ...this.$attrs });
    }
    if (markdownAST?.type === "root" && markdownAST?.children?.length) {
      return h(
        _sfc_main$1,
        {
          value,
          excerpt,
          tag,
          ...this.$attrs
        }
      );
    }
    return h(
      "pre",
      null,
      JSON.stringify({ message: "You should use slots with <ContentRenderer>", value, excerpt, tag }, null, 2)
    );
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+content@2.13.4_db0@0.3.2_ioredis@5.7.0_magicast@0.3.5_nuxt@3.19.2_@parcel+watcher_7e7971975ff5eb694dd433e304c853bb/node_modules/@nuxt/content/dist/runtime/components/ContentRenderer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=ContentRenderer-RHpM8rVt.js.map
