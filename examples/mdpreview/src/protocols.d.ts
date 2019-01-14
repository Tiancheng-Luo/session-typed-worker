import { C2W, W2C, Fin } from "session-typed-worker";

type Md2Html = C2W<string, W2C<string, Fin>>;
type Format = C2W<Source, W2C<Formatted, Fin>>;
type labels = "md2html" | "format";
type protocols = Md2Html | Format;
type RPC = C2W<labels, protocols>;

export { RPC, Md2Html, Format };
