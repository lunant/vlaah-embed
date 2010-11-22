/*************************************************************
*       VLAAH Embed - http://vlaah-embed.appspot.com/        *
**************************************************************
{% include 'LICENSE' %}
*/
(function(w) {
    if (typeof w.vlaahEmbed == 'undefined') {
        /* Helpers */
        var base64 = {% include 'scripts/base64.js' %};
        var ie6 = false /*@cc_on || @_jscript_version < 5.7 @*/;
        var urlencode = function(str) {
            return encodeURIComponent(str).replace(/%2F/gi, '%0A');
        };
        var applyAll = function(seq, func, args) {
            var returns = {};
            for (var x in seq) {
                returns[x] = func.apply(seq[x], args);
            }
            return returns;
        }

        /* Candybar class */
        var Candybar = ({% include 'scripts/candybar.js' %})();

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
                var key = base64.encode(context);
                var callback = 'vlaahEmbed.update("' + key + '")';
                var url, params = '__callback__=' + callback;

                if (form) {
                    url = form.action;
                    // temporarily deprecate the real-time voting
                    open(url, '_blank'); return;
                    var set_method = false;
                    var inputs = form.elements;
                    for (var i = 0; i < inputs.length; ++ i) {
                        var input = inputs[i];
                        params += '&' + input.name
                                + '=' + urlencode(input.value);
                        if (input.name == '_method') set_method = true;
                    }
                    if (!set_method) {
                        params += '&__method__=' + form.method;
                    }
                } else {
                    url = $.topic_base + '/' + urlencode(context);
                }
                url += '?' + params;

                var id, candybars = $.getCandybars(base64.encode(context));
                for (id in candybars) {
                    candybars[id].element && candybars[id].showLoading();
                }

                var scripts_id = id + '-scripts';
                var scripts = document.getElementById(scripts_id);

                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;
                scripts.appendChild(script);
            },

            update: function(key) {
                return function(data) {
                    var candybars = $.getCandybars(key);
                    for (var id in candybars) {
                        if (!candybars[id].element) continue;
                        candybars[id].update(data);
                        candybars[id].hideLoading();
                    }
                }
            },

            getCandybars: function(key) {
                return $.candybars[key] || {};
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

