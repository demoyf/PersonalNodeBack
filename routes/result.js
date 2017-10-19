/**
 * Created by alone on 2017/10/17.
 */
var express = require('express');
var router = express.Router();
var demo = require('./../lib/QueryString');
router.get('/child', function (req, res, next) {
    let parentId = req.query.parentId;
    let childId = req.query.childId;
    let callback = req.query.callback;
    demo.queryChildList(parentId, childId).then(function (result) {
        if (callback) {
            res.type("text/javascript");
            console.log(result);
            var temp = {
                code: 456,
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
router.get('/person', function (req, res, next) {
    let callback = req.query.callback;
    var obj = {};
    demo.queryPersonalList().then(function (result) {
        obj.personal = result;
        demo.queryOtherTopSix().then(function (data) {
            obj.otherContent = data;
            if (callback) {
                res.type("text/javascript");
                var temp = {
                    code: 200,
                    data: obj
                };
                res.send(callback + '(' + JSON.stringify(temp) + ')');
            } else {
                res.json(obj);
            }
        }).catch(function (err) {
            throw err;
        });
    }).catch(function (err) {
        throw err;
    });
});
router.get('/allPersonal', function (req, res, next) {
    let callback = req.query.callback;
    demo.queryPersonalList("all").then(function (result) {
        if (callback) {
            res.type("text/javascript");
            var temp = {
                code: 789,
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
router.get('/search', function (req, res, next) {
    var searchText = req.query.searchText;
    var callback = req.query.callback;
    if (!searchText) {
        searchText = '动画';
    }
    demo.queryDataBySearchText(searchText).then(function (result) {
        if (callback) {
            res.type("text/javascript");
            var temp = {
                code: 200,
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