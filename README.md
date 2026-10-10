The app is deployed with Vercel and available at https://file-tree-explorer-three.vercel.app/.

# File Tree Explorer

A module for an internal developer tool. Paste or upload a JSON document describing a directory structure, then browse it as a tree, inspect files and folders, and search nodes by name.

Built with React 19, TypeScript (`strict`), React Router v6 and Vite.

## Quick start

Requires **Node 18+**.

```bash
npm install && npm run dev
```

Then open the URL printed by Vite and click **Load sample**, or paste/upload your own JSON.

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run the unit tests once (Vitest) |

### Input format

```json
{
  "name": "root",
  "type": "folder",
  "children": [
    { "name": "src", "type": "folder", "children": [
      { "name": "index.ts", "type": "file", "size": 1024 }
    ] },
    { "name": "package.json", "type": "file", "size": 300 }
  ]
}
```

- The root must be a folder.
- `type` is `"folder"` or `"file"`.
- `name` is a non-empty string without `/`.
- Files need a finite `size >= 0` (bytes).
- Folders need a `children` array, which may be empty.
- Siblings must have unique names.

Errors point at the offending node, e.g. `root.children[2].size must be a non-negative number`.

## Routes

| Path | Behavior |
|---|---|
| `/` | Home: textarea, file upload (`.json`) and "Load sample". Validation errors are shown under the field. On success the tree is stored and the app redirects to `/tree`. If a tree is already loaded, a banner offers "Open it" / "Clear". |
| `/tree` | Tree layout with the root folder selected in the details panel. |
| `/tree/:nodePath` | Same layout; the details panel shows the selected node. An unknown or malformed path shows a "Node not found" panel while the tree stays usable. |
| `*` | 404 page. |

`/tree` without a loaded tree redirects to `/`. Search lives in the `?q=` query parameter on the tree routes.

## Architecture decisions

**Pure domain layer, separate from React.** `src/domain/` (validation, index building, paths, size formatting, search) has no React imports and is covered by Vitest unit tests. Components only render data the domain layer has already computed.

**Context plus a precomputed index instead of repeated recursion.** State is held in a single React Context (`TreeProvider`), with no external state library. When a tree is loaded it is indexed once into a `Map<path, NodeInfo>` and a flat `NodeInfo[]` array. Each `NodeInfo` carries the display path, parent path, depth, child count, sorted child paths and the subtree size. Lookups by URL, folder totals and search therefore need no traversal at render time. Search is a linear scan over the flat array.

**The URL is the source of truth.** The selected node comes from `:nodePath` and the search query from `?q=`. This gives deep links, working Back/Forward and refresh resilience without extra state. Only the expansion state and the loaded tree live outside the URL. The search box is debounced (200 ms) and writes `?q=` with `replace`, so typing does not pollute history. Links to nodes keep the current `?q=`, so clicking a search result shows its details while the results list stays visible.

**The tree is persisted as raw JSON in `localStorage`.** Search results and node details are derived from the tree, so `?q=` or `:nodePath` alone would not survive F5. The raw string is stored under `file-tree-explorer_tree`, then re-validated and re-indexed on startup. Corrupt or outdated data is discarded silently. If storage is full or unavailable, the app keeps working in memory and warns that the tree will not survive a refresh.

**`nodePath` contract.** A node's path is the list of names from the root's children down to the node, joined with `/` (e.g. `src/components/Button.tsx`). The root's own name is excluded. In the URL the path is a single segment encoded with `encodeURIComponent`, so `/` becomes `%2F` and the literal `:nodePath` route param is honored. The root has no segment and is simply `/tree`. The *displayed* path (details view, search results) does include the root name: `root/src/components/Button.tsx`. The selected path is decoded from `location.pathname` inside a `try/catch` rather than taken from React Router's already-decoded params, so names containing `%`, `#`, `?`, spaces or unicode round-trip correctly. A malformed encoding is treated as "node not found".

**Nested route layout.** `/tree` and `/tree/:nodePath` share `TreeLayout`: the tree on the left and an `<Outlet />` with the details on the right. Selecting a node therefore does not remount the tree or lose its expansion state. Opening a deep link auto-expands every ancestor of the target and highlights it. "Expand all" and "Collapse all" act on the in-memory expansion set.

**Iterative, stack-based algorithms.** Validation and index building use an explicit stack instead of recursion, so arbitrarily deep trees do not overflow the call stack.

**Strict hand-written validation.** No schema library is used. The validator never throws. It returns the first error, located by a path like `root.children[2].children[0].name`. Duplicate sibling names and `/` in names are rejected so that a path always identifies exactly one node.

**Deterministic ordering.** The tree view and folder contents list folders first, then files. Each group is alphabetical, using `localeCompare` with `numeric: true` so that `file2` sorts before `file10`. The JSON input order is intentionally not preserved.

**Rendering cost bounded by what is visible.** Only expanded folders render their children, so collapsed subtrees cost nothing. Search renders at most 500 rows with a "showing first 500 of N" message.

**Small dependency footprint.** Runtime dependencies are only React, React DOM and React Router. Styling uses CSS Modules (zero config in Vite). There is no UI kit, no state library and no validation library.

**Size formatting.** Sizes use base 1024 with one decimal (`512 B`, `1.0 KB`, `1.0 MB`). Values of 1024 MB and more are shown in GB to avoid outputs like `5120.0 MB`.

## With more time

- **IndexedDB storage**, to go beyond the ~5 MB `localStorage` limit.
- **List virtualization** for very large trees with many expanded folders.
- **Full WAI-ARIA tree keyboard navigation** (arrow keys, Home/End, type-ahead).
- **Component tests** (React Testing Library) and **end-to-end tests** (Playwright). Only pure logic is unit-tested today.
- **Drag & drop upload.**
- **Web Worker parsing and indexing**, so huge files do not block the main thread.
- **Persisting the expansion state** across refreshes, and **multi-tab sync** of the stored tree.
- **Richer search**: fuzzy matching, search by path, plus sort options in the tree.

## Known limitations

- **`localStorage` quota (~5 MB).** If the tree does not fit, the app works in memory only and shows a warning. The tree is then lost on refresh.
- **`JSON.parse` on pathological depth.** The validator and indexer are iterative, but the browser's `JSON.parse` can still fail on extremely deep input. Such input is reported as invalid JSON.
- **Restricted names.** Duplicate sibling names and names containing `/` are rejected.
- **Input order is not preserved.** Children are always shown folders first, then alphabetically.
- **Search is basic.** It is a case-insensitive substring match on names only (query trimmed). At most 500 results are displayed.
- **Expansion state is in memory.** It resets on refresh. Ancestors of the selected node are re-expanded automatically.
- **No virtualization.** A very large tree with everything expanded (e.g. after "Expand all") may be slow to render.
- **Basic accessibility only.** The tree uses real buttons, `aria-expanded` and `role="tree"` / `treeitem`, with visible focus styles. There is no arrow-key navigation between rows.
- **No multi-tab sync.** Loading a tree in one tab does not update other open tabs until they are refreshed.
