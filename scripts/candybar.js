function () {
    var Candybar = function(context, options) {
        /* Set properties */
        this.context = context;
        this.id = 'vlaah-embed-' + (new Date()).getTime();
        this.data = {degree: {total: 0}, percent: {total: 50}};
        this.element = null;

        /* Set options */
        options = options || {};
        for (var key in this.defaultOptions) {
            if (typeof options[key] == 'undefined') {
                options[key] = this.defaultOptions[key];
            }
        }
        this.options = options;
        this.$ = options.vlaahEmbed;

        /* Register this candybar */
        this.register();
    }

    Candybar.prototype = {
        defaultOptions: {
            showContext: false,
            vlaahEmbed: null,
            plusTheme: 'clover',
            minusTheme: 'tomato'
        },

        markup: function(template) {
            var self = this;

            var context = this.context;
            var id = this.id;
            var plusTheme = this.options.plusTheme;
            var minusTheme = this.options.minusTheme;

            template = template || this.$.html;
            template = template.replace(/\[\[([^\]]+)\]\]/g, function(_, expr) {
                return eval(expr);
            });
            if (ie6) {
                template = template.replace(/chipset\.png/g, 'chipset.gif');
            }
            return template;
        },

        append: function(container, after_ready, template) {
            var self = this;

            var markup = this.markup(template);
            var on_appended = function() {
                self.element = w.document.getElementById(self.id);
                if (self.element) {
                    var text_el = self.getTextElement();
                    var context_el = self.getContextElement();
                    var degree_el = self.getDegreeElement();

                    if (self.options.showContext) {
                        text_el.onmouseover = function() {
                            context_el.style.display = 'none';
                            degree_el.style.display = 'inline';
                        }
                        text_el.onmouseout = function() {
                            context_el.style.display = 'inline';
                            degree_el.style.display = 'none';
                        }
                        text_el.onmouseout();
                    } else {
                        context_el.style.display = 'none';
                        degree_el.style.display = 'inline';
                        self.element.title = self.context;
                    }
                    self.sync();
                }
            }
            if (container) {
                var appending = function() {
                    container.innerHTML = markup;
                    on_appended();
                }
                if (after_ready) {
                    if (w.addEventListener !== undefined) {
                        w.addEventListener('load', appending, true);
                    } else if (w.attachEvent !== undefined) {
                        w.attachEvent('onload', appending);
                    }
                } else {
                    appending();
                }
            } else {
                w.document.write(markup);
                on_appended();
            }
        },

        register: function() {
            var key = base64.encode(this.context);
            if (this.$.candybars[key] === undefined) {
                this.$.candybars[key] = {};
            }
            return this.$.candybars[key][this.id] = this;
        },

        sync: function() {
            this.$.load(this.context);
        },

        update: function(data) {
            var vlaah_score = data['pluses-count'] - data['minuses-count'];
            if (vlaah_score) {
                var denominator = data['pluses-count'] + data['minuses-count'],
                    percent = data['pluses-count'] / denominator * 100;
            } else {
                var percent = 50;
            }
            this.animatePercent(percent);
            this.getDegreeElement().innerHTML = vlaah_score;
            if (data.expressed) {
                var form = this.pushButton(data.expressed);
                form.action = this.$.topic_base + '/' + urlencode(data.comment);
                this.pullButton(data.expressed == 'plus' ? 'minus' : 'plus');
            } else {
                this.pullButton('plus');
                this.pullButton('minus');
            }
            this.data = data;
            this.percent = percent;
        },

        animatePercent: function(percent) {
            var self = this;
            var bar = this.getBarElement();

            var from = parseFloat(this.percent || 50);
            var to = percent;
            from = Math.round(from * 10) / 10;
            to = Math.round(to * 10) / 10;
            if (from == to) return;

            var steps = this.$.duration / this.$.fps;
            var amount = 1 / steps;

            var i = 0, x;
            if (this.__t) clearInterval(this.__t);
            this.__t = setInterval(function() {
                i = Math.min(1, i + amount);
                x = self.$.transition(i);
                bar.style.width = (x * (to - from) + from) + '%';
                if (i >= 1) {
                    clearInterval(self.__t);
                    return;
                }
            }, this.$.fps);
        },

        showLoading: function() {
            this.getTextElement().style.display = 'none';
            this.getLoadingElement().style.display = 'block';
        },

        hideLoading: function() {
            this.getTextElement().style.display = 'block';
            this.getLoadingElement().style.display = 'none';
        },

        pushButton: function(prefer) {
            var forms = this.getFormElements(prefer);
            forms[0].style.display = 'none';
            forms[1].style.display = 'block';
            return forms[1];
        },

        pullButton: function(prefer) {
            var forms = this.getFormElements(prefer);
            forms[0].style.display = 'block';
            forms[1].style.display = 'none';
            return forms[0];
        },

        getFormElements: function(prefer) {
            var i = Number(prefer != 'plus');
            var express = this.element.getElementsByTagName('blockquote')[i];
            return express.getElementsByTagName('form');
        },
        getBarElement: function() {
            return this.element.getElementsByTagName('u')[1];
        },
        getTextElement: function() {
            return this.element.getElementsByTagName('a')[0]
                               .getElementsByTagName('span')[0];
        },
        getContextElement: function() {
            return this.element.getElementsByTagName('s')[0];
        },
        getDegreeElement: function() {
            return this.element.getElementsByTagName('u')[0];
        },
        getLoadingElement: function() {
            return this.element.getElementsByTagName('i')[0];
        }
    };

    return Candybar;
}
