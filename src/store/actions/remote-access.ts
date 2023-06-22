import * as actionTypes from "./actionTypes";

export const updateResources = (data: string[]) => {
  return {
    type: actionTypes.UPDATE_RESOURCES,
    data
  };
};

export const addResource = (data: string) => {
  return {
    type: actionTypes.ADD_RESOURCE,
    data
  };
};

export const changeComputer = (data: string) => {
  return {
    type: actionTypes.CHANGE_SELECTED_COMPUTER,
    data
  };
};

export const updateMembers = (data: any[]) => {
  return {
    type: actionTypes.UPDATE_MEMBERS,
    data
  };
};

export const removeResourceMember = (data: string) => {
  return {
    type: actionTypes.REMOVE_RESOURCE_MEMBER,
    data
  };
};

export const addResourceMember = (data: string) => {
  return {
    type: actionTypes.ADD_RESOURCE_MEMBER,
    data
  };
};
