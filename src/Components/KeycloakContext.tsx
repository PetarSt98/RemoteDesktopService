// KeycloakContext.tsx
import { createContext } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

type KeycloakContextType = {
  keycloak: KeycloakInstance | null;
};

export const KeycloakContext = createContext<KeycloakContextType>({ keycloak: null });
