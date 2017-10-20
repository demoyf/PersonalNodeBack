/**
 * Created by alone on 2017/10/20.
 */
let Service = require('node-windows').Service;
let path = require('path');
let svc = new Service({
    name:'personal_collection',
    description:'个人作品服务端',
    script:path.resolve('./www'),
});
svc.on('install', () => {
    svc.start();
});
svc.install();