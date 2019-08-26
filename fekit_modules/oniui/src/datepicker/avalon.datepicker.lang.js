module.exports = (
function () {
    var HolidayStyle = {
            '\u5143\u65E6\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_yuandan',
                'holidayText': '\u5143\u65E6'
            },
            '\u9664\u5915': {
                'afterTime': 0,
                'beforeTime': 0,
                'dayIndex': 0,
                'holidayClass': 'c_chuxi',
                'holidayText': '\u9664\u5915'
            },
            '\u6625\u8282': {
                'afterTime': 0,
                'beforeTime': 0,
                'dayIndex': 0,
                'holidayClass': 'c_chunjie',
                'holidayText': '\u6625\u8282'
            },
            '\u5143\u5BB5\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_yuanxiao',
                'holidayText': '\u5143\u5BB5'
            },
            '\u6E05\u660E\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_qingming',
                'holidayText': '\u6E05\u660E'
            },
            '\u52B3\u52A8\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_wuyi',
                'holidayText': '\u52B3\u52A8'
            },
            '\u7AEF\u5348\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_duanwu',
                'holidayText': '\u7AEF\u5348'
            },
            '\u4E2D\u79CB\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_zhongqiu',
                'holidayText': '\u4E2D\u79CB'
            },
            '\u56FD\u5E86\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_guoqing',
                'holidayText': '\u56FD\u5E86'
            },
            '\u5723\u8BDE\u8282': {
                'afterTime': 3,
                'beforeTime': 3,
                'dayIndex': 0,
                'holidayClass': 'c_shengdan',
                'holidayText': '\u5723\u8BDE'
            }
        };
    var HolidayData = {
            '2014-01-01': { 'holidayName': '\u5143\u65E6\u8282' },
            '2014-01-30': { 'holidayName': '\u9664\u5915' },
            '2014-01-31': { 'holidayName': '\u6625\u8282' },
            '2014-02-01': { 'holidayName': '\u6B63\u6708\u521D\u4E8C' },
            '2014-02-02': { 'holidayName': '\u6B63\u6708\u521D\u4E09' },
            '2014-02-14': { 'holidayName': '\u5143\u5BB5\u8282' },
            '2014-04-05': { 'holidayName': '\u6E05\u660E\u8282' },
            '2014-05-01': { 'holidayName': '\u52B3\u52A8\u8282' },
            '2014-06-01': { 'holidayName': '\u513F\u7AE5\u8282' },
            '2014-06-02': { 'holidayName': '\u7AEF\u5348\u8282' },
            '2014-09-08': { 'holidayName': '\u4E2D\u79CB\u8282' },
            '2014-09-10': { 'holidayName': '\u6559\u5E08\u8282' },
            '2014-10-01': { 'holidayName': '\u56FD\u5E86\u8282' },
            '2014-12-25': { 'holidayName': '\u5723\u8BDE\u8282' },
            '2015-01-01': { 'holidayName': '\u5143\u65E6\u8282' },
            '2015-02-18': { 'holidayName': '\u9664\u5915' },
            '2015-02-19': { 'holidayName': '\u6625\u8282' },
            '2015-02-20': { 'holidayName': '\u6B63\u6708\u521D\u4E8C' },
            '2015-02-21': { 'holidayName': '\u6B63\u6708\u521D\u4E09' },
            '2015-03-05': { 'holidayName': '\u5143\u5BB5\u8282' },
            '2015-04-05': { 'holidayName': '\u6E05\u660E\u8282' },
            '2015-05-01': { 'holidayName': '\u52B3\u52A8\u8282' },
            '2015-06-01': { 'holidayName': '\u513F\u7AE5\u8282' },
            '2015-06-20': { 'holidayName': '\u7AEF\u5348\u8282' },
            '2015-09-27': { 'holidayName': '\u4E2D\u79CB\u8282' },
            '2015-10-01': { 'holidayName': '\u56FD\u5E86\u8282' },
            '2015-12-25': { 'holidayName': '\u5723\u8BDE\u8282' }
        };
    for (var x in HolidayData) {
        if (HolidayData.hasOwnProperty(x)) {
            var data = HolidayData[x], name = data.holidayName;
            if (name && HolidayStyle[name]) {
                var style = HolidayStyle[name];
                for (var y in style) {
                    if (style.hasOwnProperty(y) && !(y in data)) {
                        data[y] = style[y];
                    }
                }
            }
        }
    }
    return HolidayData;
}
)();