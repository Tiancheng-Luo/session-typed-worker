import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import "./style.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { send, recv } from "session-typed-worker";
import * as proto from "./protocols";

interface State {
  markdown: string;
  html: string;
}

class App extends React.Component<{}, State> {
  private p: proto.RPC["client"] = new Worker("./worker.ts") as any;
  private textarea: React.RefObject<HTMLTextAreaElement>;

  constructor(props: never) {
    super(props);
    this.state = { html: "", markdown: "" };
    this.textarea = React.createRef();
  }

  async handleKeyDown(e: React.KeyboardEvent) {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      if (this.textarea.current != null) {
        const cursor = this.textarea.current.selectionStart;
        const p1 = send(this.p, "format") as proto.Format["client"];
        const p2 = send(p1, {
          source: this.state.markdown,
          cursorOffset: cursor
        });
        const [{ formatted, cursorOffset }] = await recv(p2);

        this.setState({ markdown: formatted }, () => {
          if (this.textarea.current != null)
            this.textarea.current.selectionEnd = cursorOffset;
        });
      }
    }
  }

  async handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const markdown = e.target.value;
    const cursor = e.target.selectionStart;
    const p1 = send(this.p, "md2html") as proto.Md2Html["client"];
    const p2 = send(p1, markdown);
    const [html] = await recv(p2);

    this.setState({ markdown, html }, () => {
      if (this.textarea.current != null)
        this.textarea.current.selectionEnd = cursor;
    });
  }

  render() {
    return (
      <div
        className="container"
        tabIndex={0}
        onKeyDown={this.handleKeyDown.bind(this)}
      >
        <textarea
          className="edit-area"
          ref={this.textarea}
          value={this.state.markdown}
          onChange={this.handleChange.bind(this)}
        />
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: this.state.html }}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
