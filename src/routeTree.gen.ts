/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as MyPrsIndexImport } from './routes/my-prs/index'
import { Route as OwnerRepoIndexImport } from './routes/$owner/$repo/index'
import { Route as OwnerRepoPullsNumberHeaderImport } from './routes/$owner/$repo/pulls/$number/_header'
import { Route as OwnerRepoPullsNumberHeaderFileChangesImport } from './routes/$owner/$repo/pulls/$number/_header/file-changes'
import { Route as OwnerRepoPullsNumberHeaderConversationImport } from './routes/$owner/$repo/pulls/$number/_header/conversation'

// Create Virtual Routes

const LoginLazyImport = createFileRoute('/login')()
const AboutLazyImport = createFileRoute('/about')()
const IndexLazyImport = createFileRoute('/')()
const OwnerRepoPullsNumberImport = createFileRoute(
  '/$owner/$repo/pulls/$number',
)()

// Create/Update Routes

const LoginLazyRoute = LoginLazyImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/login.lazy').then((d) => d.Route))

const AboutLazyRoute = AboutLazyImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/about.lazy').then((d) => d.Route))

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const MyPrsIndexRoute = MyPrsIndexImport.update({
  id: '/my-prs/',
  path: '/my-prs/',
  getParentRoute: () => rootRoute,
} as any)

const OwnerRepoIndexRoute = OwnerRepoIndexImport.update({
  id: '/$owner/$repo/',
  path: '/$owner/$repo/',
  getParentRoute: () => rootRoute,
} as any)

const OwnerRepoPullsNumberRoute = OwnerRepoPullsNumberImport.update({
  id: '/$owner/$repo/pulls/$number',
  path: '/$owner/$repo/pulls/$number',
  getParentRoute: () => rootRoute,
} as any)

const OwnerRepoPullsNumberHeaderRoute = OwnerRepoPullsNumberHeaderImport.update(
  {
    id: '/_header',
    getParentRoute: () => OwnerRepoPullsNumberRoute,
  } as any,
)

const OwnerRepoPullsNumberHeaderFileChangesRoute =
  OwnerRepoPullsNumberHeaderFileChangesImport.update({
    id: '/file-changes',
    path: '/file-changes',
    getParentRoute: () => OwnerRepoPullsNumberHeaderRoute,
  } as any)

const OwnerRepoPullsNumberHeaderConversationRoute =
  OwnerRepoPullsNumberHeaderConversationImport.update({
    id: '/conversation',
    path: '/conversation',
    getParentRoute: () => OwnerRepoPullsNumberHeaderRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutLazyImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginLazyImport
      parentRoute: typeof rootRoute
    }
    '/my-prs/': {
      id: '/my-prs/'
      path: '/my-prs'
      fullPath: '/my-prs'
      preLoaderRoute: typeof MyPrsIndexImport
      parentRoute: typeof rootRoute
    }
    '/$owner/$repo/': {
      id: '/$owner/$repo/'
      path: '/$owner/$repo'
      fullPath: '/$owner/$repo'
      preLoaderRoute: typeof OwnerRepoIndexImport
      parentRoute: typeof rootRoute
    }
    '/$owner/$repo/pulls/$number': {
      id: '/$owner/$repo/pulls/$number'
      path: '/$owner/$repo/pulls/$number'
      fullPath: '/$owner/$repo/pulls/$number'
      preLoaderRoute: typeof OwnerRepoPullsNumberImport
      parentRoute: typeof rootRoute
    }
    '/$owner/$repo/pulls/$number/_header': {
      id: '/$owner/$repo/pulls/$number/_header'
      path: '/$owner/$repo/pulls/$number'
      fullPath: '/$owner/$repo/pulls/$number'
      preLoaderRoute: typeof OwnerRepoPullsNumberHeaderImport
      parentRoute: typeof OwnerRepoPullsNumberRoute
    }
    '/$owner/$repo/pulls/$number/_header/conversation': {
      id: '/$owner/$repo/pulls/$number/_header/conversation'
      path: '/conversation'
      fullPath: '/$owner/$repo/pulls/$number/conversation'
      preLoaderRoute: typeof OwnerRepoPullsNumberHeaderConversationImport
      parentRoute: typeof OwnerRepoPullsNumberHeaderImport
    }
    '/$owner/$repo/pulls/$number/_header/file-changes': {
      id: '/$owner/$repo/pulls/$number/_header/file-changes'
      path: '/file-changes'
      fullPath: '/$owner/$repo/pulls/$number/file-changes'
      preLoaderRoute: typeof OwnerRepoPullsNumberHeaderFileChangesImport
      parentRoute: typeof OwnerRepoPullsNumberHeaderImport
    }
  }
}

// Create and export the route tree

interface OwnerRepoPullsNumberHeaderRouteChildren {
  OwnerRepoPullsNumberHeaderConversationRoute: typeof OwnerRepoPullsNumberHeaderConversationRoute
  OwnerRepoPullsNumberHeaderFileChangesRoute: typeof OwnerRepoPullsNumberHeaderFileChangesRoute
}

const OwnerRepoPullsNumberHeaderRouteChildren: OwnerRepoPullsNumberHeaderRouteChildren =
  {
    OwnerRepoPullsNumberHeaderConversationRoute:
      OwnerRepoPullsNumberHeaderConversationRoute,
    OwnerRepoPullsNumberHeaderFileChangesRoute:
      OwnerRepoPullsNumberHeaderFileChangesRoute,
  }

const OwnerRepoPullsNumberHeaderRouteWithChildren =
  OwnerRepoPullsNumberHeaderRoute._addFileChildren(
    OwnerRepoPullsNumberHeaderRouteChildren,
  )

interface OwnerRepoPullsNumberRouteChildren {
  OwnerRepoPullsNumberHeaderRoute: typeof OwnerRepoPullsNumberHeaderRouteWithChildren
}

const OwnerRepoPullsNumberRouteChildren: OwnerRepoPullsNumberRouteChildren = {
  OwnerRepoPullsNumberHeaderRoute: OwnerRepoPullsNumberHeaderRouteWithChildren,
}

const OwnerRepoPullsNumberRouteWithChildren =
  OwnerRepoPullsNumberRoute._addFileChildren(OwnerRepoPullsNumberRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/about': typeof AboutLazyRoute
  '/login': typeof LoginLazyRoute
  '/my-prs': typeof MyPrsIndexRoute
  '/$owner/$repo': typeof OwnerRepoIndexRoute
  '/$owner/$repo/pulls/$number': typeof OwnerRepoPullsNumberHeaderRouteWithChildren
  '/$owner/$repo/pulls/$number/conversation': typeof OwnerRepoPullsNumberHeaderConversationRoute
  '/$owner/$repo/pulls/$number/file-changes': typeof OwnerRepoPullsNumberHeaderFileChangesRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/about': typeof AboutLazyRoute
  '/login': typeof LoginLazyRoute
  '/my-prs': typeof MyPrsIndexRoute
  '/$owner/$repo': typeof OwnerRepoIndexRoute
  '/$owner/$repo/pulls/$number': typeof OwnerRepoPullsNumberHeaderRouteWithChildren
  '/$owner/$repo/pulls/$number/conversation': typeof OwnerRepoPullsNumberHeaderConversationRoute
  '/$owner/$repo/pulls/$number/file-changes': typeof OwnerRepoPullsNumberHeaderFileChangesRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/about': typeof AboutLazyRoute
  '/login': typeof LoginLazyRoute
  '/my-prs/': typeof MyPrsIndexRoute
  '/$owner/$repo/': typeof OwnerRepoIndexRoute
  '/$owner/$repo/pulls/$number': typeof OwnerRepoPullsNumberRouteWithChildren
  '/$owner/$repo/pulls/$number/_header': typeof OwnerRepoPullsNumberHeaderRouteWithChildren
  '/$owner/$repo/pulls/$number/_header/conversation': typeof OwnerRepoPullsNumberHeaderConversationRoute
  '/$owner/$repo/pulls/$number/_header/file-changes': typeof OwnerRepoPullsNumberHeaderFileChangesRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/about'
    | '/login'
    | '/my-prs'
    | '/$owner/$repo'
    | '/$owner/$repo/pulls/$number'
    | '/$owner/$repo/pulls/$number/conversation'
    | '/$owner/$repo/pulls/$number/file-changes'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/about'
    | '/login'
    | '/my-prs'
    | '/$owner/$repo'
    | '/$owner/$repo/pulls/$number'
    | '/$owner/$repo/pulls/$number/conversation'
    | '/$owner/$repo/pulls/$number/file-changes'
  id:
    | '__root__'
    | '/'
    | '/about'
    | '/login'
    | '/my-prs/'
    | '/$owner/$repo/'
    | '/$owner/$repo/pulls/$number'
    | '/$owner/$repo/pulls/$number/_header'
    | '/$owner/$repo/pulls/$number/_header/conversation'
    | '/$owner/$repo/pulls/$number/_header/file-changes'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  AboutLazyRoute: typeof AboutLazyRoute
  LoginLazyRoute: typeof LoginLazyRoute
  MyPrsIndexRoute: typeof MyPrsIndexRoute
  OwnerRepoIndexRoute: typeof OwnerRepoIndexRoute
  OwnerRepoPullsNumberRoute: typeof OwnerRepoPullsNumberRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  AboutLazyRoute: AboutLazyRoute,
  LoginLazyRoute: LoginLazyRoute,
  MyPrsIndexRoute: MyPrsIndexRoute,
  OwnerRepoIndexRoute: OwnerRepoIndexRoute,
  OwnerRepoPullsNumberRoute: OwnerRepoPullsNumberRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about",
        "/login",
        "/my-prs/",
        "/$owner/$repo/",
        "/$owner/$repo/pulls/$number"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/about": {
      "filePath": "about.lazy.tsx"
    },
    "/login": {
      "filePath": "login.lazy.tsx"
    },
    "/my-prs/": {
      "filePath": "my-prs/index.tsx"
    },
    "/$owner/$repo/": {
      "filePath": "$owner/$repo/index.tsx"
    },
    "/$owner/$repo/pulls/$number": {
      "filePath": "$owner/$repo/pulls/$number",
      "children": [
        "/$owner/$repo/pulls/$number/_header"
      ]
    },
    "/$owner/$repo/pulls/$number/_header": {
      "filePath": "$owner/$repo/pulls/$number/_header.tsx",
      "parent": "/$owner/$repo/pulls/$number",
      "children": [
        "/$owner/$repo/pulls/$number/_header/conversation",
        "/$owner/$repo/pulls/$number/_header/file-changes"
      ]
    },
    "/$owner/$repo/pulls/$number/_header/conversation": {
      "filePath": "$owner/$repo/pulls/$number/_header/conversation.tsx",
      "parent": "/$owner/$repo/pulls/$number/_header"
    },
    "/$owner/$repo/pulls/$number/_header/file-changes": {
      "filePath": "$owner/$repo/pulls/$number/_header/file-changes.tsx",
      "parent": "/$owner/$repo/pulls/$number/_header"
    }
  }
}
ROUTE_MANIFEST_END */
