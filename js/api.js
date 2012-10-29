/* MaxPhotographer - api.js */

var API = function() {}

API.uri = function() { return 'api/'; };

API.http_request = function(method, url, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, url, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4 /* complete */) {
			console.log(xhr.responseText);
			callback(xhr.responseText);
	  }
	};
	if (data != null) {
		xhr.send(data);
	} else {
		xhr.send();
	}
}

API.format_get_data = function(args) {
	var args_formated = '',
			first_iteration = true;
	
	for (var a in args) {
		args_formated += first_iteration ? '?' : '&';
		args_formated += a + '=' + args[a];
		first_iteration = false;
	}
	return args_formated;
}

API.format_post_data = function(args) {
	var formData = new FormData();
	for (var a in args) {
		if (typeof args[a] == "object") {
			for (var i = 0; i < args[a].length; i++) {
				formData.append(a + i, args[a][i]);
			}
		} else {
			formData.append(a, args[a]);
		}
	}
	return formData;
}

API.get_ajax = function(url, args, callback) {
	if (args != null) {
			var args_formated = API.format_get_data(args);
			url += args_formated;
	}
	API.http_request('GET', url, null, callback);
};

API.post_ajax = function(url, args, callback) {
	var formData = API.format_post_data(args);
	
	API.http_request('POST', url, formData, callback);
};

API.prototype.login = function(login, password, callback) {
	API.get_ajax(API.uri() + 'user/login.php', {
		login: login,
		password: password
	}, callback);
}

API.prototype.add_images = function(section, files, callback) {		
	API.post_ajax(API.uri() + 'gallery/add.php', {
		token: localStorage.getItem('token'),
		section: section,
		file: files
	}, callback);
};

API.prototype.rm_images = function(section, urlz, callback) {
	API.post_ajax(API.uri() + 'gallery/remove.php', {
		token: localStorage.getItem('token'),
		section: section,
		url: urlz
	}, callback);
};

API.prototype.rm_section = function(section, callback) {
	API.post_ajax(API.uri() + 'gallery/remove.php', {
		token: localStorage.getItem('token'),
		section: section
	}, callback);
};

API.prototype.move_image = function(section, url, direction, callback) {
	API.post_ajax(API.uri() + 'gallery/move.php', {
		token: localStorage.getItem('token'),
		section: section,
		url: url,
		move: direction
	}, callback);
};
