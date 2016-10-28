var action = "click";

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 action = "touchstart";
}

var editing = {};
var itmList = getItemList();
function getItemList(){
	var anItemList = localStorage["itmList"];
	if( anItemList == undefined || anItemList == "undefined") {
		anItemList = [];
	}else{
		anItemList = JSON.parse(anItemList);
	}
	return anItemList;
}
function setItemList(anItemList) {
	localStorage["itmList"] = JSON.stringify(anItemList);
}
function showEditing(){
	// var $editing = $("#editing");
	// var buf = "";
	// for( c in editing) {
	// 	buf += "<p>" + c + ": " + editing[c] + "</p>";
	// }
	// $editing.html( buf );
	var $choiceTr = $(".choiceTr");
	$choiceTr.each( function(idx, elm){
		var c = $(elm).find(".choice").text();
		var $num = $(elm).find(".num");
		if( editing[c] != undefined ) {
			$num.text(editing[c]);
		}else{
			$num.text("0");
		}
	});
}

function setDisableReload(b){
	$("#btnReload").prop('disabled', b);
}

function setDisableDoneCancel(b){
	$("#btnCancel").prop('disabled', b);
	$("#btnDone").prop('disabled', b);
}

function showDb(){
	var $db = $("#db").empty();
	var db = getDb();
	var sum = {};
	var $tbl = $("<table>");
	$db.append( $tbl );
	var $thead = $(_.template(
		'<tr><td>时间</td> ' +
			'<%for(var i=0; i<itmList.length; i++){%>' +
				'<td><%- itmList[i] %></td>'+
			'<%}%>' + 
			' </tr>',
		{itmList: itmList}));
	$tbl.append($thead);
	var totalCount = 0;
	for( var i=0; i<db.length; i++) {
		var dbi = db[i];
		if( dbi.tsStr == undefined && typeof(dbi.ts) == "string" && dbi.ts.indexOf(' ') > 0 ){
			dbi.tsStr = dbi.ts;
		}
		var $tr = $(_.template('<tr><td><%=dbi.tsStr%></td> ' +
			'<%for(var i=0; i<itmList.length; i++){%>' +
				'<td><%- dbi.content[itmList[i]] || 0 %></td>'+
			'<%}%>' + 
			' </tr>', {
			dbi: dbi,
			itmList: itmList
		}));
		
		for( k in dbi.content) {
			if( sum[k] == undefined ) { sum[k] = 0; }
			sum[k] += dbi.content[k];
			totalCount += dbi.content[k];
		}

		$tbl.append($tr);
	}
	var $sum = $(_.template('<tr><td>汇总</td> ' +
			'<%for(var i=0; i<itmList.length; i++){%>' +
				'<td><%- sum[itmList[i]] || 0 %></td>'+
			'<%}%>' + 
			' </tr>', {
			sum: sum,
			itmList: itmList,
			totalCount: totalCount
		}));
	$tbl.append($sum);

	var $bottom = $(_.template('<div>总计<%- totalCount %>: ' +
			'<%for(var i=0; i<itmList.length; i++){%>' +
				'<span class="below-item"><%- itmList[i]%><%- sum[itmList[i]] || 0 %></span>'+
			'<%}%>' + 
			' </div>', {
			sum: sum,
			itmList: itmList,
			totalCount: totalCount
		}));
	$("#fixed-bottom").empty().append( $bottom );
	//$total = $("<div>").text( "汇总: " + JSON.stringify(sum) );
	//$db.prepend( $("<hr>"));
}

function getDb(){
	var db = localStorage["db"];
	if( db == undefined || db == "undefined") {
		db = [];
	}else{
		db = JSON.parse(db);
	}
	return db;
}

$(function(){
	function doChoice(e){
		var c = $(e.target).text();
		if ( editing[c] == undefined ) {
			editing[c] = 0;
		}
		editing[c]++;
		setDisableDoneCancel(false);
		showEditing();
	}

	function doMinus(e){
		var c = $(e.target).closest("tr").find(".choice").text();
		if ( editing[c] != undefined && editing[c] > 0) {
			editing[c]--;
			showEditing();		
		}
	}

	$("body").on(action,".choice", doChoice);
	//$("body").on("touchstart",".choice", doChoice);

	$("body").on(action,".btnMinus", doMinus);

	$("#btnCancel").on(action, function(){
		editing = {};
		showEditing();
		setDisableDoneCancel(true);
	});

	$("#btnClear").on(action, function(){
		if( confirm("确定删除？")) {

			localStorage["db"] = undefined;
			showDb();
		}
	})

	$("#btnDone").on(action, function (){
		//put to localStorage
		var db = getDb();
		var ts = new Date().getTime();
		db.unshift ({
			ts: ts,
			tsStr: Date.getCurrentTimeStr(new Date(ts)),
			content: editing
		});
		localStorage["db"] =  JSON.stringify(db);
		//show db
		showDb();

		//clear editing
		editing = {};
		showEditing();
	
		setDisableDoneCancel(true);
	});

	function getTr(itm){
		return _.template('<tr class="choiceTr"><td><button class="btn choice"><%- itm%></button></td><td class="tdNum"><span class="num">0</td><td><button class="btnMinus">-</button></td></tr>',
			{itm: itm}
			);
	}
	$("#btnStart").on(action, function f(){
		$("#work").empty();
		var itms = $("#allitms").val();
		itmList = itms.split(" ");
		setItemList(itmList);
		var $tbl = $('<table class="workTbl">');
		for( var i=0; i<itmList.length; i++){
			var $tr = $(getTr(itmList[i]));
			$tbl.append($tr);
		}
		$("#work").append($tbl);
		$("#h").hide();
		$("#kk").show();
		showDb();
		setDisableReload(false);
	});

	$("#btnReload").on(action, function f(){
		init();
	});

	$("#btnUpload").on(action, function f(){
		var db = getDb();
		var uploadList = [];
		for( var i=0; i<db.length; i++) {
			var o = db[i];
			for( var j=0; j<itmList.length; j++){
				var q = o.content[itmList[j]];
				var myTs = (typeof(o.ts) == "string" && o.ts.indexOf(" ") > 0)? Date.parse(o.ts): o.ts;
				if( q > 0) {
					uploadList.push({
						ts: myTs,
						kind: itmList[j],
						quantity: q
					});
				}
			}
		}
		console.log( JSON.stringify( uploadList ) );
		$.ajax({
			url: "/addMany",
			method: "POST",
			processData: false,
			contentType: 'application/json',
			data: JSON.stringify(uploadList),
			success: function(res) {
				var text = res;
				alert(text);
			},
			error: function(err){
				alert(err);
			}
		});
	});
	
	function init(){
		setDisableReload(true);
		setDisableDoneCancel(true);
		$("#work").empty();
		$("#kk").hide();
		$("#h").show();
		$("#kk").hide();
		showDb();
		window.scrollTo(0, 0);
	}
	init();
});

window.onerror = function(message, source, lineno, colno, error) {
        alert("line" + lineno+ " " + message);
}