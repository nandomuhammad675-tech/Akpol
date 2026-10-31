// VIEW: halaman hasil pemeriksaan
SG.views.result=function(r){
 var i=SG.views.icon,esc=SG.util.esc,C=2*Math.PI*44,off=C*(1-r.score/100);
 var list=r.indicators.length?r.indicators.map(function(x){return '<li>'+i('x')+'<span>'+esc(x.text)+'</span></li>'}).join('')
  :'<li class="ok">'+i('ok')+'<span>Tidak ditemukan indikator mencurigakan pada struktur URL.</span></li>';
 return '<div class="wrap pg"><div class="narrow"><a class="back" href="#/periksa">&larr; Kembali</a>'
 +'<div class="head '+r.level+'"><span class="ico">'+i('alert')+'</span>'
 +'<div class="t"><h2>'+r.name+'<span class="tag">'+r.tag+'</span></h2><div class="u">'+esc(r.url)+'</div><div class="note">Diperiksa pada '+r.checkedAt+'</div></div>'
 +'<div class="ring"><svg viewBox="0 0 108 108"><circle cx="54" cy="54" r="44" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="9"/><circle cx="54" cy="54" r="44" fill="none" stroke="var(--c)" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+off+'"/></svg><b>'+r.score+'<small>Skor Risiko<br>'+r.name.replace('Risiko ','')+'</small></b></div></div>'
 +'<div class="body"><div class="sect"><h3>Indikator yang Ditemukan</h3><ul class="ind">'+list+'</ul></div>'
 +'<div class="sect"><h3>Penjelasan</h3><div class="box">'+r.exp+'<p class="note" style="margin-top:8px">Pemeriksaan prototipe ini mencakup karakteristik URL. Analisis isi halaman akan ditambahkan pada tahap berikutnya.</p></div></div>'
 +'<div class="sect"><div class="rekom '+r.level+'"><h3>Rekomendasi Keamanan</h3><p>'+r.rec+'</p></div></div></div></div></div>';
};
SG.views.message=function(text){return '<div class="wrap pg"><div class="narrow"><a class="back" href="#/periksa">&larr; Kembali</a><div class="card"><p>'+SG.util.esc(text)+'</p></div></div></div>'};
