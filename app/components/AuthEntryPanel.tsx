"use client";

import { signIn } from "next-auth/react";

type ProviderKey = "google" | "apple" | "github";

export interface AuthProviderConfig {
  id: ProviderKey;
  name: string;
  enabled: boolean;
  blurb: string;
}

interface AuthEntryPanelProps {
  redirectTo: string;
  title: string;
  body: string;
  providers: AuthProviderConfig[];
  compact?: boolean;
  eyebrow?: string;
}

function ProviderIcon({ providerId }: { providerId: ProviderKey }) {
  if (providerId === "google") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2.1H12Z" />
        <path fill="#34A853" d="M12 21c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-3.9l-3.2 2.5C5 18.7 8.2 21 12 21Z" />
        <path fill="#4A90E2" d="M6.6 13.1c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9l-3.2-2.5C2.5 8.4 2 10.1 2 11.2s.5 2.8 1.4 4.4l3.2-2.5Z" />
        <path fill="#FBBC05" d="M12 5.4c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2.4 14.6 1.5 12 1.5c-3.8 0-7 2.3-8.6 5.6l3.2 2.5c.8-2.2 2.9-4.2 5.4-4.2Z" />
      </svg>
    );
  }

  if (providerId === "apple") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.84 12.92c.03 3.08 2.7 4.1 2.73 4.11-.02.07-.43 1.47-1.4 2.91-.84 1.24-1.72 2.48-3.09 2.5-1.35.03-1.79-.79-3.34-.79-1.55 0-2.05.77-3.31.82-1.32.05-2.33-1.31-3.18-2.55-1.74-2.51-3.06-7.08-1.28-10.18.88-1.53 2.45-2.5 4.16-2.53 1.3-.03 2.53.87 3.34.87.81 0 2.33-1.08 3.92-.92.67.03 2.55.27 3.76 2.03-.1.06-2.24 1.31-2.21 3.73ZM14.63 4.8c.7-.84 1.17-2.02 1.04-3.2-1 .04-2.21.67-2.93 1.5-.65.75-1.22 1.95-1.07 3.09 1.12.09 2.26-.57 2.96-1.39Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.68.5 12.08c0 5.12 3.3 9.46 7.88 10.99.58.11.79-.26.79-.57 0-.28-.01-1.22-.02-2.22-3.2.7-3.88-1.38-3.88-1.38-.52-1.35-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.21 1.77 1.21 1.03 1.79 2.7 1.27 3.36.97.1-.76.4-1.27.72-1.56-2.56-.3-5.24-1.3-5.24-5.8 0-1.28.45-2.33 1.19-3.15-.12-.3-.52-1.52.11-3.17 0 0 .97-.31 3.18 1.2a10.9 10.9 0 0 1 5.8 0c2.2-1.51 3.17-1.2 3.17-1.2.64 1.65.24 2.87.12 3.17.74.82 1.18 1.87 1.18 3.15 0 4.51-2.69 5.49-5.26 5.79.41.36.78 1.07.78 2.16 0 1.56-.02 2.82-.02 3.2 0 .31.21.69.8.57 4.57-1.54 7.86-5.88 7.86-10.99C23.5 5.68 18.35.5 12 .5Z"
      />
    </svg>
  );
}

export default function AuthEntryPanel({
  redirectTo,
  title,
  body,
  providers,
  compact = false,
  eyebrow,
}: AuthEntryPanelProps) {
  const primary = providers.find((provider) => provider.id === "google") ?? providers[0];
  const secondary = providers.filter((provider) => provider.id !== primary?.id);

  return (
    <div className={`auth-entry${compact ? " auth-entry--compact" : ""}`}>
      {(eyebrow || title || body) ? (
        <div className="auth-entry__copy">
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          {title ? <h3 className="auth-entry__title">{title}</h3> : null}
          {body ? <p className="auth-entry__body">{body}</p> : null}
        </div>
      ) : null}

      {primary && (
        <button
          type="button"
          className={`auth-entry__primary${primary.enabled ? "" : " auth-entry__primary--disabled"}`}
          disabled={!primary.enabled}
          onClick={() => {
            if (primary.enabled) {
              void signIn(primary.id, { callbackUrl: redirectTo });
            }
          }}
        >
          <span className="auth-entry__primary-icon">
            <ProviderIcon providerId={primary.id} />
          </span>
          <span>
            <strong>{primary.name}</strong>
            <span className="auth-entry__primary-text">
              {primary.enabled ? primary.blurb : `${primary.name} is not available yet.`}
            </span>
          </span>
        </button>
      )}

      {secondary.length > 0 && (
        <div className="auth-entry__secondary">
          {secondary.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={`auth-entry__chip${provider.enabled ? "" : " auth-entry__chip--disabled"}`}
              disabled={!provider.enabled}
              onClick={() => {
                if (provider.enabled) {
                  void signIn(provider.id, { callbackUrl: redirectTo });
                }
              }}
            >
              <span className="auth-entry__chip-icon">
                <ProviderIcon providerId={provider.id} />
              </span>
              <span>{provider.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
