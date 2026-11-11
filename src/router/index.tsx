import { lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { RouteError } from '../pages/RouteError';
import LandingPage from '../pages/LandingPage';

/*
 * HashRouter is used deliberately for GitHub Pages: every URL is served by
 * index.html (e.g. https://user.github.io/repo/#/campus/library), so deep
 * links from QR codes and page refreshes never return a 404.
 * Pages other than the landing page are code-split and loaded on demand.
 */
const CampusPage = lazy(() => import('../pages/CampusPage'));
const LocationPage = lazy(() => import('../pages/LocationPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const GalleryPage = lazy(() => import('../pages/GalleryPage'));
const GuidePage = lazy(() => import('../pages/GuidePage'));
const ChallengesPage = lazy(() => import('../pages/ChallengesPage'));
const ChallengePlayPage = lazy(() => import('../pages/ChallengePlayPage'));
const FuturePage = lazy(() => import('../pages/FuturePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'campus', element: <CampusPage /> },
      { path: 'campus/:locationId', element: <LocationPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      { path: 'guide', element: <GuidePage /> },
      { path: 'challenges', element: <ChallengesPage /> },
      { path: 'challenges/:challengeId', element: <ChallengePlayPage /> },
      { path: 'future', element: <FuturePage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
