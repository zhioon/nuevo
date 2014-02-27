// ==UserScript==
// @id iitc-oldestportal-@vincenzotilotta
// @name IITC plugin: oldestportal
// @category Info
// @version 0.0.2.20140227.00011
// @namespace https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL https://github.com/shineangelic/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @downloadURL https://github.com/shineangelic/iitc-plugins/raw/master/oldestportal/oldestportal.user.js
// @description Show the oldest portal of a chosen player
// @include https://www.ingress.com/intel*
// @include http://www.ingress.com/intel*
// @match https://www.ingress.com/intel*
// @match http://www.ingress.com/intel*
// @grant none
// @author tailot@9w9.org shine@angelic.it
// ==/UserScript==
function wrapper() {
    if (typeof window.plugin !== "function") window.plugin = function () {};
    window.plugin.oldestportal = function () {};
    window.plugin.oldestportal.html5_storage_support = function () {
        try {
            return "localStorage" in window && window["localStorage"] !== null
        } catch (e) {
            return false
        }
    };
    window.plugin.oldestportal.ResoCheck = function (e, t) {
        try {
            for (var n = 0; n < t.length; n++) {
                if (t[n].ownerGuid.toLowerCase() == e) {
                    return 1
                }
            }
            return 0
        } catch (r) {
            return 0
        }
    };
    window.plugin.oldestportal.showInfo = function() {
    			dialog({
                    html: "Oldest portal plugin stores portal information upon all script users clicking on portal details. "
                    +"It DOES NOT collect personal data, nor increase network traffic toward intel map."
                    +"<br/><br/>Once a new Guardian is found, it will be visible to ALL your faction members but not to the other faction, so clicking on your guardian is fine."
                    +" More faction clicks, more correct enemy guardian found."
                    +"<br/><br/><b>Agent discovery</b> indicates first agent spotting, ie after guardian change/removal"
                    +"<br/><br/><b>Oldest portal Discovery</b> is the date of discovery of the guardian"
                    +"<br/><br/><b>Last Reconnaissance</b> indicates last visit/confirmation to the oldest portal"
                    +"<br/><br/> <b>Oldest portal plugin</b> is a free espionage tool, but it's likely to be considered against the Ingress TOS. Any use is at your own risk. Please use it wisely and share it only with <i>trusted</i> agents.",
                    title: "Oldest Portal Plugin - tailot@9w9.org & shine@angelic.it",
                    id: "oldestportalinfo"
                });
                return;
	};
    window.plugin.oldestportal.timeToDays = function (e) {
        var t = new Date;
        return parseInt(Math.abs(e - t.getTime()) / (24 * 60 * 60 * 1e3), 10)
    };
    window.plugin.oldestportal.DrawOldestPortalByPlayer = function (e) {
        $.post("http://www.angelic.it/ingress/ingress.php", {
            n: e.toLowerCase()
        }, function (t) {
            if (t == "") {
                dialog({
                    html: "No player found with nickname: " + e + ". Is this espionage?",
                    title: "Oldest Portal Plugin - NOT FOUND",
                    id: "oldestportal"
                });
                return
            }
            var n = t.split("{}");
            var r = n[3] * 1e-6;
            var i = n[4] * 1e-6;
            var s = "NO";
            if (n[6]) s = "YES";
            var o = "#03DC03";
            if (n[2] == "RESISTANCE") o = "#0088ff";
            var u = "Life: " + window.plugin.oldestportal.timeToDays(n[1]) + " Days - Valid: " + s + "<br /><br />Oldest Portal pwned by " + '<mark class="nickname" style="color:' + o + '">' + n[0] + '</mark> is <a href="http://www.ingress.com/intel?ll=' + r.toFixed(6) + "," + i.toFixed(6) + '">' + n[5] + "</span></a>";
            var a = n[10];
            if (!a || 0 === a.length || a == "0000-00-00 00:00:00") a = "unknown";
            var f = "<i>Oldest portal Discovery: " + a + "</i>";
            var l = n[9];
            var lr = n[11];
            if (l && l != "0000-00-00 00:00:00")
                f += "<br/><i>Agent discovery: " + l + "</i>";
            if (lr && lr != "0000-00-00 00:00:00")
                f += "<br/><i>Last Reconnaissance: " + lr + "</i>";
            
            f+= '<br/><br/><div class="linkdetails" ><aside><a href="#" onclick="window.plugin.oldestportal.showInfo()" title="Oldest Portal Info">How does it Work?</a></aside></div>';
            dialog({
                html: u + "<br /><br /><br />" + f,
                title: "Oldest Portal Plugin",
                id: "oldestportal"
            })
        })
    };

    var e = function () {
        $.post("http://www.angelic.it/ingress/ingress.php", {
            u: window.PLAYER.nickname,
            f: window.PLAYER.team,
            ap: window.PLAYER.ap,
            lev: window.PLAYER.level
        });
        if (window.plugin.oldestportal.html5_storage_support() != false) {
            $(document).ajaxSuccess(function (e, t, n) {
                if (t.action == "getPortalDetails") {
                    var r;
                    var i;
                    if (!t.responseJSON.captured) {
                        r = "";
                        i = 0
                    } else {
                        r = t.responseJSON.captured.capturingPlayerId;
                        i = t.responseJSON.captured.capturedTime
                    }
                    var s = t.responseJSON.descriptiveText.map.ADDRESS;
                    var o = window.plugin.oldestportal.ResoCheck(r.toLowerCase(), t.responseJSON.resonatorArray.resonators);
                    s = s.split(",");
                    $.post("http://www.angelic.it/ingress/ingress.php", {
                        nickname: r,
                        capturetime: i,
                        faction: t.responseJSON.controllingTeam.team,
                        lat: t.responseJSON.locationE6.latE6,
                        lon: t.responseJSON.locationE6.lngE6,
                        title: t.responseJSON.descriptiveText.map.TITLE,
                        valid: o,
                        city: s[2],
                        nation: s[3]
                    })
                }
            });
            $("head").append("<style>" + ".ui-dialog-oldestportal {width: auto !important; min-width: 500px !important; max-width: 500px !important;}" + ".ui-dialog-oldestportal table {border-collapse: collapse;clear: both;empty-cells: show;margin-top: 10px;}" + "</style>");
            var e = '<input style="font-size:80%" id="playerOldPortal" placeholder="Type player name to find oldest portal" type="text">';
            $("#sidebar").append(e);
            $("#playerOldPortal").keypress(function (e) {
                if ((e.keyCode ? e.keyCode : e.which) !== 13) return;
                var t = $(this).val();
                window.plugin.oldestportal.DrawOldestPortalByPlayer(t)
            })
        }
    };
    if (window.iitcLoaded && typeof e === "function") {
        e()
    } else {
        if (window.bootPlugins) window.bootPlugins.push(e);
        else window.bootPlugins = [e]
    }
}
var script = document.createElement("script");
script.appendChild(document.createTextNode("(" + wrapper + ")();"));
(document.body || document.head || document.documentElement).appendChild(script)
