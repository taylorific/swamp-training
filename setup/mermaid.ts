import { defineMermaidSetup } from '@slidev/types'

// Slidev renders each Mermaid diagram inside a shadow DOM, so style.css can't
// style it directly. themeCSS is embedded in every diagram instead. CSS custom
// properties do inherit into the shadow DOM, so style.css sets
// --mermaid-node-stroke per color scheme and the diagram reads it here.
// The dark theme's drop shadow is removed: its offset glow made the bottom and
// right edges heavy and the top and left edges hard to see.
export default defineMermaidSetup(() => ({
  themeCSS: `
    .node rect, .node polygon, .node circle, .node ellipse, .node path {
      stroke: var(--mermaid-node-stroke, #5d8392) !important;
      stroke-width: 2px !important;
      filter: none !important;
    }
  `,
}))
