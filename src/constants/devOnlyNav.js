/**
 * Test page (`/test-page` charts hub): shown in local `vite` dev; hidden in production builds (`vite build`).
 * Care demo routes under `/test-page/care-demo/*` stay available in production (e.g. SkyportCare → Current Demo).
 * To show the charts Test page on a deployed site, set `VITE_SHOW_TEST_PAGE=true` in the host environment.
 */
export const TEST_PAGE_VISIBLE =
  import.meta.env.VITE_SHOW_TEST_PAGE === 'true' || Boolean(import.meta.env.DEV)
