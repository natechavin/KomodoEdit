/* Copyright (c) 2000-2006 ActiveState Software Inc.
   See the file LICENSE.txt for licensing information. */

/*
 * The Komodo version of EJS.js also puts EJS in the ko.snippets namespace
 */

if (typeof(ko)=='undefined') {
    var ko = {};
}
if (typeof(ko.snippets)=='undefined') {
    ko.snippets = {};
}
(function() {
    // Throw one of these objects in any EJS snippet if the snippet
    // should be rejected, as in
    // <% throw new ko.snippets.RejectedSnippet() %>
    this.RejectedSnippet = function ko_snippet_RejectedSnippet(message, ex) {
        if (!ex) {
            ex = new Error();
        }
        this.fileName = ex.fileName;
        this.lineNumber = ex.lineNumber;
        this.stack = ex.stack;
        this.name = "ko.snippets.RejectedSnippet";
        this.message = message;
    };
    this.RejectedSnippet.prototype.toString = function() {
        return ("Exception: [" + this.message + "\n"
                + "name: " + this.name + "\n"
                + "fileName: " + this.fileName + "\n"
                + "lineNumber: " + this.lineNumber + "\n"
                + "stack: " + this.stack + "]\n");
    };

    this.getTextLine = function ko_snippet_getTextLine(scimoz, currentLine) {
        if (typeof(scimoz) == "undefined") {
            scimoz = ko.views.manager.currentView.scimoz;
        }
        if (typeof(currentLine) == "undefined") {
            currentLine = scimoz.lineFromPosition(scimoz.currentPos);
        }
        var startPos = scimoz.positionFromLine(currentLine);
        var endPos = scimoz.getLineEndPosition(currentLine);
        return scimoz.getTextRange(startPos, endPos);
    };

    this._leadingKeywordRE = /(?:^|[;=])\s*\w+$/;
    this.rightOfFirstRubyKeyword =  function ko_snippet_rightOfFirstRubyKeyword() {
        var text = this.getTextLine();
        return this._leadingKeywordRE.test(text);
    };

    this.inPythonClass =  function ko_snippet_inPythonClass() {
        // Move up, looking for a line that starts with 'class', but not 'def'
        var view = ko.views.manager.currentView;
        var scimoz = view.scimoz;
        var currentPos = scimoz.currentPos;
        var currentLine = scimoz.lineFromPosition(currentPos);
        var text = this.getTextLine(scimoz, currentLine);
        var getIndentLen = function(s) {
            return s.replace(/\t/g, "    ").length;
        };
        var m;
        var indentPtn = /^([ \t]*)(.*)/;
        var currIndentLen = getIndentLen(indentPtn.exec(text)[1]);
        if (currIndentLen === 0) {
            return false;
        }
        var thisIndentLen;
        while (--currentLine >= 0) {
            text = this.getTextLine(scimoz, currentLine);
            m = indentPtn.exec(text);
            thisIndentLen = getIndentLen(m[1]);
            if (thisIndentLen < currIndentLen) {
                var style = scimoz.getStyleAt(scimoz.positionFromLine(currentLine));
                if (!m[2] || m[2][0] == '#' || style == scimoz.SCE_P_TRIPLE || style == scimoz.SCE_P_TRIPLEDOUBLE) {
                    continue;
                } else if (/^class\b/.test(m[2])) {
                    if (style == scimoz.SCE_P_DEFAULT
                        || style == scimoz.SCE_P_WORD) {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        }
        return false;
    };

    this.snippetPathShortName = function(snippet) {
        var pieces = [snippet.name];
        var parent = snippet;
        var name;
        while (parent.parent) {
            parent = parent.parent;
            name = parent.name;
            pieces.push(name);
            if (name == "Abbreviations") {
                break;
            }
        }
        pieces.reverse();
        return pieces.join("/");
    };

}).apply(ko.snippets);
