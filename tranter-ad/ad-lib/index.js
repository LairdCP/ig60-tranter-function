const { decode, decodeAds } = require("./decoder");

const { decodeFlags } = require("./decode-flags");
const fs = require("fs");

const AdTypesBT610 = JSON.parse(
  fs.readFileSync(__dirname + "/BT6RecordTypes.json").toString()
);
const AdTypesBT510 = JSON.parse(
  fs.readFileSync(__dirname + "/BT5RecordTypes.json").toString()
);

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

function getType(type, productId) {
  if (productId === undefined) {
    throw new Error("productId is required");
  }

  if (productId === 1) {
    for (let k of AdTypesBT610.recordTypes) {
      if (k["x-id"] == type) {
        return k;
      }
    }
    throw new Error(`Uknown Event Type: ${type}`);
  }
  if (productId === 0) {
    for (let k of AdTypesBT510.recordTypes) {
      if (k["x-id"] == type) {
        return k;
      }
    }
    throw new Error(`Uknown Event Type: ${type}`);
  }
}

function getRecordFromAd(ad) {
  let response = {};
  let type = getType(ad.recordType, ad.productId);
  // TODO parse data based on type from AdType
  let buf = Buffer.from(ad.data, "hex");
  let byteMethod = readMethodMap[type.schema["x-ctype"]];
  response.key = type.name;
  response.value = buf[byteMethod]();
  return response;
}

function AdsToRecords(ads) {
  return ads
    .map((a) => {
      console.log(a);
      let type = getType(a.recordType, a.productId);
      return {
        Dimensions: [
          {
            Name: "deviceId",
            Value: a.mac,
          },
        ],
        MeasureName: type.name,
        MeasureType: "VARCHAR",
        MeasureValueType: a.data + "",
        Time: a.epoch,
        TimeUnit: "SECONDS",
      };
    })
    .filter((a) => {
      return a.MeasureName !== "reserved";
    });
}

module.exports = {
  AdsToRecords,
  getType,
  decode,
  decodeAds,
  decodeFlags,
  getRecordFromAd,
};
