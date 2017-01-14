var Point = function() {

}

var Plot = function(container, properties) {

	this.container = document.querySelector(container);
	this.width = 400;
	this.height = 400;
	this.canvas = null;
	this.contex = null;

	this.settings = {
		axisX: [-1, 1],
		axisY: [-1, 1],
		axisStep: 1,
		padding: 25,
	}

	for(var key in properties) {
		this[key] = properties[key];
	}

	this._settings = null;
	this.computeRealValues();
	this.run();
}


Plot.prototype.computeRealValues = function() {
	var _settings = {
		width: this.width-2*this.settings.padding,
		height: this.height-2*this.settings.padding,
		x1: this.settings.padding,
		x2: this.width-this.settings.padding,
		y1: this.settings.padding,
		y2: this.height-this.settings.padding,
	}

	this._settings = _settings;
	this._settings.convertFunction = function(x, y) {
		var convertRange = function(value, old_r, new_r) {
			return (new_r[1]-new_r[0])*((value-old_r[0])/(old_r[1]-old_r[0]))+new_r[0];
		}

		return [_settings.x1+convertRange(x, this.settings.axisX, [0, _settings.width]),
				_settings.y2-convertRange(y, this.settings.axisY, [0, _settings.height])];

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


Plot.prototype.drawLine = function(P1, P2, color) {
	var real_p1 = this._settings.convertFunction(P1[0], P1[1]);
	var real_p2 = this._settings.convertFunction(P2[0], P2[1]);

	var ctx = this.context;
	ctx.strokeStyle = color || '#000';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(real_p1[0], real_p1[1]);
	ctx.lineTo(real_p2[0], real_p2[1]);
	ctx.stroke();
}


Plot.prototype.drawPoint = function(P, color) {
	var color = color || "#000";
	var real_p = this._settings.convertFunction(P[0], P[1]);

	var ctx = this.context;
	ctx.beginPath();
	ctx.arc(real_p[0], real_p[1], 3, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
}


Plot.prototype.drawText = function(text, x, y, color) {
	var real_p1 = this._settings.convertFunction(x, y);

	var ctx = this.context;
	ctx.font = "12px Arial";
	ctx.fillStyle = color || '#000';
	ctx.fillText(text, real_p1[0], real_p1[1]);
}


Plot.prototype.drawMiddleCross = function() {
	this.drawLine([0, this.settings.axisY[0]], [0, this.settings. axisY[1]], "#ccc");
	this.drawLine([this.settings.axisX[0], 0], [this.settings.axisX[1], 0], "#ccc");
}


Plot.prototype.drawAxes = function() {
	this.drawLine([this.settings.axisX[0], this.settings.axisY[0]], [this.settings.axisX[0], this.settings. axisY[1]]);
	this.drawLine([this.settings.axisX[0], this.settings.axisY[0]], [this.settings.axisX[1], this.settings. axisY[0]]);

	for(var x = this.settings.axisX[0]; x <= this.settings.axisX[1]; x += this.settings.axisStep) {
		this.drawText(x, x, this.settings.axisY[0]-0.1);
		this.drawLine([x, this.settings.axisY[0]-0.05], [x, this.settings.axisY[0]+0.05]);
	}

	for(var y = this.settings.axisY[0]; y <= this.settings.axisY[1]; y += this.settings.axisStep) {
		this.drawText(y, this.settings.axisX[0]-0.1, y);
		this.drawLine([this.settings.axisX[0]-0.05, y], [this.settings.axisX[0]+0.05, y]);
	}
}


Plot.prototype.redraw = function() {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.drawAxes();
	this.drawMiddleCross();
}


Plot.prototype.run = function() {
	this.prepareCanvas();
	this.redraw();
}