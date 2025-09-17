import { unref, watch, defineComponent, useSlots, h, useSSRContext } from "vue";
import { joinURL, withTrailingSlash, withoutTrailingSlash, hasProtocol } from "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs";
import _sfc_main$2 from "./ContentRenderer-RHpM8rVt.js";
import _sfc_main$1 from "./ContentQuery-DGH7khSX.js";
import { a as useRoute, b as useRuntimeConfig, u as useHead } from "../server.mjs";
import "./ContentRendererMarkdown-CTBSs1sJ.js";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs";
import "./index-fFli1Lw9.js";
import "./node-yHY0X6Y7.js";
import "vue/server-renderer";
import "./preview-BtMzuS7u.js";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/cookie-es@2.0.0/node_modules/cookie-es/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/ohash@1.1.6/node_modules/ohash/dist/index.mjs";
import "./query-B19K3o5c.js";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/perfect-debounce@2.0.0/node_modules/perfect-debounce/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs";
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
import "#internal/nuxt/paths";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs";
import "/Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/@unhead+vue@2.0.14_vue@3.5.21_typescript@5.9.2_/node_modules/@unhead/vue/dist/index.mjs";
const useContentHead = (_content, to = useRoute()) => {
  const content = unref(_content);
  const config = useRuntimeConfig();
  const refreshHead = (data = content) => {
    if (!to.path || !data) {
      return;
    }
    const head = Object.assign({}, data?.head || {});
    head.meta = [...head.meta || []];
    head.link = [...head.link || []];
    const title = head.title || data?.title;
    if (title) {
      head.title = title;
      if (!head.meta.some((m) => m.property === "og:title")) {
        head.meta.push({
          property: "og:title",
          content: title
        });
      }
    }
    const host = config.public.content.host;
    if (host) {
      const _url = joinURL(host ?? "/", config.app.baseURL, to.fullPath);
      const url = config.public.content.trailingSlash ? withTrailingSlash(_url) : withoutTrailingSlash(_url);
      if (!head.meta.some((m) => m.property === "og:url")) {
        head.meta.push({
          property: "og:url",
          content: url
        });
      }
      if (!head.link.some((m) => m.rel === "canonical")) {
        head.link.push({
          rel: "canonical",
          href: url
        });
      }
    }
    const description = head?.description || data?.description;
    if (description && head.meta.filter((m) => m.name === "description").length === 0) {
      head.meta.push({
        name: "description",
        content: description
      });
    }
    if (description && !head.meta.some((m) => m.property === "og:description")) {
      head.meta.push({
        property: "og:description",
        content: description
      });
    }
    const image = head?.image || data?.image;
    if (image && head.meta.filter((m) => m.property === "og:image").length === 0) {
      if (typeof image === "string") {
        head.meta.push({
          property: "og:image",
          content: host && !hasProtocol(image) ? new URL(joinURL(config.app.baseURL, image), host).href : image
        });
      }
      if (typeof image === "object") {
        const imageKeys = [
          "src",
          "secure_url",
          "type",
          "width",
          "height",
          "alt"
        ];
        for (const key of imageKeys) {
          if (key === "src" && image.src) {
            const isAbsoluteURL = hasProtocol(image.src);
            const imageURL = isAbsoluteURL ? image.src : joinURL(config.app.baseURL, image.src ?? "/");
            head.meta.push({
              property: "og:image",
              content: host && !isAbsoluteURL ? new URL(imageURL, host).href : imageURL
            });
          } else if (image[key]) {
            head.meta.push({
              property: `og:image:${key}`,
              content: image[key]
            });
          }
        }
      }
    }
    {
      useHead(head);
    }
  };
  watch(() => unref(_content), refreshHead, { immediate: true });
};
const ContentDoc = defineComponent({
  name: "ContentDoc",
  props: {
    /**
     * Renderer props
     */
    /**
     * The tag to use for the renderer element if it is used.
     * @default 'div'
     */
    tag: {
      type: String,
      required: false,
      default: "div"
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
     * Query props
     */
    /**
     * The path of the content to load from content source.
     * @default useRoute().path
     */
    path: {
      type: String,
      required: false,
      default: void 0
    },
    /**
     * A query builder params object to be passed to <ContentQuery /> component.
     */
    query: {
      type: Object,
      required: false,
      default: void 0
    },
    /**
     * Whether or not to map the document data to the `head` property.
     */
    head: {
      type: Boolean,
      required: false,
      default: void 0
    }
  },
  /**
   * Document empty fallback
   * @slot empty
   */
  /**
   * Document not found fallback
   * @slot not-found
   */
  render(ctx) {
    const { contentHead } = useRuntimeConfig().public.content;
    const slots = useSlots();
    const { tag, excerpt, path, query, head } = ctx;
    const shouldInjectContentHead = head === void 0 ? contentHead : head;
    const contentQueryProps = {
      ...query || {},
      path: path || query?.path || withTrailingSlash(useRoute().path),
      find: "one"
    };
    const emptyNode = (slot, data) => h("pre", null, JSON.stringify({ message: "You should use slots with <ContentDoc>", slot, data }, null, 2));
    return h(
      _sfc_main$1,
      contentQueryProps,
      {
        // Default slot
        default: slots?.default ? ({ data, refresh, isPartial }) => {
          if (shouldInjectContentHead) {
            useContentHead(data);
          }
          return slots.default?.({ doc: data, refresh, isPartial, excerpt, ...this.$attrs });
        } : ({ data }) => {
          if (shouldInjectContentHead) {
            useContentHead(data);
          }
          return h(
            _sfc_main$2,
            { value: data, excerpt, tag, ...this.$attrs },
            // Forward local `empty` slots to ContentRenderer if it is used.
            { empty: (bindings) => slots?.empty ? slots.empty(bindings) : emptyNode("default", data) }
          );
        },
        // Empty slot
        empty: (bindings) => slots?.empty?.(bindings) || h("p", null, "Document is empty, overwrite this content with #empty slot in <ContentDoc>."),
        // Not Found slot
        "not-found": (bindings) => slots?.["not-found"]?.(bindings) || h("p", null, "Document not found, overwrite this content with #not-found slot in <ContentDoc>.")
      }
    );
  }
});
const _sfc_main = ContentDoc;
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+content@2.13.4_db0@0.3.2_ioredis@5.7.0_magicast@0.3.5_nuxt@3.19.2_@parcel+watcher_7e7971975ff5eb694dd433e304c853bb/node_modules/@nuxt/content/dist/runtime/components/ContentDoc.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=ContentDoc-DUJGk_8Q.js.map
