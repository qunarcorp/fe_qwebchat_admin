/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  20120720 improve performance in ie6
 *  20140618 support render function as Hogan.Template first parameter ( compatible with older versions )
 */

window.Hogan = {};

(function (Hogan, useArrayBuffer) {
    Hogan.Template = function (codeObj, text, compiler, options) {
        codeObj = codeObj || {};
        this.r = typeof codeObj === 'function' ? codeObj : codeObj.code || this.r;
        this.c = compiler;
        this.options = options;
        this.text = text || '';
        this.partials = codeObj.partials || {};
        this.subs = codeObj.subs || {};
        this.ib();
    }

    Hogan.Template.prototype = {
        // render: replaced by generated code.
        r: function (context, partials, indent) { return ''; },

        // variable escaping
        v: hoganEscape,

        // triple stache
        t: coerceToString,

        render: function render(context, partials, indent) {
            return this.ri([context], partials || {}, indent);
        },

        // render internal -- a hook for overrides that catches partials too
        ri: function (context, partials, indent) {
            return this.r(context, partials, indent);
        },

        // ensurePartial
        ep: function(symbol, partials) {
            var partial = this.partials[symbol];

            // check to see that if we've instantiated this partial before
            var template = partials[partial.name];
            if (partial.instance && partial.base == template) {
                return partial.instance;
            }

            if (typeof template == 'string') {
                if (!this.c) {
                    throw new Error("No compiler available.");
                }
                template = this.c.compile(template, this.options);
            }

            if (!template) {
                return null;
            }

            // We use this to check whether the partials dictionary has changed
            this.partials[symbol].base = template;

            if (partial.subs) {
                template = createSpecializedPartial(template, partial.subs, partial.partials, this.text);
            }

            this.partials[symbol].instance = template;
            return template;
        },

        // tries to find a partial in the curent scope and render it
        rp: function(symbol, context, partials, indent) {
            var partial = this.ep(symbol, partials);
            if (!partial) {
                return '';
            }

            return partial.ri(context, partials, indent);
        },

        // render a section
        rs: function(context, partials, section) {
            var tail = context[context.length - 1];

            if (!isArray(tail)) {
                section(context, partials, this);
                return;
            }

            for (var i = 0; i < tail.length; i++) {
                context.push(tail[i]);
                section(context, partials, this);
                context.pop();
            }
        },

        // maybe start a section
        s: function(val, ctx, partials, inverted, start, end, tags) {
            var pass;

            if (isArray(val) && val.length === 0) {
                return false;
            }

            if (typeof val == 'function') {
                val = this.ms(val, ctx, partials, inverted, start, end, tags);
            }

            pass = !!val;

            if (!inverted && pass && ctx) {
                ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
            }

            return pass;
        },

        // find values with dotted names
        d: function(key, ctx, partials, returnFound) {
            var names = key.split('.'),
                val = this.f(names[0], ctx, partials, returnFound),
                cx = null;

            if (key === '.' && isArray(ctx[ctx.length - 2])) {
                return ctx[ctx.length - 1];
            }

            for (var i = 1; i < names.length; i++) {
                if (val && typeof val == 'object' && val[names[i]] != null) {
                    cx = val;
                    val = val[names[i]];
                } else {
                    val = '';
                }
            }

            if (returnFound && !val) {
                return false;
            }

            if (!returnFound && typeof val == 'function') {
                ctx.push(cx);
                val = this.mv(val, ctx, partials);
                ctx.pop();
            }

            return val;
        },

        // find values with normal names
        f: function(key, ctx, partials, returnFound) {
            var val = false,
                v = null,
                found = false;

            for (var i = ctx.length - 1; i >= 0; i--) {
                v = ctx[i];
                if (v && typeof v == 'object' && v[key] != null) {
                    val = v[key];
                    found = true;
                    break;
                }
            }

            if (!found) {
                return (returnFound) ? false : "";
            }

            if (!returnFound && typeof val == 'function') {
                val = this.mv(val, ctx, partials);
            }

            return val;
        },

        // higher order templates
        ls: function(func, cx, partials, text, tags) {
            var oldTags = this.options.delimiters;

            this.options.delimiters = tags;
            this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
            this.options.delimiters = oldTags;

            return false;
        },

        // compile text
        ct: function(text, cx, partials) {
            if (this.options.disableLambda) {
                throw new Error('Lambda features disabled.');
            }
            return this.c.compile(text, this.options).render(cx, partials);
        },

        // template result buffering
        b: (useArrayBuffer) ? function(s) { this.buf.push(s); } :
            function(s) { this.buf += s; },

        fl: (useArrayBuffer) ? function() { var r = this.buf.join(''); this.buf = []; return r; } :
            function() { var r = this.buf; this.buf = ''; return r; },
        // init the buffer
        ib: function () {
            this.buf = (useArrayBuffer) ? [] : '';
        },

        // method replace section
        ms: function(func, ctx, partials, inverted, start, end, tags) {
            var textSource,
                cx = ctx[ctx.length - 1],
                result = func.call(cx);

            if (typeof result == 'function') {
                if (inverted) {
                    return true;
                } else {
                    textSource = (this.activeSub && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
                    return this.ls(result, cx, partials, textSource.substring(start, end), tags);
                }
            }

            return result;
        },

        // method replace variable
        mv: function(func, ctx, partials) {
            var cx = ctx[ctx.length - 1];
            var result = func.call(cx);

            if (typeof result == 'function') {
                return this.ct(coerceToString(result.call(cx)), cx, partials);
            }

            return result;
        },

        sub: function(name, context, partials, indent) {
            var f = this.subs[name];
            if (f) {
                this.activeSub = name;
                f(context, partials, this, indent);
                this.activeSub = false;
            }
        }

    };

    function createSpecializedPartial(instance, subs, partials, childText) {
        function PartialTemplate() {};
        PartialTemplate.prototype = instance;
        function Substitutions() {};
        Substitutions.prototype = instance.subs;
        var key;
        var partial = new PartialTemplate();
        partial.subs = new Substitutions();
        partial.subsText = {};  //hehe. substext.
        partial.ib();

        for (key in subs) {
            partial.subs[key] = subs[key];
            partial.subsText[key] = childText;
        }

        for (key in partials) {
            partial.partials[key] = partials[key];
        }

        return partial;
    }

    var rAmp = /&/g,
        rLt = /</g,
        rGt = />/g,
        rApos =/\'/g,
        rQuot = /\"/g,
        hChars =/[&<>\"\']/;

    function coerceToString(val) {
        return String((val === null || val === undefined) ? '' : val);
    }

    function hoganEscape(str) {
        str = coerceToString(str);
        return hChars.test(str) ?
            str
                .replace(rAmp,'&amp;')
                .replace(rLt,'&lt;')
                .replace(rGt,'&gt;')
                .replace(rApos,'&#39;')
                .replace(rQuot, '&quot;') :
            str;
    }

    var isArray = Array.isArray || function(a) {
        return Object.prototype.toString.call(a) === '[object Array]';
    };
//typeof exports !== 'undefined' ? exports : Hogan 20130606 to fit fekit 2
})( Hogan , true);

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (Hogan) {
    // Setup regex  assignments
    // remove whitespace according to Mustache spec
    var rIsWhitespace = /\S/,
        rQuot = /\"/g,
        rNewline =  /\n/g,
        rCr = /\r/g,
        rSlash = /\\/g;

    var trim = "".trim ? function(s){ return s.trim() } : function(s){ return s.replace(/^\s+/,'').replace(/\s+$/,''); };

    Hogan.tags = {
        '#': 1, '^': 2, '<': 3, '$': 4,
        '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
        '{': 10, '&': 11, '_t': 12
    };

    Hogan.scan = function scan(text, delimiters) {
        var buf = '',
            tokens = [],
            seenTag = false,
            i = 0,
            lineStart = 0,
            otag = '{{',
            ctag = '}}',
            tagTypes = Hogan.tags;

        function addBuf() {
            if (buf.length > 0) {
                tokens.push({tag:'_t',text : buf });
                buf = '';
            }
        }

        function lineIsWhitespace() {
            var isAllWhitespace = true , tagTypes = Hogan.tags;
            for (var j = lineStart; j < tokens.length; j++) {
                isAllWhitespace =
                    (tagTypes[tokens[j].tag] < tagTypes['_v']) ||
                        (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
                if (!isAllWhitespace) {
                    return false;
                }
            }

            return isAllWhitespace;
        }

        function filterLine(haveSeenTag, noNewLine) {
            addBuf();

            if (haveSeenTag && lineIsWhitespace()) {
                for (var j = lineStart, next; j < tokens.length; j++) {
                    if (tokens[j].text) {
                        if ((next = tokens[j+1]) && next.tag == '>') {
                            // set indent to token value
                            next.indent = tokens[j].text.toString()
                        }
                        tokens.splice(j, 1);
                    }
                }
            } else if (!noNewLine) {
                tokens.push({tag:'\n'});
            }

            seenTag = false;
            lineStart = tokens.length;
        }

        function changeDelimiters(text, index) {
            var close = '=' + ctag,
                closeIndex = text.indexOf(close, index),
                delimiters = trim(
                    text.substring(text.indexOf('=', index) + 1, closeIndex)
                ).split(' ');

            otag = delimiters[0];
            ctag = delimiters[1];

            return closeIndex + close.length - 1;
        }

        if (delimiters) {
            delimiters = delimiters.split(' ');
            otag = delimiters[0];
            ctag = delimiters[1];
        }


        var oI , cI , lastNI , nI, tagChar , tmpCTag , tmpBuf , tag , tagType;

        while( true ){
            oI = tagIndex( otag , text , i );
            if( i !== oI ){
                tmpBuf = oI === -1 ? text.substring(i) : text.substring( i , oI);
                lastNI = -1;
                while( true ){
                    nI = tmpBuf.indexOf('\n', lastNI + 1 );

                    if( nI !== -1 ){
                        buf = tmpBuf.substring( lastNI + 1 , nI );
                        filterLine(seenTag);
                        lastNI = nI;
                    }else{
                        buf = tmpBuf.substring( lastNI + 1 );
                        break;
                    }
                }

                addBuf();
            }
            if( oI === -1 ){
                filterLine(seenTag , true );
                break;
            }
            i = oI + otag.length;
            tagChar = text.charAt(i) , tag = tagTypes[ tagChar ] , tagType = tag ? tagChar : '_v';
            if( tagType === '='){
                i = changeDelimiters(text, i - 1) + 1;

                seenTag = i - 1;
            }else{
                if( tag )
                    i++;

                tmpCTag = tagType === '{' ? '}' + ctag : ctag;

                cI = tagIndex( tmpCTag , text , i );

                seenTag = i - 1;

                tokens.push({
                    tag: tagType,
                    n: trim( text.substring( i , cI ) ) ,
                    otag: otag,
                    ctag: ctag,
                    i: (tagType === '/') ? seenTag - otag.length : cI + tmpCTag.length
                });

                i = cI + tmpCTag.length;
            }

        }

        return tokens;
    };


    function tagIndex( tag , text , index ){
        return text.indexOf( tag , index );
    }

    // the tags allowed inside super templates
    var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

    function buildTree(tokens, i ,  kind, stack, customTags) {
        var instructions = [],
            opener = null,
            tail,
            token,
            node;

        tail = stack[stack.length - 1];

        while ( ( token = tokens[i++] ) != null ) {

            if (tail && tail.tag === '<' && !(token.tag in allowedInSuper)) {
                throw new Error('Illegal content in < super tag.');
            }

            if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
                stack.push(token);
                node = buildTree(tokens , i , token.tag, stack, customTags);
                token.nodes = node.instructions;
                i = node.next;
            } else if (token.tag === '/') {
                if (stack.length === 0) {
                    throw new Error('Closing tag without opener: /' + token.n);
                }
                opener = stack.pop();
                if (token.n !== opener.n && !isCloser(token.n, opener.n, customTags)) {
                    throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
                }
                opener.end = token.i;
                return { instructions : instructions , next : i };
            } else if (token.tag === '\n') {
                token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
            }

            instructions.push(token);
        }

        if (stack.length > 0) {
            throw new Error('missing closing tag: ' + stack.pop().n);
        }

        return { instructions : instructions , next : i };
    }

    function isOpener(token, tags) {
        for (var i = 0, l = tags.length; i < l; i++) {
            if (tags[i].o === token.n) {
                token.tag = '#';
                return true;
            }
        }
    }

    function isCloser(close, open, tags) {
        for (var i = 0, l = tags.length; i < l; i++) {
            if (tags[i].c === close && tags[i].o === open) {
                return true;
            }
        }
    }

    function stringifySubstitutions(obj) {
        var items = [];
        for (var key in obj) {
            items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
        }
        return "{ " + items.join(",") + " }";
    }

    function stringifyPartials(codeObj) {
        var partials = [];
        for (var key in codeObj.partials) {
            partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
        }
        return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
    }

    Hogan.stringify = function(codeObj, text, options) {
        return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code.join('')) + " }," + stringifyPartials(codeObj) +  "}";
    }

    var serialNo = 0;
    Hogan.generate = function(tree, text, options) {
        serialNo = 0;
        var context = { code: [], subs: {}, partials: {} };
        Hogan.walk(tree, context);

        if (options.asString) {
            return this.stringify(context, text, options);
        }

        return this.makeTemplate(context, text, options);
    }

    Hogan.wrapMain = function(code) {
        return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
    }

    Hogan.template = Hogan.Template;

    Hogan.makeTemplate = function(codeObj, text, options) {
        var template = this.makePartials(codeObj);
        template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code.join('')));
        return new this.template(template, text, this, options);
    }

    Hogan.makePartials = function(codeObj) {
        var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
        for (key in template.partials) {
            template.partials[key] = this.makePartials(template.partials[key]);
        }
        for (key in codeObj.subs) {
            template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
        }
        return template;
    }

    function esc(s) {
        return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r');
    }

    function chooseMethod(s) {
        return (~s.indexOf('.')) ? 'd' : 'f';
    }

    function createPartial(node, context) {
        var prefix = "<" + (context.prefix || "");
        var sym = prefix + node.n + serialNo++;
        context.partials[sym] = {name: node.n, partials: {}};
        context.code.push('t.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));');
        return sym;
    }

    Hogan.codegen = {
        '#': function(node, context) {
            context.code.push('if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
                'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
                't.rs(c,p,' + 'function(c,p,t){');
            Hogan.walk(node.nodes, context);
            context.code.push('});c.pop();}');
        },

        '^': function(node, context) {
            context.code.push('if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){');
            Hogan.walk(node.nodes, context);
            context.code.push('};');
        },

        '>': createPartial,
        '<': function(node, context) {
            var ctx = {partials: {}, code: [] , subs: {}, inPartial: true};
            Hogan.walk(node.nodes, ctx);
            var template = context.partials[createPartial(node, context)];
            template.subs = ctx.subs;
            template.partials = ctx.partials;
        },

        '$': function(node, context) {
            var ctx = {subs: {}, code: [], partials: context.partials, prefix: node.n};
            Hogan.walk(node.nodes, ctx);
            context.subs[node.n] = ctx.code.join('');
            if (!context.inPartial) {
                context.code.push('t.sub("' + esc(node.n) + '",c,p,i);');
            }
        },

        '\n': function(node, context) {
            context.code.push(write('"\\n"' + (node.last ? '' : ' + i')));
        },

        '_v': function(node, context) {
            context.code.push('t.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));');
        },

        '_t': function(node, context) {
            context.code.push(write('"' + esc(node.text) + '"'));
        },

        '{': tripleStache,

        '&': tripleStache
    };

    function tripleStache(node, context) {
        context.code.push('t.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));');
    }

    function write(s) {
        return 't.b(' + s + ');';
    }

    Hogan.walk = function (nodelist, context) {
        var func;
        for (var i = 0, l = nodelist.length; i < l; i++) {
            func = Hogan.codegen[nodelist[i].tag];
            func && func(nodelist[i], context);
        }
        return context;
    };

    Hogan.parse = function(tokens, text, options) {
        options = options || {};
        return buildTree(tokens, 0 ,'', [], options.sectionTags || []).instructions;
    };

    Hogan.cache = {};

    Hogan.cacheKey = function(text, options) {
        return [text, !!options.asString, !!options.disableLambda].join('||');
    };

    Hogan.compile = function(text, options) {
        options = options || {};
        var key = Hogan.cacheKey(text, options);
        var template = this.cache[key];

        if (template) {
            return template;
        }

        template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
        return this.cache[key] = template;
    };

//20130606 to fit fekit 2
// typeof exports !== 'undefined' ? exports :
})(Hogan);
