self.__MIDDLEWARE_MATCHERS = [
  {
    "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|api\\/recommend|favicon.ico|sw.js|manifest.json|images\\/|icon-|apple-icon|robots.txt|sitemap.xml).*))(\\.json)?[\\/#\\?]?$",
    "originalSource": "/((?!_next/static|_next/image|api/recommend|favicon.ico|sw.js|manifest.json|images/|icon-|apple-icon|robots.txt|sitemap.xml).*)"
  }
];self.__MIDDLEWARE_MATCHERS_CB && self.__MIDDLEWARE_MATCHERS_CB()