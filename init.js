/*
Copyright (c) 2010 Lee, Heungsub <lee@heungsub.net>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

(function(w) {
    if (typeof w.vlaahEmbed == 'undefined') {
        /* Helpers */
        var ie6 = false /*@cc_on || @_jscript_version < 5.7 @*/;
        var urlencode = encodeURIComponent;
        var applyAll = function(seq, func, args) {
            var returns = {};
            for (var x in seq) {
                returns[x] = func.apply(seq[x], args);
            }
            return returns;
        }

        /* Candybar class */
        var Candybar = ({% include 'candybar.js' %})();

        /* VLAAH Embed library */
        var $;
        w.vlaahEmbed = $ = {
            initialized: true,

            Candybar: Candybar,
            candybars: {},
            initOptions: {},

            topic_base: {{ topic_base|escapejs }},
            html: {{ html|escapejs }},

            append: function(context, container_id, after_ready,
                             plus_theme, minus_theme, show_context) {
                var candybar = new $.Candybar(context, {
                    plusTheme: plus_theme,
                    minusTheme: minus_theme,
                    showContext: show_context,
                    vlaahEmbed: w.vlaahEmbed
                });
                candybar.append(document.getElementById(container_id),
                                after_ready);
            },

            load: function(context, form) {
                var id, candybars = $.getCandybars(context);
                for (id in candybars) {
                    candybars[id].element && candybars[id].showLoading();
                }

                var callback = 'vlaahEmbed.update("'
                             + urlencode(context) + '")';
                var url, params = '_xhr=on&_callback=' + callback;

                if (form) {
                    url = form.action;
                    var set_method = false;
                    var inputs = form.elements;
                    for (var i = 0; i < inputs.length; ++ i) {
                        var input = inputs[i];
                        params += '&' + input.name
                                + '=' + urlencode(input.value);
                        if (input.name == '_method') set_method = true;
                    }
                    if (!set_method) {
                        params += '&_method=' + form.method;
                    }
                } else {
                    url = $.topic_base + '/' + urlencode(context);
                }
                url += '?' + params;

                var scripts_id = id + '-scripts';
                var scripts = document.getElementById(scripts_id);

                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                scripts.appendChild(script);
            },

            update: function(context) {
                return function(data) {
                    var candybars = $.getCandybars(context);
                    for (var id in candybars) {
                        if (!candybars[id].element) continue;
                        candybars[id].update(data);
                        candybars[id].hideLoading();
                    }
                }
            },

            getCandybars: function(context) {
                return $.candybars[context] || {};
            },

            /* Animation */
            duration: 100,
            fps: 20,
            transition: function(x) {
                return Math.sin(x * Math.PI / 2);
            }
        };
    }
})(window);

