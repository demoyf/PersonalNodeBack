/**
 * Created by alone on 2017/9/26.
 */
var cheerio = require('cheerio');
var fs = require('fs');
var mysql = require('mysql');
var connectionOption = {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '960412',
    database: 'person'
};
var SQLString = {
    insertString: {
        insertToOtherParent: 'insert into otherhead(title,has_child) values (?,?)',
        insertToOtherChild: 'insert into childhead(p_id,title) values (?,?)',
        insertToOtherChildContent: 'insert into childcontent(c_id,title,href,description,background_path) value(?,?,?,?,?)',
        insertToOtherContent: 'insert into othercontent(other_id,title,description,background_path,href) values(?,?,?,?,?)',
    }
};
var connection = mysql.createConnection(connectionOption);
connection.connect(function (err) {
    if (err) {
        console.log("error");
    } else {
        readStream();
    }
});
function parseHtml(html) {
    var $ = cheerio.load(html);
    var dtList = $('body > dl > dt > dl').children("dt");
    var result = getObject($, dtList);
    insertData(result);
}
function getObject($, dlList) {
    var listObject = [];
    var count = 1;
    dlList.each(function () {
        var title = $(this).children("h3").text();
        var temp = $(this).children("dl");
        var childDt = temp.children("dt");
        var childDd = temp.children("dd");
        var obj = {};
        obj.title = title;
        var listChild = [];
        childDt.each(function (index) {
            var childObj = {};
            if ($(this).children("dl").length == 0) {
                var aEle = $(this).children("a");
                childObj.title = aEle.text();
                childObj.href = aEle.attr("href");
                childObj.description = myTrim(childDd.eq(index).text());
            }
            else {
                var demo = getObject($, $(this));
                if (demo != null && demo.length != 0) {
                    childObj.childObj = demo[0];
                    obj.hasChildObj = true;
                }
            }
            listChild.push(childObj);
        });
        obj.childList = listChild;
        listObject.push(obj);
    });
    return listObject;
}
function myTrim(text) {
    text = text.trim();
    text = text.replace(/[\n]/, "");
    text = text.replace(/\s/g, "");
    return text;
}
function readStream() {
    var readStream = fs.createReadStream("./../src/Bookmarks.htm");
    var html = "";
    readStream.on("data", function (chunk) {
        html += chunk;
    });
    readStream.on("end", function () {
        parseHtml(html);
    });
}
function insertData(result) {
    for (let i = 0; i < result.length; i++) {
        let temp = result[i];
        let title = temp.title;
        let childList = temp.childList;
        connection.query(SQLString.insertString.insertToOtherParent, [title, temp.hasChildObj ? 1 : 0], function (err, result) {
            if (err) {
                throw err;
            }
            let parentId = result.insertId;
            for (let j = 0; j < childList.length; j++) {
                let child = childList[j];
                if (child.childObj == null) {
                    connection.query(SQLString.insertString.insertToOtherContent,
                        [parentId, child.title, child.description.length ? child.description.substr(0, 255) : child.description,
                            '', child.href.length > 255 ? child.href.substr(0, 255) : child.href], function (err, result) {
                            if (err) {
                                throw err;
                            }
                        });
                } else {
                    var demo = child.childObj;
                    insertChildObject(parentId, demo);
                }
            }
        });
    }
}
function insertChildObject(parentId, childObj) {
    let title = childObj.title;
    let list = childObj.childList;
    connection.query(SQLString.insertString.insertToOtherChild, [parentId, title], function (err, result) {
        if (err) {
            throw err;
        }
        let demoId = result.insertId;
        for (let j = 0; j < list.length; j++) {
            let child = list[j];
            connection.query(SQLString.insertString.insertToOtherChildContent,
                [demoId, child.title, child.href.length > 255 ? child.href.substr(0, 255) : child.href,
                    child.description.length ? child.description.substr(0, 255) : child.description, ''], function (err, result) {
                    if (err) {
                        throw err;
                    }
                });
        }
    });
}