const fs = require("fs");
const path = require("path");

exports.reverseBytes = (input) => {
  let result = "";
  for (let i = 0; i < input.length; i = i + 2) {
    result = input.substr(i, 2) + result;
  }
  return result;
};

exports.pad = (length, v) => {
  let p = "00000000000000000000000000000000" + v;
  return p.slice(length * -1);
};

exports.loadParamsFile = (thingType, apiVersion) => {
  let paramsFile;
  console.log("loadParamsFile", thingType, apiVersion);
  switch (thingType.toLowerCase()) {
    case "bt610":
    case "bt610-sensor":
      paramsFile = fs.readFileSync(
        path.join(__dirname, `/BT6ApiParams_${apiVersion}.json`)
      );
  }

  try {
    return JSON.parse(paramsFile);
  } catch (error) {
    console.log("error", "Malformed JSON params file", error.message);
  }
};

exports.camelToSnake = (key) =>
  key
    .split(/(?=[A-Z])/)
    .join("_")
    .toLowerCase();

exports.snakeToCamel = (key) =>
  key
    .split("_")
    .map((k, i) => (i ? k.charAt(0).toUpperCase() + k.slice(1) : k))
    .join("");
