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
        selectPersonal: "select * from personal limit 6",
        selectPersonalAll: "select * from personal",
        selectOtherTopSix: "select * from othercontent limit 6",
        selectBySearchText:"SELECT * FROM personal WHERE LOCATE(?, `title`)>0 or LOCATE(?, `description`)>0",
        selectParentBySearchText:"SELECT * FROM othercontent WHERE LOCATE(?, `title`)>0 or LOCATE(?, `description`)>0",
        selectChildBySearchText:"SELECT * FROM childcontent WHERE LOCATE(?, `title`)>0 or LOCATE(?, `description`)>0",
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
        return new Promise(function (resolve, reject) {
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
                        promiseList.push(new Promise(function (resolve, reject) {
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
                                resolve("data");
                            });
                        }));
                    } else {
                        obj.hasChild = false;
                        allList.push(obj);
                    }
                }
                Promise.all(promiseList).then(function (reslut) {
                    resolve(allList);
                });
            });
        });
    },
    queryChildList: function (parentId, childId) {
        var connection = this.connection;
        var selectParent = this.selectString.selectParentContent;
        var selectChild = this.selectString.selectChildContent;
        return new Promise(function (resolve, reject) {
            var promiseList = [];
            var data = {};
            promiseList.push(new Promise(function (resolve, reject) {
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
                    resolve(err);
                });
            }));
            promiseList.push(new Promise(function (resolve, reject) {
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
                    resolve();
                });
            }));
            Promise.all(promiseList).then(function (demo) {
                resolve(data);
            }).catch(function (err) {
                reject(err);
            });
        });
    },
    queryParentList: function (parentId) {
        var connection = this.connection;
        var selectParent = this.selectString.selectParentContent;
        return new Promise(function (resolve, reject) {
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
                resolve(parentData);
            });
        });
    },
    queryPersonalList: function (which) {
        var connection = this.connection;
        var sql = "";
        if (which == "all") {
            sql =  this.selectString.selectPersonalAll;
        } else {
            sql = this.selectString.selectPersonal;
        }
        return new Promise(function (resolve, reject) {
            connection.query(sql, function (err, result) {
                var list = [];
                if (err) {
                    reject(err);
                }
                for (let i = 0; i < result.length; i++) {
                    var obj = {};
                    obj.title = result[i].title;
                    obj.description = result[i].description;
                    obj.href = result[i].href;
                    obj.background_path = result[i].background_path;
                    var date = new Date(result[i].create_time);
                    obj.create_time = date.toDateString();
                    list.push(obj);
                }
                resolve(list);
            });
        });
    },
    queryOtherTopSix: function () {
        var connection = this.connection;
        var sql = this.selectString.selectOtherTopSix;
        return new Promise(function (resolve, reject) {
            connection.query(sql, function (err, result) {
                var list = [];
                if (err) {
                    reject(err);
                }
                for (let i = 0; i < result.length; i++) {
                    var obj = {};
                    obj.title = result[i].title;
                    obj.description = result[i].description;
                    obj.href = result[i].href;
                    obj.background_path = result[i].background_path;
                    list.push(obj);
                }
                resolve(list);
            });
        });
    },
    queryDataBySearchText: function (searchText) {
        let connection = this.connection;
        let sql = this.selectString.selectBySearchText;
        let sqlParent = this.selectString.selectParentBySearchText;
        let sqlChild = this.selectString.selectChildBySearchText;
        return new Promise(function (resolve, reject) {
            var data = {};
            data.otherContent = [];
            var promiseList = [];
            promiseList.push(new Promise(function (resolve,reject) {
                connection.query(sql, [searchText,searchText], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    var personContent = [];
                    for (let i = 0;i<result.length;i++) {
                        var obj = {};
                        for (var key in result[i]) {
                            obj[key] = result[i][key];
                        }
                        personContent.push(obj);
                    }
                    data.personContent = personContent;
                    resolve();
                });
            }));
            promiseList.push(new Promise(function (resolve, reject) {
                connection.query(sqlParent, [searchText,searchText], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    for (let i = 0;i<result.length;i++) {
                        var obj = {};
                        for (var key in result[i]) {
                            obj[key] = result[i][key];
                        }
                        data.otherContent.push(obj);
                    }
                    resolve();
                });
            }));
            promiseList.push(new Promise(function (resolve, reject) {
                connection.query(sqlChild, [searchText,searchText], function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    for (let i = 0;i<result.length;i++) {
                        var obj = {};
                        for (var key in result[i]) {
                            obj[key] = result[i][key];
                        }
                        data.otherContent.push(obj);
                    }
                    resolve();
                });
            }));
            Promise.all(promiseList).then(function () {
                resolve(data);
            });
        });
    }
};
module.exports = temp;