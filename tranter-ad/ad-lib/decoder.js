const Parser = require("binary-parser").Parser;

let OneMPhyResponse = new Parser()
  .endianess("little")
  .seek(2)
  // .uint8('length')
  // .uint8('GAP_ADTYPE_MANUFACTURER_SPECIFIC')
  .uint8("companyId1")
  .uint8("companyId2")
  .uint16("protocolId")
  .uint16("productId")
  .array("firmwareVersion", {
    type: "uint8",
    lengthInBytes: 3,
  })
  .uint8("firmwareType")
  .uint8("configVersion")
  .array("bootLoaderVersion", {
    type: "uint8",
    lengthInBytes: 3,
  })
  .uint8("hardwareVersion")
  .uint8("nameLength")
  .uint8("fullName")
  .string("name", {
    encoding: "utf8",
    length: function () {
      return this.nameLength - 1;
    },
  });

let CodedPhy = new Parser()
  .endianess("little")
  .uint16("productId")
  .array("firmwareVersion", {
    type: "uint8",
    lengthInBytes: 3,
  })
  .uint8("firmwareType")
  .uint8("configVersion")
  .array("bootLoaderVersion", {
    type: "uint8",
    lengthInBytes: 3,
  })
  .uint8("hardwareVersion")
  .uint8("nameLength")
  .uint8("fullName")
  .string("name", {
    encoding: "utf8",
    length: function () {
      return this.nameLength - 1;
    },
  });

const RepeatedAdParser = new Parser()
  .endianess("little")
  .uint8("length")
  .uint8("type")
  .uint8("companyId1")
  .uint8("companyId2")
  .uint16("protocolId")
  .uint8("repeatHeaderLength")
  .choice("repeatHeader", {
    tag: "repeatHeaderLength",
    choices: {
      0: new Parser(), // legacy BT510
      1: new Parser(), // legacy BT510
      2: new Parser().uint8("currentTtlCount"),
      3: new Parser().uint8("currentTtlCount").uint8("maxTtlCount"),
    },
  })
  .uint16("networkId")
  .uint16("flags")
  .string("mac", {
    encoding: "hex",
    length: 6,
  })
  .uint8("recordType")
  .uint16("recordNumber")
  .uint32("epoch")
  .string("data", {
    encoding: "hex",
    length: 4,
  })
  .uint8("resetCount")

  // if this is 1M with response or codedPhy
  // amend the protocolData to the parser
  .choice("protocolData", {
    tag: "protocolId",
    choices: {
      80: OneMPhyResponse, // legacy BT510
      81: OneMPhyResponse,
      82: CodedPhy,
    },
  });
const AdParser = new Parser()
  .endianess("little")
  .seek(5)
  // .uint8('length')
  // .uint8('GAP_ADTYPE_FLAGS')
  // .uint8('GAP_ADTYPE_FLAGS_BREDR_NOT_SUPPORTED')
  // .uint8('length')
  // .uint8('GAP_ADTYPE_MANUFACTURER_SPECIFIC')
  .uint8("companyId1")
  .uint8("companyId2")
  .uint16("protocolId")
  .uint16("networkId")
  .uint16("flags")
  .string("mac", {
    encoding: "hex",
    length: 6,
  })
  .uint8("recordType")
  .uint16("recordNumber")
  .uint32("epoch")
  .string("data", {
    encoding: "hex",
    length: 4,
  })
  .uint8("resetCount")

  // if this is 1M with response or codedPhy
  // amend the protocolData to the parser
  .choice("protocolData", {
    tag: "protocolId",
    choices: {
      0: OneMPhyResponse, // legacy BT510
      1: OneMPhyResponse,
      2: CodedPhy,
    },
  });

const postProcessAd = (ad) => {
  for (let k in ad.protocolData) {
    ad[k] = ad.protocolData[k];
  }
  delete ad.protocolData;

  ad.firmwareVersion = ad.firmwareVersion.join(".");
  ad.bootLoaderVersion = ad.bootLoaderVersion.join(".");

  switch (ad.productId) {
    case 0:
      ad.thingTypeName = "BT510-Sensor";
      break;
    case 1:
      ad.thingTypeName = "BT610-Sensor";
      break;
    default:
      ad.thingTypeName = "Unknown-Sensor";
  }

  return ad;
};

module.exports.decodeAds = (apiVersion, payloads) => {
  let result = [];
  payloads.forEach((payload) => {
    try {
      console.log("decoding", payload);
      ad = module.exports.decode(apiVersion, payload);
      result.push(ad);
    } catch(error) {
      console.error(error)  
    }
  });
  return result;
};

module.exports.decode = (apiVersion, payload) => {
  let result;

  let adBytes = Buffer.from(payload.bytes, "hex");
  result = AdParser.parse(adBytes);
  result.rssi = payload.rssi;
  result.observedMac = payload.mac;

  return postProcessAd(result);
};
