import { defineMermaidSetup } from '@slidev/types'

// Slidev renders each Mermaid diagram inside a shadow DOM, so style.css can't
// reach it. themeCSS is embedded in every diagram instead. In dark mode the
// default node border nearly vanishes against the slide, so draw node boxes with
// a 2px blue-gray border that holds at least 3.5:1 contrast on both color schemes.
export default defineMermaidSetup(() => ({
  themeCSS: `
    .node rect, .node polygon, .node circle, .node ellipse, .node path {
      stroke: #5d8392 !important;
      stroke-width: 2px !important;
    }
  `,
}))
