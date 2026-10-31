// VIEW: kerangka halaman (navbar + footer)
SG.views.layout=function(route,content){
 var nav=[['/','Beranda'],['/cara-kerja','Cara Kerja'],['/edukasi','Edukasi'],['/tentang','Tentang']];
 var links=nav.map(function(n){return '<a href="#'+n[0]+'"'+(n[0]===route?' class="on"':'')+'>'+n[1]+'</a>'}).join('');
 return '<nav><div class="nav"><a class="logo" href="#/">'+SG.views.icon('shield')+'SCAMGUARD</a><div class="links">'+links+'</div><a class="btn" href="#/periksa">Periksa URL</a></div></nav>'
  +content+'<footer>&copy; 2026 SCAMGUARD &middot; Tim Akpoll &middot; Politeknik Negeri Jember</footer>';
};
