import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { assetUrl } from '../utils/assets';

/** Shown if a page crashes or a code-split chunk fails to load (e.g. after a redeploy). */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Something went wrong.';
  const chunkError = /dynamically imported module|Loading chunk|Failed to fetch/i.test(message);

  return (
    <div className="route-error">
      <AlertTriangle size={40} aria-hidden="true" />
      <h1>{chunkError ? 'A newer version is available' : 'Oops – this page hit a problem'}</h1>
      <p>{chunkError ? 'The exhibition site was updated. Reload to continue exploring.' : message}</p>
      <div className="btn-row center">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <a className="btn btn-ghost" href={assetUrl('') || './'}>
          Go to home
        </a>
      </div>
    </div>
  );
}
