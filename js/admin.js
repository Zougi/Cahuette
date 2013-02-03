/* MaxPhotographer - admin.js */

function get_selected_images() {
	var ez_div = document.querySelectorAll('.img');
	var url, urlz = []; 
	for (var i = 0; i < ez_div.length; i++) {
		if (ez_div[i].childNodes.length > 1) {
			url = ez_div[i].getAttribute('data-img');
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
				api.rm_section(section_name, function() {
					if (section_name == section) {
						window.location.reload(true);
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
	attr.nodeValue = 'bt_upload';
	e_input_u.setAttributeNode(attr);
	e_input_u.addEventListener('change', handleFileSelect, false);
	e_content.appendChild(e_input_u);
	
	
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
		handleFileSelect(event);
	});
	
	
	//remove files
	e_bt = document.createElement('button');
	attr = document.createAttribute('class');
	attr.nodeValue = 'bt_upload';
	e_bt.setAttributeNode(attr);
	e_bt.appendChild(document.createTextNode('remove'));
	e_bt.addEventListener('click', function(event) {
		var urlz = get_selected_images();
		var api = new API();
		api.rm_images(section, urlz, function() {
			window.location.reload();
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
		api.move_image(section, url, 'up', function() {
			window.location.reload(true);
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
		api.move_image(section, url, 'down', function(e) {
			window.location.reload(true);
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
	api.login(login, password, function(response) {
		var result = JSON.parse(response);
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

function init() {
	//switch to admin display if is connected
	var token = localStorage.getItem('token');
	if (token != undefined && token != null) {
		admin_display();
	} else if (location.search == '?login') { 		//display login form if #login in url
		document.getElementById('logbox').className = 'add';
	}
}

function handleFileSelect(event) {
	try {
		var files = (event.target.files || event.dataTransfer.files || event.originalEvent.dataTransfer.files);

		for (var file in files) {
			if (file.type != undefined && !file.type.match('image.*')) {
				alert('Files must be images');
				return;
			}
		}
		var api = new API();
		api.add_images(section || url_tag || Object.keys(gallery)[0], files, function(reponse) {
			window.location.reload(true);
		});
	} catch(e) {
		console.log(e);
	}
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
}
