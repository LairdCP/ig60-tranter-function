/*

Run this file at the command line with the following arguments:
node decode <path to json file>

will print out the decoded ads and write them to a file with a timestamp

*/

const fs = require('fs');
const adLib = require("./ad-lib");

const jsonInput = fs.readFileSync(process.argv[2])
const message = JSON.parse(jsonInput);
const jsonAds = []

jsonAds.push(...message.body.map((a) => {
  return {
    mac: a[0],
    bytes: a[1],
    rssi: a[2],
    type: a[3]
  }
}));

const DecodedAds = adLib.decodeAds('1', jsonAds);

DecodedAds.forEach((ad) => {
  // decode the flags byte
  ad.decodedFlags = adLib.decodeFlags(
    ad.thingTypeName,
    ad.flags
  );

  // identify the record type (reading)
  ad.record = adLib.getRecordFromAd(ad);

})
console.log(DecodedAds);

fs.writeFileSync(`${Date.now()}_parsed_${process.argv[2]}`, JSON.stringify(DecodedAds, null, 2));
