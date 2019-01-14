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
  private p: proto.Md2Html["client"] = new Worker("./worker.ts") as any;
  private textarea: React.RefObject<HTMLTextAreaElement>;

  constructor(props: never) {
    super(props);
    this.state = { html: "", markdown: "" };
    this.textarea = React.createRef();
  }

  async handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const markdown = e.target.value;
    const cursor = e.target.selectionStart;
    const p1 = send(this.p, markdown);
    const [html] = await recv(p1);
    this.setState({ markdown, html }, () => {
      if (this.textarea.current != null)
        this.textarea.current.selectionEnd = cursor;
    });
  }

  render() {
    return (
      <div className="container">
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
