var API = 'https://smarthealth-comp5527.rhcloud.com/demo';

var TimeSlot;
var Measurements = new Array();
var Tab = "TabPressureHigh";

var Today = new Date();
var WeekDate = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));

var AndroidAPI = {

    register : function(token){
        if (Android !== undefined){
            Android.register(token);
        }
    },
    alert : function(msg){
        if (Android !== undefined){
            Android.toast(msg);
        }
    },
    hasNetwork : function(){
        if (Android !== undefined){
            return Android.hasNetwork();
        }
    }

};

var LocalStorage = {
	Save: function(Key, Obj) {
		// Save JS Object in LocalStorage
		// var Obj = {"Key" : "Value", "Key" : "Value"};
		// LocalStorage.Save(Key, Obj);

		localStorage.setItem(Key, JSON.stringify(Obj));
	},
	Load: function(Key) {
		// Load Data from LocalStorage and save as a JS Object
		// var Key = LocalStorage.Load(Key);

		return JSON.parse(localStorage.getItem(Key));
	},
	Remove: function(Key) {
		// Remove Data from LocalStorage
		localStorage.removeItem(Key);
	}
};

$(document).ready(function() {
	$("#Date").val(pad(Today.getDate(), 2) + '-' + pad((Today.getMonth() + 1), 2) + '-' + Today.getFullYear());
	$("#BPH").val(getRandomInt(100, 150));
	$("#BPL").val(getRandomInt(60, 120));
	$("#BG").val(getRandomInt(0, 20));

	Clock();

	$(".tab").tabs().on('tabsactivate', function(event, ui) {
		var index = ui.newTab.index();

		if(ui.index === 0 && plot1._drawCount === 0) {
			Tab = "TabPressureHigh";
		} else if(ui.index === 1 && plot2._drawCount === 0) {
			Tab = "TabPressureLow";
		} else {
			Tab = "TabGlucose";
		}
	});

	$(".accordion").accordion();

	if(LocalStorage.Load("TimeSlot") === null) {
		TimeSlot = {
			"AFTER_BED": true,
			"BEFORE_BREAKFAST": true,
			"AFTER_BREAKFAST": true,
			"BEFORE_LUNCH": true,
			"AFTER_LUNCH": true,
			"BEFORE_DINNER": true,
			"AFTER_DINNER": true,
			"BEFORE_BED": true
		};
		LocalStorage.Save("TimeSlot", TimeSlot);
	} else {
		TimeSlot = LocalStorage.Load("TimeSlot");
	}

	if(TimeSlot.length) {
		$.each(TimeSlot, function(Key, Value) {
			$("[name=TimeSlot][value=" + Key + "]").prop("checked", Value);
		});
	}

	$("[name=TimeSlot]").click(function(e) {
		TimeSlot[this.value] = $(this).is(':checked');
		LocalStorage.Save("TimeSlot", TimeSlot);
		LoadTable();
	});

	if(window.localStorage.getItem("token") === null) {
		$.mobile.changePage("#PageLogin");
	} else {
		User.LoadMeasurement(WeekDate.getDate() + '-' + (WeekDate.getMonth() + 1) + '-' + WeekDate.getFullYear(), Today.getDate() + '-' + (Today.getMonth() + 1) + '-' + Today.getFullYear());
		$.mobile.changePage("#PageRecord");
	}

	LoadTable();
});

function Clock() {
	var Now = new Date();
	var HTML = Now.getDate() + ' - ' + (Now.getMonth() + 1) + ' - ' + Now.getFullYear();
	HTML += ' ' + pad(Now.getHours(), 2) + ':' + pad(Now.getMinutes(), 2) + ':' + pad(Now.getSeconds(), 2);

	$(".SpanDateTime").html(HTML);
	setTimeout(function() {
		Clock()
	}, 500);
};

function ShowChart(Type) {
	$("#PageChart [role=main]").html('<iframe src="chart.html#' + Type + '"></iframe>');
	$.mobile.changePage("#PageChart");
}

var InputDate = {
	B: function() {
		Today = new Date(Today.getTime() - (24 * 60 * 60 * 1000));
		$("#Date").val(pad(Today.getDate(), 2) + '-' + pad((Today.getMonth() + 1), 2) + '-' + Today.getFullYear());
	},
	F: function() {
		Today = new Date(Today.getTime() + (24 * 60 * 60 * 1000));
		$("#Date").val(pad(Today.getDate(), 2) + '-' + pad((Today.getMonth() + 1), 2) + '-' + Today.getFullYear());
	}
};

var User = {
	Login: function() {
		$.mobile.changePage("#PageLoading");

		$.ajax({
			url: API + '/rest/getToken',
			type: "POST",
			dataType: "json",
			data: JSON.stringify({
				"userId": $("#UserID").val(),
				"password": $("#Password").val()
			}),
			contentType: "application/json; charset=utf-8",
			success: function(JData) {
				localStorage.setItem("token", JData.token);
				User.LoadMeasurement(WeekDate.getDate() + '-' + (WeekDate.getMonth() + 1) + '-' + WeekDate.getFullYear(), Today.getDate() + '-' + (Today.getMonth() + 1) + '-' + Today.getFullYear());
				AndroidAPI.alert("Login Success");
				$.mobile.changePage("#PageRecord");
				AndroidAPI.register(window.localStorage.getItem("token"));
			},
			error : function(err){
			    $.mobile.changePage("#PageLogin");
			    AndroidAPI.alert("Login Fail");
			}
		});
	},
	Logout: function() {
		localStorage.removeItem("token");
		$.mobile.changePage("#PageLogin");
	},
	LoadMeasurement: function(From, To) {
		var measurements = new Array();

		if(LocalStorage.Load("Measurements") === null) {
			User.GetMeasurement(From, To);
		} else {
			Measurements = LocalStorage.Load("Measurements");

			$.each(Measurements, function() {
				if(this.Submitted === false) {
					measurements.push({
						"date": this.date,
						"time": this.time,
						"bph": this.BPH,
						"bpl": this.BPL,
						"bg": this.BG
					});
				}
			});

			if(measurements.length) {
				$.ajax({
					url: API + '/rest/savemeasurement',
					type: "POST",
					dataType: "json",
					data: JSON.stringify({
						"token": localStorage.getItem("token"),
						"measurements": measurements
					}),
					contentType: "application/json; charset=utf-8",
					success: function(JData) {
						User.GetMeasurement(From, To);
					},
					error: function() {

					}
				});
			} else {
				User.GetMeasurement(From, To);
			}
		}
	},
	GetMeasurement: function(From, To) {
		$.ajax({
			url: API + '/rest/getmeasurement',
			type: "POST",
			dataType: "json",
			data: JSON.stringify({
				"token": localStorage.getItem("token"),
				"from": From,
				"to": To,
			}),
			contentType: "application/json; charset=utf-8",
			success: function(JData) {
				Measurements = new Array();

				$.each(JData, function() {
					Measurements.push({
						"date": this.date,
						"time": this.time,
						"BPH": this.bph,
						"BPL": this.bpl,
						"BG": this.bg,
						"Submitted": true
					});
				});

				LocalStorage.Save("Measurements", Measurements);
				LoadTable();
			},
			error: function() {

			}
		});
	}
};

var Measurement = {
	Submit: function() {
		var BPH = $("#BPH").val().length ? $("#BPH").val() : 0;
		var BPL = $("#BPL").val().length ? $("#BPL").val() : 0;
		var BG = $("#BG").val().length ? $("#BPL").val() : 0;

		if(isNaN(parseFloat(BPH))) {
			alert('Please input a valid value for the Systolic Pressure');
		} else if(isNaN(parseFloat(BPL))) {
			alert('Please input a valid value for the Diastolic Pressure');
		} else if(isNaN(parseFloat(BG))) {
			alert('Please input a valid value for the Glycemia');
		} else {
			Measurements.push({
				"date": $("#Date").val(),
				"time": $("#Time").val(),
				"BPH": BPH,
				"BPL": BPL,
				"BG": BG,
				"Submitted": false
			});
			LocalStorage.Save("Measurements", Measurements);
			User.LoadMeasurement(WeekDate.getDate() + '-' + (WeekDate.getMonth() + 1) + '-' + WeekDate.getFullYear(), Today.getDate() + '-' + (Today.getMonth() + 1) + '-' + Today.getFullYear());
			$.mobile.changePage("#PageRecord");
		}
	}
};

function LoadTable() {
	var HTML = "";
	HTML += "<tr>";
	HTML += "<th>DATE</th>";
	$.each(TimeSlot, function(Key, Value) {
		if(Value) {
			HTML += "<th>" + Key.replace("_", "<br />") + "</th>";
		}
	});
	HTML += "</tr>";

	for(var i = 0; i < 7; i++) {
		DummyDate = new Date(new Date().getTime() - (i * 24 * 60 * 60 * 1000));

		HTML += "<tr>";
		HTML += '<td>' + pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear() + '</td>';

		$.each(TimeSlot, function(Key, Value) {
			if(Value) {
				HTML += '<td>';
				HTML += '<span class="' + pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear() + ' ' + Key + '"> --- </span>';
				HTML += '</td>';
			}
		});

		HTML += "</tr>";
	}

	$(".tab table").html(HTML);

	if(Measurements.length) {
		$.each(Measurements, function() {
			this.date;
			this.time;
			this.BPH;
			this.BPL;
			this.BPH;

			$("#TabPressureHigh ." + this.date + "." + this.time).html(this.BPH);
			$("#TabPressureLow ." + this.date + "." + this.time).html(this.BPL);
			$("#TabGlucose ." + this.date + "." + this.time).html(this.BG);
		});
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(a, b) {
	return (1e15 + a + "").slice(-b);
}
