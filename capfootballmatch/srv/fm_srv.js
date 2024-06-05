const cds = require('@sap/cds')

module.exports = class FootballMatchService extends cds.ApplicationService { init(){
    // this.before ('NEW','Authors', genid)
    // this.before ('NEW','Books', genid)
    return super.init()
  }}