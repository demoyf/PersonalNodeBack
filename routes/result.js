/**
 * Created by alone on 2017/10/17.
 */
var express = require('express');
var router = express.Router();
var demo = require('./../lib/QueryString');
demo.buildDb();
router.get('/child', function (req, res, next) {
    let parentId = req.query.parentId;
    let childId = req.query.childId;
    let callback = req.query.callback;
    console.log(parentId);
    demo.queryChildList(parentId, childId).then(function (result) {
        if (callback) {
            res.type("text/javascript");
            var temp = {
                code: 456,
                data: result
            };
            console.log(temp);
            res.send(callback + '(' + JSON.stringify(temp) + ')');
        } else {
            res.json(result);
        }
    }).catch(function (err) {
        throw err;
    });
});
router.get('/parent', function (req, res, next) {
    let parentId = req.query.parentId;
    let callback = req.query.callback;
    demo.queryParentList(parentId).then(function (result) {
        if (callback) {
            res.type("text/javascript");
            var temp = {
                code: 123,
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