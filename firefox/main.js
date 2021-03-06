var data         = require("sdk/self").data;
var ss           = require("sdk/simple-storage");
var clipboard    = require("sdk/clipboard");
var Panel        = require("sdk/panel").Panel;
var ToggleButton = require('sdk/ui/button/toggle').ToggleButton;
var Hotkey       = require("sdk/hotkeys").Hotkey;
var tabs         = require("sdk/tabs");

var panel, button, hotkey;

panel = Panel({
  width: 510,
  height: 370,
  contentURL: data.url("popup.html"),
  contentScriptFile: data.url("helper.js"),
  onShow: function() {
    button.state('window', {checked: true});
  },
  onHide: function() {
    button.state('window', {checked: false});
  }
});

// Create a button
button = ToggleButton({
  id: "show-emoji-panel",
  label: "Show Emoji Helper",
  icon: {
    "16": "./icon.png",
    "32": "./icon.png",
    "64": "./icon.png"
  },
  onChange: function (state) {
    if (state.checked) {
      panel.show({
        position: button
      });
    }
  }
});

function createHotkey(combo) {
  ss.storage.combo = combo;
  if(combo === 'none'){
    return;
  }

  // create a keyboard shortcut
  hotkey = Hotkey({
    combo: combo,
    onPress: function() {
      if (panel.isShowing) {
        panel.hide();
      }else{
        panel.show({
          position: button
        });
      }
    }
  });
}

createHotkey(ss.storage.combo || "accel-e");

panel.port.on("combo", function(combo) {
  hotkey.destroy();
  createHotkey(combo);
});

panel.port.on("insert", function(text) {
  tabs.activeTab.attach({
    contentScript: 'document.activeElement.value += "' + (text || "") + '"'
  });
});

panel.port.on("copy", function(text) {
  clipboard.set(text);
});

panel.port.on("set", function(item) {
  ss.storage[item.key] = item.value;
});

panel.port.on("get", function(key) {
  panel.port.emit("send", {
    key: key,
    value: ss.storage[key]
  });
});


