{% include 'scripts/init.js' %}
(function(w) {
    var opt = w.vlaahEmbed.initOptions;

    var context = {{ context|escapejs }} || opt.context || w.location.href;
    var container_id = {{ container_id|escapejs }} || opt.container_id;
    var after_ready = {{ after_ready|escapejs }} || opt.after_ready || false;
    var plus_theme = {{ plus_theme|escapejs }} || opt.plus_theme || 'clover';
    var minus_theme = {{ minus_theme|escapejs }} || opt.minus_theme || 'tomato';
    var show_context = {{ show_context|escapejs }} || opt.show_context || false;

    w.vlaahEmbed.append(context, container_id, after_ready,
                        plus_theme, minus_theme, show_context);
    w.vlaahEmbed.initOptions = {};
})(window);

