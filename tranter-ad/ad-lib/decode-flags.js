const flagsEnum = {
  "BT610-Sensor": [
    "qrtcSet",
    "activeMode",
    "flagSet",
    "temperatureAlarm1State",
    "temperatureAlarm2State",
    "temperatureAlarm3State",
    "temperatureAlarm4State",
    "batteryLowAlarm",
    "analogAlarm1State",
    "analogAlarm2State",
    "analogAlarm3State",
    "analogAlarm4State",
    "digitalAlarm1State",
    "digitalAlarm2State",
    "tamperSwitchStatus",
    "magnetState",
  ],
  "BT510-Sensor": [
    "qrtcSet",
    "activeMode",
    "flagSet",
    "reserved",
    "reserved",
    "reserved",
    "reserved",
    "batteryLowAlarm",
    "temperatureAlarmHigh1",
    "temperatureAlarmHigh2",
    "temperatureAlarmLow1",
    "temperatureAlarmLow2",
    "temperatureAlarmDelta",
    "reserved",
    "movementAlarm",
    "magnetState",
  ],
};

module.exports.decodeFlags = (thingTypeName, flags) => {
  let flagJSON = {};
  if (!(thingTypeName in flagsEnum)) {
    throw new Error(
      `Error: Can't decode flags for unknown type: ${thingTypeName}`
    );
  }
  if (flags > 65536) {
    throw new Error(`Error: 2 flag byte is supported: ${thingTypeName}`);
  }
  flags = flags.toString(2).split("").reverse();

  // while (flags.length < 16) {
  //   flags.unshift("0");
  // }

  flagsEnum[thingTypeName].forEach((f, i) => {
    if (/^reserved/.test(f)) {
      return;
    }
    flagJSON[f] = flags[i] === "1";
  });
  return flagJSON;
};
