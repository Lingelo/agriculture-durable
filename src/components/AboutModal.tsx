import { timeAgo } from '../utils/format';

interface Props {
  onClose: () => void;
  lastUpdate?: string;
}

export function AboutModal({ onClose, lastUpdate }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">A propos</h2>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>
            Cette carte croise deux jeux de donnees pour visualiser l'agriculture
            durable en France : la localisation des exploitations certifiees
            biologiques et les volumes de pesticides vendus par departement.
          </p>
          <p>
            <strong>Sources :</strong>
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Agence Bio (exploitations biologiques) —{' '}
              <a
                href="https://opendata.agencebio.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                opendata.agencebio.org
              </a>
            </li>
            <li>
              Hub'Eau / BNV-D (ventes de pesticides par departement) —{' '}
              <a
                href="https://hubeau.eaufrance.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                hubeau.eaufrance.fr
              </a>
            </li>
          </ul>
          <p>
            <strong>Licence :</strong> Licence Ouverte v2.0
          </p>
          {lastUpdate && (
            <p>
              <strong>Derniere mise a jour :</strong> {timeAgo(lastUpdate)}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
