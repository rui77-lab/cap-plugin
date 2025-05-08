//const cds = require('@sap/cds')
const log = cds.log("eonid");

export async function trackInsertQuery(req) {

    for (let entry of req.query.INSERT?.entries) {
        if (entry.companycodeId) {
            const seqResult = await cds.run(`SELECT "${entry.companycodeId}_seq".NEXTVAL as ID FROM DUMMY`);
            entry.companycodeId += seqResult[0].ID;
        }
    }

    log.debug(`Processed insert for entity ${req.entity}`)
}