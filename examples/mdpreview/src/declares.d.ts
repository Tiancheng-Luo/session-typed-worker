declare module "remark-parse";
declare module "remark-rehype";
declare module "rehype-highlight";
declare module "rehype-stringify";
declare module "prettier/standalone";
declare module "prettier/parser-markdown";

interface Source {
  source: string;
  cursorOffset: number;
}
interface Formatted {
  formatted: string;
  cursorOffset: number;
}
