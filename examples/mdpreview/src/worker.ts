import unified from "unified";
import parse from "remark-parse";
import mutate from "remark-rehype";
import highlight from "rehype-highlight";
import stringify from "rehype-stringify";
import prettier from "prettier/standalone";
import markdown from "prettier/parser-markdown";

import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

function md2html(markdown: string): string {
  return unified()
    .use(parse)
    .use(mutate)
    .use(highlight, { ignoreMissing: true })
    .use(stringify)
    .processSync(markdown)
    .toString();
}

function format({ source, cursorOffset }: Source): Formatted {
  return prettier.formatWithCursor(source, {
    cursorOffset,
    parser: "markdown",
    plugins: [markdown]
  });
}

const p: proto.RPC["worker"] = self as any;
(async () => {
  while (true) {
    const [label, p1] = await recv(p);
    switch (label) {
      case "md2html": {
        const [markdown, p2] = await recv(p1 as proto.Md2Html["worker"]);
        send(p2, md2html(markdown));
        break;
      }
      case "format": {
        const [source, p2] = await recv(p1 as proto.Format["worker"]);
        send(p2, format(source));
        break;
      }
    }
  }
})();
