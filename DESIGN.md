---
name: "Forma"
description: "A contemporary studio specimen system for everyday business operations."
colors:
  background: "#fafafb"
  foreground: "#282832"
  card: "#ffffff"
  card-foreground: "#282832"
  popover: "#ffffff"
  popover-foreground: "#282832"
  primary: "#7560cf"
  primary-foreground: "#ffffff"
  secondary: "#f1eef8"
  secondary-foreground: "#5b4b98"
  muted: "#f2f2f6"
  muted-foreground: "#686872"
  accent: "#f0edf9"
  accent-foreground: "#6953b8"
  destructive: "#bb4654"
  border: "#e9e9ee"
  input: "#e1e1e8"
  ring: "#8c77dc"
  success: "#327059"
  success-bg: "#edf6f1"
  warning: "#856022"
  warning-bg: "#faf3e5"
  info: "#477197"
  info-bg: "#edf3fa"
  sidebar: "#ffffff"
  chart-1: "#9f8dde"
  chart-2: "#d0c6ec"
  chart-3: "#a8bcb0"
  chart-4: "#b5c8d7"
  dark-background: "#191a20"
  dark-foreground: "#eeeef3"
  dark-card: "#22232b"
  dark-popover: "#272832"
  dark-primary: "#ae99ed"
  dark-primary-foreground: "#211a36"
  dark-secondary: "#343047"
  dark-secondary-foreground: "#c6b8ed"
  dark-muted: "#2b2c36"
  dark-muted-foreground: "#acaeba"
  dark-accent: "#343047"
  dark-accent-foreground: "#c6b8ed"
  dark-destructive: "#f091a0"
  dark-border: "#353640"
  dark-input: "#44454f"
  dark-ring: "#b5a0ee"
  dark-success: "#8dceb2"
  dark-success-bg: "#253a32"
  dark-warning: "#e1bd79"
  dark-warning-bg: "#3c3425"
  dark-info: "#9ebfdf"
  dark-info-bg: "#293643"
  dark-sidebar: "#202128"
  blue-primary: "#3872aa"
  blue-accent: "#e9f1fa"
  blue-accent-foreground: "#356da5"
  blue-ring: "#689ac9"
  blue-chart-1: "#6e9dc5"
  blue-chart-2: "#b9d0e4"
  green-primary: "#417e69"
  green-accent: "#e7f2ec"
  green-accent-foreground: "#3b7460"
  green-ring: "#6a9f89"
  green-chart-1: "#7daa94"
  green-chart-2: "#b8d2c4"
  dark-blue-primary: "#9ebfe9"
  dark-blue-primary-foreground: "#1a2c42"
  dark-blue-accent: "#293950"
  dark-blue-accent-foreground: "#b4cbed"
  dark-green-primary: "#91c3a9"
  dark-green-primary-foreground: "#193128"
  dark-green-accent: "#2a3e33"
  dark-green-accent-foreground: "#add5bf"
typography:
  display:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "29px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.7px"
  headline:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.8px"
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.1px"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-compact:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.375
  label-small:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.5
  control:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
  brand:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.8px"
rounded:
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "18px"
  panel: "13px"
  navigation: "8px"
  filter: "7px"
  status: "5px"
  circle: "50%"
  brand: "10px 10px 4px 10px"
spacing:
  "3": "3px"
  "4": "4px"
  "7": "7px"
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "16": "16px"
  "17": "17px"
  "18": "18px"
  "20": "20px"
  "23": "23px"
  "24": "24px"
  "28": "28px"
  "34": "34px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, var(--primary) 80%, transparent)"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "34px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "34px"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-destructive:
    backgroundColor: "color-mix(in oklab, var(--destructive) 10%, transparent)"
    textColor: "{colors.destructive}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "0 12px"
    height: "34px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  input-editor:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "38px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.navigation}"
    padding: "8px 12px"
    height: "39px"
  nav-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.navigation}"
    padding: "8px 12px"
    height: "39px"
  status-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  status-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  status-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  status-neutral:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  status-violet:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.panel}"
  panel-header:
    typography: "{typography.title}"
    padding: "21px 23px 14px"
  metric:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.md}"
    padding: "19px 20px 17px"
  tabs-line-active:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "2px 6px"
    height: "calc(100% - 1px)"
  records-table:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    padding: "14px 18px"
    height: "65px"
---

# Design System: Forma

## Overview

**Creative North Star: "Contemporary Studio Specimen"**

Forma makes a business legible through precise hierarchy, grouped data, and editable records. The accepted world is the contemporary studio specimen (direction seed 939046f6): cool near-white, graphite type, restrained violet, and gently rounded controls. Its character is calm, exact, and approachable.

The interface is compact enough for repeated operations work while keeping page titles, performance figures, and record actions distinct. White surfaces, fine separators, and a quiet active navigation background establish order. Motion connects selection and changing figures; it remains brief and respects reduced-motion preferences.

This system describes the implemented React and TypeScript workspace with bundled DM Sans, Tailwind CSS v4, shadcn Base UI primitives, a Cult UI rolling number, and Motion navigation. The font, geometric Forma mark, palette relationships, and state hierarchy form the reusable identity.

**Key Characteristics:**

- A quiet cool canvas with white, finely bordered panels.
- DM Sans throughout, compact labels, and tabular numeric figures.
- One active accent, paired with a pale selection surface.
- Text-labelled status tags and grouped, horizontally scrollable records.
- Brief navigation continuity and reduced-motion alternatives.

## Colors

The palette combines cool paper and graphite with a restrained studio violet. The frontmatter records the current CSS values; `src/styles.css` remains the implementation source.

### Primary

- **Studio Violet** (`primary`): primary actions and the geometric mark; paired with `primary-foreground`.
- **Selected Lilac** (`accent` / `accent-foreground`): active navigation, highlighted search results, selection bars, and violet status tags.
- **Focus Violet** (`ring`): keyboard outlines and field rings.
- **Soft Violet Surface** (`secondary` / `secondary-foreground`): the available secondary button foundation. The current screens mainly use primary, outline, ghost, and destructive variants.

### Secondary

- **Forest Status** (`success` / `success-bg`): paid, delivered, active, published, and healthy records; positive trends.
- **Amber Status** (`warning` / `warning-bg`): pending, processing, in-review, and low-stock records.
- **Slate Blue Status** (`info` / `info-bg`): shipped, VIP, and returning records.
- **Rose Alert** (`destructive`): errors, destructive actions, negative trends, and removed values in history. Destructive buttons use transparent tints of this token.

### Tertiary

- **Chart Pastels** (`chart-1` through `chart-4`): violet, pale lilac, sage, and blue-grey series. Legends and accessible summaries supply meaning alongside the plotted color.
- **Optional Blue / Green** (`blue-*` / `green-*`): implemented accent alternatives. They change primary actions, selected surfaces, focus, and the first two chart series. These are alternatives to the violet accent.

### Neutral

- **Cool Paper** (`background`): the workspace canvas and table headers.
- **Graphite** (`foreground`): principal text, titles, and values.
- **White Surface** (`card`, `popover`, `sidebar`): panels, overlays, and the navigation rail.
- **Quiet Grey** (`muted` / `muted-foreground`): background grouping, secondary copy, neutral statuses, and inactive navigation.
- **Fine Divider** (`border`): panel outlines, rails, row separators, and utility-bar divisions.
- **Field Stroke** (`input`): input boundaries.

### Theme Behavior

The `.dark` class changes the semantic surface, text, status, and violet action tokens. Dark card and popover foregrounds use `dark-foreground`. Dark blue and green accents have separate action foregrounds and selection pairs. Their focus rings and chart colors retain the corresponding blue or green overrides from the light accent selector. Chart series three and four retain their base values in every theme.

The frontmatter's `dark-*`, `blue-*`, and `green-*` names describe implemented selector overrides. Components consume the unprefixed CSS variables at runtime. Theme variants are separate modes; they are not a tonal ramp.

**The The Accent Continuity Rule.** Use the selected accent for primary actions, selection, focus, and the first two chart series. Preserve semantic success, warning, and information roles when changing the accent.

## Typography

**Display Font:** DM Sans, with sans-serif fallback.
**Body Font:** DM Sans, with sans-serif fallback.
**Label Font:** DM Sans; no separate mono family is used.

The application bundles regular, medium, semibold, and bold weights locally. Rounded letterforms soften the dense operational layout; moderate weights and slightly tightened larger text provide hierarchy.

### Hierarchy

- **Display**: metric figures use the `display` role (29px, 500, line-height 1.5). Chart totals use a smaller related treatment (24px, 500, −0.5px tracking).
- **Headline**: page headings use `headline` (26px, 500, line-height 1.4), reducing to 23px at the intermediate and mobile layouts, then 21px on the narrowest layout.
- **Title**: panel headings use `title` (13px, 600). Record sheet titles are larger (20px, 500, −0.5px tracking).
- **Body**: the base is `body` (14px, 400); page explanations and fields commonly use `body-compact` (12px, 400). Longer explanations use observed line-heights of 1.7–1.9.
- **Label**: field labels use `label` (12px, 500); grouped navigation captions and small summaries use the compact label role. Table headers are quieter (10px, 400).
- **Control**: global button overrides establish compact text (11px); the unlayered `button { font: inherit; }` rule preserves the surrounding regular weight and line-height. Navigation explicitly sets its own size (12px) and active weight (600).
- **Brand**: the wordmark uses `brand` (23px, 700, line-height 1), with a small regular workspace descriptor.

**The The Measured Figures Rule.** Use tabular numerals for performance figures, totals, percentages, and aligned amounts. Preserve a readable final value when number motion is reduced.

## Layout

The desktop shell uses a sticky, viewport-height navigation rail (232px) and a flexible content column. The collapsed rail is narrower (76px). The utility bar is fixed in the layout flow (68px high); the main area has a maximum width (1700px) and generous horizontal insets (34px). These values describe current code, including the small differences from the provisional surface brief.

The overview uses four metric columns, followed by a two-column chart composition (1.9:1) and grouped record panels. Main section spacing is typically 23px, metric gaps 17px, and two-column field gaps 18px. Controls and inline rows use smaller gaps (7–12px). Custom spacings sit alongside the Tailwind utility rhythm; the project does not expose a single exhaustive spacing scale.

Responsive changes follow the implemented maximum-width queries:

- **1250px**: rail narrows to 212px; content insets become 24px, metric gaps 13px, and chart proportions tighten.
- **1050px**: rail narrows to 200px; metrics become two columns; lower overview, merchandising, and analytics groups become single-column layouts. Media uses two columns.
- **800px**: the desktop rail is replaced by a left navigation sheet (285px); the utility bar becomes shorter (61px). Main content uses 23px horizontal insets.
- **600px**: page heading actions stack; charts become single-column; main insets reduce to 17px; settings field grids become one column. Record sheets fill the viewport width. Tables retain minimum widths (510px for recent records, 640px for full record tables) and scroll within their containers.
- **360px**: main insets reduce to 12px, headline size to 21px, and media becomes one column.

Record editors open in a right sheet (up to 540px), with an independently scrolling body and a persistent action footer. Retain horizontal table scrolling and wrapping toolbars rather than truncating the operational layout's meaning.

## Elevation & Depth

Workspace panels and metrics have no ambient shadow. Fine borders, white or dark card surfaces, and pale selected states supply most depth. Dialogs use a subtle foreground ring and a lightly dimmed, softly blurred backdrop. Sheets and transient toast feedback carry the implemented shadows.

### Shadow Vocabulary

- **Sheet Lift** (`0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a`): the compiled Tailwind `shadow-lg` value used by navigation and record sheets.
- **Toast Lift** (`0 8px 25px #00000018`): compact feedback over the workspace, with a success or error icon.

**The The Flat Surfaces Rule.** Keep workspace panels and metrics flat at rest. Use fine borders and surface tone for grouping; reserve shadows for sheets and transient feedback.

## Shapes

The shadcn foundation starts from a gently curved base radius (14px): its smaller steps are 10px and 12px, and its larger step is 18px. Current workspace panels use their own slightly tighter corner (13px); metric and media cards use 12px. Navigation rows use 8px, filter groups 7px, and status tags 5px.

A thin border (1px) defines controls and containers. Avatars and tiny status dots are circular. The independently authored geometric mark uses a distinctive asymmetric corner sequence (10px 10px 4px 10px) and simple light strokes. Preserve its geometry when changing the selected accent.

## Components

### Buttons

Compact and gently rounded. Primary, outline, ghost, and destructive buttons are used in the current screens.

- **Shape and density:** the normal global treatment is 34px high with 12px horizontal padding, a 7px gap, and the foundation's large radius. Panel and pagination actions have smaller local overrides.
- **Primary:** selected primary background with its matched foreground; hover applies the source's 80% primary tint.
- **Outline:** background canvas, foreground text, and a thin divider border; hover uses muted tone. Dark mode uses a tinted input surface.
- **Ghost:** transparent at rest, muted surface on hover, and no persistent visible border.
- **Destructive:** rose text over a restrained transparent tint; dark mode increases the tint.
- **States:** enabled press moves the control down by 1px unless it opens a popup; disabled controls fade to half opacity. Focus uses the ring token, with a 2px outline offset by 3px and the primitive's 3px soft ring.

### Chips

Status tags are compact, text-labelled, and gently rectangular. A small circular dot inherits the text color. Use the existing success, warning, information, neutral, and violet mappings from the shared Status component. Tags have compact internal padding (4px 7px) and small text (9px); they convey state and are not action buttons.

### Cards / Containers

Panels combine the card surface, a 1px divider border, and the panel radius. Headers use generous insets (21px 23px 14px) with a semibold title and quiet description. Bodies and list edges align to the same 23px inset. Metrics use a related smaller card (12px radius) with measured padding (19px 20px 17px). Keep the surrounding gutters visible.

### Inputs / Fields

Fields use a transparent fill in light mode, an input-coloured border, and the foundation's large radius. The primitive starts at 32px high; record editors raise this to at least 38px, and business settings use 39px. Fields have visible labels, with optional small descriptions.

Focus changes the stroke to the ring token and adds a soft 3px ring. Invalid state uses destructive stroke and ring; disabled state is tinted and half opaque. Dark fields use a transparent input tint. Search fields pair a small inline search icon with the same field foundation; the global search palette removes the normal field boundary inside its dedicated header.

### Navigation

Grouped navigation uses small captions, consistent line icons (18px, stroke 1.7), and quiet rows (39px minimum height). Hover changes tone and text; the selected row uses the accent surface and accent foreground with semibold text. Optional small counts sit at the far edge. Preserve `aria-current="page"`, icon-only accessible names, and the skip-to-content link.

The active background uses Motion's shared-layout identity and a brief transition (180ms), with separate identities for desktop and mobile navigation. Reduced motion sets that transition to zero.

### Tables and Tabs

Record tables use quiet canvas-coloured headers (34px high), compact text, fine row separators, and generous record rows (65px). Hover adds a subtle muted tint. Sort controls, selection checkboxes, and named record links retain their existing control semantics. Right-align amounts and keep column widths stable.

Record filters use a muted segmented group with a white selected item; settings use the implemented line-tab variant, with a foreground underline on the active tab. Keep selection and focus distinct.

### Number Motion and Feedback

The Cult rolling number is wrapped by the shared Count component: mass 0.8, stiffness 160, and damping 25. Animated digits are hidden from assistive technology while a formatted final value remains available. Reduced motion renders the final formatted value directly. CSS transitions and animations shorten to 0.01ms under the reduced-motion media query; sheets otherwise transition over 200ms, dialogs over 100ms.

Charts have textual summaries, and toast feedback uses status or alert semantics. Preserve these behaviours as the system expands.

## Do's and Don'ts

### Do:

- **Do** use the semantic CSS variables so light, dark, blue, and green selections stay coherent.
- **Do** use bundled DM Sans and the observed 400, 500, 600, and 700 weights.
- **Do** keep compact controls, clear field labels, visible keyboard focus, and text-labelled statuses.
- **Do** preserve grouped records, tabular numeric alignment, and horizontal overflow on narrow tables.
- **Do** give animated numbers and charts an accessible text equivalent and honor reduced motion.

### Don't:

- **Don't** substitute the old lighter muted text, success, warning, information, or blue action colors for the current CSS values.
- **Don't** use chart pastels as small body text or status text.
- **Don't** turn ordinary panels into floating surfaces with ambient shadows.
- **Don't** remove labels from status tags or accessible names from icon-only controls.
- **Don't** compress record columns until their content becomes illegible on mobile.
