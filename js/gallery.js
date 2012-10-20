/* max photography - gallery.js */
var max_gallery = 3;
var gallery, section;

/* get obj gallery from json */
function get_gallery(success) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'gallery.json', true);
	xhr.onreadystatechange = function(r) {
		r = r.target;
		if (r.readyState == 4 /* complete */) {
			var result = JSON.parse(r.responseText);
			success(result);
		}
	};
	xhr.send();
}

/* add an image to the gallery */
function add_img_gallery(img) {
	var e_gallery = document.getElementById('gallery'),
			e_load = document.getElementById('load'),
			e_img = document.createElement('div'),
			e_img_attr = document.createAttribute('style');

	e_img_attr.nodeValue = 'background-image: url(' + img.url + ');';
	e_img.setAttributeNode(e_img_attr);

	e_img_attr = document.createAttribute('class');
	e_img_attr.nodeValue = 'img';
	e_img.setAttributeNode(e_img_attr);
	
	e_gallery.insertBefore(e_img, e_load);
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

/* add images to gallery */
function generate_gallery(gallery, name, max) {
	var i = 0;
	for (var img in gallery[name]) {
		if (i++ > max) {
			break;
		}
		add_img_gallery(gallery[name][img]);
	}
}

/* add section to menu */
function add_menu_section(name, e_menu, e_ul, e_li) {
	var e_li = document.createElement('li'),
			e_a = document.createElement('a'),
			e_a_attr = document.createAttribute('href'),
			e_gallery = document.getElementById('gallery');
	
	e_a.innerHTML = name;

	e_a_attr.nodeValue = '#' + name;
	e_a.setAttributeNode(e_a_attr);
	
	e_a.addEventListener('click', function() {
		//remove previous images in gallery
		var all_imgs = e_gallery.getElementsByClassName('img');
		if (all_imgs.length > 0) {
			while (all_imgs.length != 0) {
				e_gallery.removeChild(all_imgs[all_imgs.length - 1]);
			}
		}
		
		//add section's imgages to gallery
		generate_gallery(gallery, name, max_gallery);
		
		section = name;
		//console.log(gallery[name]);
	});
	e_li.appendChild(e_a);
	
	e_ul.appendChild(e_li);
}

//trigger whenever gallery has been fully scrolled to the right
document.getElementById('gallery').addEventListener('scroll', function() {
	var e_gallery = document.getElementById('gallery');

	if (e_gallery.scrollWidth - e_gallery.offsetWidth <= e_gallery.scrollLeft)
	{
		var nb_all_imgs = e_gallery.getElementsByClassName('img').length,
				nb_gallery = gallery[section].length;

	 	if (nb_gallery > nb_all_imgs) {
			var i = 0;
			while (nb_gallery == nb_all_imgs || i == 2) {
				add_img_gallery[nb_all_imgs + i++];
			}
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


//fill menu and gallery
get_gallery(function(result) {
		gallery = result;
		fill_menu(gallery);
		var keys = Object.keys(gallery);
		section = (keys.indexOf(section) != -1) ? section : keys[0];
		generate_gallery(gallery, section, max_gallery);
		init();
});


//drag gallery
var dragged, offsetX,
		e_gallery = document.getElementById('gallery');

e_gallery.onmousedown = function(event) {
    if (event.button == 2) return;
    dragged = true;
    offsetX = event.screenX - this.offsetLeft;
    return false;
}

document.onmousemove = function(event) {
	if (dragged) {
		e_gallery.scrollLeft = e_gallery.scrollLeft - (event.screenX - offsetX) / 7;
	}
} 
     
document.onmouseup = function() {
  if (dragged) {
		dragged = false;
  }
}
