import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "./styles.css";
import { App } from "./App";
import { WorkspaceProvider } from "./lib/workspace";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="startup"><h1>The workspace could not open.</h1><p>Reload to reconnect to the local demo server.</p><button onClick={() => location.reload()}>Reload workspace</button></main>;
    return this.props.children;
  }
}
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><ErrorBoundary><WorkspaceProvider><App /></WorkspaceProvider></ErrorBoundary></React.StrictMode>);
