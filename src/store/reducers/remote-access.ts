import * as actionTypes from "../actions/actionTypes";

interface ActionType {
  type: string;
  data: any;
}

export interface IRemoteAccess {
  resourceMembers: string[];
  resources: string[];
  selectedComputer: string;
}

const initialState: IRemoteAccess = {
  resourceMembers: [],
  resources: [],
  selectedComputer: ""
};

const updateStateMembers = (
  state: IRemoteAccess,
  data: string[]
): IRemoteAccess => {
  return { ...state, resourceMembers: data.map((m) => m.toLowerCase()) };
};

const updateStateResources = (
  state: IRemoteAccess,
  data: string[]
): IRemoteAccess => {
  return { ...state, resources: data };
};

const addStateResource = (
  state: IRemoteAccess,
  data: string
): IRemoteAccess => {
  return { ...state, resources: [...state.resources, data] };
};

const changeComputer = (state: IRemoteAccess, data: string) => {
  return { ...state, selectedComputer: data };
};

const removeMember = (state: IRemoteAccess, name: string) => {
  return {
    ...state,
    resourceMembers: state.resourceMembers.filter((member) => member !== name)
  };
};

const addMember = (state: IRemoteAccess, name: string): IRemoteAccess => {
  return {
    ...state,
    resourceMembers: [...state.resourceMembers, name.toLowerCase()]
  };
};

export const remoteAccessReducer = (
  state = initialState,
  action: ActionType
) => {
  switch (action.type) {
    case actionTypes.UPDATE_MEMBERS:
      return updateStateMembers(state, action.data);
    case actionTypes.UPDATE_RESOURCES:
      return updateStateResources(state, action.data);
    case actionTypes.ADD_RESOURCE:
      return addStateResource(state, action.data);
    case actionTypes.CHANGE_SELECTED_COMPUTER:
      return changeComputer(state, action.data);
    case actionTypes.REMOVE_RESOURCE_MEMBER:
      return removeMember(state, action.data);
    case actionTypes.ADD_RESOURCE_MEMBER:
      return addMember(state, action.data);
    default:
      return state;
  }
};
