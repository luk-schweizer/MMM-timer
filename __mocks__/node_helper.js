const NodeHelper = {
  create: jest.fn((moduleDefinition)=>{
    moduleDefinition.name = 'MMM-timer';
    moduleDefinition.sendSocketNotification = jest.fn((notification, payload)=>{});
    return moduleDefinition;
  }),
};

module.exports = NodeHelper;
