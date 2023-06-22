import { IRemoteAccess } from "./reducers/remote-access";

export interface Store {
  keycloak: any;
  remoteAccess: IRemoteAccess;
}
