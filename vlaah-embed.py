import os
import sys
sys.path.insert(0, os.path.abspath('jinja2'))
import time
import urllib
import jinja2
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson


LOADER = jinja2.FileSystemLoader(os.path.dirname(__file__))
env = jinja2.Environment(loader=LOADER)
env.filters["escapejs"] = simplejson.JSONEncoder().encode
env.filters["unescapejs"] = simplejson.JSONDecoder().decode
env.filters["urlencode"] = urllib.quote


PROD_URLS = {
        #  'topic_base': 'http://vlaah.com',
        'topic_base': 'http://h.xym.kr:8912',
  'dynamic': 'http://dynamic.vlaah.com',
  'static': 'http://static.vlaah.com'
}
DEV_URLS = PROD_URLS


class IndexHandler(webapp.RequestHandler):

  def get(self):
    domain = self.request.host

    template = env.get_template(os.path.join('templates', 'index.html'))
    self.response.out.write(template.render({
      'embed': 'http://' + domain + '/embed.js',
      'init': 'http://' + domain + '/init.js'
    }))


class ScriptHandler(webapp.RequestHandler):

  def get(self):
    host = 'http://' + self.request.host
    product = 'appspot' in host

    context = self.request.get('context') or None
    container_id = self.request.get('container_id') or None
    after_ready = self.request.get('after_ready') or None
    plus_theme = self.request.get('plus_theme') or None
    minus_theme = self.request.get('minus_theme') or None
    show_context = self.request.get('show_context') or None

    self.response.headers['content-type'] = 'text/javascript; charset=utf-8'

    urls = (PROD_URLS if product else DEV_URLS).copy()
    urls.update(host=host)

    template = env.get_template(os.path.join('templates', 'candybar.html'))
    html = template.render(urls)

    template = env.get_template('scripts' + self.request.path)
    self.response.out.write(template.render({
      'html': html,
      'topic_base': urls['topic_base'],
      'context': context,
      'container_id': container_id,
      'after_ready': after_ready,
      'plus_theme': plus_theme,
      'minus_theme': minus_theme,
      'show_context': show_context
    }))


def main():
  application = webapp.WSGIApplication([
    ('/', IndexHandler),
    ('/.+\.js', ScriptHandler)
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
