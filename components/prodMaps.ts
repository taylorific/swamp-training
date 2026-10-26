// swamp-club production maps for <ProdMap>, redrawn from John Watson's
// production map at https://world.swamp-club.com/diagram.html (snapshot
// 2026-09-14) and his TypeSafe alert triage post. Simplified for a slide:
// each map is hand-placed on a 1000-wide grid so wires don't cross. Edit the
// groups / nodes / links tables to change a map.

export type Kind = 'req' | 'data' | 'signal' | 'alert' | 'notify' | 'quiet' | 'up' | 'deploy'

export interface MapGroup {
  x: number, y: number, w: number, h: number
  color: string
  label: string
  sub?: string
  dash?: boolean
  inner?: boolean
}

export interface MapNode {
  id: string
  x: number, y: number, w: number, h: number
  color: string
  title: string
  sub?: string[]
  ghost?: boolean
}

export interface MapLink {
  from: string
  to: string
  kind: Kind
  d: string
  label?: string
  lx?: number
  ly?: number
}

export interface ProdMapSpec {
  height: number
  columns: [string, number][]
  groups: MapGroup[]
  nodes: MapNode[]
  links: MapLink[]
  notes?: { x: number, y: number, lines: string[] }[]
  legend: [Kind, string][]
}

export const C = {
  green: '#4ade80',
  cyan: '#22d3ee',
  orange: '#fb923c',
  violet: '#c084fc',
  amber: '#fbbf24',
  grey: '#9ca3af',
  client: '#e5e7eb',
}

export const KIND: Record<Kind, string> = {
  req: C.green,
  data: C.cyan,
  signal: C.cyan,
  alert: C.amber,
  notify: C.green,
  quiet: C.grey,
  up: C.violet,
  deploy: C.orange,
}

// An S-curve between two points, leaving and arriving horizontally.
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
}

// A right-angled route through the given points, with rounded corners.
const route = (pts: [number, number][], r = 10) => {
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1]
    const [x, y] = pts[i]
    const [nx, ny] = pts[i + 1]
    const inX = Math.sign(x - px), inY = Math.sign(y - py)
    const outX = Math.sign(nx - x), outY = Math.sign(ny - y)
    d += ` L${x - inX * r},${y - inY * r} Q${x},${y} ${x + outX * r},${y + outY * r}`
  }
  const [lx, ly] = pts[pts.length - 1]
  return `${d} L${lx},${ly}`
}

// ------------------------------------------------------------------ architecture
export const ARCHITECTURE: ProdMapSpec = {
  height: 478,
  columns: [['INBOUND', 10], ['EDGE', 190], ['COMPUTE', 390], ['DATA', 750]],
  groups: [
    { x: 10, y: 30, w: 150, h: 430, color: C.grey, label: '// CLIENTS', sub: 'outside world', dash: true },
    { x: 190, y: 30, w: 170, h: 250, color: C.orange, label: '// CLOUDFLARE', sub: 'dns · proxy · workers', dash: true },
    { x: 390, y: 30, w: 330, h: 250, color: C.cyan, label: '// DIGITALOCEAN · SFO3', sub: 'customer-facing compute' },
    { x: 404, y: 72, w: 302, h: 196, color: C.cyan, label: 'DOKS / SWAMP-CLUB-PROD', inner: true },
    { x: 390, y: 300, w: 330, h: 160, color: C.green, label: '// GOOGLE CLOUD · US-WEST1', sub: 'internal ops platform' },
    { x: 404, y: 340, w: 302, h: 110, color: C.green, label: 'GKE / PLATFORM', inner: true },
    { x: 750, y: 30, w: 240, h: 130, color: C.violet, label: '// SAAS', sub: 'managed services' },
    { x: 750, y: 175, w: 240, h: 165, color: C.cyan, label: '// DO SFO3 · VPC', sub: 'droplets + object storage' },
    { x: 750, y: 360, w: 240, h: 100, color: C.green, label: '// CHAT', sub: 'where people see it' },
  ],
  notes: [
    { x: 205, y: 74, lines: ['dns · 4 zones', '*.swamp.club → 301'] },
  ],
  nodes: [
    { id: 'browser', x: 25, y: 80, w: 120, h: 50, color: C.client, title: 'BROWSER', sub: ['customers, admins'] },
    { id: 'cli', x: 25, y: 160, w: 120, h: 70, color: C.client, title: 'SWAMP CLI', sub: ['user machines', 'telemetry +', 'downloads'] },
    { id: 'eng', x: 25, y: 372, w: 120, h: 50, color: C.client, title: 'ENGINEERS', sub: ['+ alert webhooks'] },

    { id: 'cfedge', x: 205, y: 188, w: 140, h: 44, color: C.orange, title: 'CLOUDFLARE EDGE', sub: ['artifacts.swamp-club.com'] },
    { id: 'worker', x: 205, y: 242, w: 140, h: 34, color: C.orange, title: 'WORKER', sub: ['artifacts-edge'] },

    { id: 'ingress', x: 418, y: 88, w: 82, h: 164, color: C.cyan, title: 'INGRESS', sub: ['do lb', 'traefik', 'tls'] },
    { id: 'api', x: 528, y: 90, w: 164, h: 48, color: C.cyan, title: 'SWAMP-CLUB-API', sub: ['web app + api'] },
    { id: 'tele', x: 528, y: 160, w: 164, h: 48, color: C.cyan, title: 'TELEMETRY-API', sub: ['cli events'] },
    { id: 'corp', x: 528, y: 220, w: 164, h: 36, color: C.grey, title: 'CORP APPS · GRAFANA', sub: ['no public ingress'], ghost: true },

    { id: 'glb', x: 418, y: 356, w: 82, h: 82, color: C.green, title: 'INGRESS', sub: ['gcp lb', 'traefik'] },
    { id: 'serve', x: 528, y: 354, w: 164, h: 40, color: C.green, title: 'SWAMP SERVE', sub: ['ops.swamp-club.com'] },
    { id: 'workers', x: 528, y: 404, w: 164, h: 38, color: C.green, title: 'WORKERS ×5', sub: ['run workflows'] },

    { id: 'atlas', x: 765, y: 68, w: 210, h: 38, color: C.violet, title: 'MONGODB ATLAS', sub: ['operational data'] },
    { id: 'axiom', x: 765, y: 112, w: 210, h: 38, color: C.violet, title: 'AXIOM', sub: ['otel traces + logs'] },
    { id: 'clickhouse', x: 765, y: 212, w: 210, h: 36, color: C.cyan, title: 'CLICKHOUSE', sub: ['analytics + scoring'] },
    { id: 'prom', x: 765, y: 254, w: 210, h: 32, color: C.cyan, title: 'PROMETHEUS', sub: ['metrics'] },
    { id: 'spaces', x: 765, y: 292, w: 210, h: 40, color: C.cyan, title: 'SPACES', sub: ['event lake · giga-swamp datastore'] },
    { id: 'discord', x: 765, y: 400, w: 210, h: 44, color: C.green, title: 'DISCORD #OPS', sub: ['triaged alerts'] },
  ],
  links: [
    { from: 'browser', to: 'ingress', kind: 'req', d: curve(145, 112, 416, 112), label: 'https · swamp-club.com', lx: 152, ly: 104 },
    { from: 'cli', to: 'ingress', kind: 'req', d: curve(145, 172, 416, 172), label: 'telemetry', lx: 152, ly: 166 },
    { from: 'cli', to: 'cfedge', kind: 'req', d: curve(145, 214, 203, 210) },
    { from: 'cfedge', to: 'worker', kind: 'req', d: 'M275,232 V240' },
    { from: 'worker', to: 'spaces', kind: 'data', d: route([[345, 259], [372, 259], [372, 290], [736, 290], [736, 306], [763, 306]]), label: 'cli binaries', lx: 600, ly: 286 },
    { from: 'ingress', to: 'api', kind: 'req', d: curve(500, 114, 526, 114) },
    { from: 'ingress', to: 'tele', kind: 'req', d: curve(500, 184, 526, 184) },
    { from: 'api', to: 'atlas', kind: 'data', d: curve(692, 108, 763, 87) },
    { from: 'api', to: 'clickhouse', kind: 'data', d: curve(692, 124, 763, 226) },
    { from: 'tele', to: 'clickhouse', kind: 'data', d: curve(692, 190, 763, 236) },
    { from: 'eng', to: 'glb', kind: 'req', d: curve(145, 397, 416, 397), label: 'ops.swamp-club.com · /hooks', lx: 152, ly: 389 },
    { from: 'glb', to: 'serve', kind: 'req', d: curve(500, 374, 526, 374) },
    { from: 'serve', to: 'workers', kind: 'req', d: 'M610,394 V402' },
    { from: 'serve', to: 'spaces', kind: 'data', d: route([[692, 368], [740, 368], [740, 322], [763, 322]]) },
    { from: 'workers', to: 'discord', kind: 'notify', d: curve(692, 423, 763, 423) },
  ],
  legend: [['req', 'request'], ['data', 'data read / write'], ['notify', 'notify']],
}

// ------------------------------------------------------------------ observability
export const OBSERVABILITY: ProdMapSpec = {
  height: 430,
  columns: [['SOURCES', 10], ['COLLECT', 200], ['RECEIVE', 395], ['TRIAGE', 600], ['OUTCOME', 805]],
  groups: [
    { x: 10, y: 30, w: 165, h: 290, color: C.grey, label: '// WORKLOADS', sub: 'emit traces, logs, metrics', dash: true },
    { x: 200, y: 30, w: 170, h: 120, color: C.violet, label: '// AXIOM', sub: 'otel + log aggregation' },
    { x: 200, y: 170, w: 170, h: 220, color: C.cyan, label: '// METRICS', sub: 'do vpc + corp apps' },
    { x: 395, y: 170, w: 385, h: 220, color: C.green, label: '// SWAMP SERVE', sub: 'ops.swamp-club.com' },
    { x: 805, y: 30, w: 185, h: 360, color: C.violet, label: '// AI + PEOPLE', sub: 'only what needs them', dash: true },
  ],
  nodes: [
    { id: 'apps', x: 25, y: 76, w: 135, h: 50, color: C.cyan, title: 'APPS', sub: ['swamp-club-api', 'telemetry-api'] },
    { id: 'servesrc', x: 25, y: 150, w: 135, h: 44, color: C.green, title: 'SWAMP SERVE', sub: ['ops platform'] },
    { id: 'pagent', x: 25, y: 230, w: 135, h: 44, color: C.cyan, title: 'PROMETHEUS', sub: ['agent, in-cluster'] },

    { id: 'axiom', x: 215, y: 76, w: 140, h: 50, color: C.violet, title: 'AXIOM', sub: ['swamp_club_prod', 'monitors'] },
    { id: 'prom', x: 215, y: 216, w: 140, h: 44, color: C.cyan, title: 'PROMETHEUS', sub: ['droplet in vpc'] },
    { id: 'grafana', x: 215, y: 300, w: 140, h: 50, color: C.cyan, title: 'GRAFANA', sub: ['dashboards', 'alert rules'] },

    { id: 'relay', x: 410, y: 76, w: 165, h: 44, color: C.amber, title: 'WEBHOOK RELAY', sub: ['axiom-webhook-relay'] },
    { id: 'hookA', x: 410, y: 216, w: 165, h: 40, color: C.green, title: '/hooks/axiom-alerts' },
    { id: 'hookG', x: 410, y: 305, w: 165, h: 40, color: C.green, title: '/hooks/grafana-alerts' },
    { id: 'ingest', x: 605, y: 214, w: 160, h: 134, color: C.green, title: 'OPS-SIGNAL-INGEST', sub: ['swamp workflow', '', '1 dedupe', '2 screen', '3 triage', '4 record + route'] },

    { id: 'typesafe', x: 820, y: 76, w: 155, h: 50, color: C.violet, title: 'TYPESAFE AI', sub: ['first-pass screen', 'p(actionable)'] },
    { id: 'claude', x: 820, y: 160, w: 155, h: 50, color: C.violet, title: 'CLAUDE', sub: ['full triage,', 'escalated only'] },
    { id: 'discord', x: 820, y: 244, w: 155, h: 44, color: C.green, title: 'DISCORD #OPS', sub: ['incident posted'] },
    { id: 'dismiss', x: 820, y: 318, w: 155, h: 50, color: C.grey, title: 'DISMISSAL', sub: ['score, threshold,', 'reason recorded'], ghost: true },
  ],
  links: [
    { from: 'apps', to: 'axiom', kind: 'signal', d: curve(160, 101, 213, 101), label: 'otlp', lx: 172, ly: 93 },
    { from: 'servesrc', to: 'axiom', kind: 'signal', d: curve(160, 172, 213, 116) },
    { from: 'pagent', to: 'prom', kind: 'signal', d: curve(160, 252, 213, 238), label: 'remote write', lx: 164, ly: 266 },
    { from: 'prom', to: 'grafana', kind: 'data', d: 'M285,260 V298', label: 'queries', lx: 291, ly: 283 },
    { from: 'axiom', to: 'relay', kind: 'alert', d: curve(355, 98, 408, 98) },
    { from: 'relay', to: 'hookA', kind: 'alert', d: 'M555,120 V214' },
    { from: 'grafana', to: 'hookG', kind: 'alert', d: curve(355, 325, 408, 325) },
    { from: 'hookA', to: 'ingest', kind: 'alert', d: curve(575, 236, 603, 250) },
    { from: 'hookG', to: 'ingest', kind: 'alert', d: curve(575, 325, 603, 310) },
    { from: 'ingest', to: 'typesafe', kind: 'signal', d: route([[660, 214], [660, 101], [818, 101]]), label: 'last 20 signals + alert', lx: 668, ly: 95 },
    { from: 'ingest', to: 'claude', kind: 'alert', d: route([[715, 214], [715, 185], [818, 185]]), label: 'actionable', lx: 723, ly: 179 },
    { from: 'ingest', to: 'discord', kind: 'notify', d: curve(765, 266, 818, 266) },
    { from: 'ingest', to: 'dismiss', kind: 'quiet', d: curve(765, 330, 818, 343) },
  ],
  legend: [['signal', 'telemetry / screen'], ['alert', 'alert path'], ['notify', 'people'], ['quiet', 'no one paged']],
}

// ------------------------------------------------------------------ yours vs. theirs
// What runs on your machines, what runs at swamp-club.com, and exactly what
// crosses between them (the same list as the "Can the swamp team see your
// data?" slide).
export const LOCAL_VS_CLOUD: ProdMapSpec = {
  height: 470,
  columns: [],
  groups: [
    { x: 10, y: 30, w: 470, h: 410, color: C.green, label: '// YOUR MACHINES', sub: 'you run all of this' },
    { x: 20, y: 64, w: 190, h: 300, color: C.green, label: 'LAPTOP', inner: true },
    { x: 220, y: 64, w: 150, h: 300, color: C.green, label: 'SERVER · OPTIONAL', inner: true },
    { x: 600, y: 30, w: 220, h: 410, color: C.cyan, label: '// SWAMP-CLUB.COM', sub: 'the swamp team runs this' },
    { x: 840, y: 30, w: 150, h: 140, color: C.violet, label: '// THIRD PARTY', sub: 'your choice', dash: true },
  ],
  nodes: [
    { id: 'agent', x: 30, y: 90, w: 170, h: 44, color: C.client, title: 'YOUR AGENT', sub: ['claude code, codex…'] },
    { id: 'repo', x: 30, y: 146, w: 170, h: 44, color: C.green, title: 'YOUR REPO', sub: ['behaviors · workflows'] },
    { id: 'store', x: 30, y: 202, w: 170, h: 44, color: C.green, title: 'DATASTORE', sub: ['.swamp/ data · runs'] },
    { id: 'vault', x: 30, y: 258, w: 170, h: 44, color: C.green, title: 'VAULTS', sub: ['secrets, or 1password'] },
    { id: 'serve', x: 230, y: 90, w: 130, h: 44, color: C.green, title: 'SWAMP SERVE', sub: ['schedules, hooks'] },
    { id: 'workers', x: 230, y: 146, w: 130, h: 44, color: C.green, title: 'WORKERS', sub: ['run workflows'] },
    { id: 'shared', x: 230, y: 202, w: 130, h: 44, color: C.green, title: 'SHARED STORE', sub: ['your s3 bucket'] },
    { id: 'systems', x: 230, y: 258, w: 130, h: 44, color: C.green, title: 'YOUR SYSTEMS', sub: ['what behaviors call'] },
    { id: 'cli', x: 385, y: 64, w: 85, h: 300, color: C.green, title: 'SWAMP CLI', sub: ['every', 'command,', 'laptop or', 'server'] },
    { id: 'never', x: 20, y: 378, w: 450, h: 50, color: C.grey, title: 'NEVER LEAVES YOUR MACHINES', sub: ['definitions · data · run history · secrets · files · flag values'], ghost: true },

    { id: 'install', x: 615, y: 80, w: 190, h: 44, color: C.cyan, title: 'INSTALLER + BINARIES', sub: ['install.sh · artifacts'] },
    { id: 'account', x: 615, y: 150, w: 190, h: 44, color: C.cyan, title: 'ACCOUNT + LICENSE', sub: ['who you are, your plan'] },
    { id: 'registry', x: 615, y: 220, w: 190, h: 50, color: C.cyan, title: 'EXTENSION REGISTRY', sub: ['shared behavior types'] },
    { id: 'telemetry', x: 615, y: 295, w: 190, h: 44, color: C.cyan, title: 'TELEMETRY', sub: ['usage events'] },
    { id: 'docs', x: 615, y: 370, w: 190, h: 44, color: C.grey, title: 'MANUAL · DISCORD', sub: ['read in a browser'], ghost: true },

    { id: 'provider', x: 850, y: 90, w: 130, h: 50, color: C.violet, title: 'MODEL PROVIDER', sub: ['your agent’s, not', 'swamp’s'] },
  ],
  links: [
    { from: 'cli', to: 'install', kind: 'req', d: curve(470, 102, 613, 102), label: 'install.sh', lx: 478, ly: 96 },
    { from: 'cli', to: 'account', kind: 'req', d: curve(470, 172, 613, 172), label: 'swamp auth login', lx: 478, ly: 166 },
    { from: 'cli', to: 'registry', kind: 'req', d: curve(470, 236, 613, 236), label: 'search · pull', lx: 478, ly: 230 },
    { from: 'cli', to: 'registry', kind: 'up', d: curve(470, 256, 613, 256), label: 'extension push', lx: 478, ly: 270 },
    { from: 'cli', to: 'telemetry', kind: 'signal', d: curve(470, 317, 613, 317), label: 'usage · opt out', lx: 478, ly: 311 },
    { from: 'agent', to: 'provider', kind: 'quiet', d: route([[190, 90], [190, 22], [960, 22], [960, 88]]), label: 'what your agent reads goes to its own provider', lx: 500, ly: 17 },
  ],
  legend: [['req', 'you download / sign in'], ['up', 'you publish'], ['signal', 'usage data'], ['quiet', 'your agent’s traffic']],
}

// ------------------------------------------------------------------ two owners
// The swamp team is a swamp user too: giga-swamp is their repo, and it also
// deploys and operates swamp-club.com.
export const TWO_OWNERS: ProdMapSpec = {
  height: 372,
  columns: [['YOU', 10], ['THE PRODUCT', 360], ['THE SWAMP TEAM, AS A USER', 710]],
  groups: [
    { x: 10, y: 30, w: 280, h: 300, color: C.green, label: '// YOUR SWAMP', sub: 'your repo, your machines' },
    { x: 360, y: 30, w: 280, h: 300, color: C.cyan, label: '// SWAMP-CLUB.COM', sub: 'what every swamp talks to' },
    { x: 710, y: 30, w: 280, h: 300, color: C.green, label: '// GIGA-SWAMP', sub: 'their repo, their machines' },
  ],
  nodes: [
    { id: 'uLaptop', x: 25, y: 80, w: 250, h: 44, color: C.client, title: 'YOUR LAPTOP', sub: ['swamp cli + your agent'] },
    { id: 'uServe', x: 25, y: 140, w: 250, h: 44, color: C.green, title: 'YOUR SWAMP SERVE', sub: ['optional, on your hardware'] },
    { id: 'uStore', x: 25, y: 200, w: 250, h: 44, color: C.green, title: 'YOUR DATASTORE', sub: ['.swamp/ or your bucket'] },
    { id: 'uRepo', x: 25, y: 260, w: 250, h: 44, color: C.green, title: 'YOUR REPO', sub: ['your behaviors + workflows'] },

    { id: 'registry', x: 375, y: 80, w: 250, h: 44, color: C.cyan, title: 'EXTENSION REGISTRY', sub: ['@swamp/*, @you/*, …'] },
    { id: 'account', x: 375, y: 140, w: 250, h: 44, color: C.cyan, title: 'ACCOUNTS + LICENSES', sub: ['swamp-club-api'] },
    { id: 'telemetry', x: 375, y: 200, w: 250, h: 44, color: C.cyan, title: 'TELEMETRY', sub: ['telemetry-api → clickhouse'] },
    { id: 'binaries', x: 375, y: 260, w: 250, h: 44, color: C.cyan, title: 'SWAMP BINARIES', sub: ['artifacts.swamp-club.com'] },

    { id: 'tLaptop', x: 725, y: 80, w: 250, h: 44, color: C.client, title: 'ENGINEERS’ LAPTOPS', sub: ['swamp cli + agents'] },
    { id: 'tServe', x: 725, y: 140, w: 250, h: 44, color: C.green, title: 'THEIR SWAMP SERVE', sub: ['ops.swamp-club.com, on gke'] },
    { id: 'tStore', x: 725, y: 200, w: 250, h: 44, color: C.green, title: 'THEIR DATASTORE', sub: ['a spaces bucket'] },
    { id: 'tRepo', x: 725, y: 260, w: 250, h: 44, color: C.green, title: 'GIGA-SWAMP REPO', sub: ['private · infra as swamp'] },
  ],
  links: [
    { from: 'uLaptop', to: 'registry', kind: 'req', d: curve(275, 102, 373, 102), label: 'pull', lx: 282, ly: 96 },
    { from: 'uLaptop', to: 'account', kind: 'req', d: curve(275, 114, 373, 162), label: 'login', lx: 282, ly: 140 },
    { from: 'uServe', to: 'telemetry', kind: 'signal', d: curve(275, 172, 373, 222), label: 'usage', lx: 282, ly: 200 },
    { from: 'tLaptop', to: 'registry', kind: 'up', d: curve(723, 102, 627, 102), label: 'push @swamp/*', lx: 640, ly: 96 },
    { from: 'tServe', to: 'account', kind: 'deploy', d: curve(723, 162, 627, 162), label: 'ops · alerts', lx: 640, ly: 156 },
    { from: 'tRepo', to: 'binaries', kind: 'deploy', d: curve(723, 282, 627, 282), label: 'defines + deploys', lx: 632, ly: 276 },
  ],
  legend: [['req', 'any user'], ['signal', 'usage data'], ['up', 'publishes'], ['deploy', 'deploys + runs']],
}

export const MAPS: Record<string, ProdMapSpec> = {
  architecture: ARCHITECTURE,
  observability: OBSERVABILITY,
  'local-vs-cloud': LOCAL_VS_CLOUD,
  'two-owners': TWO_OWNERS,
}
