var Point = function() {

}

var Plot = function(container, properties) {

	var mergeSettings = function(properties, to) {
		for(var key in properties) {
			if(typeof properties[key] == "object") {
				mergeSettings(properties[key], to[key]);
			}
			else {
				to[key] = properties[key];
			}
		}
	}

	this.container = document.querySelector(container);
	this.width = 400;
	this.height = 400;
	this.canvas = null;
	this.contex = null;

	this.settings = {
		axisX: [-1, 1],
		axisY: [-1, 1],
		axisStepX: 1,
		axisStepY: 1,
		axisTitleX: null,
		axisTitleY: null,
		padding: 25,
		paddingTop: null,
		paddingLeft: null,
		paddingRight: null,
		paddingBottom: null,
		drawMiddleCross: true,
		title: null
	}

	this.C_TITLE_PADDING = 20;

	mergeSettings(properties, this);

	this._settings = null;
	this.computeRealValues();
	this.run();
}


Plot.prototype.computeRealValues = function() {
	var convertRange = function(value, old_r, new_r) {
		return (new_r[1]-new_r[0])*((value-old_r[0])/(old_r[1]-old_r[0]))+new_r[0];
	}

	var paddingLeft = this.settings.paddingLeft || this.settings.padding;
	var paddingRight = this.settings.paddingRight || this.settings.padding;
	var paddingTop = this.settings.paddingTop || this.settings.padding;
	var paddingBottom = this.settings.paddingBottom || this.settings.padding;

	if(this.settings.title) paddingTop += this.C_TITLE_PADDING;

	var _settings = {
		width: this.width-(paddingLeft+paddingRight),
		height: this.height-(paddingTop+paddingBottom),
		x1: paddingLeft,
		x2: this.width-paddingRight,
		y1: paddingTop,
		y2: this.height-paddingBottom,
	}

	this._settings = _settings;
	this._settings.convertFunction = function(x, y) {
		return [_settings.x1+convertRange(x, this.settings.axisX, [0, _settings.width]),
				_settings.y2-convertRange(y, this.settings.axisY, [0, _settings.height])];

	}.bind(this);

	this._settings.reverseConvertFunction = function(x, y) {
		return [convertRange(x, [0, _settings.width], this.settings.axisX),
				convertRange(y, [0, _settings.height], this.settings.axisY)];

	}.bind(this);
}


Plot.prototype.prepareCanvas = function() {
	this.canvas = document.createElement("canvas");
	this.canvas.width = this.width*window.devicePixelRatio;
	this.canvas.height = this.height*window.devicePixelRatio;
	this.canvas.style.width = this.width+"px";
	this.canvas.style.height = this.height+"px";

	this.container.appendChild(this.canvas);
	this.context = this.canvas.getContext("2d");
	this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
}


Plot.prototype.drawLine = function(P1, P2, color, P1_ro = [0,0], P2_ro = [0,0]) {
	var real_p1 = this._settings.convertFunction(P1[0], P1[1]);
	var real_p2 = this._settings.convertFunction(P2[0], P2[1]);

	var ctx = this.context;
	ctx.strokeStyle = color || '#000';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(real_p1[0] + P1_ro[0], real_p1[1] + P1_ro[1]);
	ctx.lineTo(real_p2[0] + P2_ro[0], real_p2[1] + P2_ro[1]);
	ctx.stroke();
}


Plot.prototype.drawPoint = function(P, color, radius) {
	var color = color || "#000";
	var radius = radius || 3;
	var real_p = this._settings.convertFunction(P[0], P[1]);

	var ctx = this.context;
	ctx.beginPath();
	ctx.arc(real_p[0], real_p[1], radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
}


Plot.prototype.getPixel = function(P, color) {
	var real_p = this._settings.convertFunction(P[0], P[1]);
	var imageData = this.context.getImageData(window.devicePixelRatio*real_p[0], window.devicePixelRatio*real_p[1], 1, 1);
	return imageData.data;
}


Plot.prototype.setPixel = function(P, color) {
	var real_p = this._settings.convertFunction(P[0], P[1]);
	var imageData = this.context.createImageData(1, 1);
	for(var i in color) {
		imageData.data[i] = color[i];
	}
	this.context.putImageData(imageData, window.devicePixelRatio*real_p[0], window.devicePixelRatio*real_p[1]);
}


Plot.prototype.drawText = function(text, x, y, color, x_ro = 0, y_ro = 0, font) {
	var real_p1 = this._settings.convertFunction(x, y);

	var ctx = this.context;
	ctx.font = font || "12px Arial";
	ctx.fillStyle = color || '#000';
	ctx.fillText(text, real_p1[0] + x_ro, real_p1[1] + y_ro);
}


Plot.prototype.drawMiddleCross = function() {
	this.drawLine([0, this.settings.axisY[0]], [0, this.settings. axisY[1]], "#ccc");
	this.drawLine([this.settings.axisX[0], 0], [this.settings.axisX[1], 0], "#ccc");
}


Plot.prototype.drawTitle = function() {
	var ctx = this.context;
	ctx.font = "18px Arial";
	var tw = ctx.measureText(this.settings.title).width;
	this.drawText(this.settings.title, 0, this.settings.axisY[1], "#904", (this._settings.width-tw)/2, -this.C_TITLE_PADDING, "18px Arial");
}


Plot.prototype.drawAxisTitleX = function() {
	this.drawText(this.settings.axisTitleX, this.settings.axisX[1], 0, "#f00", 10, 0);
}


Plot.prototype.drawAxisTitleY = function() {
	this.drawText(this.settings.axisTitleY, 0, this.settings.axisY[1], "#f00", 0, -10);
}


Plot.prototype.drawAxes = function() {
	this.drawLine([this.settings.axisX[0], this.settings.axisY[0]], [this.settings.axisX[0], this.settings. axisY[1]]);
	this.drawLine([this.settings.axisX[0], this.settings.axisY[0]], [this.settings.axisX[1], this.settings. axisY[0]]);

	for(var x = this.settings.axisX[0]; x <= this.settings.axisX[1]; x += this.settings.axisStepX) {
		this.drawText(x, x, this.settings.axisY[0], null, 0, 20);
		this.drawLine([x, this.settings.axisY[0]], [x, this.settings.axisY[0]], null, [0, -5], [0, 5]);
	}

	for(var y = this.settings.axisY[0]; y <= this.settings.axisY[1]; y += this.settings.axisStepY) {
		this.drawText(y, this.settings.axisX[0], y, null, -20, 0);
		this.drawLine([this.settings.axisX[0], y], [this.settings.axisX[0], y], null, [-5, 0], [5, 0]);
	}
}


Plot.prototype.redraw = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	if(this.settings.drawMiddleCross) this.drawMiddleCross();

	this.drawAxes();

	if(this.settings.title) this.drawTitle();
	if(this.settings.axisTitleX) this.drawAxisTitleX();
	if(this.settings.axisTitleY) this.drawAxisTitleY();
}


Plot.prototype.run = function() {
	this.prepareCanvas();
	this.redraw();
}


Plot.prototype.onMouseMove = function(Callback) {

	var paddingLeft = this.settings.paddingLeft || this.settings.padding;
	var paddingTop = this.settings.paddingTop || this.settings.padding;
	if(this.settings.title) paddingTop += this.C_TITLE_PADDING;

	this.canvas.addEventListener("mousemove", function(e) {
		var pos = this._settings.reverseConvertFunction(e.layerX-paddingLeft, this._settings.height-(e.layerY-paddingTop));
		Callback({x: pos[0], y: pos[1], e: e});
	}.bind(this));
}

Plot.prototype.onClick = function(Callback) {

	var paddingLeft = this.settings.paddingLeft || this.settings.padding;
	var paddingTop = this.settings.paddingTop || this.settings.padding;
	if(this.settings.title) paddingTop += this.C_TITLE_PADDING;

	this.canvas.addEventListener("click", function(e) {
		var pos = this._settings.reverseConvertFunction(e.layerX-paddingLeft, this._settings.height-(e.layerY-paddingTop));
		Callback({x: pos[0], y: pos[1], e: e});
	}.bind(this));
}