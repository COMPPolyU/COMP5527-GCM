var measurements = new Array();
var DummyDate;

for(var i = 0; i < 14; i++) {

	DummyDate = new Date(new Date().getTime() - (i * 24 * 60 * 60 * 1000));

	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "AFTER_BED",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "BEFORE_BREAKFAST",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "AFTER_BREAKFAST",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "BEFORE_LUNCH",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "AFTER_LUNCH",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "BEFORE_DINNER",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "AFTER_DINNER",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
	measurements.push({
		"date": pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear(),
		"time": "BEFORE_BED",
		"bph": getRandomInt(100, 150),
		"bpl": getRandomInt(60, 120),
		"bg": getRandomInt(10, 200) / 10
	});
}

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
	},
	error: function() {
	}
});