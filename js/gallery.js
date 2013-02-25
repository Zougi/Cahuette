/* MaxPhotographer - gallery.js */

var landscape_max_height = 540,
		uri_login = 'login';
var gallery, section, total_width, total_height, nb_image_processed, old_url;
var e_gallery = document.getElementById('gallery'),
		e_load = document.getElementById('load_gallery');

/* get obj gallery from json */
function get_gallery(success) {
	get_storage('storage/gallery.json', success, function() {
		init_admin_panel();
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

function display_fullscreen_image(img_url, imgz) {
		var _n_img = new Image();
		_n_img.onload = function(event) {
			var e_full = document.getElementById('fullscreen');
		
			//delete previous image
			while (e_full.firstChild) {
				e_full.removeChild(e_full.firstChild);
			}
			
			var canvas = img_resize(this, window.innerHeight, window.innerWidth);	
			
			//left arrow
			var e_arrow = document.createElement('div'),
					attr = document.createAttribute('class');
			attr.nodeValue = 'arrow arrow_left';
			e_arrow.setAttributeNode(attr);
			
			attr = document.createAttribute('style');
			attr.nodeValue = 'margin-left: -' + ((canvas.width / 2) + arrow_width + arrow_margin) + px_str;
			attr.nodeValue += 'margin-top: ' + ((window.innerHeight - arrow_height) / 2) + px_str;
			e_arrow.setAttributeNode(attr);
			
			e_arrow.addEventListener('click', function() {
				e_arrow_click(img_url, imgz, false);
			});
			e_full.appendChild(e_arrow);
			
			//canvas
			attr = document.createAttribute('style');
			attr.nodeValue = 'margin-left: -' + (canvas.width / 2) + px_str;
			attr.nodeValue += 'margin-top: ' + ((window.innerHeight - canvas.height) / 2) + px_str;
			canvas.setAttributeNode(attr);
			
			var e_img_attr = document.createAttribute('data-src');
			e_img_attr.nodeValue = this.src.substr(this.src.lastIndexOf('/') + 1);
			canvas.setAttributeNode(e_img_attr);
			
			e_full.appendChild(canvas);
			
			//right arrow
			e_arrow = document.createElement('div');
			
			attr = document.createAttribute('class');
			attr.nodeValue = 'arrow arrow_right';
			e_arrow.setAttributeNode(attr);
			
			attr = document.createAttribute('style');
			attr.nodeValue = 'margin-left: ' + ((canvas.width / 2) + arrow_margin) + px_str;
			attr.nodeValue += 'margin-top: ' + ((window.innerHeight - arrow_height) / 2) + px_str;
			e_arrow.setAttributeNode(attr);

			e_arrow.addEventListener('click', function() {
				e_arrow_click(img_url, imgz, true);
			});
			e_full.appendChild(e_arrow);
		};
		_n_img.src = img_url;
}


document.addEventListener('keyup', function (event) {
	if (event.keyCode == 37 /*left arrow key*/ || event.keyCode == 39 /* right */) {
		var e_img = document.getElementById('fullscreen').getElementsByTagName('canvas')[0];
		var img_url = 'gallery/' + e_img.getAttribute('data-src');
		e_arrow_click(img_url, gallery[section], (event.keyCode == 39))
	}
});

function e_arrow_click(img_url, imgz, right) {
	for (var i = 0; i < imgz.length; i++) {
		var nxt_img = imgz[right ? i + 1 : i - 1]
		if (imgz[i].url == img_url && nxt_img != undefined) {
			//reload fullscreen with new image
			display_fullscreen_image(nxt_img.url, imgz);
			
			//move g_gallery
			var e_imgz = document.querySelectorAll('.img');
			for (var i = 0; i < e_imgz.length; i++) {
				if ('gallery/' + e_imgz[i].getAttribute('data-src') == img_url) {
					console.log(e_imgz[i].firstChild.width);
										console.log(e_imgz[i].firstChild);
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
	var e_img = document.createElement('div'),
			e_img_attr = document.createAttribute('style');
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
	if ((preload == undefined || preload == false) && (imgz.length != iterator + 1)) {
		e_load.className = e_load.className.replace(/add_inline|add|remove/, '');
	  e_load.className += ' ' + (mql.matches ? 'add' : 'add_inline');	
	} 
		var img =  imgz[iterator],
				n_img = new Image();
			
	if (img != undefined && old_url.indexOf(img.url) == -1) {

		if (preload == undefined || preload == false) {
			nb_image_processed = iterator + 1;
		}

		// get saved scroll position
		var pos, position_string = window.localStorage.getItem('scroll_landscape_' + section);					
		if (position_string != undefined) {
			pos = JSON.parse(position_string);
		}
		
		old_url = img.url;
		n_img.onload = function(event) {
			
			//add infos to image
			var e_img_attr = document.createAttribute('data-src');
			e_img_attr.nodeValue = this.src.substr(this.src.lastIndexOf('/') + 1);
			e_img.setAttributeNode(e_img_attr);
		
			e_img_attr = document.createAttribute('class');
			e_img_attr.nodeValue = 'img';
			e_img.setAttributeNode(e_img_attr);
	
			//resize image to canvas
			var resized_img = (
				window.matchMedia("only screen and (max-width:480px)").matches
				? img_resize(event.target, null, window.innerWidth)
				: img_resize(event.target,  (window.innerHeight > landscape_max_height) ? window.innerHeight * 0.8 : landscape_max_height)
			);
			e_img.appendChild(resized_img);

			//image can be selected to be manipulated if user is admin
			var btz = null;
			e_img.addEventListener('mouseup', function(event) {
				var elem = event.target.parentNode,
						token = localStorage.getItem('token');
						
				if (token != undefined && token != null && (s_offsetX == 0 || s_offsetX == offsetX)) { //double click to select img
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
				old_click_position = event.screenX + '' + event.screenY;
			});
			e_img.addEventListener('mouseup', function(event) {
				var	token = localStorage.getItem('token');
				if ((token == undefined || token == null)
						&& !mql.matches && (old_click_position == event.screenX + '' + event.screenY)) {
							
					var e_full = document.getElementById('fullscreen');
					e_full.className = 'add';
					
					e_full.addEventListener('click', function(event) { //quit fullscreen
						if (event.target.className.indexOf('arrow') != -1) {
							return false;
						}
						this.className = 'remove';
						try {
							while (this.firstChild) {
								this.removeChild(this.firstChild);
							}
						} catch (e) {}
					});
					
					display_fullscreen_image(img.url, imgz);
				}
			});
	
			//insert the image at last position
			if (!(preload == undefined || preload == false)) {
				g_preload.push(e_img);
			} else {
				g_gallery.insertBefore( ((g_preload.length > 0) ? g_preload.shift() : e_img), e_load);
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
				} else if (preload == undefined || preload == true) {
					var _preload = true;
					//restitute previous nb of images ... delay preload
					if (pos != null && nb_image_processed < pos.nb_img) {
						_preload = undefined;
					}
					generate_gallery(imgz, ++iterator, _preload);
				}					
			}
			
			//scroll to saved position
			if (pos != undefined) {
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

		if (pos == undefined || !(nb_image_processed < pos.nb_img)) {
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
