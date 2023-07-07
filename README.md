### Hex Advert
[02010626FF][77000200][00000][3C03][2317A8D89F1][20][A712][D840A764][68E16341][00][0100][020003][00][00][000000][00][0E][09][436F6C645F5072657373757265]

### Data structure
> All data is little endian
02010626 - header
02: flags length, uint8
01: gapAdtypeFlags, uint8
06: gapAdtypeFlagsBredrNotSupported, uint8
26: length, uint8
FF: gapAdtypeManufacturerSpecific, uint8
7700: manufacturer Id, uint16
0200: protocol Id, uint16
0000: network Id, uint16
> see flags map below
03C0: flags, uint16
32317A8D89F1: device ID (bytes in reverse order), string

> (using the recordType lookup, this is int 32 which is pressure, pin2) refer to /tranter-ad/ad-lib/BT6RecordTypes.json
20: record type, uint8
A712: record number, uint16
D840A764: epoch (seconds), uint32

> record value data type is LE float, also in BT6RecordTypes.json, so this is 14.242530822753906
68E16341: record value (data), variable
00: resetCount, uint8
0100: product Id, uint16
020003: firmware version (major, minor, patch), uint8 x 3
00: firmware type, uint8
00: configVersion, uint8
000000: bootloader version (major, minor, patch), uint8 x 3
00: hardware version, uint8
0E: name length, uint8
09: full name (unsure what this means)
436F6C645F5072657373757265: name (ascii)

### flags bitmap
0: 'qrtcSet'
1: 'activeMode'
2: 'flagSet'
3: 'temperatureAlarm1State',
4: 'temperatureAlarm2State',
5: 'temperatureAlarm3State',
6: 'temperatureAlarm4State',
7: 'batteryLowAlarm',
8: 'analogAlarm1State',
9: 'analogAlarm2State',
10:'analogAlarm3State',
11:'analogAlarm4State',
12:'digitalAlarm1State',
13:'digitalAlarm2State',
14:'tamperSwitchStatus',
15:'magnetState'


### Parsed data
```
  {
    "companyId1": 119,
    "companyId2": 0,
    "protocolId": 2,
    "networkId": 0,
    "flags": 49155,
    "mac": "32317a8d89f1",
    "recordType": 32,
    "recordNumber": 4775,
    "epoch": 1688682712,
    "data": "68e16341",
    "resetCount": 0,
    "rssi": "-35",
    "observedMac": "01F1898D7A3132",
    "productId": 1,
    "firmwareVersion": "2.0.3",
    "firmwareType": 0,
    "configVersion": 0,
    "bootLoaderVersion": "0.0.0",
    "hardwareVersion": 0,
    "nameLength": 14,
    "fullName": 9,
    "name": "Cold_Pressure",
    "thingTypeName": "BT610-Sensor",
    "decodedFlags": {
      "qrtcSet": true,
      "activeMode": true,
      "flagSet": false,
      "temperatureAlarm1State": false,
      "temperatureAlarm2State": false,
      "temperatureAlarm3State": false,
      "temperatureAlarm4State": false,
      "batteryLowAlarm": false,
      "analogAlarm1State": false,
      "analogAlarm2State": false,
      "analogAlarm3State": false,
      "analogAlarm4State": false,
      "digitalAlarm1State": false,
      "digitalAlarm2State": false,
      "tamperSwitchStatus": true,
      "magnetState": true
    },
    "record": {
      "key": "pressure2",
      "value": 14.242530822753906
    }
  }
```