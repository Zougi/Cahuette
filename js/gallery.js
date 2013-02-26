var gallery = (function () {

var properties = {
	admin: true,
	fullscreen: true,
	drag: true,
	responsive: true,
	remember_scroll_position: true,
	min_height: 540,
	auto_fit: true
};
if (arguments[0] != undefined && typeof arguments[0] == 'object') {
	for (var i in properties) {
		for (var j in arguments[0]) {
			if (i == j) {
				properties[i] = arguments[0][j];
				break;
			}
		}
	}
}

/* -------------------------- MaxPhotographer - API -------------------------- */

var API = function() {}

API.uri = function() { return 'api/'; };

API.http_request = function(method, url, data, callback, progress) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, url, true);
	xhr.onprogress = progress;
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4 /* complete */) {
			console.log(xhr.responseText);
			var result;
			try {
				result = JSON.parse(xhr.responseText);
			} catch (e) {
				result = null;
			}
			callback(result);
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
		if (typeof args[a] == 'object') { //if files...
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

API.post_ajax = function(url, args, callback, progress) {
	var formData = API.format_post_data(args);
	
	API.http_request('POST', url, formData, callback, progress);
};

API.prototype.login = function(login, password, callback) {
	API.get_ajax(API.uri() + 'user/login.php', {
		login: login,
		password: password
	}, callback);
}

API.prototype.max_file_upload = function(callback) {
	API.post_ajax(API.uri() + 'max_file_upload.php', {
		token: localStorage.getItem('token')
	}, callback);
}

API.prototype.add_images = function(section, files, callback, progress) {		
	API.post_ajax(API.uri() + 'gallery/add.php', {
		token: localStorage.getItem('token'),
		section: section,
		file: files
	}, callback, progress);
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

/* -------------------------- MaxPhotographer - ADMIN -------------------------- */

function get_selected_images() {
	var ez_div = document.querySelectorAll('.img');
	var url, urlz = []; 
	for (var i = 0; i < ez_div.length; i++) {
		if (ez_div[i].childNodes.length > 1) {
			url = ez_div[i].getAttribute('data-src');
			url = 'gallery/' + url;
			urlz.push(url);
		}
	}
	return urlz;
}

//switch to admin display
function admin_display() {
	var e_bt,
			e_menu = document.getElementById('menu'),
			e_content = document.getElementById('content'),
			e_ul = e_menu.getElementsByTagName('ul')[0];
			ez_li = e_ul.getElementsByTagName('li'),
	 		attr = document.createAttribute('class');

	//remove logbox
	document.getElementById('logbox').className = 'remove';
	
	//add suppress buttons
	for (var i = 0; i < ez_li.length; i++) {
		e_bt = document.createElement('button');
		e_bt.appendChild(document.createTextNode('x'));
		e_bt.addEventListener('click', function(event) {
			var e_li = event.target.parentNode;
			var section_name = e_li.getElementsByTagName('a')[0].innerHTML;
			if (confirm('remove ' + section_name + ' ?')) {
				var api = new API();
				api.rm_section(section_name, function(response) {
					if (section_name == section) {
						if (response.error == undefined) {
							window.location.reload(true);
						}
					} else {
						e_ul.removeChild(e_li);
					}
				});
			}
		});
		attr = document.createAttribute('title');
		attr.nodeValue = 'remove';
		e_bt.setAttributeNode(attr);
		
		ez_li[i].appendChild(e_bt);
	}
	
	//add section
	var e_input = document.createElement('input')
	attr = document.createAttribute('placeholder');
	attr.nodeValue = 'New Categorie';
	e_input.setAttributeNode(attr);
	e_menu.appendChild(e_input);

	e_bt = document.createElement('button');
	e_bt.addEventListener('click', function(event) {
		if (e_input.value == '') {
			alert("Supply a category name");
			return;
		}
		
		add_menu_section(e_input.value, e_menu, e_ul);
		
		e_bt = document.createElement('button');
		e_bt.appendChild(document.createTextNode('x'));
		e_bt.addEventListener('click', function(event) {	
			var e_li = event.target.parentNode;
			var section_name = e_li.getElementsByTagName('a')[0].innerHTML;
			if (confirm('remove ' + section_name + ' ?')) {
				var api = new API();
				api.rm_section(section_name, function() {
					e_ul.removeChild(e_li);
				});
			}
		});
		
		ez_li = e_ul.getElementsByTagName('li');
		ez_li[ez_li.length - 1].appendChild(e_bt);
		
		clear_gallery();
		alert('The new section will be saved after you added one image or more');
		window.history.pushState(null, document.title, '#' +  e_input.value);
		section = e_input.value;
		e_input.value = '';
		var e_input_file = document.querySelectorAll('input[type=file]')[0];
		e_input_file.className = e_input_file.className.replace(/add_inline|remove/, '');
	});
	e_bt.appendChild(document.createTextNode('add'));
	e_menu.appendChild(e_bt);
	
	//logout
	e_bt = document.createElement('button');
	e_bt.appendChild(document.createTextNode('logout'));
	e_bt.addEventListener('click', function(event) {
		localStorage.clear();
		window.location.replace('.');
	});
	e_menu.appendChild(e_bt);
	
	//upload files
	var e_input_u = document.createElement('input');
	
	attr = document.createAttribute('type');
	attr.nodeValue = 'file';
	e_input_u.setAttributeNode(attr);
	
	attr = document.createAttribute('name');
	attr.nodeValue = 'imgz';
	e_input_u.setAttributeNode(attr);
	
	attr = document.createAttribute('multiple');
	e_input_u.setAttributeNode(attr);
	
	attr = document.createAttribute('class');
	var val = 'bt_upload';
	if (ez_li.length == 0) {
		val += ' remove';
	}
	attr.nodeValue = val;
	e_input_u.setAttributeNode(attr);
	e_input_u.addEventListener('change', handleFileSelect, false);
	e_content.appendChild(e_input_u);
	
	//progressbar
	var e_progressbar = document.createElement('progress');
	
	attr = document.createAttribute('class');
	attr.nodeValue = 'remove';
	e_progressbar.setAttributeNode(attr);

	attr = document.createAttribute('value');
	attr.nodeValue = 0;
	e_progressbar.setAttributeNode(attr);

	attr = document.createAttribute('max');
	attr.nodeValue = 100;
	e_progressbar.setAttributeNode(attr);
	
	e_content.appendChild(e_progressbar);

	//handle upload by drag and drop
	var e_gallery = document.getElementById('gallery');
	e_gallery.addEventListener('dragenter', function() {
			if (event.target.className == 'img') {
				 event.target.parentNode.style.opacity = 0.2;
			} else {
				 event.target.style.opacity = 0.2;
			}
      return false;
  });

	e_gallery.addEventListener('dragleave', function(event) {
		event.target.parentNode.style.opacity = 1;
    return false;
	});
	e_gallery.addEventListener('drop', function(event) {
		event.target.parentNode.style.opacity = 1;
		return handleFileSelect(event);
	});
	
	
	//remove files
	e_bt = document.createElement('button');
	attr = document.createAttribute('class');
	attr.nodeValue = 'bt_upload bt_del remove';
	e_bt.setAttributeNode(attr);
	e_bt.appendChild(document.createTextNode('remove'));
	e_bt.addEventListener('click', function(event) {
		var urlz = get_selected_images();
		var api = new API();
		api.rm_images(section, urlz, function(response) {
			if (response.error == undefined) {
				var pos, position_string = window.localStorage.getItem('scroll_landscape_' + section);					
				if (properties.remember_scroll_position && position_string != undefined) {
					pos = JSON.parse(position_string);
				}
				if (pos != undefined) {
					while (pos.nb_img > nb_image_processed - urlz.length) {
						pos.nb_img = pos.nb_img - 1;
					} 
					window.localStorage.setItem('scroll_landscape_' + section, pos);
				}
				window.location.reload(true);
			}
		})
	});
	e_content.appendChild(e_bt);
	
	function text_convert(html)
	{
	   var tmp = document.createElement("div");
	   tmp.innerHTML = html;
	   return tmp.textContent||tmp.innerText;
	}
	
	//move file up 
	e_bt = document.createElement('button');
	attr = document.createAttribute('class');
	attr.nodeValue = 'bt_up';
	e_bt.setAttributeNode(attr);
	e_bt.appendChild(document.createTextNode(text_convert('&larr; up')));
	e_bt.addEventListener('click', function(event) {
		var url = get_selected_images()[0],
				api = new API();
		api.move_image(section, url, 'up', function(response) {
			if (response.error == undefined) {
				window.location.reload(true);
			}
		});
	});
	e_content.appendChild(e_bt);
	
	//move file down 
	e_bt = document.createElement('button');
	attr = document.createAttribute('class');
	attr.nodeValue = 'bt_down';
	e_bt.setAttributeNode(attr);
	e_bt.appendChild(document.createTextNode(text_convert('down &rarr;')));
	e_bt.addEventListener('click', function(event) {
		var url = get_selected_images()[0],
				api = new API();
		api.move_image(section, url, 'down', function(response) {
			if (response.error == undefined) {
				window.location.reload(true);
			}
		});
	});
	e_content.appendChild(e_bt);
}

//button close logbox
document.getElementById('close').addEventListener('click', function(event) {
	document.getElementById('logbox').className = 'remove';
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	window.history.pushState(null, document.title, '.#' + section);
	return false;
});

//button connect logbox call api/login
document.getElementById('logbox').addEventListener('submit', function (event) {
	var login = document.getElementById('login').value,
			password = document.getElementById('password').value;
			
	var api = new API();
	api.login(login, password, function(result) {
		if (result.error != undefined) {
			if (result.error == 401) {
				alert('error: login/password incorrect');
			} else {
				alert('error: problem api');
			}
		} else {
			localStorage.setItem('token', result.token);
			admin_display();
			window.history.pushState(null, document.title, '.');
		}
	});
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
});

function init_admin_panel() {
	if (!properties.admin) return;
	//switch to admin display if is connected
	var token = localStorage.getItem('token');
	if (token != undefined && token != null) {
		admin_display();
	} else if (location.search == '?' + uri_login) { 		//display login form if #login in url
		document.getElementById('logbox').className = 'add';
	}
}

// return a spliced array
function splice(arr, start, end) {
	var a = [];
	for (var i in arr) {
		if (i >= start && i < end) {
			a.push(arr[i]);
		}
	}
	return a;
}

var nb_files = 0, n_files = 0;
function updateProgress(evt) {
  if (evt.lengthComputable) {
		var e_progress = document.querySelectorAll('progress')[0];
		
    var percentLoaded = Math.round((evt.loaded / evt.total) * 100);

		if (nb_files != 0) {
			percentLoaded = Math.round((((percentLoaded / 100) / nb_files) + (n_files / nb_files)) * 100);
		}
console.log(percentLoaded);
    if (percentLoaded < 100) {
      e_progress.setAttribute('value', percentLoaded + '%');
      e_progress.textContent = percentLoaded + '%';
    }
  }
}

//upload 'files' by packets respecting <limit> 
function add_images_by_group(callback, api, limit, section, files, done) {
	api.add_images(section, splice(files, 0, limit), function(reponse) {
		if (done != undefined) {
			callback();
		} else {
			if (resp.response != "success") {
				console.log(resp);
			}
			if (files.length > limit) {
				files = splice(files, limit, files.length);
			} else {
				limit = files.length;
				done = true;
			}
			n_files = ++n_files;
			add_images_by_group(callback, api, limit, section, files, done);			
		}
	}, updateProgress);
}

//reload the gallery when upload is done
function add_images_callback () {
	var e_progress = document.querySelectorAll('progress')[0];
	e_progress.className = e_progress.className.replace(/add|add_inline/, 'remove');
	
	get_gallery(function(result) {
		gallery = result;
		if (g_gallery != null) {
			generate_gallery(gallery[section]);	
		}
	});
}

function handleFileSelect(event) {
	var e_progress = document.querySelectorAll('progress')[0];
	e_progress.className = e_progress.className.replace(/remove/, 'add');
	e_progress.innerHTML = 'upload in progress...';
	try {
		var files = (event.target.files || event.dataTransfer.files || event.originalEvent.dataTransfer.files);

		for (var file in files) {
			if (file.type != undefined && !file.type.match('image.*')) {
				alert('Files must be images');
				return;
			}
		}
		var api = new API();
		api.max_file_upload(function(r) { //php has a limit for the nbr of uploads, the following is a work around
			section = section || url_tag || Object.keys(gallery)[0];
			if (r.limit != undefined && r.limit < files.length) {
				nb_files = files.length;
				add_images_by_group(add_images_callback, api, parseInt(r.limit), section, files);
			} else {
				nb_files = 0;
				api.add_images(section, files, function(resp) {
					if (resp.response == "success") {
						add_images_callback();
					}
				}, updateProgress);
			}
		});
		
	} catch(e) {
		console.log(e);
	}
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
}

/* -------------------------- MaxPhotographer - GALLERY -------------------------- */

var landscape_default_height = properties.min_height,
		uri_login = 'login', stop_loading = false;
var gallery, section, total_width, total_height, nb_image_processed, old_url;
var e_gallery = document.getElementById('gallery'),
		e_load = document.getElementById('load_gallery');

/* get obj gallery from json */
function get_gallery(success) {
	get_storage('storage/gallery.json', success, function() {
		init_admin_panel();
	});
}

/* get json file */
function get_storage(text, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', text, true);
	xhr.onreadystatechange = function(r) {
		r = r.target;
		if (r.readyState == 4 /* complete */) {
			if (r.responseText != "") {
				var result = JSON.parse(r.responseText);
				success(result);
			} else {
				error();
			}
		}
	};
	xhr.send();
}

/* regenerate gallery if view landscape/portrait change */
var mql = { matches: false };
if (properties.responsive) {
	mql = window.matchMedia("only screen and (max-width:480px)");
	mql.addListener(function() {
		setTimeout(function() {
			generate_gallery(gallery[section]);
		},100);
	});
}

/* handle window resize */
var flag = true;
window.onresize = function() {
//global	var e_gallery = document.getElementById('gallery');
	if (e_gallery.offsetWidth > total_width && flag === true && !mql.matches) {
		add_img_gallery();
		flag = false;
	}
}

/* resize image using canvas. can only be downsized. keep proportions */
function img_resize(img, height, width) {
	var e_canvas = document.createElement('canvas');
	if (height != null) {
		e_canvas.width = Math.round(height * (img.width / img.height));
	  e_canvas.height = height;
	} else {
		e_canvas.width = width;
		e_canvas.height = Math.round(width * (img.height / img.width));
	}
	
	//prevent upsize
	if (e_canvas.width > img.width || e_canvas.height > img.height) {
		e_canvas.width = img.width;
		e_canvas.height = img.height;
	}
	
  var ctx = e_canvas.getContext('2d');
  ctx.drawImage(img,0, 0, img.width, img.height, 0, 0, e_canvas.width, e_canvas.height);
  return (height != null && width != null) ? img_resize(e_canvas, null, width) : e_canvas;
}

//create button for display_fullscreen_image
function arrow_button(right, canvas_width, img_url, imgz) {
	var e_arrow = document.createElement('div'),
			attr = document.createAttribute('class');
	attr.nodeValue = 'arrow ' + (right ? 'arrow_right' : 'arrow_left');
	e_arrow.setAttributeNode(attr);
	
	attr = document.createAttribute('style');
	attr.nodeValue = right ? 'margin-left: ' + ((canvas_width / 2) + arrow_margin) + px_str
												 : 'margin-left: -' + ((canvas_width / 2) + arrow_width + arrow_margin) + px_str;
	attr.nodeValue += 'margin-top: ' + ((window.innerHeight - arrow_height) / 2) + px_str;
	e_arrow.setAttributeNode(attr);
	
	e_arrow.addEventListener('click', function() {
		e_arrow_click(img_url, imgz, right);
	});
	return e_arrow;
}

function display_fullscreen_image(img_url, imgz) {
		var _n_img = new Image();
		_n_img.onload = function(event) {
			var e_full = document.getElementById('fullscreen');
		
			//delete previous image
			while (e_full.firstChild && (e_full.firstChild.className == undefined || e_full.firstChild.className.indexOf('load') == -1)) {
				e_full.removeChild(e_full.firstChild);
			}
			var e_loadf = e_full.getElementsByClassName('load')[0];
			e_loadf.className = e_loadf.className.replace(/add|add_inline/, 'remove');
			
			var canvas = img_resize(this, window.innerHeight, window.innerWidth - ((arrow_width + arrow_margin * 2) * 2));	
			
			//left arrow
			e_full.insertBefore(arrow_button(false, canvas.width, img_url, imgz), e_full.firstChild);
			
			//canvas
			var attr = document.createAttribute('style');
			attr.nodeValue = 'margin-left: -' + (canvas.width / 2) + px_str;
			attr.nodeValue += 'margin-top: ' + ((window.innerHeight - canvas.height) / 2) + px_str;
			canvas.setAttributeNode(attr);
			
			var e_img_attr = document.createAttribute('data-src');
			e_img_attr.nodeValue = this.src.substr(this.src.lastIndexOf('/') + 1);
			canvas.setAttributeNode(e_img_attr);
			
			e_full.insertBefore(canvas, e_full.firstChild);
			
			//right arrow
			e_full.insertBefore(arrow_button(true, canvas.width, img_url, imgz), e_full.firstChild);
		};
		_n_img.src = img_url;
}

//arrows keys can be used to change fullscreen image
document.addEventListener('keyup', function (event) {
	if (event.keyCode == 37 /*left arrow key*/ || event.keyCode == 39 /* right */) {
		var e_img = document.getElementById('fullscreen').getElementsByTagName('canvas')[0];
		var img_url = 'gallery/' + e_img.getAttribute('data-src');
		e_arrow_click(img_url, gallery[section], (event.keyCode == 39))
	}
});

//prevent gallery scrolling in fullscreen mode
document.addEventListener('keydown', function (event) {
	var e_full = document.getElementById('fullscreen');
	if (e_full.className.indexOf('remove') == -1) {
		event.preventDefault ? event.preventDefault() : event.returnValue = false;
	}
});

//return -1 if the image is in the gallery, 0 otherwise
function img_inNodeList(n, list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i].getAttribute('data-src') == n) {
			return 0;
		}
	}
	return -1;
}

//display next/previous fullscreen image
function e_arrow_click(img_url, imgz, right) {
	for (var i = 0; i < imgz.length; i++) {
		var nxt_img = imgz[right ? i + 1 : i - 1];
		if (imgz[i].url == img_url) {
			if (nxt_img == undefined) {
				nxt_img = right ? imgz[0] : imgz[imgz.length - 1];
			}
			//reload fullscreen with new image
			display_fullscreen_image(nxt_img.url, imgz);
			
			//move g_gallery
			var e_imgz = document.querySelectorAll('.img');
			for (var i = 0; i < e_imgz.length; i++) {
				if ('gallery/' + e_imgz[i].getAttribute('data-src') == img_url) {
					if (right) {
						g_gallery.scrollLeft += e_imgz[i].firstChild.width;
					} else {
						g_gallery.scrollLeft -= e_imgz[i].firstChild.width;
					}
				}
			}
			break;
		}
	}
}

var s_offsetX = 0,
		arrow_width = 60,
		arrow_height = 180,
		arrow_margin = 20,
		px_str = 'px;';
/* add images to the gallery */
function generate_gallery(imgz, iterator, preload) {
	var e_img = document.createElement('div');
	if (imgz == undefined || g_gallery == null) return;
	if (iterator == undefined) {
		iterator = 0;
		total_width = 0;
		total_height = 0;
		clear_gallery();
		old_url = [];
		g_preload = [];
	}
	
	//display loader
	if ((preload == undefined || preload === false) && (imgz.length != iterator + 1)) {
		e_load.className = e_load.className.replace(/add_inline|add|remove/, '');
	  e_load.className += ' ' + (mql.matches ? 'add' : 'add_inline');	
	} 
		var img =  imgz[iterator],
				n_img = new Image();
			
	if (img != undefined && old_url.indexOf(img.url) == -1) {
		if ((preload == undefined || preload === false) && (imgz.length != iterator + 1)) {
			e_load.className = e_load.className.replace(/add_inline|add|remove/, '');
		  e_load.className += ' ' + (mql.matches ? 'add' : 'add_inline');	
		}
		if (preload == undefined || preload === false) {
			nb_image_processed = iterator + 1;
		}
		
		old_url = img.url;
		n_img.onload = function(event) {
			if (stop_loading) {
				stop_loading = false;
				return;
			}
			// get saved scroll position
			var pos, position_string = window.localStorage.getItem('scroll_landscape_' + section);					
			if (properties.remember_scroll_position && position_string != undefined) {
				pos = JSON.parse(position_string);
			}

			//delete cookie if it's been 1 hours you disconnected
			if (pos != undefined && pos.time + 3600000 < Date.now()) {
				window.localStorage.removeItem('scroll_landscape_' + section);
			}
			
			//add infos to image
			var e_img_attr = document.createAttribute('data-src');
			e_img_attr.nodeValue = this.src.substr(this.src.lastIndexOf('/') + 1);
			e_img.setAttributeNode(e_img_attr);
		
			e_img_attr = document.createAttribute('class');
			e_img_attr.nodeValue = 'img';
			e_img.setAttributeNode(e_img_attr);
	
			//resize image to canvas
			var resized_img = (
				mql.matches
				? img_resize(event.target, null, window.innerWidth)
				: img_resize(event.target,  (window.innerHeight > landscape_default_height && properties.auto_fit)
																					? (window.innerHeight * 0.8 < landscape_default_height ? landscape_default_height : window.innerHeight * 0.8)
																					: landscape_default_height)
			);
			e_img.appendChild(resized_img);

			//image can be selected to be manipulated if user is admin
			var btz = null;
			e_img.addEventListener('mouseup', function(event) {
				var elem = event.target.parentNode,
						token = localStorage.getItem('token');
						
				if (properties.admin && token != undefined && token != null && (s_offsetX == 0 || s_offsetX == offsetX)) { //double click to select img
					if (elem.childNodes.length == 1) {
						elem.appendChild(document.createElement('span'));
					} else {
						elem.removeChild(elem.lastChild);
					}
					if (btz == null) {
						btz = document.querySelectorAll('.bt_up, .bt_down');
					}
					var nbr_imgz = (get_selected_images()).length;
					for (var i = 0; i < btz.length; i++) {
						btz[i].className = btz[i].className.replace(/add_inline|remove/, '')
																+ ' ' + (nbr_imgz == 1 ? 'add_inline' : 'remove');
					}
					var del = document.querySelectorAll('.bt_del')[0];
					if (nbr_imgz > 0) {
						del.className = del.className.replace(/add_inline|remove/, '');
					} else {
						del.className += ' remove';
					}
				}
				s_offsetX = offsetX;
			});
			
			//display image fullscreen
			var old_click_position = '';
			e_img.addEventListener('mousedown', function(event) {
				old_click_position = event.screenX + ',' + event.screenY;
			});
			e_img.addEventListener('mouseup', function(event) {
				var	token = localStorage.getItem('token');
				if ((token == undefined || token == null)
						&& properties.fullscreen
						&& !mql.matches && (old_click_position == event.screenX + ',' + event.screenY)) {
							
					var e_full = document.getElementById('fullscreen');
					e_full.className = 'add';
					
					e_full.addEventListener('click', function(event) { //quit fullscreen
						if (event.target.className.indexOf('arrow') != -1) {
							return false;
						}
						this.className = 'remove';
						var e_loadf = e_full.getElementsByClassName('load')[0];
						e_loadf.className = e_loadf.className.replace(/remove/, 'add');
					});
					
					display_fullscreen_image('gallery/' + event.target.parentNode.getAttribute('data-src'), imgz);
				}
			});
	
			//insert the image at last position
			if (!(preload == undefined || preload === false)) {
				g_preload.push(e_img);
			} else {
				var img = (g_preload.length > 0) ? g_preload.shift() : e_img;

				var src = this.src.substr(this.src.lastIndexOf('/') + 1);
				if (img_inNodeList(src, document.querySelectorAll('.img')) == -1) {
						g_gallery.insertBefore(img, e_load);
				}
			}
			disable_scroll = false;
	
			//add another image if there is space to fill on the block
			total_width += resized_img.width;
			total_height += resized_img.height;

			// chose side depending on screen orientation
			var total_size, gallery_size;
			if (mql.matches) {
				total_size = total_height;
				gallery_size = window.innerHeight;
			} else {
				total_size = total_width;
				gallery_size = window.innerWidth;
			}
			
			// if there is space to fill on the gallery and still images in it: add an image
			if (imgz.length != iterator + 1) {
				
				if (total_size < gallery_size) {
					generate_gallery(imgz, ++iterator);
				} else if (preload == undefined || preload === true) {
					var _preload = true;
					//restitute previous nb of images ... delay preload
					if (pos != null && nb_image_processed < pos.nb_img) {
						_preload = undefined;
					}
					generate_gallery(imgz, ++iterator, _preload);
				}
			}
			
			//scroll to saved position
			if (pos != undefined && !preload) {
				g_gallery.scrollLeft = pos.position;
			}
			
			e_load.className = e_load.className.replace(/add_inline|add/, 'remove');
		};
		n_img.src = img.url;
	}
}


/* fill the menu*/
function fill_menu(result) {
	var e_menu = document.getElementById('menu'),
			e_ul = e_menu.getElementsByTagName('ul')[0];
	result = Object.keys(result);
	for (var section in result) {
		add_menu_section(result[section], e_menu, e_ul);
	}
}

/* clear all images from gallery */
function clear_gallery() {
	var all_imgs = g_gallery.getElementsByClassName('img');
	if (all_imgs.length > 0) {
		while (all_imgs.length != 0) {
			g_gallery.removeChild(all_imgs[all_imgs.length - 1]);
		}
	}
	e_load.className = e_load.className.replace(/add_inline|add/, 'remove'); //global
}

/* add section to menu */
function add_menu_section(name, e_menu, e_ul) {
	var e_li = document.createElement('li'),
			e_a = document.createElement('a');
	
	e_a.innerHTML = name;

	var e_a_attr = document.createAttribute('href');
	e_a_attr.nodeValue = '#' + name;
	e_a.setAttributeNode(e_a_attr);
	
	e_a.addEventListener('click', function() {
		section = name;

		//add section's imgages to gallery
		generate_gallery(gallery[name]);

		localStorage.setItem('section', section);
	});
	e_li.appendChild(e_a);
	
	e_ul.appendChild(e_li);
}

var disable_scroll = false;

//trigger whenever gallery has been fully scrolled to the right
var g_gallery = document.getElementById('gallery'), g_preload = [];
if (g_gallery != null) {
	g_gallery.addEventListener('scroll', function() {
		if ((g_gallery.scrollWidth - g_gallery.offsetWidth <= g_gallery.scrollLeft) && !disable_scroll)
		{
			disable_scroll = true;
			add_img_gallery();
			flag = true;
		}

		var pos, position_string = window.localStorage.getItem('scroll_landscape_' + section);					
		if (position_string != undefined) {
			pos = JSON.parse(position_string);
		}

		if (properties.remember_scroll_position && (pos == undefined || !(nb_image_processed < pos.nb_img))) {
			//save user's
			window.localStorage.setItem('scroll_landscape_' + section,
				JSON.stringify({
					position: g_gallery.scrollLeft,
					nb_img: nb_image_processed,
					time: Date.now()
				})
			);
		}
	});
}

//add the next image to the gallery
function add_img_gallery() {
	var nb_all_imgs = nb_image_processed || g_gallery.getElementsByClassName('img').length,
			nb_gallery = gallery[section].length;
 	if (nb_gallery > nb_all_imgs) {
		generate_gallery(gallery[section], nb_all_imgs, false);
	}
}

window.addEventListener('scroll', function(event) {
	if (mql.matches) {
		if ((window.pageYOffset == document.documentElement.scrollHeight - document.documentElement.clientHeight) && !disable_scroll) {
			disable_scroll = true;
			add_img_gallery();
		}
	}
});

//get arg in url after #
function get_UrlArg() {
	var loc = window.location.href;
	var loc_separator = loc.indexOf('#');
	return (loc_separator == -1) ? '' : loc.substr(loc_separator + 1);
}
section = get_UrlArg();


//fill menu and gallery -- main
get_gallery(function(result /*, init_admin_panel */ ) {
	gallery = result;
	fill_menu(gallery);
	
	var keys = Object.keys(gallery);
	if (location.search == '?' + uri_login) {
		section = localStorage.getItem('section') || keys[0];
	} else {
		section = (keys.indexOf(section) != -1) ? section : keys[0];
	}
	if (g_gallery != null) {
		generate_gallery(gallery[section]);
	}
	if (typeof init_admin_panel == 'function') {
	  init_admin_panel();
	}
});

/* drag gallery */
var dragged, offsetX,
 		g_gallery = document.getElementById('gallery');
if (properties.drag && g_gallery != null) {
	g_gallery.onmousedown = function(event) {
		dragged = false;
	  if (event.button == 2) return;
		if (event.screenY < g_gallery.parentNode.offsetHeight - 5) { //correct bug no mouseup trigger after use of scrollbar
			dragged = true;
		}
    offsetX = event.screenX - this.offsetLeft;
    return false;
	}

	g_gallery.onmousemove = function(event) {
		if (dragged) {
			g_gallery.scrollLeft = g_gallery.scrollLeft - (event.screenX - offsetX) / 7; //the division slows the slide by cursor
		}
	} 
     
	g_gallery.onmouseup = function() {
	  if (dragged) {
			dragged = false;
	  }
	}
}

});