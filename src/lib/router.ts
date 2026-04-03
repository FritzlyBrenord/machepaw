// ============================================
// SIMPLE ROUTER - Preview-aware navigation
// ============================================

import { useState, useCallback, useEffect } from 'react';

type NamedRoute =
  | 'home'
  | 'products'
  | 'product'
  | 'cart'
  | 'wishlist'
  | 'account'
  | 'login'
  | 'register'
  | 'checkout'
  | 'order-detail'
  | 'order-confirmation';

type Route = NamedRoute | string;

interface RouteState {
  route: Route;
  params: Record<string, string>;
}

function getPublicStoreBasePath(pathname: string) {
  const match = pathname.match(/^\/boutique\/([^/]+)/);
  if (!match) return null;
  return `/boutique/${match[1]}`;
}

function getBuilderBasePath(pathname: string) {
  if (pathname === '/builder' || pathname === '/builder/') {
    return '/builder';
  }

  return null;
}

const PREVIEW_ROUTE_KEY = 'previewRoute';

const routeToPath = (
  route: Route,
  params: Record<string, string> = {}
): string => {
  if (route.startsWith('/')) {
    return route;
  }

  const knownRoutes: NamedRoute[] = [
    'home',
    'products',
    'product',
    'cart',
    'wishlist',
    'account',
    'login',
    'register',
    'checkout',
    'order-detail',
    'order-confirmation',
  ];

  if (!knownRoutes.includes(route as NamedRoute)) {
    return `/${route.replace(/^\/+/, '')}`;
  }

  switch (route) {
    case 'home':
      return '/';
    case 'products': {
      const search = new URLSearchParams();
      if (params.category) search.set('category', params.category);
      if (params.search) search.set('search', params.search);
      if (params.minPrice) search.set('minPrice', params.minPrice);
      if (params.maxPrice) search.set('maxPrice', params.maxPrice);
      if (params.sort) search.set('sort', params.sort);
      if (params.view) search.set('view', params.view);
      const query = search.toString();
      return query ? `/products?${query}` : '/products';
    }
    case 'product': {
      const search = new URLSearchParams();
      if (params.id) search.set('id', params.id);
      const query = search.toString();
      return query ? `/product?${query}` : '/product';
    }
    case 'cart':
      return '/cart';
    case 'wishlist':
      return '/wishlist';
    case 'account':
      return '/account';
    case 'login':
      return '/connexion';
    case 'register':
      return '/inscription';
    case 'checkout':
      return '/checkout';
    case 'order-detail':
      return params.id
        ? `/commande/${encodeURIComponent(params.id)}`
        : '/commande';
    case 'order-confirmation': {
      const search = new URLSearchParams();
      if (params.id) search.set('id', params.id);
      const query = search.toString();
      return query ? `/order-confirmation?${query}` : '/order-confirmation';
    }
    default:
      return '/';
  }
};

const pathToRoute = (pathname: string): Route => {
  switch (pathname) {
    case '/':
      return 'home';
    case '/products':
    case '/produits':
      return 'products';
    case '/product':
    case '/produit':
      return 'product';
    case '/cart':
    case '/panier':
      return 'cart';
    case '/wishlist':
    case '/favoris':
      return 'wishlist';
    case '/account':
    case '/compte':
      return 'account';
    case '/connexion':
    case '/login':
      return 'login';
    case '/inscription':
    case '/register':
      return 'register';
    case '/checkout':
      return 'checkout';
    case '/commande':
    case '/commandes':
      return 'order-detail';
    case '/order-confirmation':
    case '/confirmation':
      return 'order-confirmation';
    default:
      return 'home';
  }
};

function buildPreviewUrl(
  basePath: string,
  route: Route,
  params: Record<string, string> = {}
) {
  const search = new URLSearchParams();

  if (route !== 'home') {
    search.set(PREVIEW_ROUTE_KEY, route);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function getCurrentStateFromUrl(): RouteState {
  if (typeof window === 'undefined') {
    return { route: 'home', params: {} };
  }

  const publicBasePath = getPublicStoreBasePath(window.location.pathname);
  const builderBasePath = getBuilderBasePath(window.location.pathname);
  const search = new URLSearchParams(window.location.search);
  const previewRoute = search.get(PREVIEW_ROUTE_KEY) as Route | null;
  const params: Record<string, string> = {};

  search.forEach((value, key) => {
    if (key !== PREVIEW_ROUTE_KEY) {
      params[key] = value;
    }
  });

  if (builderBasePath && previewRoute) {
    return { route: previewRoute, params };
  }

  if (builderBasePath) {
    return { route: 'home', params: {} };
  }

  const pathnameToResolve = publicBasePath
    ? window.location.pathname.slice(publicBasePath.length) || '/'
    : window.location.pathname;
  const normalizedPathname = pathnameToResolve || '/';

  if (
    normalizedPathname === '/commande' ||
    normalizedPathname === '/commandes' ||
    normalizedPathname.startsWith('/commande/') ||
    normalizedPathname.startsWith('/commandes/')
  ) {
    const pathSegments = normalizedPathname.split('/').filter(Boolean);
    const orderId = pathSegments.length > 1 ? decodeURIComponent(pathSegments[1] || '') : '';

    return {
      route: 'order-detail',
      params: orderId ? { id: orderId } : {},
    };
  }

  const route = pathToRoute(normalizedPathname);
  return { route, params };
}

let currentRoute: RouteState = { route: 'home', params: {} };
let listeners: Set<(state: RouteState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(currentRoute));
}

function navigateTo(route: Route, params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;

  const builderBasePath = getBuilderBasePath(window.location.pathname);
  const shouldStayInBuilder = Boolean(builderBasePath);
  const publicBasePath = getPublicStoreBasePath(window.location.pathname);

  currentRoute = { route, params };

  if (shouldStayInBuilder) {
    const targetUrl = buildPreviewUrl(builderBasePath!, route, params);
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }

    notifyListeners();
    return;
  }

  const targetUrl = publicBasePath
    ? `${publicBasePath}${route === 'home' ? '' : routeToPath(route, params)}`
    : routeToPath(route, params);
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (currentUrl === targetUrl) {
    notifyListeners();
    return;
  }

  window.location.assign(targetUrl);
}

export function useRouter() {
  const [state, setState] = useState<RouteState>(() => {
    const nextState = getCurrentStateFromUrl();
    currentRoute = nextState;
    return nextState;
  });

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      currentRoute = getCurrentStateFromUrl();
      setState(currentRoute);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = useCallback((route: Route, params: Record<string, string> = {}) => {
    navigateTo(route, params);
  }, []);

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  return {
    route: state.route,
    params: state.params,
    navigate,
    goBack,
  };
}

export function useNavigate() {
  return useCallback((route: Route, params: Record<string, string> = {}) => {
    navigateTo(route, params);
  }, []);
}

export function useParams() {
  const [state, setState] = useState<RouteState>(() => getCurrentStateFromUrl());

  useEffect(() => {
    const handleLocationChange = () => {
      const nextState = getCurrentStateFromUrl();
      currentRoute = nextState;
      setState(nextState);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return state.params;
}

export function getCurrentRoute(): RouteState {
  if (typeof window !== 'undefined') {
    currentRoute = getCurrentStateFromUrl();
  }
  return currentRoute;
}

export function navigate(route: Route, params: Record<string, string> = {}) {
  navigateTo(route, params);
}

export type { Route, RouteState };
