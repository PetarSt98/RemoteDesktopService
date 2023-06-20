const computerMaxLength = 50;
const memberNameMaxLength = 32;
const groupMinLength = 9;
const nameRegex = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/;

const isLegalComputerName = (value: string): boolean => {
  return value.trim().length < computerMaxLength && nameRegex.test(value);
};

const isLegalAccountName = (value: string): boolean => {
  if (value.includes("-")) return false;
  return value.trim().length < memberNameMaxLength && nameRegex.test(value);
};

const isLegalGroupName = (value: string): boolean => {
  if (!value.includes("-")) return false;
  return (
    value.trim().length >= groupMinLength &&
    value.trim().length < memberNameMaxLength &&
    nameRegex.test(value)
  );
};

type RuleFunction = (val: string, isValid: boolean) => boolean;
type RuleKey = "required" | "computerName" | "memberName";

export type Rules = {
  [key in RuleKey]?: boolean;
};

type ValidationFunctions = {
  [key in RuleKey]: RuleFunction;
};

const isLegalMemberName = (value: string) => {
  return isLegalAccountName(value) || isLegalGroupName(value);
};

const validationRules: ValidationFunctions = {
  required: (value, isValid) => value.trim() !== "" && isValid,
  computerName: (value, isValid) => isLegalComputerName(value) && isValid,
  memberName: (value, isValid) => isLegalMemberName(value) && isValid
};

export const checkValidity = (value: string, rules: Rules) => {
  return Object.keys(rules).reduce((isValid, key) => {
    return validationRules[key as RuleKey](value, isValid);
  }, true);
};
