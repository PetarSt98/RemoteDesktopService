import { checkValidity, Rules } from "./validation";

const userNameRules: Rules = {
  memberName: true,
  required: true
};

const computerNameRules: Rules = {
  computerName: true,
  required: true
};

test("valid account names", () => {
  let result = checkValidity("accountname", userNameRules);
  expect(result).toBe(true);
  result = checkValidity("accountname01", userNameRules);
  expect(result).toBe(true);
  result = checkValidity("account123name", userNameRules);
  expect(result).toBe(true);
  result = checkValidity("group-name", userNameRules);
  expect(result).toBe(true);
});

test("invalid account names", () => {
  let result = checkValidity("21accountname", userNameRules);
  expect(result).toBe(false);
  result = checkValidity("accountname)", userNameRules);
  expect(result).toBe(false);
  result = checkValidity("accountn^ame", userNameRules);
  expect(result).toBe(false);
  result = checkValidity("+_accountname", userNameRules);
  expect(result).toBe(false);
  result = checkValidity("accoun.tname", userNameRules);
  expect(result).toBe(false);
  result = checkValidity("-group-name", userNameRules);
  expect(result).toBe(false);
  result = checkValidity("group-name-", userNameRules);
  expect(result).toBe(false);
  result = checkValidity(
    "verylongnameinfactwaytoolongbecauseitsover32chars",
    userNameRules
  );
  expect(result).toBe(false);
  result = checkValidity("sh-ort", userNameRules);
  expect(result).toBe(false);
});

test("valid computer names", () => {
  let result = checkValidity("computername", computerNameRules);
  expect(result).toBe(true);
  result = checkValidity("computername01", computerNameRules);
  expect(result).toBe(true);
  result = checkValidity("computer-name", computerNameRules);
  expect(result).toBe(true);
  result = checkValidity("computer-name01", computerNameRules);
  expect(result).toBe(true);
});

test("invalid computer names", () => {
  let result = checkValidity(
    "computernamecomputernamecomputernamecomputernamecomputernamecomputernamecomputernamecomputernamecomputernamecomputernamecomputername",
    computerNameRules
  );
  expect(result).toBe(false);
  result = checkValidity("computername-", computerNameRules);
  expect(result).toBe(false);
  result = checkValidity("-computername", computerNameRules);
  expect(result).toBe(false);
  result = checkValidity("computern()ame", computerNameRules);
  expect(result).toBe(false);
  result = checkValidity("comput.erna.me", computerNameRules);
  expect(result).toBe(false);
  result = checkValidity(".computername", computerNameRules);
  expect(result).toBe(false);
  result = checkValidity("comp*#utername", computerNameRules);
  expect(result).toBe(false);
});
