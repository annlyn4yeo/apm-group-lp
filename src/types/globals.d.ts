// Ambient module declaration for side-effect CSS imports (e.g.
// `import "@/styles/globals.css"` in layout.tsx). Next's webpack/Turbopack
// pipeline strips these at build time, but the TypeScript language service
// still needs a type for the import statement itself, especially when the
// specifier goes through a `paths` alias rather than a relative path.
declare module "*.css";
