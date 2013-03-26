# Cahuette #

Cahuette is a html5 javascript gallery component for websites and webapp.

## Overview ##

Cahuette is:
 - Responsive : It has a "smartphone view": try to resize the page or just display it from a smartphone.
 - Adaptive : the gallery's height adapt to large screens (on normal view)
 - Manageable : Cahuette comes with a php API. It allows you to add/delete multiple images and add/delete sections from your navigator. You can also do it manually by editing a simple file. Cahuette doesn't use any database.
 - Configurable : The API is optional, the adaptive height can be disabled, the responsive behavior too, ... take a closer look at the documentation below
 - Lightweight : doesn't require any external library

By its design the gallery's images can't be saved with right click. Images are proportionally resized to fit in the gallery. (canvas)

Cahuette has been tested on Firefox, Chrome, Safari and Internet Explorer

Summary:
- installation
- usage
- how to contribute
- license

## Installation ##

### Gallery ###

The gallery component work as a stand alone. It's full javascript.
The component requires the files : js/gallery.min.js, css/gallery.landscape.css, css/gallery.landscape.css, storage/gallery.json

Your html must contain the links to the files Cahuette depends on.

Put between your head tags the style files:

```html
<link href="css/gallery.landscape.css" rel="stylesheet" type="text/css" />
<link href="css/gallery.portrait.css" rel="stylesheet" type="text/css" media="only screen and (max-width:480px)" />
```

Put in the body tag:
```html
<div id="gallery"></div><!-- Menu is of course optional but recommended -->
<div id="menu"></div> <!-- Menu is of course optional but recommended. it allows user to switch between sections -->
```

Put after the end of body tag:
```html
<script src="js/gallery.js"></script>
<script>
  //gallery component
  gallery();
</script>
```
To change the properties of the gallery, pass a javascript object to the function 'gallery(..);' with some of the following options:
```javascript
gallery({
	admin: true, //enable the admin interface
	fullscreen: true, //tap on an image to display it fullscreen
	drag: true, //allow user to scroll the gallery by dragging the images
	responsive: true, //activate smartphone view (portrait)
	remember_scroll_position: true, //reset the scroll position after page reload or switch of section 
	min_height: 540, //minimum height of the gallery container
	max_height: 0, //if defined, set a maximum resizement height for gallery container. (auto_fit must be enabled)
	auto_fit: true, //autofit option is enabled max_height = window.innerHeight
	uri_api: 'api/' //default url of the api is 'api/'
 uri_storage: 'storage/gallery.json'//default url to get the images datas is 'storage/gallery.json'
});
```
The values on this example are the default ones.

Note: To integrate the gallery to a local webapp (phonegap!?), you must keep the storage/gallery.json client-side. Otherwise 

### API ###

A working installation of PHP is needed.

Make sure "storage/gallery.json" is writable (chmod 666). Make sure the "gallery" folder is writable (chmod 777).
Edit $def_login and $def_password in api/user/login.php

```php
$def_login = 'login';
$def_password = 'password';
```

Cahuete API has been tested on php 5.4.4

Note: The API is written for a casual usage, not for heavy use. It doesn't require any database. It may present security issues.
This API is mostly a way to show an implementation client side of the management control.

## USAGE ##

When you land on the main page, the menu is generated and the images of the first category load.
Only few images are displayed, the rest continues to load. Every time you scroll the gallery, the next image is added to the display list.

To administrate the admin/management section, go to: http://your_website/?login
 
- add section: fill the input "new category" and add images to this category (see section below).
Note: if no image is added, the section will not be saved

- add image(s): You can drag n drop your images from your computer to the gallery. If you prefer a more conventional way, choose the button upload at the bottom of the gallery. (On chrome it's called "Choose files...", on firefox "Browse...").
Note: The images will be uploaded to the section you are viewing

- remove image(s): select (with left click) one or more images. Click on the remove button

- move image: select just one image, click on the button up or down to move it

- remove section: Just click on the cross near the section name in the menu. Validate with ok when you are asked.

## How to contribute ##

I use the command 'make' to generate the gallery.min.js from gallery.js with 'uglifyjs'.
For any push request, please make the less change possible on the code syntax (I mean changing tabs, adding new lines), it makes the commit's relevant changes hard to find.

## License ##

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
