const APIS = '/apis'
const LOCALURL = '/apis/apply/msgMobile.php'
//const APIS = ''
//const LOCALURL = ''

const URL = {
    apis:APIS,
    base:LOCALURL,
    getList:LOCALURL + '?op=get_list',  //获取列表数据
    insertData:LOCALURL + '?op=insertData',  //提交留言
}

module.exports = URL