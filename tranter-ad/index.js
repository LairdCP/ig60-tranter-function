
/*
Converts

["01DEA6F6C0CB2C", "0201061BFF77000100000006802CCBC0F6A6DE01510181340B610D0800000010FFE4000300000003000700020100070006094254353130", "-43", ""]

To

{
  companyId1: 228,
  companyId2: 0,
  protocolId: 3,
  networkId: 0,
  flags: 32774,
  mac: '2ccbc0f6a6de',
  recordType: 1,
  recordNumber: 337,
  epoch: 1628124289,
  data: '0d080000',
  resetCount: 0,
  productId: 0,
  firmwareVersion: '3.0.7',
  firmwareType: 0,
  configVersion: 2,
  bootLoaderVersion: '1.0.7',
  hardwareVersion: 0,
  nameLength: 6,
  fullName: 9,
  name: 'BT510',
  thingTypeName: 'BT510-Sensor',
  decodedFlags: {
    qrtcSet: false,
    activeMode: true,
    flagSet: true,
    batteryLowAlarm: false,
    temperatureAlarmHigh1: false,
    temperatureAlarmHigh2: false,
    temperatureAlarmLow1: false,
    temperatureAlarmLow2: false,
    temperatureAlarmDelta: false,
    movementAlarm: false,
    magnetState: true
  },
  record: { key: 'temperature', value: 2061 }
  rssi: -43,
  observedMac: '01DEA6F6C0CB2C'
}
*/

const adLib = require("./ad-lib");

module.exports = function (context, IoTHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array: ${IoTHubMessages}`);
    
    const jsonAds = []
    IoTHubMessages.forEach(message => {
      let ads;
      try {
        message = JSON.parse(message);
      } catch (error) {
        console.error(error)
        return;
      }

      if ('igState' in message) {
        // handle ig sensor state
        console.log(message)
      } else {
        // convert the nested arrays to an array of objects
        jsonAds.push(...message.map((a) => {
          return {
            mac: a[0],
            bytes: a[1],
            rssi: a[2],
            type: a[3]
          }
        }));

        console.log(`Processed message: ${jsonAds.length}`);
      }
    });

    if (jsonAds) {
      // decode all the advertisements to the JSON schema
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
    }
    context.done();
};
