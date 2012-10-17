/* max photography - gallery.js */
var debug = true;

var mql = window.matchMedia("only screen and (max-width:720px)");
mql.addListener(function(m) {
  console.log('little screen');
});

var gallery;

/* fill gallery and menu */
var xhr = new XMLHttpRequest();
xhr.open('GET', 'gallery.json', true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4 /* complete */) {
    var result = JSON.parse(xhr.responseText);
		gallery = result;
		fill_menu(result);
  }
};
xhr.send();

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
	// if (debug) {
	// 	console.log(img);
	// }
}

/* fill the menu*/
function fill_menu(result) {
	var e_menu = document.getElementById('menu'),
			e_ul = e_menu.getElementsByTagName('ul')[0];
			
	var sections = [];
	for (var section_name in result) {
		sections.push(section_name);
	}
	var nb_sections = sections.length;
	var section;
	while ((section = sections.pop()) != null) {
		add_menu_section(section, e_menu, e_ul);
	}
}

/* add section to menu */
function add_menu_section(name, e_menu, e_ul, e_li) {
	var e_li = document.createElement('li'),
			e_a = document.createElement('a'),
			e_a_attr = document.createAttribute('href'),
			e_gallery = document.getElementById('gallery'),
			e_title = document.getElementById('title');
	
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
		
		//name gallery
		e_title.innerHTML = name;
		
		//add section's imgages to gallery
		for (var img in gallery[name]) {
			add_img_gallery(gallery[name][img]);
		}
		//console.log(gallery[name]);
	});
	e_li.appendChild(e_a);
	
	e_ul.insertBefore(e_li, e_ul.children[1]);
}

//nbr of time div has been scrolled to the right
var nb_scroll = 0;

//trigger whenever gallery has been fully scrolled to the right
document.getElementById('gallery').addEventListener('scroll', function() {
	var e_gallery = document.getElementById('gallery');
	
	if (e_gallery.scrollWidth - e_gallery.offsetWidth <= e_gallery.scrollLeft)
	{
		var all_imgs = e_gallery.getElementsByClassName('img');
	    console.log('scrolled');
	}
});
