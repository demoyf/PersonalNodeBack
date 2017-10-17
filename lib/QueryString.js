/**
 * Created by alone on 2017/9/30.
 */
var mysql = require('mysql');
let Promise = require('bluebird');
var temp = {
    connection: null,
    dbOption: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '960412',
        database: 'person'
    },
    selectString: {
        selectTitle: 'select * from otherhead',
        selectChildTitle: "select * from childhead where p_id = ?",
        selectParentContent: "select * from othercontent where other_id = ?",
        selectChildContent: "select * from childcontent where c_id = ?",
    },
    buildDb: function () {
        this.connection = mysql.createConnection(this.dbOption);
        this.connection.connect(function (err) {
            if (err) {
                throw err;
            }
        });
        this.connection.on("error", function () {
            this.buildDb();
        });
    },
    queryList: function () {
        var connection = this.connection;
        if (connection == null) {
            throw new Error("show build db first");
        }
        var list = [];
        var selectTitle = this.selectString.selectTitle;
        var selectChildTitle = this.selectString.selectChildTitle;
        return new Promise(function (reslove, reject) {
            var allList = [];
            var promiseList = [];
            connection.query(selectTitle, function (err, result) {
                if (err) {
                    reject("error");
                }
                for (let i = 0; i < result.length; i++) {
                    let temp = result[i];
                    let obj = {};
                    obj.title = temp.title;
                    obj.id = temp.id;
                    if (temp.has_child == 1) {
                        promiseList.push(new Promise(function (reslove, reject) {
                            connection.query(selectChildTitle, [temp.id], function (err, result) {
                                if (err) {
                                    reject();
                                }
                                let myObj = [];
                                for (let j = 0; j < result.length; j++) {
                                    let demoTemp = {};
                                    demoTemp.title = result[j].title;
                                    demoTemp.id = result[j].id;
                                    myObj.push(demoTemp);
                                }
                                obj.hasChild = true;
                                obj.childList = myObj;
                                allList.push(obj);
                                reslove("data");
                            });
                        }));
                    } else {
                        obj.hasChild = false;
                        allList.push(obj);
                    }
                }
                Promise.all(promiseList).then(function (reslut) {
                    reslove(allList);
                });
            });
        });
    },
    queryChildList: function (parentId, childId) {
        var connection = this.connection;
        var selectParent = this.selectString.selectParentContent;
        var selectChild = this.selectString.selectChildContent;
        return new Promise(function (reslove, reject) {
            var promiseList = [];
            var data = {};
            promiseList.push(new Promise(function (reslove, reject) {
                connection.query(selectParent, [parentId], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    var parentData = [];
                    for (let i = 0; i < result.length; i++) {
                        var obj = {
                            title: result[i].title,
                            href: result[i].href,
                            description: result[i].description,
                            background: result[i].background_path
                        };
                        parentData.push(obj);
                    }
                    data.parentData = parentData;
                    reslove(err);
                });
            }));
            promiseList.push(new Promise(function (reslove, reject) {
                connection.query(selectChild, [childId], function (err, result) {
                    if (err) {
                        reject();
                    }
                    var childData = [];
                    for (let i = 0; i < result.length; i++) {
                        var obj = {
                            title: result[i].title,
                            href: result[i].href,
                            description: result[i].description,
                            background: result[i].background_path
                        };
                        childData.push(obj);
                    }
                    data.childData = childData;
                    reslove();
                });
            }));
            Promise.all(promiseList).then(function (demo) {
                reslove(data);
            }).catch(function (err) {
                reject(err);
            });
        });
    },
    queryParentList: function (parentId) {
        var connection = this.connection;
        var selectParent = this.selectString.selectParentContent;
        return new Promise(function (reslove, reject) {
            connection.query(selectParent, [parentId], function (err, result) {
                if (err) {
                    reject(err);
                }
                var parentData = [];
                for (let i = 0; i < result.length; i++) {
                    var obj = {
                        title: result[i].title,
                        href: result[i].href,
                        description: result[i].description,
                        background: result[i].background_path
                    };
                    parentData.push(obj);
                }
                reslove(parentData);
            });
        });
    }
};
module.exports = temp;