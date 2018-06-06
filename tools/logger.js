const log = (msg, color) => {
	const colors = {
		"error"  : "\033[91m[ERR]\x1b[0m",
		"success": "\033[92m[Success]\x1b[0m",
		"info"   : "\033[96m[INFO]\x1b[0m",
		"reset"  : "\033[00m",
		"gray"   : "\033[90m"
	};
	if (color === undefined)
		console.log('\033[90m' + `[${new Date().toTimeString().slice(0, 8) + ':' + new Date().getMilliseconds()}] ` + '\033[00m' + msg)
	else
		console.log('\033[90m' + `[${new Date().toTimeString().slice(0, 8) + ':' + new Date().getMilliseconds()}] ${colors[color]} ${msg}`)
};

module.exports = log;