/// <reference types="vite/client" />
/** Injected by ViteJS define plugin */
declare const APP_VERSION: string;

/** Import a plain text file as a raw string */
declare module "*.txt?raw" {
  const content: string;
  export default content;
}
