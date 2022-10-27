const Parser = require("binary-parser").Parser;
const cbor = require("cbor");
const { snakeToCamel, loadParamsFile } = require("./shared");

const readMethodMap = {
  uint64_t: "readBigUInt64LE",
  uint32_t: "readUInt32LE",
  uint16_t: "readUInt16LE",
  uint8_t: "readUInt8",
  int64_t: "readBigInt64LE",
  int32_t: "readInt32LE",
  int16_t: "readInt16LE",
  int8_t: "readInt8",
  double: "readDoubleLE",
  float: "readFloatLE",
};

function parseParamsFile(thingType, apiVersion) {
  let paramsMap = [];
  let paramsFile = loadParamsFile(thingType, apiVersion);

  for (let index in paramsFile.components.contentDescriptors.deviceParams[
    "x-deviceparameters"
  ]) {
    let c =
      paramsFile.components.contentDescriptors.deviceParams[
        "x-deviceparameters"
      ][index];

    paramsMap[c["x-id"]] = JSON.parse(JSON.stringify(c));
    let byteMethod;

    switch (paramsMap[c["x-id"]].schema["x-ctype"]) {
      case "double":
      case "uint64_t":
      case "int64_t":
        byteMethod = readMethodMap[paramsMap[c["x-id"]].schema["x-ctype"]];
        paramsMap[c["x-id"]].transform = (v) => {
          let buf = Buffer.from(v, "hex");
          try {
            // BigInt is not supported by JSON
            return buf[byteMethod]().toString();
          } catch (error) {
            console.log(paramsMap[c["x-id"]].schema["x-ctype"]);
            console.log("decode error", error);
            console.log(v, byteMethod, buf);
            return "0x" + v;
          }
        };
        break;
      case "float":
      case "uint32_t":
      case "int32_t":
      case "uint16_t":
      case "int16_t":
      case "uint8_t":
      case "int8_t":
        byteMethod = readMethodMap[paramsMap[c["x-id"]].schema["x-ctype"]];
        paramsMap[c["x-id"]].transform = (v) => {
          let buf = Buffer.from(v, "hex");
          try {
            return buf[byteMethod]();
          } catch (error) {
            console.log(paramsMap[c["x-id"]].schema["x-ctype"]);
            console.log("decode error", error);
            console.log(v, byteMethod, buf);
            return "0x" + v;
          }
        };
        break;
      case "bool":
        paramsMap[c["x-id"]].transform = (v) => {
          return v === "01";
        };
        break;
      case "string":
      default:
        paramsMap[c["x-id"]].transform = (v) => {
          return v;
        };
        break;
    }
  }
  return paramsMap;
}

const internalDecode = function (thingType, apiVersion, fileString) {
  fileString = fileString.split("\n");

  let paramsMap = parseParamsFile(thingType, apiVersion);
  let jsonResult = {};

  fileString.forEach((kv) => {
    let kvPair = kv.split("=");
    let id = -1;
    try {
      id = parseInt(kvPair[0], 16);
    } catch (error) {}

    if (kvPair.length === 2 && !isNaN(id)) {
      if (kvPair[1] === "null") {
        jsonResult[kvPair[0]] = null;
        return;
      }
      let m = paramsMap[id];
      if (m) {
        if (parseFloat(apiVersion) > 1.9) {
          jsonResult[snakeToCamel(m.name)] = m.transform(kvPair[1]);
        } else {
          jsonResult[m.name] = m.transform(kvPair[1]);
        }
      } else {
        console.log("error", `Uknown Param ID ${kvPair[0]}`);
      }
    } else {
      console.log(`malformed line, skipping ${kv}`);
    }
  });
  return jsonResult;
};

const smpHeaderParser = new Parser()
  .endianess("big")
  .string("mgmtOp", {
    encoding: "hex",
    length: 1,
  })
  .string("flags", {
    encoding: "hex",
    length: 1,
  })
  .uint16("length")
  .uint16("group")
  .uint8("seq")
  .uint8("id");

function decode(thingType, apiVersion, payload) {
  // convert the hex string to a byte buffer
  let buf = Buffer.from(payload, "base64");
  // payload = buf.toString('utf8')

  // detect the smp header?
  let smpHeader;
  try {
    smpHeader = smpHeaderParser.parse(buf);
    if (parseInt(smpHeader.mgmtOp, 16) < 4) {
      buf = buf.slice(8);
      console.log("smpHeader\n", smpHeader);
    }
  } catch (error) {
    console.log("error", "no smpHeader?");
  }

  // detect cbor?
  try {
    let cborString = buf.toString("hex"),
      cborPayload,
      cborPayloadData;
    cborPayload = cbor.decodeAllSync(cborString);
    for (let i = 0; i < cborPayload.length; i++) {
      if (cborPayload[i] === "data") {
        cborPayloadData = cborPayload[i + 1];
        break;
      }
    }
    if (!cborPayloadData) {
      throw new Error("Not CBOR?");
    } else {
      payload = cborPayloadData.toString("utf8");
    }
  } catch (error) {
    payload = buf.toString("utf8");
    console.log("error", error.message);
  }
  let result = internalDecode(thingType, apiVersion, payload);
  return result;
}

module.exports = {
  decode,
  parseParamsFile,
};
