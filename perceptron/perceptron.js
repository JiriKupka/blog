var Perceptron = function(n_inputs, eta) {
	this.eta = eta || 0.2;
	this.weights = [0.3, 0.12, 0.26];
}

Perceptron.prototype.activate = function(x) {
	return math.sgn(math.dot(x, this.weights));
}

Perceptron.prototype.train = function(x, z) {
	var y = this.activate(x);
	for(var v = 0; v < this.weights.length; v++) {
		this.weights[v] = this.weights[v]+this.eta*(z-y)*x[v];
	}
	return y;
}

window.Perceptron = Perceptron;