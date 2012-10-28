/* MaxPhotographer - contacts.js */

function init() {
	var pos_slash = location.href.lastIndexOf('/') + 1,
			href = location.href.substr(0, pos_slash),
			uri = location.href.substr(pos_slash);
	if (uri != "") {
		var e_menu_linkz = document.getElementById('menu').querySelectorAll('a');
		for (var i in e_menu_linkz) {
			if (e_menu_linkz[i].href != undefined) {
				e_menu_linkz[i].href = href + e_menu_linkz[i].href.substr(e_menu_linkz[i].href.lastIndexOf('#'));
			}
		}
	}
}
