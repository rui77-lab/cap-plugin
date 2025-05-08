const cds = require('@sap/cds');

const log = cds.log("eonid");
const { fs, path } = cds.utils

const { trackInsertQuery } = require('./lib/trackInsert');

// requires @sap/cds-dk version >= 7.5.0
cds.build?.register?.('eonid', class EonIdPlugin extends cds.build.Plugin {

    static taskDefaults = { src: cds.env.folders.db }

    //run build plugin only and only if theres at least one company code configured in the package.json
    static hasTask() { return cds.env.eonid_plg?.companycodes.length > 0 }

    init() {
        //REVISIT: Will this work for build in Java projects?
        const destinationFolder = cds.env.eonid_plg?.destFolder || 'sequencesfolder';

        this.task.dest = path.join(cds.root, 'gen', 'db', 'src', destinationFolder);
    }
    async build() {
        const promises = [];

        if (cds.env.eonid_plg?.companycodes) {
            cds.env.eonid_plg?.companycodes.filter(companyCode => companyCode.length == 4).forEach(companyCode => {
                log.info(`Create sequence for company code ${companyCode}`);
                promises.push(this.write(`SEQUENCE "${companyCode}_seq" START WITH 1 INCREMENT BY 1 MINVALUE 1 NO CYCLE NO MAXVALUE`).to(path.join(`${companyCode}_seq.hdbsequence`)));
            });
        }
        return Promise.all(promises);
    }
});

function trackEntity(entity) {
    return entity.includes?.includes('com.eon.plugins.eonid');
}

function registerHandlers() {
    for (const srv of cds.services) {
        for (const entity of Object.values(srv.entities)) {
            if (trackEntity(entity)) {
                cds.db.before("CREATE", entity, trackInsertQuery);
            }
        }
    }
}

cds.on('served', registerHandlers);