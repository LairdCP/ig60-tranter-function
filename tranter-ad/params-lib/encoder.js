const { snakeToCamel, loadParamsFile, pad } = require("./shared");

const writeMethodMap = {
  uint64_t: "writeBigUInt64LE",
  uint32_t: "writeUInt32LE",
  uint16_t: "writeUInt16LE",
  uint8_t: "writeUInt8",
  int64_t: "writeBigInt64LE",
  int32_t: "writeInt32LE",
  int16_t: "writeInt16LE",
  int8_t: "writeInt8",
  double: "writeDoubleLE",
  float: "writeFloatLE",
  string: "string",
};

const LoadParamsFile = function (thingType, apiVersion) {
  let paramsMap = {};
  let paramsFile = loadParamsFile(thingType, apiVersion);

  for (let index in paramsFile.components.contentDescriptors.deviceParams[
    "x-deviceparameters"
  ]) {
    let c =
      paramsFile.components.contentDescriptors.deviceParams[
        "x-deviceparameters"
      ][index];
    c.hexid = "0000".concat(c["x-id"].toString(16)).slice(-4);

    let name = c.name;
    if (parseFloat(apiVersion) > 1.9) {
      name = snakeToCamel(c.name);
    }
    paramsMap[name] = JSON.parse(JSON.stringify(c));
    let byteMethod;
    let method;
    let length = 0;

    switch (paramsMap[name].schema["x-ctype"]) {
      case "double":
      case "uint64_t":
      case "int64_t":
        byteMethod = writeMethodMap[paramsMap[name].schema["x-ctype"]];
        length = 8;
        break;
      case "float":
      case "uint32_t":
      case "int32_t":
        byteMethod = writeMethodMap[paramsMap[name].schema["x-ctype"]];
        length = 4;
        break;
      case "uint16_t":
      case "int16_t":
        byteMethod = writeMethodMap[paramsMap[name].schema["x-ctype"]];
        length = 2;
        break;

      case "uint8_t":
      case "int8_t":
        byteMethod = writeMethodMap[paramsMap[name].schema["x-ctype"]];
        length = 1;
        break;
      case "bool":
        method = (v) => {
          if (v === true || v === "true" || v === 1 || v === "1") {
            return 1;
          } else {
            return 0;
          }
        };
        break;
      case "string":
      default:
    }

    paramsMap[name].transform = (v) => {
      if (byteMethod) {
        let buf = Buffer.alloc(length, 0);
        buf[byteMethod](v);
        return pad(length * 2, buf.toString("hex"));
      } else if (method) {
        return method(v);
      } else {
        return v;
      }
    };
  }
  return paramsMap;
};

exports.encode = (thingType, apiVersion, payload) => {
  let paramsMap = LoadParamsFile(thingType, apiVersion);

  let fileString = "";
  for (let k in payload) {
    if (k in paramsMap) {
      // for each key in the shadow delta, create a line in the params file
      fileString =
        fileString +
        [
          paramsMap[k].hexid,
          "=",
          paramsMap[k].transform(payload[k]),
          "\n",
        ].join("");
    }
  }

  return JSON.stringify({
    data: fileString,
  });
};
