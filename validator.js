const { executeQuery } = require("./database/database");

async function validate(rules, value, name) {
  for (let i = 0; i < rules.length; i++) {
    let rule = rules[i];
    let result = await isValidByRule(rule, value);

    if (!result.isValid) {
      return {
        success: false,
        message: result.message,
        field: name,
      };
    }
  }

  return {
    success: true,
    message: "",
  };
}

async function isValidByRule(rule, value) {
  if (rule == "required" && !value) {
    return {
      isValid: false,
      message: "This field is required",
    };
  } else if (rule == "number" && isNaN(value)) {
    return {
      isValid: false,
      message: "This field should be a number",
    };
  } else if (rule.split(":")[0] == "min") {
    let result = validateMin(rule, value);
    if (!result.isValid) {
      return result;
    }
  } else if (rule.split(":")[0] == "max") {
    let result = validateMax(rule, value);
    if (!result.isValid) {
      return result;
    }
  } else if (rule == "password" && !isValidPassword(value)) {
    return {
      isValid: false,
      message:
        "The password should contain contain at least one numeric digit, one uppercase and one lowercase letter. The length should be greater than 6 characters.",
    };
  } else if (rule == "email" && !isValidEmail(value)) {
    return {
      isValid: false,
      message: "The email is invalid.",
    };
  } else if (rule.split(":")[0] == "in") {
    let result = validateIn(rule, value);

    if (!result.isValid) {
      return result;
    }
  } else if (rule == "phone" && !isValidPhone(value)) {
    return {
      isValid: false,
      message:
        "Phone number is invalid. It can either be +2547xxxxxxxx or 07xxxxxxxx",
    };
  } else if (rule.split(":")[0] == "unique") {
    let result = await validateUnique(rule, value);

    if (!result.isValid) {
      return result;
    }
  } else if (rule.split(":")[0] == "exists") {
    let result = await validateExist(rule, value);

    if (!result.isValid) {
      return result;
    }
  }

  return {
    isValid: true,
    message: "",
  };
}

function isValidPassword(value) {
  let pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  return value.match(pattern);
}

function validateMin(rule, value) {
  let minimum = rule.split(":")[1];

  if (value.length < minimum) {
    return {
      isValid: false,
      message: `This field should have a minimum of ${minimum} characters`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

function validateMax(rule, value) {
  let maximum = rule.split(":")[1];

  if (value.length > maximum) {
    return {
      isValid: false,
      message: `This field should have a maximum of ${maximum} characters`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

function validateIn(rule, value) {
  let valuesStr = rule.split(":")[1];
  let valuesArr = valuesStr.split(",");

  let found = valuesArr.findIndex((item) => {
    return item == value;
  });

  if (found < 0) {
    return {
      isValid: false,
      message: "This field can either be: " + valuesStr,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

function isValidEmail(value) {
  return String(value)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

function isValidPhone(value) {
  return String(value)
    .toLowerCase()
    .match(/^(?:\+254|0)?(7(?:(?:[12][0-9])|(?:0[0-8])|(?:9[0-2]))[0-9]{6})$/);
}

async function validateMany(valueObj, rulesObj) {
  for (let key in valueObj) {
    let rules = rulesObj[key];

    if (!rules) {
      continue;
    }
    let validationResult = await validate(rules, valueObj[key], key);

    if (!validationResult.success) {
      return validationResult;
    }
  }

  return {
    success: true,
    message: "",
  };
}

async function validateUnique(rule, value) {
  let ruleStr = rule.split(":")[1];
  let rules = ruleStr.split(",");
  let tableName = rules[1];
  let columnName = rules[0];
  let excludeId = rules[2];

  let query = `SELECT * FROM ${tableName} WHERE ${columnName}='${value}'`;

  if (excludeId) {
    query = query + ` AND id NOT IN(${excludeId})`;
  }
  result = await executeQuery(query, []);

  if (result && result.length > 0) {
    return {
      isValid: false,
      message: `${columnName} already exists`,
    };
  }
  return {
    isValid: true,
    message: "",
  };
}

async function validateExist(rule, value) {
  let ruleStr = rule.split(":")[1];
  let rules = ruleStr.split(",");
  let tableName = rules[1];
  let columnName = rules[0];

  let query = `SELECT * FROM ${tableName} WHERE ${columnName}='${value}'`;

  result = await executeQuery(query, []);

  if (result && result.length > 0) {
    return {
      isValid: true,
      message: "",
    };
  }
  return {
    isValid: false,
    message: `${columnName} does not exist`,
  };
}

module.exports = {
  validate,
  validateMany,
};
