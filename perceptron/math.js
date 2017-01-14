window.math = {
	sgn: function(x) {
		return x < 0 ? 0 : 1;
	},
	dot: function(u, v) {
		var sum = 0;
		for(var i = 0; i < u.length; i++) sum += u[i]*v[i];
		return sum;
	}
}