// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function(fmt)
{ //author: meizz
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}

function addZero2(d){
  if( d < 10) {
    return "0" + d;
  }else{
    return d;
  }
}
Date.getCurrentTimeStr = function getCurrentTimeStr(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    var t = yyyy+"-"+mm+"-"+dd+" "+ addZero2(today.getHours())+":"+addZero2(today.getMinutes())+":"+addZero2(today.getSeconds());
    return t;
};

/**
fn = Math.ceiling / Math.floor
**/
Date.prototype.toIntDay = function timestampToIntDay(fn) {
    //console.log("[timestampToIntDay] ts=" + ts);
    var day = (this / 1000 / 60 / 60 + 8) / 24;
    //console.log("[timestampToIntDay] day=" + day);
    if( fn ) {
        //从 epoch + 8小时开始（因为中国的时区有8小时偏移）
        var ret = fn( day );
        //console.log("[timestampToIntDay] ret=" + ret);
        return ret;
    }else{
        var ret = Math.floor( day );
        //console.log("[timestampToIntDay] ret=" + ret);
        return ret;
    }
}

Date.intDayToTs = function intDayToTs(intDay) {
    var ts = intDay * 1000 * 3600 * 24 - 8 * 3600 * 1000;
    return ts;
}

Date.intDayToDate = function intDayToDate(intDay) {
    var ts = Date.intDayToTs(intDay);
    return new Date(ts);
}

Date.intDayToDateStr = function intDayToDateStr(intDay) {
    var dt = Date.intDayToDate(intDay);
    //console.log("[intDayToDateStr] ts=" + ts);
    return dt.format("yyyy-MM-dd");
}

Date.intDayToDateStrShort = function intDayToDateStr(intDay) {
    var dt = Date.intDayToDate(intDay);
    //console.log("[intDayToDateStr] ts=" + ts);
    return dt.format("yyyyMMdd");
}

Date.intDayToMonthStr =  function intDayToMonthStr(intDay) {
    var dt = Date.intDayToDate(intDay);
    //console.log("[intDayToDateStr] ts=" + ts);
    return dt.format("yyyy-MM");
}

Date.intDayOfThisMonthFirstDay = function intDayOfThisMonthFirstDay(intDay){
    var d = Date.intDayToDate(intDay);
    d.setDate(1);
    return d.toIntDay();
}

Date.intDayOfLastMonthFirstDay = function intDayOfLastMonthFirstDay(intDay){
    var d = Date.intDayToDate(intDay);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d.toIntDay();
}

Date.intDayOfLastMonthLastDay = function intDayOfLastMonthLastDay(intDay){
  var d = Date.intDayToDate(intDay);
  d.setDate(0);
  return d.toIntDay();
}

Date.dateStrToIntDay = function dateStrToIntDay(dateStr){
  var tmpDate = dateStr + "T00:00:00+08:00";
  var dt = Date.parse(tmpDate);
  return new Date(dt).toIntDay();
}

//example:
//input: 2016-05-15
//output: 2016-05-16
Date.nextDateStr = function (dateStr) {
   var tmpDate = dateStr + "T00:00:00+08:00";
   var dt = Date.parse(tmpDate);
   return Date.intDayToDateStr(new Date(dt).toIntDay() + 1);
};

Date.yesterdayDateStr = function (){
    return Date.intDayToDateStr(new Date().toIntDay() - 1)
};

Date.lastSunday = function(intDay) {
    var ts = Date.intDayToTs(intDay);
    var nWeekDay = new Date(ts).getDay();
    return (intDay - nWeekDay);
};