var express = require('express');
var router = express.Router();
var demo = require('./../lib/QueryString');
demo.buildDb();
/* GET home page. */
router.get('/', function (req, res, next) {
    let callback = req.query.callback;
    demo.queryList().then(function (result) {
        if (callback) {
            res.type("text/javascript");
            var temp = {
                code: "200",
                data: result
            };
            res.send(callback + '(' + JSON.stringify(temp) + ')');
        } else {
            res.json(result);
        }
    }).catch(function (err) {
        throw err;
    });
});
module.exports = router;