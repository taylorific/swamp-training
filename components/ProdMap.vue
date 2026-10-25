<!--
  A swamp-club production map, in the style of John Watson's diagrams at
  https://world.swamp-club.com/diagram.html. The maps themselves are data in
  ./prodMaps.ts. Hover a box to trace its connections.

  Usage: <ProdMap map="architecture" />, where map is one of the keys of
  MAPS. highlight lists node ids to keep lit while nothing is hovered:
  <ProdMap map="architecture" :highlight="['cli', 'tele']" />
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { KIND, MAPS } from './prodMaps'

const props = defineProps<{ map: string, highlight?: string[] }>()
const spec = computed(() => MAPS[props.map])
const hot = ref<string | null>(null)

const lit = (l: { from: string, to: string }) => {
  if (hot.value !== null) return l.from === hot.value || l.to === hot.value
  return !props.highlight ||
    (props.highlight.includes(l.from) && props.highlight.includes(l.to))
}
const near = (id: string) => {
  if (hot.value === null) return !props.highlight || props.highlight.includes(id)
  return id === hot.value ||
    spec.value.links.some((l) => lit(l) && (l.from === id || l.to === id))
}
</script>

<template>
  <div class="prod-map">
    <svg :viewBox="`0 0 1000 ${spec.height}`" role="img" :aria-label="`swamp-club ${map} map`">
      <defs>
        <!-- userSpaceOnUse: a straight line's bounding box has no height, so a
             percentage filter region would make horizontal links vanish. -->
        <filter :id="`glow-${map}`" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" :height="spec.height">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <text v-for="[label, x] in spec.columns" :key="label" :x="x" y="14" class="col">{{ label }}</text>

      <g v-for="g in spec.groups" :key="g.label">
        <rect :x="g.x" :y="g.y" :width="g.w" :height="g.h" rx="6"
          :fill="g.inner ? 'rgba(255,255,255,0.015)' : 'none'" :stroke="g.color"
          :stroke-opacity="g.inner ? 0.35 : 0.55" :stroke-dasharray="g.dash ? '4 4' : undefined" />
        <text :x="g.x + 10" :y="g.y + (g.inner ? 16 : 18)" :fill="g.color" class="glabel">{{ g.label }}</text>
        <text v-if="g.sub" :x="g.x + 10" :y="g.y + 31" class="gsub">{{ g.sub }}</text>
      </g>

      <g v-for="n in spec.notes ?? []" :key="n.lines[0]">
        <text v-for="(line, i) in n.lines" :key="line" :x="n.x" :y="n.y + i * 13" class="note">{{ line }}</text>
      </g>

      <g v-for="l in spec.links" :key="l.from + l.to" :class="{ dim: !lit(l) }" class="link">
        <path :d="l.d" fill="none" :stroke="KIND[l.kind]" stroke-width="1.6"
          :stroke-dasharray="l.kind === 'quiet' ? '3 4' : undefined"
          :filter="(hot || highlight) && lit(l) ? `url(#glow-${map})` : undefined" />
        <text v-if="l.label" :x="l.lx" :y="l.ly" :fill="KIND[l.kind]" class="llabel">{{ l.label }}</text>
      </g>

      <g v-for="n in spec.nodes" :key="n.id" class="node" :class="{ dim: !near(n.id) }"
        @mouseenter="hot = n.id" @mouseleave="hot = null">
        <rect :x="n.x" :y="n.y" :width="n.w" :height="n.h" rx="5" fill="#101014"
          :stroke="n.color" :stroke-opacity="n.ghost ? 0.5 : 1" stroke-width="1.4"
          :stroke-dasharray="n.ghost ? '4 3' : undefined" />
        <text :x="n.x + n.w / 2" :y="n.y + (n.sub?.length ? 16 : n.h / 2 + 4)" class="title"
          :fill="n.ghost ? '#a1a1aa' : '#ededee'">{{ n.title }}</text>
        <text v-for="(s, i) in n.sub ?? []" :key="i" :x="n.x + n.w / 2" :y="n.y + 29 + i * 12" class="sub">{{ s }}</text>
      </g>

      <g v-for="([kind, label], i) in spec.legend" :key="kind">
        <line :x1="10 + i * 170" :x2="34 + i * 170" :y1="spec.height - 8" :y2="spec.height - 8"
          :stroke="KIND[kind]" stroke-width="2" :stroke-dasharray="kind === 'quiet' ? '3 4' : undefined" />
        <text :x="40 + i * 170" :y="spec.height - 4" class="legend">{{ label }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Always dark, like the original map, in both slide color schemes. */
.prod-map {
  background: #0a0a0c;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 10px 12px 6px;
}
svg {
  display: block;
  width: 100%;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}
.col { fill: #52525b; font-size: 10px; letter-spacing: 1.5px; }
.glabel { font-size: 10.5px; font-weight: 600; letter-spacing: 1px; }
.gsub { fill: #71717a; font-size: 9.5px; }
.note { fill: #a1a1aa; font-size: 9.5px; }
.title { font-size: 10.5px; font-weight: 600; letter-spacing: 0.6px; text-anchor: middle; }
.sub { fill: #a1a1aa; font-size: 9.5px; text-anchor: middle; }
.llabel { font-size: 9px; }
.legend { fill: #a1a1aa; font-size: 9.5px; }
.node { cursor: pointer; }
.node, .link { transition: opacity 0.15s; }
.dim { opacity: 0.18; }
</style>
