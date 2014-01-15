var noms = loadNoms();


function saveNoms()
{
	localStorage['noms'] = typeof noms === "string" ? noms : JSON.stringify(noms);
}


function loadNoms()
{
	var noms = localStorage['noms'];

	if(noms && typeof noms === "string" && noms[0] === "{")
		try { noms = JSON.parse(noms); } catch(msg) { }

	if(!noms) noms = {};

	return noms;
}


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse)
	{
		var action = request.action;

		switch(action)
		{
			case "changeNom":
				noms[request.windowId] = request.nom;
				saveNoms();
				sendResponse({"noms": noms});
				break;

			case "getNoms":
				sendResponse({"noms": noms});
				break;
		}

		//console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
		//if (request.greeting == "hello")
		//	sendResponse({farewell: "goodbye"});
	}
);


chrome.tabs.onActivated.addListener(function(info)
{
	var tabId = info.tabId;
	var windowId = info.windowId;
	var nom = noms[windowId];

	// test
	//if(!nom) nom = "NONE";

	if(nom)
	chrome.windows.get(windowId, {"populate": true}, function(win)
	{
		if(win.tabs && win.tabs.length)
		{
			// TODO: Cache last activated tab, and change only its title, instead of all tabs

			var len = win.tabs.length;
			for(var i=0; i < len; i++)
			{
				var inject = false;
				var tab = win.tabs[i];

				if(tab.id != tabId)
				{
					// TODO: Remove old title specifically, instead of a [A-Z] dragnet
					inject = {
						"code": "document.title = document.title.replace(/^[A-Z\\s]+:\\s/, '');",
					};
				}

				else // if(tab.id == tabId)
				{
					if(nom) inject = {
						"code": "document.title = '" + nom.toUpperCase().replace("'", "\\'")
							+ ": ' + document.title.replace(/^[A-Z\\s]+:\\s/, '');",
					};
				}

				chrome.tabs.executeScript(tab.id, inject, function(result)
				{
					if (chrome.runtime.lastError && chrome.runtime.lastError.indexOf("chrome://") === -1) {
						alert("runtime err: "+chrome.runtime.lastError.message);
						//lazyLog("err "+chrome.runtime.lastError.message);
					}
				});
			}
		}

	}); // end windows.getCurrent


}); // end tabs.onActivated



function contextMenuClick(clickData, tab)
{

}

var contextMenuDetails = {
	"id":		"pants",
	"title":	"pants",
	"type":		"radio",
	"checked":	true,
	"contexts":	["all"],
	"onclick":	contextMenuClick
};

//chrome.contextMenus.create(contextMenuDetails, function(generatedId){ alert(generatedId); });
//chrome.contextMenus.create(contextMenuDetails);


/*
contextMenuDetails.id = "pants2";
contextMenuDetails.title = "pants2";
contextMenuDetails.checked = false;
*/

var contextMenuDetails2 = {
	"id":		"pants2",
	"title":	"pants2",
	"type":		"radio",
	"checked":	false,
	"contexts":	["all"],
	"onclick":	contextMenuClick
};


//chrome.contextMenus.create(contextMenuDetails2, function(generatedId){ alert(generatedId); });
//chrome.contextMenus.create(contextMenuDetails2);

