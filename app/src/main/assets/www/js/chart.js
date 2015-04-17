google.load('visualization', '1', {
	packages: ['corechart', 'line']
});

$(document).ready(function() {
	var Measurements = LocalStorage.Load("Measurements");
	var TimeSlot = LocalStorage.Load("TimeSlot");

	var Cell = new Array();
	var Title = "";

	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Date');
	data.addColumn('number', 'AFTER BED');
	data.addColumn('number', 'BEFORE BREAKFAST');
	data.addColumn('number', 'AFTER BREAKFAST');
	data.addColumn('number', 'BEFORE LUNCH');
	data.addColumn('number', 'AFTER LUNCH');
	data.addColumn('number', 'BEFORE DINNER');
	data.addColumn('number', 'AFTER DINNER');
	data.addColumn('number', 'BEFORE BED');

	data.addRows(8);

	for(var i = 0; i < 7; i++) {
		DummyDate = new Date(new Date().getTime() - (i * 24 * 60 * 60 * 1000));
		Cell[pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear()] = i;
		data.setCell(i, 0, pad(DummyDate.getDate(), 2) + '-' + pad((DummyDate.getMonth() + 1), 2) + '-' + DummyDate.getFullYear());
	}

	var Tab = window.location.href;
	Tab = Tab.split("#");
	Tab = Tab[1];

	$.each(Measurements, function() {
		if(!isNaN(parseInt(Cell[this.date]))) {
			var Value;
			if(Tab == "PressureHigh") {
				Title = "Systolic Pressure";
				Value = this.BPH;
			} else if(Tab == "PressureLow") {
				Title = "Diastolic Pressure";
				Value = this.BPL;
			} else {
				Title = "Glycemia";
				Value = this.BG;
			}

			switch(this.time) {
			case "AFTER_BED":
				if(TimeSlot.AFTER_BED) {
					data.setCell(Cell[this.date], 1, Value);
				}
				break;
			case "BEFORE_BREAKFAST":
				if(TimeSlot.AFTER_BED) {
					data.setCell(Cell[this.date], 2, Value);
				}
				break;
			case "AFTER_BREAKFAST":
				if(TimeSlot.AFTER_BREAKFAST) {
					data.setCell(Cell[this.date], 3, Value);
				}
				break;
			case "BEFORE_LUNCH":
				if(TimeSlot.BEFORE_LUNCH) {
					data.setCell(Cell[this.date], 4, Value);
				}
				break;
			case "AFTER_LUNCH":
				if(TimeSlot.AFTER_LUNCH) {
					data.setCell(Cell[this.date], 5, Value);
				}
				break;
			case "BEFORE_DINNER":
				if(TimeSlot.BEFORE_DINNER) {
					data.setCell(Cell[this.date], 6, Value);
				}
				break;
			case "AFTER_DINNER":
				if(TimeSlot.AFTER_DINNER) {
					data.setCell(Cell[this.date], 7, Value);
				}
				break;
			case "BEFORE_BED":
				if(TimeSlot.BEFORE_BED) {
					data.setCell(Cell[this.date], 7, Value);
				}
				break;
			}
		}
	});

	var options = {
		'title': Title,
		'width': 300
	};

	var chart = new google.visualization.LineChart(document.getElementById('DivChart'));
	chart.draw(data, options);
});

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

function pad(a, b) {
	return (1e15 + a + "").slice(-b);
}