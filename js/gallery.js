/* MaxPhotographer - gallery.js */

var landscape_max_height = 540,
		landscape_max_width = 380;
var gallery, section, total_width, total_height;

/* get obj gallery from json */
function get_gallery(success) {
	get_storage('storage/gallery.json', success, function() {
		init();
	});
}

/* get obj text from json */
function get_text(success) {
	get_storage('storage/text.json', success);
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
var mql = window.matchMedia("only screen and (max-width:480px)");
mql.addListener(function(m) {
	setTimeout(function() {
		generate_gallery(gallery[section]);
	},100);
});

/* handle window resize */
var flag = true;
window.onresize = function(e) {
	var e_gallery = document.getElementById('gallery');
	if (e_gallery.offsetWidth > total_width && flag === true && !mql.matches) {
		add_img_gallery();
		flag = false;
	}
}

/* resize image using canvas */
function img_resize(img, height, width) {
	var e_canvas = document.createElement('canvas');
	if (height != null) {
		e_canvas.width = Math.round(height * (img.width / img.height));
	  e_canvas.height = height;
	} else {
		e_canvas.height = Math.round(width * (img.height / img.width));
		e_canvas.width = width;
	}
  var ctx = e_canvas.getContext('2d');
  ctx.drawImage(img,0, 0, img.width, img.height, 0, 0, e_canvas.width, e_canvas.height);
  return e_canvas;
}

/* add images to the gallery */
function generate_gallery(imgz, iterator) {
	var e_img = document.createElement('div'),
			e_load = document.getElementById('load'),
			e_img_attr = document.createAttribute('style'),
			e_gallery = document.getElementById('gallery');
				
	if (imgz == undefined || g_gallery == null) return;
	if (iterator == undefined) {
		iterator = 0;
		total_width = 0;
		total_height = 0;
		clear_gallery();
	}

	//display loader
	e_load.className = mql.matches ? 'add' : 'add_inline';
	
	var img =  imgz[iterator],
			n_img = new Image();
			
	if (img != undefined) {
		n_img.src = img.url;
		n_img.onload = function(event) {
	
			//resize image to canva
			var resized_img = (
				window.matchMedia("only screen and (max-width:480px)").matches
				? img_resize(event.target, null, landscape_max_width)
				: img_resize(event.target, landscape_max_height)
			);
			e_img.appendChild(resized_img);
	
			//add infos to image
			var e_img_attr = document.createAttribute('data-src');
			e_img_attr.nodeValue = this.src.substr(this.src.lastIndexOf('/') + 1);
			e_img.setAttributeNode(e_img_attr);
		
			e_img_attr = document.createAttribute('class');
			e_img_attr.nodeValue = 'img';
			e_img.setAttributeNode(e_img_attr);

			//image can be selected to be manipulated if user is admin
			var btz = null;
			e_img.addEventListener('click', function(event) {
				var elem = event.target.parentNode,
						token = localStorage.getItem('token');
				if (token != undefined && token != null) {
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
			});
	
			//insert the image at last position
			g_gallery.insertBefore(e_img, e_load);
	
			//add another image if there is space to fill on the block
			total_width += resized_img.width;
			total_height += resized_img.height;

			if (mql.matches) {
				e_gallery_height = window.innerHeight;
				if (total_height < e_gallery_height && imgz.length != iterator + 1) {
					generate_gallery(imgz, ++iterator);
				}
			} else {
				e_gallery_width = window.innerWidth;
				if (total_width < e_gallery_width && imgz.length != iterator + 1) {
					generate_gallery(imgz, ++iterator);
				}
			}
			
			if (imgz.length == iterator + 1) {
				//hide loader
				e_load.className = 'remove';
			}
		}
	};
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
	e_load.className = 'remove';
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
		//add section's imgages to gallery
		generate_gallery(gallery[name]);
		
		section = name;
		localStorage.setItem('section', section);
	});
	e_li.appendChild(e_a);
	
	e_ul.appendChild(e_li);
}

//trigger whenever gallery has been fully scrolled to the right
var g_gallery = document.getElementById('gallery');
if (g_gallery != null) {
	var e_load = document.getElementById('load');
	g_gallery.addEventListener('scroll', function() {
		if (g_gallery.scrollWidth - g_gallery.offsetWidth <= g_gallery.scrollLeft)
		{
			add_img_gallery();
		}
	});
}

function add_img_gallery() {
	var nb_all_imgs = g_gallery.getElementsByClassName('img').length,
			nb_gallery = gallery[section].length;
 	if (nb_gallery > nb_all_imgs) {
		generate_gallery(gallery[section], nb_all_imgs);
	}
}

window.addEventListener('scroll', function(event) {
	if (mql.matches) {
		if (window.pageYOffset == document.documentElement.scrollHeight - document.documentElement.clientHeight) {
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
get_gallery(function(result) {
	gallery = result;
	fill_menu(gallery);
	var keys = Object.keys(gallery);
	if (location.search == '?login') {
			section = localStorage.getItem('section') || keys[0];
	} else {
			section = (keys.indexOf(section) != -1) ? section : keys[0];
	}
	if (g_gallery != null) {
		generate_gallery(gallery[section]);	
	}
	if (typeof init == 'function') {
	  init();
	}
});


//drag gallery
var dragged, offsetX,
 		g_gallery = document.getElementById('gallery');
if (g_gallery != null) {
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