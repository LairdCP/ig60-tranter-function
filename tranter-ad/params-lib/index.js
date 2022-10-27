const { encode } = require("./encoder");
const { decode } = require("./decoder");
const shared = require("./shared");

function getNameById(thingType, apiVersion, id) {
  let paramsFile = shared.loadParamsFile(thingType, apiVersion);

  for (let index in paramsFile.components.contentDescriptors.deviceParams["x-deviceparameters"]) {
    let c = paramsFile.components.contentDescriptors.deviceParams["x-deviceparameters"][index];

    if (c["x-id"] === id) {
      return c.name;
    }
  }
}

module.exports = {
  encode,
  decode,
  getNameById,
};
