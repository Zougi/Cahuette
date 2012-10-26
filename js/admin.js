
//switch to admin display
function admin_display() {
	var e_bt,
			e_logbox = document.getElementById('logbox'),
			e_menu = document.getElementById('menu'),
			e_content = document.getElementById('content'),
			e_ul = e_menu.getElementsByTagName('ul')[0];
			ez_li = e_ul.getElementsByTagName('li'),
	 		attr = document.createAttribute('class');

	//remove logbox
	attr.nodeValue = 'remove';
	e_logbox.setAttributeNode(attr);
	
	//add supress buttons
	for (var i = 0; i < ez_li.length; i++) {
		e_bt = document.createElement('button');
		e_bt.appendChild(document.createTextNode('x'));
		e_bt.addEventListener('click', function(event) {
			var e_li = event.target.parentNode;
			if (confirm('remove ' + e_li.getElementsByTagName('a')[0].innerHTML + ' ?')) {
				e_ul.removeChild(e_li);
				//call api
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
			if (confirm('remove ' + e_li.getElementsByTagName('a')[0].innerHTML + ' ?')) {
				e_ul.removeChild(e_li);
				//call api
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
	
	//remove files
	e_bt = document.createElement('button');
	attr = document.createAttribute('class');
	attr.nodeValue = 'bt_upload';
	e_bt.setAttributeNode(attr);
	e_bt.appendChild(document.createTextNode('remove'));
	e_bt.addEventListener('click', function(event) {
		var ez_div = document.querySelectorAll('.img');
		var urlz = []; 
		for (var i = 0; i < ez_div.length; i++) {
			if (ez_div[i].hasChildNodes()) {
				var url = window.getComputedStyle(ez_div[i]).getPropertyValue('background-image');
				url = 'gallery/' + url.replace(/^url\(["']?.*(\\|\/)/, '').replace(/["']?\)$/, '');
				urlz.push(url);
			}
		}
		var formData = new FormData();

		formData.append('token', localStorage.getItem('token'));
		formData.append('section', section);
		for (var i = 0; i < urlz.length; i++) {
			formData.append('url' + i, urlz[i]);	
		}
		
	  var xhr = new XMLHttpRequest();
	  xhr.open('POST', 'api/gallery/remove.php', true);
	  xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 /* complete */) {
	      console.log(xhr.responseText);
				window.location.reload();
	    }
		};
	  xhr.send(formData);
	});
	e_content.appendChild(e_bt);
}

//button close logbox
document.getElementById('close').addEventListener('click', function(event) {
	var e_logbox = document.getElementById('logbox'),
			attr = document.createAttribute('class');
	attr.nodeValue = 'remove';
	e_logbox.setAttributeNode(attr);
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	window.history.pushState(null, document.title, '.');
	return false;
});

//button connect logbox call api/login
document.addEventListener('submit', function (event) {
	var login = document.getElementById('login').value,
			password = document.getElementById('password').value;
			
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'api/user/login.php?login=' + login + '&password=' + password, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4 /* complete */) {
			var result = JSON.parse(xhr.responseText);
			localStorage.setItem('token', result.token);
			admin_display();
			window.history.pushState(null, document.title, '.');		
	  }
	};
	xhr.send();
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
});

function init() {
	//switch to admin display if is connected
	var token = localStorage.getItem('token');
	if (token != undefined && token != null) {
		admin_display();
	} else if (location.search == '?login') { 		//display login form if #login in url
		var e_logbox = document.getElementById('logbox'),
				attr = document.createAttribute('class');
		attr.nodeValue = 'add';
		e_logbox.setAttributeNode(attr);
	}
}


function send_img(section, files, callback) {
  var formData = new FormData();

	formData.append('token', localStorage.getItem('token'));
	formData.append('section', section);
	for (var file in files) {
		formData.append('file' + file, files[file]);
	}
		
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'api/gallery/add.php', true);
  xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 /* complete */) {
      console.log(xhr.responseText);
			//callback(xhr.responseText);
    }
	};
	// var progressBar = document.querySelector('progress');
	//   xhr.upload.onprogress = function(e) {
	//     if (e.lengthComputable) {
	//       progressBar.value = (e.loaded / e.total) * 100;
	//       progressBar.textContent = progressBar.value; // Fallback for unsupported browsers.
	//     }
	//   };
  xhr.send(formData);
}

function handleFileSelect(event) {
	try {
		var files = (event.target.files || event.originalEvent.dataTransfer.files);

		for (var file in files) {
			if (file.type != undefined && !file.type.match('image.*')) {
				alert('Files must be images');
				return;
			}
		}
		send_img(section || url_tag || Object.keys(gallery)[0], files, function(reponse) {
			window.location.href = '#' + section;
		});
	} catch(e) {
		if (typeof debug != 'undefined' && debug) {
			console.log('Display error');
			console.log(e);
		}
	}
	event.preventDefault ? event.preventDefault() : event.returnValue = false;
	return false;
}
