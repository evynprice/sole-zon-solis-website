require('dotenv').config();
const net = require('net');
var tcpp = require('tcp-ping');

// https://stackoverflow.com/questions/10723393/nodejs-pinging-ports
function checkFTP(callback) {
    tcpp.probe(process.env.FTP_HOST, process.env.FTP_PORT, function(err, available) {
        if (err) {
            return callback(false)
        }
        if (available) {
            return callback(true)
        }
        return callback(false)
    });
}

function checkAD(callback) {
    tcpp.probe(process.env.AD_IP, process.env.AD_PORT, function(err, available) {
        if (err) {
            return callback(false)
        }
        if (available) {
            return callback(true)
        }
        return callback(false)
    });
}

// https://stackoverflow.com/questions/10723393/nodejs-pinging-ports
class ServiceMonitor {
    constructor( services){
        this.services = services
    }
    async monitor  () {
        let status = {
            url  : {},
            alias: {}
        }
        for ( let service of this.services ) {
            let isAlive = await this.ping ( service )
            status.url  [ `${service.address}:${service.port}` ] = isAlive
            status.alias[ service.service                      ] = isAlive
        }
        return status
    }
    ping ( connection ) {
        return new Promise ( ( resolve, reject )=>{
            const tcpp = require('tcp-ping');
            tcpp.ping( connection,( err, data)=> {
                let error = data.results [0].err            
                if ( !error ) {
                    resolve ( true )
                }
                if ( error ) {
                    resolve ( false )
                }
            });
        })        
    }
}

async function monitor () {
    let services = [
        {
            service : "task_ftp",
            address : "10.0.22.73",
            port    : 21,
            timeout : 3000,
            attempts: 1
        },
        {
            service : "task_ad_dc",
            address : "10.0.22.73",
            port    : 389,
            timeout : 3000,
            attempts: 1
        },
        {
            service : "task_smtp",
            address : "10.0.22.73",
            port    : 25,
            timeout : 3000,
            attempts: 1
        },
        {
            service : "task_imap",
            address : "10.0.22.73",
            port    : 143,
            timeout : 3000,
            attempts: 1
        }
    ],
    status = await new ServiceMonitor (services).monitor()
    console.log(status)
    return status
}

module.exports = { checkFTP, checkAD, monitor };