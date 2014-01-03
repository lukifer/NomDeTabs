// Ready
document.addEventListener("DOMContentLoaded", function(e)
{
	var nomInput = document.getElementById("nom");
	var nomList = document.getElementById("nomList");

	// Change the current windows nom
	nomInput.addEventListener("change", function(e)
	{
		var nom = this.value;
		if(!nom) return;

		nom = nom.replace(/[^a-zA-Z0-9_\-!'"\s,\.?;%]/g, "");
		if(nom) chrome.windows.getCurrent({"populate": false}, function(win)
		{
			var msg = {
				"action": "changeNom",
				"nom": nom,
				"windowId": win.id
			};

			chrome.runtime.sendMessage(msg, function(response)
			{
				renderNomList(response.noms);
			});
		});
	}, false); // end eventListener change


	// Enter key == blur
	nomInput.addEventListener("keyup", function(e)
	{
		// TODO: Clean non-standard characters? Force uppercase?

		if(e.keyCode === 13) this.blur();
	}, false);


	// Click another nom: move tab to that
	nomList.addEventListener("click", function(e)
	{
		var a = e.target;
		var nom = a.dataset["nom"];
		var windowId = parseInt(a.dataset["windowId"]);

		chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs)
		{
			if(tabs.length < 1) return;

			chrome.tabs.move(tabs[0].id, {"windowId": windowId, "index": -1}, function(){ });
		});

		return true;
	});


	// Initial nomList render
	chrome.runtime.sendMessage({"action": "getNoms"}, function(response)
	{
		renderNomList(response.noms);

		chrome.windows.getCurrent({}, function(win)
		{
			nomInput.value = response.noms[win.id] || "none";
		});

	});

}, false); // end DOMContentLoaded


function renderNomList(noms)
{
	var ul = document.getElementById("nomList");

	var html = '';
	for(var windowId in noms)
	{
		var nom = noms[windowId];
		html += '<li><a href="javascript:void(0);" data-window-id="'+windowId+'" data-nom="'+nom+'">'+nom+'</a></li>';
	}

	ul.innerHTML = html;
}


function lazyLog(txt)
{
	var lazy = document.getElementById("lazyLog");

	var val = lazy.value + "";
	lazy.value = val + txt + "\n";
}



/* win

{"alwaysOnTop":false,"focused":false,"height":1028,"id":5444,"incognito":false,"left":4,"state":"maximized","tabs":[{"active":false,"height":956,"highlighted":false,"id":5445,"incognito":false,"index":0,"pinned":false,"selected":false,"status":"complete","title":"chrome.omnibox - Google Chrome","url":"file:///Users/lukifer/Sites/developer.chrome.com/extensions/omnibox.html","width":1676,"windowId":5444},{"active":false,"height":956,"highlighted":false,"id":5457,"incognito":false,"index":1,"pinned":false,"selected":false,"status":"complete","title":"chrome.windows - Google Chrome","url":"file:///Users/lukifer/Sites/developer.chrome.com/extensions/windows.html#method-getCurrent","width":1676,"windowId":5444},{"active":false,"height":956,"highlighted":false,"id":5451,"incognito":false,"index":2,"pinned":false,"selected":false,"status":"complete","title":"Manifest File Format - Google Chrome","url":"file:///Users/lukifer/Sites/developer.chrome.com/extensions/manifest.html","width":1676,"windowId":5444},{"active":true,"favIconUrl":"chrome://theme/IDR_EXTENSIONS_FAVICON@2x","height":956,"highlighted":true,"id":5447,"incognito":false,"index":3,"pinned":false,"selected":true,"status":"complete","title":"Extensions","url":"chrome://extensions/","width":752,"windowId":5444},{"active":false,"favIconUrl":"https://www.google.com/favicon.ico","height":916,"highlighted":false,"id":5453,"incognito":false,"index":4,"pinned":false,"selected":false,"status":"complete","title":"New Tab","url":"chrome://newtab/","width":567,"windowId":5444}],"top":22,"type":"normal","width":1676}
*/
