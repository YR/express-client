/**
 * Safely merge object 'b' into 'a',
 * making sure not to overwrite existing properties in 'a'
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
module.exports = function safeMerge (a, b) {
	if (a && b) {
		for (var key in b) {
			if (a[key] == null) a[key] = b[key];
		}
	}

	return a;
};