let profilePhotoPreviewUrl='';

const $=id=>document.getElementById(id);const KEY='moveplus_data_v1';let data;try{data=JSON.parse(localStorage.getItem(KEY))||{name:'Corredor de Uruçuí',runs:[]}}catch{data={name:'Corredor de Uruçuí',runs:[]}};const save=()=>localStorage.setItem(KEY,JSON.stringify(data));// Imagens de apresentação exibidas até o carregamento dos anúncios da região.
const ads=[
 {image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2XONinUdQvVrucnMqhnu9HJwSE7QbD-stt0yNSCueZA&s=10',url:''},
 {image:'https://template.canva.com/EAFtI4Y2vqA/2/0/800w-_FM7CYxRDXQ.jpg',url:''},
 {image:'https://template.canva.com/EAE36LKvTAo/2/0/1600w-4TUPr4UZz6s.jpg',url:''}
];let adindex=0;
function renderAd(){if(!ads.length){$('adimage').removeAttribute('src');$('adlink').removeAttribute('href');$('adlink').onclick=e=>e.preventDefault();$('dots').innerHTML='';$('adlink').style.display='none';return;}$('adlink').style.display='';const a=ads[adindex%ads.length],link=$('adlink');$('adimage').src=a.image;link.href=a.url||'#';link.onclick=a.url?null:(e)=>{e.preventDefault()};$('dots').innerHTML=ads.map((_,i)=>'<i class="dot '+(i===adindex?'on':'')+'"></i>').join('')}
setInterval(()=>{if(ads.length>1){adindex=(adindex+1)%ads.length;renderAd()}},6000);
const events=[];let activeChallengeId=null;
function challengeDateValid(e){const today=new Date().toISOString().slice(0,10);return (!e.inicio||String(e.inicio).slice(0,10)<=today)&&(!e.fim||String(e.fim).slice(0,10)>=today)}
function challengeProgress(e){return (data.runs||[]).filter(r=>r.challengeId===e.id).reduce((sum,r)=>sum+(Number(r.km)||0),0)}
function eventHtml(e,i){const km=Number(e.metaKm)||0,progress=challengeProgress(e),percent=km?Math.min(100,Math.round(progress/km*100)):0,open=challengeDateValid(e);return `<article class="challenge-card"><div class="challenge-cover">${e.image?`<img src="${escapeHtml(e.image)}" alt="Imagem do desafio" loading="lazy" onerror="this.style.display='none'">`:'<i data-lucide="flag"></i>'}</div><div class="challenge-info"><div class="challenge-eyebrow">${escapeHtml(e.modalidade||'Corrida')} · ${open?'DESAFIO ATIVO':'FORA DO PERÍODO'}</div><h3>${escapeHtml(e.title||'Desafio')}</h3><p>${escapeHtml(e.descricao||'Supere seus limites no seu ritmo.')}</p><div class="challenge-progress-line"><span style="width:${percent}%"></span></div><div class="challenge-meta"><b>${progress.toFixed(2).replace('.',',')} / ${km.toFixed(1).replace('.',',')} km</b><span>${percent}%</span></div><button class="bigbtn" ${!open?'disabled':''} onclick="startChallenge(${i})"><i data-lucide="play"></i> ${percent>=100?'CONTINUAR DESAFIO':'INICIAR DESAFIO'}</button></div></article>`}
function renderHomeChallengeGroups(){
 const groups=[['Caminhada','footprints'],['Corrida','person-standing'],['Ciclismo','bike']];
 if(!events.length)return emptyEventsHtml();
 return groups.map(([mode,icon])=>{
  const list=events.map((e,i)=>({...e,_index:i})).filter(e=>e.modalidade===mode);
  if(!list.length)return '';
  return `<section class="home-challenge-group"><div class="home-challenge-heading"><span><i data-lucide="${icon}"></i> ${mode}</span><small>${list.length>1?'Deslize para ver mais →':'Desafio disponível'}</small></div><div class="home-challenge-carousel" aria-label="Desafios de ${mode}">${list.map(e=>`<div class="home-challenge-slide">${eventHtml(e,e._index)}</div>`).join('')}</div></section>`;
 }).join('')||emptyEventsHtml();
}
function renderWeeklyChallenges(){
 const el=$('weeklyChallengeProgress');if(!el)return;
 const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const monday=new Date(today);monday.setDate(today.getDate()-(today.getDay()+6)%7);
 const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);sunday.setHours(23,59,59,999);
 const list=events.filter(e=>{const start=e.inicio?new Date(String(e.inicio).slice(0,10)+'T00:00:00'):null,end=e.fim?new Date(String(e.fim).slice(0,10)+'T23:59:59'):null;return (!start||start<=sunday)&&(!end||end>=monday)});
 if(!list.length){el.innerHTML='<div class="card"><p class="small">Nenhum desafio disponível nesta semana. Explore os desafios para começar.</p></div>';return}
 el.innerHTML=list.map(e=>{const km=Number(e.metaKm)||0,all=(data.runs||[]).filter(r=>r.challengeId===e.id),weekly=all.filter(r=>{const d=new Date(r.date);return d>=monday&&d<=sunday}),done=all.reduce((s,r)=>s+(Number(r.km)||0),0),week=weekly.reduce((s,r)=>s+(Number(r.km)||0),0),percent=km?Math.min(100,Math.round(done/km*100)):0;return `<article class="weekly-challenge-card"><div class="row"><strong>${escapeHtml(e.title||'Desafio')}</strong><span class="chip">${escapeHtml(e.modalidade||'')}</span></div><p class="small">Nesta semana: <b>${week.toFixed(2).replace('.',',')} km</b> · ${weekly.length} atividade(s)</p><div class="challenge-progress-line"><span style="width:${percent}%"></span></div><div class="row small"><span>Acumulado: ${done.toFixed(2).replace('.',',')} / ${km.toFixed(1).replace('.',',')} km</span><b>${percent}%</b></div></article>`}).join('');
}
function emptyEventsHtml(){return `<div class="events-empty"><div class="events-empty-icon"><i data-lucide="flag"></i></div><h3>Novos desafios em breve!</h3><p>Acompanhe esta área para participar dos desafios de corrida, caminhada e ciclismo da comunidade.</p></div>`}
function eventDetail(i){startChallenge(i)}
function startChallenge(i){const e=events[i];if(!e||!challengeDateValid(e))return;if(running||starting){openModal('<h2>Atividade em andamento</h2><p>Finalize seu treino atual antes de iniciar outro desafio.</p><button class="bigbtn" onclick="closeModal()">Entendi</button>');return}activeChallengeId=e.id;setMode(e.modalidade||'Corrida');goal=Math.max(1,Math.ceil(Math.max(.1,(Number(e.metaKm)||1)-challengeProgress(e))));$('goalval').textContent=goal;showScreen('track');updateChallengeTrackBanner()}
function updateChallengeTrackBanner(){const el=$('challengeTrackBanner');if(!el)return;const e=events.find(x=>x.id===activeChallengeId);if(!e){el.classList.add('hide');el.innerHTML='';return}el.classList.remove('hide');el.innerHTML=`<div><span>DESAFIO SELECIONADO</span><strong>${escapeHtml(e.title)}</strong><small>${escapeHtml(e.modalidade)} · Meta ${Number(e.metaKm).toFixed(1).replace('.',',')} km · Seu progresso ${challengeProgress(e).toFixed(2).replace('.',',')} km</small></div><button type="button" onclick="cancelChallenge()" ${running||starting?'disabled':''} aria-label="Sair do desafio"><i data-lucide="x"></i></button>`;refreshIcons()}
function cancelChallenge(){if(running||starting)return;activeChallengeId=null;updateChallengeTrackBanner();showScreen('events')}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.page===id));window.scrollTo(0,0);if(id==='profile')renderReminderSettings();if(id==='ranking')loadCommunityRanking();if(id==='track')updateChallengeTrackBanner();if(id==='track')setTimeout(()=>{initMap();if(!running&&!starting)resetCurrentRoute();focusUserLocation()},80);updateActivityUI();render()}function homeStartAction(){if(!running&&!starting)activeChallengeId=null;showScreen('track');updateChallengeTrackBanner()}function chooseActivity(m){if(!running&&!starting)activeChallengeId=null;setMode(m);showScreen('track');updateChallengeTrackBanner()}function setMode(m){if(running)return;mode=m;$('selrun').classList.toggle('on',m==='Corrida');$('selwalk').classList.toggle('on',m==='Caminhada');$('selbike').classList.toggle('on',m==='Ciclismo');$('livepaceLabel').textContent=m==='Ciclismo'?'VELOCIDADE MÉDIA':m==='Caminhada'?'RITMO DE CAMINHADA':'RITMO DE CORRIDA';updateLive()}let goal=3,mode='Corrida';let ascent=0,descent=0,lastAltitude=null,maxSpeedKmh=0,currentSpeedKmh=0,movingSeconds=0,previousGpsTime=0;function changeGoal(n){if(running)return;goal=Math.max(1,Math.min(100,goal+n));$('goalval').textContent=goal}
let map,routeLine,marker,hasCentered=false,watchId=null,running=false,paused=false,points=[],distance=0,elapsed=0,timer=null,lastTick=0,starting=false,countdownTimer=null,voiceHalf=false,voiceNear=false,lastAcceptedTime=0;function initMap(){if(map){map.invalidateSize();return}if(typeof L==='undefined'){$('map').innerHTML='<div class="map-placeholder">Mapa indisponível sem conexão.</div>';return} $('map').innerHTML='';map=L.map('map',{zoomControl:false}).setView([-7.23,-44.55],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);routeLine=L.polyline([],{color:'#83ce1c',weight:6}).addTo(map);L.control.zoom({position:'bottomright'}).addTo(map);map.invalidateSize()}
function focusUserLocation(){if(!navigator.geolocation||!map)return;navigator.geolocation.getCurrentPosition(pos=>{if(!map)return;const lat=pos.coords.latitude,lng=pos.coords.longitude;if(!marker)marker=L.circleMarker([lat,lng],{radius:8,color:'white',weight:3,fillColor:'#72c625',fillOpacity:1}).addTo(map);else marker.setLatLng([lat,lng]);map.setView([lat,lng],17,{animate:true});hasCentered=true;$('gpsstatus').textContent='GPS ativo'},()=>{$('gpsstatus').textContent='Permita o GPS'},{enableHighAccuracy:true,maximumAge:0,timeout:12000})}function haversine(a,b){const r=6371,toRad=x=>x*Math.PI/180,dLat=toRad(b.lat-a.lat),dLon=toRad(b.lng-a.lng);const q=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;return 2*r*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))}function formatTime(s){s=Math.floor(s);return String(Math.floor(s/3600)).padStart(2,'0')+':'+String(Math.floor(s%3600/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}function pace(){return mode==='Ciclismo'?speedText(elapsed,distance):paceText(elapsed,distance)}function speedText(seconds,km){if(km<.05||seconds<5)return '—';return (km*3600/seconds).toFixed(1).replace('.',',')+' km/h'}function paceText(seconds,km){if(km<.05||seconds<5)return '—';const total=Math.round(seconds/km);if(!Number.isFinite(total)||total<=0)return '—';return Math.floor(total/60)+"'"+String(total%60).padStart(2,'0')+'"'}function updateLive(){renderSportDashboard();$('livekm').textContent=distance.toFixed(2).replace('.',',');$('livetime').textContent=formatTime(elapsed);$('livepace').textContent=pace();$('livecal').textContent=estimatedCalories(distance,mode);updateActivityUI()}function estimatedCalories(km,activity){return Math.max(0,Math.round(km*(activity==='Caminhada'?0.53:activity==='Ciclismo'?0.45:1)*(Number(data.weight)||70)))}function speakMotivation(message){if(!$('voiceenabled').checked||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(message);speech.lang='pt-BR';speech.rate=1;speechSynthesis.speak(speech)}catch(e){console.warn('Narração indisponível',e)}}function checkMilestones(){if(goal<=0)return;if(!voiceHalf&&distance>=goal*.5){voiceHalf=true;speakMotivation('Muito bem! Você já completou metade do seu objetivo. Continue firme, você está indo muito bem!')}if(!voiceNear&&distance>=goal*.9){voiceNear=true;speakMotivation('Falta muito pouco! Você já percorreu noventa por cento da sua meta. Vamos terminar com força!')}}function onPosition(pos){const p={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:pos.coords.accuracy,alt:Number.isFinite(pos.coords.altitude)?pos.coords.altitude:null,altAcc:pos.coords.altitudeAccuracy};$('gpsstatus').textContent='● GPS ativo';if(map){if(!marker)marker=L.circleMarker([p.lat,p.lng],{radius:8,color:'white',weight:3,fillColor:'#72c625',fillOpacity:1}).addTo(map);else marker.setLatLng([p.lat,p.lng]);if(!hasCentered){map.setView([p.lat,p.lng],17);hasCentered=true}else if(running&&!paused){map.panTo([p.lat,p.lng],{animate:true})}}if(!running||paused||p.acc>(mode==='Ciclismo'?55:mode==='Caminhada'?30:40))return;const prev=points[points.length-1];if(prev){const d=haversine(prev,p);const now=pos.timestamp||Date.now();const delta=(now-lastAcceptedTime)/1000;if(d<(mode==='Ciclismo'?.012:mode==='Caminhada'?.003:.006)||delta<=0||d/delta*3600>(mode==='Ciclismo'?85:mode==='Caminhada'?16:35))return;const speed=d/delta*3600;currentSpeedKmh=speed;maxSpeedKmh=Math.max(maxSpeedKmh,speed);if(speed>(mode==='Ciclismo'?3:1)){movingSeconds+=delta}distance+=d}if(p.alt!==null&&Number.isFinite(p.altAcc)&&p.altAcc<=20){if(lastAltitude!==null){const diff=p.alt-lastAltitude;if(Math.abs(diff)>=3){if(diff>0)ascent+=diff;else descent-=diff;lastAltitude=p.alt}}else lastAltitude=p.alt}points.push(p);lastAcceptedTime=pos.timestamp||Date.now();if(routeLine)routeLine.setLatLngs(points.map(q=>[q.lat,q.lng]));checkMilestones();updateLive()}function onGpsError(err){$('gpsstatus').textContent='GPS indisponível';if(running)openModal('<h2>Localização indisponível</h2><p class="eventdetail">Confira se a localização está ativada e se o site está aberto por HTTPS ou localhost. O cronômetro continuará funcionando, mas sem GPS a distância não será medida.</p><button class="bigbtn" onclick="closeModal()">Entendi</button>')}
function resetCurrentRoute(){ascent=0;descent=0;lastAltitude=null;maxSpeedKmh=0;currentSpeedKmh=0;movingSeconds=0;previousGpsTime=0;points=[];distance=0;elapsed=0;lastAcceptedTime=0;voiceHalf=false;voiceNear=false;hasCentered=false;if(routeLine)routeLine.setLatLngs([]);if(marker&&map){map.removeLayer(marker);marker=null}updateLive();focusUserLocation()}
function startRun(){if(running||starting)return;if(!navigator.geolocation){alert('Seu navegador não oferece geolocalização.');return}initMap();starting=true;resetCurrentRoute();$('startcontrols').classList.add('hide');$('countdown').classList.remove('hide');let count=5;$('countnumber').textContent=count;speakCountdown(count);countdownTimer=setInterval(()=>{count--;if(count>0){$('countnumber').textContent=count;speakCountdown(count);return}clearInterval(countdownTimer);countdownTimer=null;$('countnumber').textContent='VAI!';speakCountdown(0);setTimeout(()=>{$('countdown').classList.add('hide');starting=false;beginTracking()},450)},1000)}
function beginTracking(){running=true;paused=false;updateActivityUI();$('activecontrols').classList.remove('hide');$('pausebtn').innerHTML='<i data-lucide="pause"></i> PAUSAR';lastTick=Date.now();timer=setInterval(()=>{const now=Date.now();if(!paused)elapsed+=(now-lastTick)/1000;lastTick=now;updateLive()},250);watchId=navigator.geolocation.watchPosition(onPosition,onGpsError,{enableHighAccuracy:true,maximumAge:0,timeout:15000});updateLive()}
function togglePause(){paused=!paused;updateActivityUI();lastTick=Date.now();$('pausebtn').innerHTML=paused?'<i data-lucide="play"></i> RETOMAR':'<i data-lucide="pause"></i> PAUSAR'}function finishRun(){if(!running)return;clearInterval(timer);if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;running=false;paused=false;updateActivityUI();$('activecontrols').classList.add('hide');$('startcontrols').classList.remove('hide');let run={id:Date.now(),mode,km:distance,seconds:Math.round(elapsed),calories:estimatedCalories(distance,mode),date:new Date().toISOString(),locality:data.locality||'',route:points.map(p=>[p.lat,p.lng]),challengeId:activeChallengeId||null,ascent:Math.round(ascent),descent:Math.round(descent),elevationMeasured:lastAltitude!==null,maxSpeedKmh:+maxSpeedKmh.toFixed(1),movingSeconds:Math.round(movingSeconds),sportNotes:{}};data.runs.unshift(run);save();render();updateChallengeTrackBanner();if(sessionToken&&run.seconds>0){api({action:'updatePerformance',token:sessionToken,performance:dailyPerformance(run.mode)}).then(()=>loadCommunityRanking()).catch(e=>console.warn('Atividade não sincronizada:',e))}showFinishSponsorWithRefresh(run);celebrateActivityFinish()}function showResult(r){if(!r)return;openModal(`<div class="result-head"><span class="eyebrow">ATIVIDADE CONCLUÍDA</span><h2>${escapeHtml(r.mode)} • ${Number(r.km).toFixed(2).replace('.',',')} km</h2><p>${formatTime(r.seconds)} de duração • ${r.calories??estimatedCalories(r.km,r.mode)} kcal estimadas</p></div>${sportMetricsHtml(r)}<div class="result-actions"><button class="bigbtn" onclick="openPhotoComposer(${r.id})"><i data-lucide="image"></i> Compartilhar conquista</button><button class="bigbtn dark" onclick="closeModal();showScreen('progress')"><i data-lucide="chart-no-axes-column-increasing"></i> Ver progresso completo</button></div>`);refreshIcons()}
function sportMetrics(r){const km=Number(r.km)||0,s=Number(r.seconds)||0;const fmt=n=>Number(n).toFixed(1).replace('.',',');const stats=[['Distância',fmt(km)+' km'],['Tempo total',formatTime(s)],['Tempo em movimento',r.movingSeconds!=null?formatTime(r.movingSeconds):'—'],['Ritmo médio',paceText(s,km)+'/km'],['Velocidade média',speedText(s,km)]];if(r.mode==='Ciclismo'){stats.splice(3,1);stats.push(['Velocidade máxima',r.maxSpeedKmh?fmt(r.maxSpeedKmh)+' km/h':'—']);stats.push(['Tipo de pedal',escapeHtml(r.sportNotes?.bikeType||'Não informado')])}else if(r.mode==='Corrida'){stats.push(['Tipo de treino',escapeHtml(r.sportNotes?.workout||'Não informado')])}else{stats.push(['Intensidade',escapeHtml(r.sportNotes?.intensity||'Não informada')])}stats.push(['Ganho de elevação',r.elevationMeasured?Math.round(r.ascent||0)+' m':'Não disponível']);stats.push(['Perda de elevação',r.elevationMeasured?Math.round(r.descent||0)+' m':'Não disponível']);stats.push(['Calorias estimadas',String(r.calories??estimatedCalories(km,r.mode))+' kcal']);if(r.sportNotes?.effort)stats.push(['Esforço percebido',escapeHtml(r.sportNotes.effort)+'/10']);if(r.sportNotes?.terrain)stats.push(['Terreno',escapeHtml(r.sportNotes.terrain)]);return stats}
function sportMetricsHtml(r){return '<div class="sport-metric-grid">'+sportMetrics(r).map(([k,v])=>'<div><small>'+k+'</small><strong>'+v+'</strong></div>').join('')+'</div>'}
function renderSportDashboard(){const el=$('sportDashboard');if(!el)return;const km=distance,secs=elapsed;const fields=mode==='Ciclismo'?[['Velocidade atual',currentSpeedKmh?currentSpeedKmh.toFixed(1).replace('.',',')+' km/h':'—'],['Velocidade máxima',maxSpeedKmh?maxSpeedKmh.toFixed(1).replace('.',',')+' km/h':'—'],['Tempo em movimento',formatTime(movingSeconds)],['Ganho de elevação',lastAltitude!==null?Math.round(ascent)+' m':'—']]:mode==='Corrida'?[['Pace médio',paceText(secs,km)+'/km'],['Velocidade média',speedText(secs,km)],['Tempo em movimento',formatTime(movingSeconds)],['Ganho de elevação',lastAltitude!==null?Math.round(ascent)+' m':'—']]:[['Ritmo médio',paceText(secs,km)+'/km'],['Velocidade média',speedText(secs,km)],['Tempo em movimento',formatTime(movingSeconds)],['Ganho de elevação',lastAltitude!==null?Math.round(ascent)+' m':'—']];el.innerHTML='<div class="sport-dashboard-title">'+(mode==='Ciclismo'?'DADOS DO PEDAL':mode==='Corrida'?'DADOS DA CORRIDA':'DADOS DA CAMINHADA')+'</div><div class="sport-metric-grid">'+fields.map(([k,v])=>'<div><small>'+k+'</small><strong>'+v+'</strong></div>').join('')+'</div><p class="sport-dashboard-note">Altimetria disponível somente com sinal de altitude adequado. O GPS pode variar conforme o ambiente.</p>'}
function showSportFinishDetails(id){const r=data.runs.find(x=>x.id===id);if(!r)return;const opts=(arr)=>arr.map(v=>'<option value="'+escapeHtml(v)+'">'+escapeHtml(v)+'</option>').join('');const modality=r.mode==='Ciclismo'?'<label class="small">Modalidade do pedal</label><select class="field" id="sportKind">'+opts(['Não informado','Estrada / Speed','Mountain bike (MTB)','Gravel','Urbano / Passeio','Treino indoor'])+'</select>':r.mode==='Corrida'?'<label class="small">Tipo de treino</label><select class="field" id="sportKind">'+opts(['Não informado','Rodagem leve','Treino contínuo','Longão','Intervalado / Tiros','Tempo run / Limiar','Prova'])+'</select>':'<label class="small">Intensidade da caminhada</label><select class="field" id="sportKind">'+opts(['Não informada','Leve / Recuperação','Moderada','Acelerada','Trilha'])+'</select>';openModal('<h2>Atividade concluída!</h2><p class="small">Confira seus números e registre como foi o treino.</p>'+sportMetricsHtml(r)+modality+'<label class="small">Terreno</label><select class="field" id="sportTerrain">'+opts(['Não informado','Asfalto','Terra / Estradão','Trilha','Misto','Esteira / Rolo'])+'</select><label class="small">Esforço percebido (escala de 1 a 10)</label><select class="field" id="sportEffort"><option value="">Não informar</option>'+Array.from({length:10},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'/10</option>').join('')+'</select><button class="bigbtn" onclick="saveSportDetails('+id+')">Salvar detalhes do treino</button><button class="ghost" onclick="closeModal();showResult(data.runs.find(x=>x.id==='+id+'))">Ver resumo</button>');refreshIcons()}
function saveSportDetails(id){const r=data.runs.find(x=>x.id===id);if(!r)return;const kind=$('sportKind')?.value||'';r.sportNotes={terrain:$('sportTerrain')?.value||'',effort:$('sportEffort')?.value||''};if(r.mode==='Ciclismo')r.sportNotes.bikeType=kind;else if(r.mode==='Corrida')r.sportNotes.workout=kind;else r.sportNotes.intensity=kind;save();render();closeModal();showResult(r)}
function formatPace(r){return r.mode==='Ciclismo'?speedText(r.seconds,r.km):paceText(r.seconds,r.km)}function unitFor(r){return r.mode==='Ciclismo'?'':'/km'}

// Desenha somente o percurso real registrado pelo GPS, sem simular trajetos.
function routeCoordinates(route,width,height,pad=28){
 if(!Array.isArray(route))return [];
 const pts=route.filter(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1]));
 if(pts.length<2)return [];
 const meanLat=pts.reduce((sum,p)=>sum+(+p[0]),0)/pts.length;
 const factor=Math.cos(meanLat*Math.PI/180);
 const coords=pts.map(p=>({x:(+p[1])*factor,y:-(+p[0])}));
 const xs=coords.map(p=>p.x),ys=coords.map(p=>p.y),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
 const spanX=Math.max(xmax-xmin,1e-8),spanY=Math.max(ymax-ymin,1e-8);
 const scale=Math.min((width-pad*2)/spanX,(height-pad*2)/spanY);
 const ox=(width-spanX*scale)/2,oy=(height-spanY*scale)/2;
 return coords.map(p=>({x:ox+(p.x-xmin)*scale,y:oy+(p.y-ymin)*scale}));
}
function drawRouteOnCanvas(c,route,x,y,w,h,transparent=false){
 const pts=routeCoordinates(route,w,h,36);
 if(!pts.length)return false;
 c.save();c.translate(x,y);c.lineCap='round';c.lineJoin='round';
 c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
 c.strokeStyle=transparent?'rgba(0,0,0,.9)':'rgba(0,0,0,.55)';c.lineWidth=24;c.stroke();
 c.strokeStyle='#b6f43c';c.lineWidth=13;c.stroke();
 for(const [p,color] of [[pts[0],'#fff'],[pts[pts.length-1],'#b6f43c']]){c.beginPath();c.arc(p.x,p.y,13,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle='#142000';c.lineWidth=4;c.stroke()}
 c.restore();return true;
}
function routePreviewHtml(r){
 const pts=routeCoordinates(r.route,310,150,15);
 if(!pts.length)return '<p class="route-empty">Percurso não disponível: GPS insuficiente nesta atividade.</p>';
 const path=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
 return `<div class="route-preview"><div class="route-caption">SEU PERCURSO GPS</div><svg viewBox="0 0 310 150" role="img" aria-label="Traçado do percurso da atividade"><path d="${path}" stroke="#b6f43c" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${pts[0].x}" cy="${pts[0].y}" r="6" fill="white"/><circle cx="${pts[pts.length-1].x}" cy="${pts[pts.length-1].y}" r="6" fill="#b6f43c"/></svg></div>`;
}

// Galeria de fundos fornecida pelo projeto. As imagens externas devem permitir CORS para exportação em Canvas.
const photoGallery={
 Ciclismo:['https://i.ibb.co/DHwQtwb8/Design-sem-nome-4.png','https://i.ibb.co/LXPSHHZq/Design-sem-nome-5.png','https://i.ibb.co/ZzG7q13Q/Design-sem-nome-6.png','https://i.ibb.co/qYC0fPny/Design-sem-nome-7.png'],
 Corrida:['https://i.ibb.co/PGj2pBZw/Design-sem-nome-2.png','https://i.ibb.co/hF5yWTPc/Design-sem-nome-3.png','https://i.ibb.co/9mJMWKRH/Design-sem-nome.png','https://i.ibb.co/3mC2fPbH/Design-sem-nome-8.png']
};
let composerRun=null,composerSource=null,composerObjectUrl=null;
function openPhotoComposer(id){const r=data.runs.find(x=>x.id===id);if(!r)return;composerRun=r;composerSource=null;const photos=photoGallery[r.mode==='Ciclismo'?'Ciclismo':'Corrida'];openModal(`<div class="composer"><h2>Minha conquista</h2><p class="small">Escolha uma imagem ou adicione uma foto do seu celular.</p><div class="photo-choices">${photos.map((url,i)=>`<button type="button" onclick="selectComposerPhoto(${i})" aria-label="Escolher imagem ${i+1}"><img src="${url}" alt="Fundo ${i+1}" loading="lazy"></button>`).join('')}</div><label class="upload-photo"><i data-lucide="image-plus"></i> Escolher foto da galeria<input id="customComposerPhoto" type="file" accept="image/*" onchange="selectCustomComposerPhoto(this)"></label><div class="photo-preview" id="photoPreview"><p>Escolha uma foto para visualizar o resultado.</p></div><button class="bigbtn" id="downloadPhotoBtn" disabled onclick="shareComposerImage('system')"><i data-lucide="share-2"></i> Compartilhar</button><p class="small">Escolha o aplicativo no menu de compartilhamento do celular.</p><button class="ghost" onclick="closeModal()">Fechar</button></div>`);refreshIcons()}
function selectComposerPhoto(i){const r=composerRun;if(!r)return;composerSource=photoGallery[r.mode==='Ciclismo'?'Ciclismo':'Corrida'][i];renderComposerPreview()}
function selectCustomComposerPhoto(input){const file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){alert('Selecione uma imagem válida.');return}if(composerObjectUrl)URL.revokeObjectURL(composerObjectUrl);composerObjectUrl=URL.createObjectURL(file);composerSource=composerObjectUrl;renderComposerPreview()}
function renderComposerPreview(){const r=composerRun;if(!r||!composerSource)return;document.querySelectorAll('.photo-choices button').forEach(btn=>btn.classList.toggle('chosen',btn.querySelector('img').src===composerSource));$('photoPreview').innerHTML=`<img src="${composerSource}" alt="Prévia da foto"><div class="photo-shade"></div><div class="photo-top"><span>${escapeHtml(r.mode.toUpperCase())} • ${new Date(r.date).toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase()}</span></div><div class="photo-bottom"><div class="photo-stats"><div><b>${Number(r.km).toFixed(2).replace('.',',')}</b><small>KM</small></div><div><b>${formatTime(r.seconds)}</b><small>DURAÇÃO</small></div><div><b>${r.calories??estimatedCalories(r.km,r.mode)}</b><small>KCAL</small></div></div><div class="photo-brand">URUÇUÍ <strong>EM MOVIMENTO</strong></div></div>`;$('downloadPhotoBtn').disabled=false;}
function loadComposerImage(src){return new Promise((resolve,reject)=>{const img=new Image();if(!src.startsWith('blob:'))img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Não foi possível carregar a imagem.'));img.src=src})}
async function createComposerFile(){
 const r=composerRun;if(!r||!composerSource)throw new Error('Escolha uma imagem primeiro.');
 const img=await loadComposerImage(composerSource),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');const scale=Math.max(canvas.width/img.width,canvas.height/img.height),w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(1080-w)/2,(1920-h)/2,w,h);const shade=ctx.createLinearGradient(0,0,0,1920);shade.addColorStop(0,'rgba(0,0,0,.38)');shade.addColorStop(.46,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.85)');ctx.fillStyle=shade;ctx.fillRect(0,0,1080,1920);ctx.fillStyle='#fff';ctx.textBaseline='top';ctx.font='bold 36px Arial';ctx.fillText(r.mode.toUpperCase()+'  •  '+new Date(r.date).toLocaleDateString('pt-BR',{weekday:'long'}).toUpperCase(),65,75);const stats=[{v:Number(r.km).toFixed(2).replace('.',','),k:'KM'},{v:formatTime(r.seconds),k:'DURAÇÃO'},{v:String(r.calories??estimatedCalories(r.km,r.mode)),k:'KCAL'}];stats.forEach((a,i)=>{const x=65+i*350;ctx.font='bold 72px Arial';ctx.fillText(a.v,x,1600);ctx.font='bold 26px Arial';ctx.fillText(a.k,x,1690)});ctx.font='bold 39px Arial';ctx.fillText('URUÇUÍ',65,1800);ctx.font='30px Arial';ctx.fillText('EM MOVIMENTO',245,1806);const blob=await new Promise((res,rej)=>{try{canvas.toBlob(b=>b?res(b):rej(new Error('PNG indisponível')),'image/png')}catch(e){rej(e)}});return new File([blob],'uruçui-em-movimento-'+r.mode.toLowerCase()+'-'+new Date(r.date).toISOString().slice(0,10)+'.png',{type:'image/png'});
}
function saveShareFallback(file,platform){
 const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 const message=platform==='instagram'?'Abra o Instagram, crie um Story e selecione a imagem salva.':platform==='facebook'?'Abra o Facebook, crie um Story e selecione a imagem salva.':platform==='whatsapp'?'Abra o WhatsApp, escolha uma conversa e anexe a imagem salva.':'Abra a imagem salva no seu celular para compartilhar.';
 alert('Seu navegador não permite enviar o PNG diretamente para essa rede. A imagem foi disponibilizada para download. '+message);
}
async function shareComposerImage(platform='system'){
 if(!composerRun||!composerSource)return;
 const btn=$('downloadPhotoBtn');const original=btn.innerHTML;btn.disabled=true;btn.textContent='Preparando imagem...';
 try{
  const file=await createComposerFile();
  // Web Share API: browsers cannot select a target app or force publication in Stories.
  // Let the user choose the installed destination in the system share sheet.
  if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
   try{await navigator.share({files:[file],title:'Minha conquista • Uruçuí em Movimento'});return}
   catch(err){if(err&&err.name==='AbortError')return;}
  }
  saveShareFallback(file,platform);
 }catch(e){alert('Não foi possível preparar essa imagem. Se for uma imagem da galeria do app, tente uma foto do celular. Alguns servidores impedem a exportação por segurança.');}
 finally{btn.disabled=false;btn.innerHTML=original;refreshIcons()}
}
async function downloadComposerImage(){return shareComposerImage('system')}

function render(){let runs=data.runs,total=runs.reduce((a,r)=>a+r.km,0),secs=runs.reduce((a,r)=>a+r.seconds,0),best=runs.filter(r=>r.km>.02&&r.mode!=='Ciclismo').sort((a,b)=>a.seconds/a.km-b.seconds/b.km)[0];$('greeting').textContent='Olá, '+(data.name||'corredor').split(' ')[0]+'!';$('profilename').textContent=data.name;renderProfilePhoto();renderProfileSummary(total);$('homekm').textContent=total.toFixed(1).replace('.',',')+' km';$('hometime').textContent=Math.round(secs/60)+' min';$('homecount').textContent=runs.length;$('homebest').textContent=best?formatPace(best):'—';$('progkm').textContent=total.toFixed(1).replace('.',',');$('progcount').textContent=runs.length;$('medal1').innerHTML=runs.length?'<i data-lucide="check"></i>':'<i data-lucide="lock"></i>';$('medal2').innerHTML=total>=10?'<i data-lucide="check"></i>':'<i data-lucide="lock"></i>';$('homeevents').innerHTML=renderHomeChallengeGroups();$('eventlist').innerHTML=events.length?events.map(eventHtml).join(''):emptyEventsHtml();renderRanking();$('history').innerHTML=runs.length?runs.map(r=>`<div class="history row"><div><strong>${r.mode} • ${r.km.toFixed(2).replace('.',',')} km</strong><br><small>${new Date(r.date).toLocaleDateString('pt-BR')} • ${formatTime(r.seconds)} • ${formatPace(r)}${unitFor(r)} • ${r.calories??estimatedCalories(r.km,r.mode)} kcal</small></div><button class="chip" onclick="showResult(data.runs.find(x=>x.id===${r.id}))">Ver <i data-lucide="arrow-up-right"></i></button></div>`).join(''):'<p class="small">Nenhuma atividade ainda. Inicie sua primeira atividade!</p>';let days=Array.from({length:7},(_,i)=>{let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));return d});let vals=days.map(d=>runs.filter(r=>new Date(r.date).toDateString()===d.toDateString()).reduce((a,r)=>a+r.km,0)),max=Math.max(1,...vals);$('chart').innerHTML=days.map((d,i)=>`<div><div class="bar" style="height:${Math.max(5,vals[i]/max*125)}px"></div><small>${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]}</small></div>`).join('')}
function openModal(html){$('modalcontent').innerHTML=html;$('modal').classList.add('show')}function closeModal(){$('modal').classList.remove('show')}function openSettings(){openModal(`<h2>Editar perfil</h2><label class="small" for="namefield">Nome completo</label><input class="field" id="namefield" maxlength="80" value="${escapeHtml(data.name)}"><label class="small" for="birthfield">Data de nascimento</label><input class="field" id="birthfield" type="date" value="${escapeHtml(data.birth||'')}"><label class="small" for="weightfield">Peso (kg)</label><input class="field" id="weightfield" type="number" min="20" max="350" step="0.1" value="${escapeHtml(data.weight||'')}"><label class="small" for="heightfield">Altura (cm)</label><input class="field" id="heightfield" type="number" min="90" max="250" value="${escapeHtml(data.height||'')}"><label class="small" for="sexfield">Sexo</label><select class="field" id="sexfield"><option value="">Prefiro não informar</option><option value="feminino" ${data.sex==='feminino'?'selected':''}>Feminino</option><option value="masculino" ${data.sex==='masculino'?'selected':''}>Masculino</option><option value="outro" ${data.sex==='outro'?'selected':''}>Outro</option></select><label class="small" for="emailfield">E-mail</label><input class="field" id="emailfield" type="email" maxlength="120" value="${escapeHtml(data.email||'')}"><button class="bigbtn" onclick="saveSettings()">Salvar perfil</button><p class="small" style="margin-top:16px">Nome, peso e sexo serão sincronizados com a conta. Altura e data de nascimento ficam neste dispositivo.</p><button class="ghost" style="margin-top:12px" onclick="closeModal()">Fechar</button>`)}function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}function saveSettings(){const email=$('emailfield').value.trim();if(email&&!$('emailfield').checkValidity()){$('emailfield').reportValidity();return}const weight=$('weightfield').value;if(weight&&(Number(weight)<20||Number(weight)>350)){alert('Informe um peso entre 20 e 350 kg.');return}data.name=$('namefield').value.trim()||'Corredor de Uruçuí';data.birth=$('birthfield').value;data.weight=weight?Number(weight):null;const height=$('heightfield').value;if(height&&(Number(height)<90||Number(height)>250)){alert('Informe uma altura entre 90 e 250 cm.');return}data.height=height?Number(height):null;data.sex=$('sexfield').value;data.email=email;save();closeModal();render();if(sessionToken){api({action:'updateProfile',token:sessionToken,usuario:data.name,peso:data.weight,sexo:data.sex}).then(r=>applyAccount(r.user)).catch(e=>alert('Seu perfil foi salvo neste dispositivo, mas ainda não foi atualizado na sua conta. Tente novamente quando estiver conectado.'))}}$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});renderAd();

let iconsPending=false;function refreshIcons(){if(iconsPending)return;iconsPending=true;requestAnimationFrame(()=>{iconsPending=false;if(window.lucide){try{lucide.createIcons()}catch(e){console.warn('Ícones:',e)}}else{document.querySelectorAll('i[data-lucide]').forEach(i=>{if(!i.textContent.trim())i.textContent=({'house':'⌂','user-round':'◉','map-pin':'⌖','refresh-cw':'↻','play':'▶','pause':'Ⅱ','calendar-days':'▦','trophy':'★','footprints':'♧','bike':'♢','navigation':'➤','log-out':'⇥','clock-3':'◷','trash-2':'×','arrow-right':'→','arrow-up-right':'↗','check':'✓','lock':'▣','settings':'⚙'}[i.dataset.lucide]||'•');i.classList.add('icon-fallback')})}})}const iconObserver=new MutationObserver(changes=>{if(changes.some(c=>Array.from(c.addedNodes).some(n=>n.nodeType===1&&(n.matches?.('i[data-lucide]')||n.querySelector?.('i[data-lucide]')))))refreshIcons()});iconObserver.observe(document.body,{childList:true,subtree:true});refreshIcons();

let communityRanking=[],communityLoading=false,communityError='',communityDate='';
function todayCommunity(){return fortalezaDay(new Date())}
async function loadCommunityRanking(){if(!sessionToken||!data.localityCity){communityRanking=[];communityError='Ative a localização para encontrar atletas da sua cidade.';renderRanking();return}communityLoading=true;communityError='';renderRanking();try{const r=await api({action:'ranking',token:sessionToken,modalidade:rankingMode});communityRanking=r.ranking||[];communityDate=r.dia||todayCommunity()}catch(e){communityError='Não foi possível atualizar a comunidade agora. Tente novamente em instantes.';communityRanking=[]}finally{communityLoading=false;renderRanking()}}
function renderRanking(){const node=$('rankinglist'),pod=$('podium');if(!node||!pod)return;const city=data.localityCity||'sua cidade';const list=communityRanking;const format=n=>Number(n||0).toFixed(2).replace('.',',');if(communityLoading){pod.innerHTML='';node.innerHTML='<div class="ranking-empty">Carregando atletas da cidade...</div>';return}if(communityError){pod.innerHTML='';node.innerHTML='<div class="ranking-empty">'+escapeHtml(communityError)+'</div>';return}if(!list.length){pod.innerHTML='';node.innerHTML='<div class="ranking-empty"><strong>Nenhuma atividade registrada hoje.</strong><p>Seja o primeiro atleta de '+escapeHtml(city)+' a marcar quilômetros!</p></div>';return}const positions=[1,0,2];pod.innerHTML=positions.map(i=>{const u=list[i],place=i+1;return `<div data-me="${u&&u.eu?'true':'false'}" class="podium-place ${i===0?'first':i===1?'second':'third'}"><div class="podium-avatar"><i data-lucide="user-round"></i></div><strong>${place}º</strong><small>${u?escapeHtml(u.usuario):'—'}</small><div class="podium-step">${u?format(u.km)+' km':place}</div></div>`}).join('');node.innerHTML=`<p class="ranking-city">${escapeHtml(city)} • ${escapeHtml(rankingMode)} • Hoje</p>`+list.map((u,i)=>`<div class="ranking-row community-row" data-me="${u.eu?'true':'false'}"><span class="rank-number">${i+1}</span><div class="ranking-user-avatar">${photoAvatarHtml(u.eu?(profilePhotoPreviewUrl||data.profilePhoto||u.foto):u.foto)}</div><div style="flex:1;min-width:0"><strong>${escapeHtml(u.usuario)}${u.eu?' (você)':''}</strong><div class="small">${u.atividades} ${u.atividades===1?'atividade':'atividades'} hoje</div></div><strong>${format(u.km)} km</strong></div>`).join('');refreshIcons()}

function updateActivityUI(){const active=running||starting;const label=$('homeStartLabel');if(label)label.textContent=active?'RETOMAR':'INICIAR';const mini=$('activeMini');if(mini){mini.classList.toggle('hide',!active||document.getElementById('track').classList.contains('active'));$('miniTitle').textContent=paused?'Atividade pausada':starting?'Preparando atividade':mode+' em andamento';$('miniStats').textContent=distance.toFixed(2).replace('.',',')+' km • '+formatTime(elapsed)}}

function speakCountdown(n){if(!('speechSynthesis' in window))return;try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(n===0?'Vai!':String(n));utterance.lang='pt-BR';utterance.rate=1.12;utterance.volume=1;speechSynthesis.speak(utterance)}catch(e){console.warn(e)}}
function renderProfileSummary(total){const node=$('profileSummary');if(!node)return;node.innerHTML=`<div><strong>${data.weight?escapeHtml(data.weight)+' kg':'—'}</strong><small>Peso</small></div><div><strong>${data.height?escapeHtml(data.height)+' cm':'—'}</strong><small>Altura</small></div><div><strong>${total.toFixed(1).replace('.',',')} km</strong><small>Distância total</small></div>`}
function fortalezaDay(d){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const v=Object.fromEntries(p.map(x=>[x.type,x.value]));return v.year+'-'+v.month+'-'+v.day}
const weekdays=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function renderReminderSettings(){const r=data.reminder||{days:[1,2,3,4,5],time:'07:00',enabled:false};$('reminderTime').value=r.time||'07:00';$('reminderEnabled').checked=!!r.enabled;$('reminderDays').innerHTML=weekdays.map((day,i)=>`<label><input type="checkbox" value="${i}" ${r.days.includes(i)?'checked':''}><span>${day}</span></label>`).join('')}
async function saveReminder(){const days=[...document.querySelectorAll('#reminderDays input:checked')].map(x=>Number(x.value));const enabled=$('reminderEnabled').checked;const time=$('reminderTime').value||'07:00';if(enabled&&!days.length){alert('Escolha pelo menos um dia.');return}const btn=document.querySelector('button[onclick="saveReminder()"]');const label=btn?.innerHTML;if(btn){btn.disabled=true;btn.innerHTML='<span class="reminder-spinner"></span> Salvando lembrete...'}try{if(!sessionToken)throw Error('Entre na sua conta para salvar seu lembrete.');await api({action:'saveReminder',token:sessionToken,enabled,days,time});data.reminder={enabled,days,time};save();alert(enabled?'Lembrete ativado! Você receberá e-mails motivacionais nos dias escolhidos, no horário escolhido (podendo haver pequeno atraso na entrega).':'Lembretes desativados com sucesso.')}catch(e){alert('Não foi possível salvar seu lembrete agora. Confira sua conexão e tente novamente.')}finally{if(btn){btn.disabled=false;btn.innerHTML=label}}}
// Lembretes remotos por e-mail; sem alerta local duplicado.
// Preencha os destinos oficiais antes de publicar.
const contactConfig={whatsapp:'',about:'',social:''};
function openSupport(){if(contactConfig.whatsapp){window.open('https://wa.me/'+contactConfig.whatsapp.replace(/\D/g,''),'_blank','noopener')}else openModal('<h2>Suporte</h2><p class="eventdetail">O WhatsApp de suporte ainda não foi configurado. Tente novamente mais tarde.</p><button class="bigbtn" onclick="closeModal()">Entendi</button>')}
function openExternalSetting(type){const url=contactConfig[type];if(url){window.open(url,'_blank','noopener,noreferrer')}else openModal('<h2>'+ (type==='about'?'Sobre nós':'Redes sociais')+'</h2><p class="eventdetail">O link oficial ainda não foi cadastrado. Configure o endereço no arquivo script.js.</p><button class="bigbtn" onclick="closeModal()">Fechar</button>')}
function confirmDeleteAccount(){openModal('<h2>Excluir minha conta definitivamente?</h2><p class="eventdetail">Seu perfil e seus dados vinculados à conta serão excluídos, incluindo sessões e lembretes. Esta ação não pode ser desfeita.</p><button class="bigbtn dark" onclick="closeModal()">Cancelar</button><button class="bigbtn danger-button" onclick="deleteLocalAccount()">Excluir minha conta</button>')}
async function deleteLocalAccount(){const btn=document.querySelector('.danger-button');if(btn){btn.disabled=true;btn.textContent='Excluindo conta...'}try{if(!sessionToken)throw Error('Sessão inválida.');await api({action:'deleteAccount',token:sessionToken});sessionToken='';localStorage.removeItem(SESSION_KEY);localStorage.removeItem(ACCOUNT_CACHE_KEY);localStorage.removeItem(KEY);localStorage.removeItem('uem_active_user');if(running){clearInterval(timer);if(watchId!==null)navigator.geolocation.clearWatch(watchId);running=false;watchId=null}data={name:'Corredor de Uruçuí',runs:[]};closeModal();showScreen('home');authOpen()}catch(e){alert('Não foi possível excluir sua conta agora. Tente novamente.');if(btn){btn.disabled=false;btn.textContent='Excluir minha conta'}}}

// Banners retangulares: ajuste imagens e destinos conforme os contratos publicitários.
const leaderboardAds=[
 {image:'https://template.canva.com/EAFtI4Y2vqA/2/0/800w-_FM7CYxRDXQ.jpg',url:''},
 {image:'https://template.canva.com/EAE36LKvTAo/2/0/1600w-4TUPr4UZz6s.jpg',url:''},
 {image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2XONinUdQvVrucnMqhnu9HJwSE7QbD-stt0yNSCueZA&s=10',url:''}
];
let boardIndex=0;
function renderLeaderboards(){if(!leaderboardAds.length){document.querySelectorAll('.leaderboard-slot').forEach(slot=>slot.innerHTML='');return;}document.querySelectorAll('.leaderboard-slot').forEach((slot,idx)=>{const ad=leaderboardAds[(boardIndex+idx)%leaderboardAds.length];slot.innerHTML=`<a class="leaderboard-image" href="${ad.url||'#'}" ${ad.url?'target="_blank" rel="noopener noreferrer"':'onclick="event.preventDefault()"'} aria-label="Publicidade"><img src="${ad.image}" alt="Publicidade" loading="lazy"></a><div class="leaderboard-dots">${leaderboardAds.map((_,i)=>`<span class="${i===(boardIndex+idx)%leaderboardAds.length?'selected':''}"></span>`).join('')}</div>`})}
renderLeaderboards();setInterval(()=>{if(leaderboardAds.length>1){boardIndex=(boardIndex+1)%leaderboardAds.length;renderLeaderboards()}},6000);
const advertisingWhatsApp='5589994484966'; // Número comercial editável
function requestAdvertising(){window.open('https://wa.me/'+advertisingWhatsApp+'?text='+encodeURIComponent('Olá! Quero anunciar no Uruçuí em Movimento.'),'_blank','noopener,noreferrer')}
const finishAds=[];let finishSponsorIndex=0;
// Antes de mostrar o oferecimento, consulta os banners atuais do painel quando necessario.
// A publicidade e sempre opcional: sem campanha ativa, o atleta continua normalmente.
async function showFinishSponsorWithRefresh(run){
 // Atividades de desafios exibem somente o patrocinador cadastrado no proprio desafio.
 // Atividades livres preservam a publicidade geral da posicao finish.
 if(run.challengeId){
  let desafio=events.find(e=>String(e.id)===String(run.challengeId));
  if(!desafio){
   const cidade=String(data.localityCity||'').trim(),uf=ufNormalizada(data.localityState);
   if(cidade&&uf){try{const c=await Promise.race([publicContent(cidade,uf),new Promise(resolve=>setTimeout(()=>resolve(null),4500))]);if(c&&Array.isArray(c.desafios)){desafio=c.desafios.find(e=>String(e.id)===String(run.challengeId));}}catch(e){console.warn('Patrocinador do desafio indisponivel:',e)}}
  }
  showFinishSponsor(run,desafio||null);return;
 }
 if(!finishAds.some(x=>x.image)){
  const cidade=String(data.localityCity||'').trim(),uf=ufNormalizada(data.localityState);
  if(cidade&&uf){try{const c=await Promise.race([publicContent(cidade,uf),new Promise(resolve=>setTimeout(()=>resolve(null),4500))]);if(c&&Array.isArray(c.banners)){const anuncios=c.banners.filter(x=>x.imagem&&String(x.posicao||'home').split(',').map(v=>v.trim().toLowerCase()).includes('finish')).map(x=>({image:x.imagem,url:x.link||''}));finishAds.splice(0,finishAds.length,...anuncios)}}catch(e){console.warn('Publicidade de conclusao indisponivel:',e)}}
 }
 showFinishSponsor(run,null);
}
function showFinishSponsor(r,desafio=null){
 const isChallenge=!!r.challengeId;
 const patrocinadores=finishAds.filter(x=>x.image);
 const ad=isChallenge?(desafio?.patrocinadorImagem?{image:desafio.patrocinadorImagem,url:desafio.patrocinadorLink||'',name:desafio.patrocinador||''}:null):(patrocinadores.length?patrocinadores[finishSponsorIndex++%patrocinadores.length]:null);
 const validUrl=ad&&/^https:\/\//i.test(ad.url||'')?ad.url:'';
 const title=isChallenge&&desafio?'Desafio: '+escapeHtml(desafio.title||desafio.titulo||''):'Atividade finalizada!';
 openModal(`<div class="finish-head"><i data-lucide="check-circle-2"></i><h2>Atividade finalizada!</h2><p>${title}</p><p>Você percorreu <strong>${Number(r.km).toFixed(2).replace('.',',')} km</strong>. Parabéns!</p></div>${ad?`<p class="small" style="text-align:center;margin:18px 0 8px">OFERECIMENTO${ad.name?' DE '+escapeHtml(ad.name):''}</p><div class="finish-sponsor">${validUrl?`<a href="${escapeHtml(validUrl)}" target="_blank" rel="noopener noreferrer">`:''}<img src="${escapeHtml(ad.image)}" alt="Banner do patrocinador do desafio">${validUrl?'</a>':''}</div>`:''}<button class="bigbtn" onclick="showSportFinishDetails(${r.id})">Continuar <i data-lucide="arrow-right"></i></button><button class="ghost" onclick="closeModal()">Fechar</button>`);refreshIcons();
}
function birthdayKey(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function checkBirthday(){if(!data.birth)return;const parts=data.birth.split('-').map(Number),now=new Date();if(parts[1]!==now.getMonth()+1||parts[2]!==now.getDate())return;if(localStorage.getItem('uem_birthday_seen')===birthdayKey())return;const overlay=$('birthdayOverlay');if(!overlay)return;$('birthdayMessage').textContent=`${(data.name||'Corredor').split(' ')[0]}, que seu novo ciclo seja cheio de saúde, energia e quilômetros de conquistas!`;$('birthdayConfetti').innerHTML=Array.from({length:60},(_,i)=>`<span style="left:${Math.random()*100}%;animation-delay:${Math.random()*2}s;background:${['#b6f43c','#fff','#77a5fa','#ffd96a'][i%4]}"></span>`).join('');overlay.classList.remove('hide');refreshIcons()}
function dismissBirthday(){localStorage.setItem('uem_birthday_seen',birthdayKey());$('birthdayOverlay').classList.add('hide')}
const oldSaveSettings=saveSettings;saveSettings=function(){oldSaveSettings();checkBirthday()};setTimeout(checkBirthday,600);

// Progresso por modalidade e localização atual (apenas dados deste dispositivo).
let progressMode='Todas',rankingMode='Corrida',lastLocalityLookup=0;
function filteredRuns(){return data.runs.filter(r=>progressMode==='Todas'||r.mode===progressMode)}
function setProgressMode(m){progressMode=m;renderProgressDetails()}
function setRankingMode(m){rankingMode=m;loadCommunityRanking();document.querySelectorAll('#rankingModes button').forEach(b=>b.classList.toggle('on',b.textContent.trim()===m))}
function renderProgressDetails(){const runs=filteredRuns(),total=runs.reduce((a,r)=>a+r.km,0),seconds=runs.reduce((a,r)=>a+r.seconds,0),cals=runs.reduce((a,r)=>a+(r.calories??estimatedCalories(r.km,r.mode)),0),longest=Math.max(0,...runs.map(r=>r.km));$('progkm').textContent=total.toFixed(1).replace('.',',');$('progcount').textContent=runs.length;document.querySelectorAll('#progressModes button').forEach(b=>b.classList.toggle('on',b.textContent.trim()===progressMode));$('progressDetail').innerHTML=`<div class="progress-metrics"><div><strong>${formatTime(seconds)}</strong><small>Tempo total</small></div><div><strong>${cals}</strong><small>Calorias estimadas</small></div><div><strong>${longest.toFixed(2).replace('.',',')} km</strong><small>Maior distância</small></div><div><strong>${runs.length?(total/runs.length).toFixed(2).replace('.',','):'0,00'} km</strong><small>Média por atividade</small></div></div><p class="small">${progressMode==='Ciclismo'?'No ciclismo, priorize velocidade média e distância.':progressMode==='Caminhada'?'Na caminhada, acompanhe constância e ritmo.':progressMode==='Corrida'?'Na corrida, acompanhe ritmo e evolução.':'Selecione uma modalidade para analisar seus resultados separadamente.'}</p>`;$('history').innerHTML=runs.length?runs.map(r=>`<div class="history row"><div><strong>${escapeHtml(r.mode)} • ${r.km.toFixed(2).replace('.',',')} km</strong><br><small>${new Date(r.date).toLocaleDateString('pt-BR')} • ${formatTime(r.seconds)} • ${r.calories??estimatedCalories(r.km,r.mode)} kcal</small></div><button class="chip" onclick="showResult(data.runs.find(x=>x.id===${r.id}))">Detalhes</button></div>`).join(''):'<p class="small">Nenhuma atividade nesta modalidade.</p>';const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-i));return d});const vals=days.map(d=>runs.filter(r=>new Date(r.date).toDateString()===d.toDateString()).reduce((n,r)=>n+r.km,0)),max=Math.max(1,...vals);$('chart').innerHTML=days.map((d,i)=>`<div><div class="bar" style="height:${Math.max(5,vals[i]/max*125)}px"></div><small>${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]}</small></div>`).join('')}
const originalRender=render;render=function(){originalRender();renderProgressDetails();renderLocality()};
function renderLocality(){const location=data.locality||'Localização não identificada';const node=$('locationStatus');if(node)node.querySelector('span').textContent=location;const profile=$('profileLocation');if(profile)profile.textContent=location;const title=document.querySelector('#ranking h1');if(title)title.textContent=data.locality?'Comunidade • '+data.locality:'Comunidade local';}
async function updateLocality(force=false){if(!navigator.geolocation){const el=$('locationStatus');if(el)el.querySelector('span').textContent='GPS não disponível neste navegador';return}if(!force&&Date.now()-lastLocalityLookup<1800000)return;lastLocalityLookup=Date.now();navigator.geolocation.getCurrentPosition(async position=>{try{const lat=position.coords.latitude,lon=position.coords.longitude;const url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=14&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon);const res=await fetch(url,{headers:{'Accept':'application/json'}});if(!res.ok)throw Error('Serviço de localização indisponível');const obj=await res.json(),a=obj.address||{};const district=a.suburb||a.city_district||a.neighbourhood||a.quarter||a.borough||'',city=a.city||a.town||a.village||a.municipality||a.county||'',state=a.state||'';const locality=(district&&city&&district.toLowerCase()!==city.toLowerCase()?district+' • '+city:city||district||state);if(locality){data.locality=locality;data.localityCity=city||district||state;data.localityState=state;data.localityDistrict=district;data.localityUpdatedAt=Date.now();save();renderLocality();loadCommunityRanking();if(sessionToken){api({action:'location',token:sessionToken,cidade:data.localityCity,uf:data.localityState}).catch(console.warn);refreshCityContent()}}}catch(e){console.warn('Não foi possível identificar a cidade',e);const el=$('locationStatus');if(el)el.querySelector('span').textContent=data.locality||'Não foi possível identificar sua cidade. Toque para tentar novamente.'}},()=>{renderLocality();const el=$('locationStatus');if(el&&!data.locality)el.querySelector('span').textContent='Permita a localização ou toque para tentar novamente.'},{enableHighAccuracy:false,timeout:12000,maximumAge:300000})}
const baseShowScreen=showScreen;showScreen=function(id){baseShowScreen(id);if(id==='progress')renderProgressDetails();if(id==='ranking')renderRanking();if(id==='home'||id==='ranking')updateLocality()};
const baseRenderRanking=renderRanking;renderRanking=function(){baseRenderRanking();const today=new Date().toDateString(),mine=data.runs.filter(r=>r.mode===rankingMode&&new Date(r.date).toDateString()===today&&(!data.locality||r.locality===data.locality)),km=mine.reduce((n,r)=>n+r.km,0);$('rankinglist').innerHTML=`<div class="ranking-row"><span class="rank-number">1</span><div style="flex:1"><strong>${escapeHtml(data.name||'Você')}</strong><div class="small">${rankingMode} • ${mine.length} atividades hoje</div></div><strong>${km.toFixed(2).replace('.',',')} km</strong></div><p class="small" style="margin-top:14px">Sua atividade de hoje em ${escapeHtml(data.locality||'localização ainda não identificada')}. A comunidade acompanha sua localização atual; para ver outras pessoas é necessário um servidor com dados dos atletas.</p>`;document.querySelectorAll('#rankingModes button').forEach(b=>b.classList.toggle('on',b.textContent.trim()===rankingMode))};
// Inicialização adiada para depois de todas as declarações.

// Atualiza a comunidade ao retornar ao aplicativo, respeitando o intervalo de consulta.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateLocality()});
window.addEventListener('focus',()=>updateLocality());
const oldRenderLocality=renderLocality;renderLocality=function(){oldRenderLocality();const el=document.getElementById('communityCurrentLocation');if(el)el.textContent=data.locality||'Autorize a localização para identificar sua comunidade';};
const oldRenderRankingV12=renderRanking;renderRanking=function(){oldRenderRankingV12();renderLocality();};


// V15: conexão opcional com sensores de frequência cardíaca Bluetooth LE.
// Não é integração com Apple Health, Health Connect ou plataformas proprietárias.
let wearableDevice=null,wearableServer=null,wearableCharacteristic=null,wearableHeartRate=null;
function setWearableStatus(message){const el=document.getElementById('wearableStatus');if(el)el.textContent=message;const bpm=document.getElementById('wearableBpm');if(bpm)bpm.textContent=wearableHeartRate===null?'—':String(wearableHeartRate)}
function handleWearableHeartRate(event){const value=event.target.value;if(!value||value.byteLength<2)return;const flags=value.getUint8(0);const is16=(flags&1)!==0;const bpm=is16?(value.byteLength>=3?value.getUint16(1,true):null):value.getUint8(1);if(bpm===null)return;wearableHeartRate=bpm;setWearableStatus('Conectado • frequência cardíaca em tempo real')}
function handleWearableDisconnect(){wearableServer=null;wearableCharacteristic=null;wearableHeartRate=null;setWearableStatus('Dispositivo desconectado')}
async function connectWearable(){if(!window.isSecureContext){setWearableStatus('Abra o aplicativo por HTTPS para usar Bluetooth.');return}if(!navigator.bluetooth){setWearableStatus('Bluetooth pelo navegador indisponível neste dispositivo.');return}try{setWearableStatus('Escolha um sensor compatível na lista...');const device=await navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}],optionalServices:['heart_rate']});if(wearableDevice&&wearableDevice!==device)disconnectWearable();wearableDevice=device;device.addEventListener('gattserverdisconnected',handleWearableDisconnect);setWearableStatus('Conectando a '+(device.name||'sensor')+'...');wearableServer=await device.gatt.connect();const service=await wearableServer.getPrimaryService('heart_rate');wearableCharacteristic=await service.getCharacteristic('heart_rate_measurement');await wearableCharacteristic.startNotifications();wearableCharacteristic.addEventListener('characteristicvaluechanged',handleWearableHeartRate);setWearableStatus('Conectado: '+(device.name||'sensor')+' • aguardando batimentos')}catch(error){const msg=error?.name==='NotFoundError'?'Nenhum dispositivo selecionado.':error?.name==='NotSupportedError'?'Este relógio não disponibiliza o serviço de frequência cardíaca compatível.':'Não foi possível conectar: '+(error?.message||'erro desconhecido');setWearableStatus(msg)}}
function disconnectWearable(){try{if(wearableCharacteristic)wearableCharacteristic.removeEventListener('characteristicvaluechanged',handleWearableHeartRate);if(wearableDevice?.gatt?.connected)wearableDevice.gatt.disconnect()}catch(e){}wearableDevice=null;wearableServer=null;wearableCharacteristic=null;wearableHeartRate=null;setWearableStatus('Nenhum sensor conectado')}


// Celebração visual e sonora ao concluir uma atividade.
let finishCelebrationTimer=null;
function celebrateActivityFinish(){
  document.querySelector('.activity-confetti-layer')?.remove();
  const layer=document.createElement('div');layer.className='activity-confetti-layer';
  layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);
  const palette=['#b9ff35','#ffffff','#ffd447','#42d5ff','#fa79a8'];
  for(let i=0;i<100;i++){
    const bit=document.createElement('span');bit.className='activity-confetti';
    bit.style.setProperty('--x',`${Math.random()*100}vw`);
    bit.style.setProperty('--drift',`${(Math.random()-.5)*180}px`);
    bit.style.setProperty('--delay',`${Math.random()*.65}s`);
    bit.style.setProperty('--duration',`${2.3+Math.random()*1.7}s`);
    bit.style.setProperty('--color',palette[i%palette.length]);
    bit.style.setProperty('--rotation',`${Math.random()*1080}deg`);
    layer.appendChild(bit);
  }
  clearTimeout(finishCelebrationTimer);
  finishCelebrationTimer=setTimeout(()=>layer.remove(),4800);
  playActivityFinishSound();
}
function playActivityFinishSound(){
  try{
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx)return;
    const ctx=new AudioCtx();
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    const start=ctx.currentTime+.025;
    [659.25,783.99,987.77,1318.51].forEach((frequency,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(frequency,start+i*.115);
      gain.gain.setValueAtTime(.0001,start+i*.115);
      gain.gain.exponentialRampToValueAtTime(.095,start+i*.115+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,start+i*.115+.34);
      osc.connect(gain);gain.connect(ctx.destination);
      osc.start(start+i*.115);osc.stop(start+i*.115+.36);
    });
    setTimeout(()=>ctx.close().catch(()=>{}),1800);
  }catch(e){console.debug('Som de conclusão indisponível',e)}
}


/* CONFIGURAÇÃO: cole a URL /exec da implantação do Apps Script abaixo */
const APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbxDtLUCKuiDgJ5XIIVf7bKPj4NEp73QkFo-3cy7Smx63w9_OBKk2HAlUQVdGs58yl-ICg/exec';
const SESSION_KEY='uem_session_v1';
const ACCOUNT_CACHE_KEY='uem_account_cache_v1';
let sessionToken=localStorage.getItem(SESSION_KEY)||'';
function friendlyServiceError(message){const m=String(message||'');if(/sessão expirada|sessão inválida|credenciais inválidas|conta indisponível/i.test(m))return 'Sua sessão expirou. Entre novamente na sua conta.';if(/senha|e-mail|email|código|codigo|já cadastrado|não encontrado|incorret|inválid|invalid|obrigatóri|formato|tamanho|grande|permissão/i.test(m)&&!/script|planilha|sheet|servidor|implantação|deploy/i.test(m))return m;return 'Não foi possível concluir agora. Confira sua conexão e tente novamente.'}function api(payload){if(!APPS_SCRIPT_URL.startsWith('https://'))return Promise.reject(Error('Serviço temporariamente indisponível'));return fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow'}).then(async r=>{const t=await r.text();try{return JSON.parse(t)}catch(e){throw Error('Serviço temporariamente indisponível')}}).then(r=>{if(!r.ok){console.warn('Falha de serviço na ação:',payload.action);throw Error(friendlyServiceError(r.error))};return r})}
function publicContent(city,uf){return new Promise((resolve,reject)=>{if(!APPS_SCRIPT_URL.startsWith('https://'))return resolve(null);let cb='uemcb'+Date.now()+Math.floor(Math.random()*10000),s=document.createElement('script');let timer=setTimeout(()=>{cleanup();reject(Error('Tempo esgotado'))},15000);function cleanup(){clearTimeout(timer);delete window[cb];s.remove()}window[cb]=r=>{cleanup();r.ok?resolve(r):reject(Error(r.error))};s.onerror=()=>{cleanup();reject(Error('Não foi possível carregar anúncios'))};s.src=APPS_SCRIPT_URL+'?'+new URLSearchParams({action:'content',cidade:city||'',uf:uf||'',callback:cb});document.head.appendChild(s)})}
function authMessage(m){document.getElementById('authError').textContent=m||''}
function authStep(step){document.querySelectorAll('.auth-step').forEach(x=>x.hidden=x.dataset.step!==step);authMessage('')}
function authOpen(){document.getElementById('authOverlay').hidden=false;authStep('start')}
function authClose(){document.getElementById('authOverlay').hidden=true}
function authBusy(on,message){const el=document.getElementById('authLoading');if(!el)return;el.hidden=!on;document.getElementById('authLoadingText').textContent=message||'Conectando...'}
async function authSubmit(e){e.preventDefault();let f=e.target,action=f.dataset.action,b=f.querySelector('button[type=submit]');b.disabled=true;authMessage('');authBusy(true,action==='login'?'Entrando na sua conta...':action==='register'?'Criando seu perfil...':action==='forgot'?'Enviando seu código...':'Preparando sua experiência...');try{let v=Object.fromEntries(new FormData(f));if(action==='preRegister'){window.pendingRegister={email:v.email,password:v.password};authStep('profile');return}if(action==='register'){let p={...window.pendingRegister,...v,action:'register',cidade:data.localityCity||data.user?.cidade||'',uf:data.localityState||data.user?.uf||''};let r=await api(p);loginDone(r,true)}else if(action==='login'){loginDone(await api({action,...v}),false)}else if(action==='forgot'){let r=await api({action,...v});authStep('reset');authMessage(r.message);document.getElementById('resetEmail').value=v.email}else if(action==='reset'){await api({action,...v});authStep('login');authMessage('Senha redefinida. Entre com a nova senha.')}}catch(err){authMessage(friendlyServiceError(err.message))}finally{b.disabled=false;authBusy(false)}}
function loginDone(r,first){const old=localStorage.getItem('uem_active_user');if(old&&old!==r.user.id){data={name:r.user.usuario,runs:[]};save()}localStorage.setItem('uem_active_user',r.user.id);sessionToken=r.token;localStorage.setItem(SESSION_KEY,sessionToken);localStorage.setItem(ACCOUNT_CACHE_KEY,JSON.stringify(r.user));applyAccount(r.user);authClose();if(first){document.getElementById('welcomeName').textContent=r.user.usuario;document.getElementById('welcomeOverlay').hidden=false}refreshCityContent();syncReminderFromServer().catch(console.warn);syncDailyPerformance().then(loadCommunityRanking).catch(console.warn)}
function applyAccount(u){if(!u||!u.usuario)return;localStorage.setItem(ACCOUNT_CACHE_KEY,JSON.stringify(u));data.name=u.usuario;data.weight=Number(u.peso)||70;data.age=u.idade;data.sex=u.sexo;data.profilePhoto=u.foto||'';data.localityCity=data.localityCity||u.cidade||'';data.localityState=data.localityState||u.uf||'';if(!data.locality&&u.cidade)data.locality=u.cidade;save();render()}
async function checkSession(){
  if(!sessionToken){authOpen();return}
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(ACCOUNT_CACHE_KEY)||'null')}catch(e){}
  if(cached&&cached.usuario){const old=localStorage.getItem('uem_active_user');if(old&&old!==cached.id){data={name:cached.usuario,runs:[]};save()}localStorage.setItem('uem_active_user',cached.id);applyAccount(cached)}
  try{
    const r=await api({action:'me',token:sessionToken});
    applyAccount(r.user);refreshCityContent();
    syncReminderFromServer().catch(console.warn);
    syncDailyPerformance().then(loadCommunityRanking).catch(console.warn);
  }catch(e){
    const message=String(e.message||'');
    const invalid=/sessão expirada|conta indisponível|sessão inválida|credenciais inválidas/i.test(message);
    if(invalid){sessionToken='';localStorage.removeItem(SESSION_KEY);localStorage.removeItem(ACCOUNT_CACHE_KEY);authOpen()}
    else if(!cached){authOpen();authMessage('Não foi possível acessar sua conta agora. Confira sua conexão e tente novamente.')}
    else console.warn('Sem conexão com o servidor. Exibindo perfil salvo neste dispositivo:',message);
  }
}
async function logoutAccount(){if(window.logoutInProgress)return;window.logoutInProgress=true;flashBusy('Saindo da sua conta...');try{if(sessionToken)await api({action:'logout',token:sessionToken})}catch(e){console.warn('Encerrando sessão localmente',e)}finally{sessionToken='';localStorage.removeItem(SESSION_KEY);localStorage.removeItem(ACCOUNT_CACHE_KEY);localStorage.removeItem('uem_active_user');data={name:'Corredor de Uruçuí',runs:[]};save();closeModal();render();flashBusyEnd();window.logoutInProgress=false;authOpen()}}
// Conteúdo publicado pelo painel: recarrega automaticamente sem atualizar a página.
const UF_NOMES={'acre':'AC','alagoas':'AL','amapa':'AP','amazonas':'AM','bahia':'BA','ceara':'CE','distrito federal':'DF','espirito santo':'ES','goias':'GO','maranhao':'MA','mato grosso':'MT','mato grosso do sul':'MS','minas gerais':'MG','para':'PA','paraiba':'PB','parana':'PR','pernambuco':'PE','piaui':'PI','rio de janeiro':'RJ','rio grande do norte':'RN','rio grande do sul':'RS','rondonia':'RO','roraima':'RR','santa catarina':'SC','sao paulo':'SP','sergipe':'SE','tocantins':'TO'};
function ufNormalizada(uf){const v=String(uf||'').trim();if(v.length===2)return v.toUpperCase();const k=v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return UF_NOMES[k]||v}
let atualizandoConteudo=false;
async function refreshCityContent(){
 if(atualizandoConteudo)return;
 atualizandoConteudo=true;
 try{
  const cidade=String(data.localityCity||'').trim();
  const uf=ufNormalizada(data.localityState);
  if(!cidade||!uf){console.info('Aguardando cidade e UF para consultar publicidade');return}
  const c=await publicContent(cidade,uf);
  if(!c)return;
  const banners=Array.isArray(c.banners)?c.banners:[];
  const possuiPosicao=(x,p)=>String(x.posicao||'home').split(',').map(s=>s.trim().toLowerCase()).includes(p);
  const inicio=banners.filter(x=>x.imagem&&possuiPosicao(x,'home')).map(x=>({image:x.imagem,url:x.link||''}));
  const comunidade=banners.filter(x=>x.imagem&&possuiPosicao(x,'ranking')).map(x=>({image:x.imagem,url:x.link||''}));
  const conclusao=banners.filter(x=>x.imagem&&possuiPosicao(x,'finish')).map(x=>({image:x.imagem,url:x.link||''}));
  ads.splice(0,ads.length,...inicio);adindex=0;renderAd();
  leaderboardAds.splice(0,leaderboardAds.length,...comunidade);boardIndex=0;renderLeaderboards();
  finishAds.splice(0,finishAds.length,...conclusao);
  events.splice(0,events.length,...(Array.isArray(c.desafios)?c.desafios:[]).map(x=>({...x,image:x.image||''})));updateChallengeTrackBanner();
  render();
 }catch(e){console.warn('Falha ao atualizar conteúdo:',e.message)}
 finally{atualizandoConteudo=false}
}
// Verifica novidades a cada 15 segundos enquanto a página está aberta.
setInterval(()=>{if(!document.hidden)refreshCityContent()},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshCityContent()});
window.addEventListener('focus',()=>refreshCityContent());
window.addEventListener('load',()=>{document.querySelectorAll('#authOverlay form').forEach(f=>f.addEventListener('submit',authSubmit));checkSession()});

async function syncReminderFromServer(){if(!sessionToken)return;const r=await api({action:'getReminder',token:sessionToken});if(r.reminder){data.reminder={enabled:r.reminder.ativo==='sim',days:String(r.reminder.dias||'').split(',').filter(x=>x!=='').map(Number),time:r.reminder.horario||'07:00'};save();if(document.getElementById('profile').classList.contains('active'))renderReminderSettings()}}

function dailyPerformance(m){const day=fortalezaDay(new Date());const runs=data.runs.filter(r=>r.mode===m&&fortalezaDay(new Date(r.date))===day);return {mode:m,day,km:runs.reduce((v,r)=>v+(Number(r.km)||0),0),seconds:runs.reduce((v,r)=>v+(Number(r.seconds)||0),0),count:runs.length}}
async function syncDailyPerformance(){if(!sessionToken)return;for(const m of ['Corrida','Caminhada','Ciclismo']){const p=dailyPerformance(m);if(p.count)await api({action:'updatePerformance',token:sessionToken,performance:p})}}

// Ranking público da cidade: pódio dos três primeiros e lista dos dez melhores.
renderRanking=function(){
 const node=$('rankinglist'),pod=$('podium');if(!node||!pod)return;
 document.querySelectorAll('#rankingModes button').forEach(b=>b.classList.toggle('on',b.textContent.trim()===rankingMode));
 if(communityLoading){pod.innerHTML='';node.innerHTML='<div class="ranking-empty">Carregando ranking...</div>';return}
 if(communityError){pod.innerHTML='';node.innerHTML='<div class="ranking-empty">'+escapeHtml(communityError)+'</div>';return}
 const list=communityRanking||[],fmt=n=>Number(n||0).toFixed(2).replace('.',',');
 if(!list.length){pod.innerHTML='';node.innerHTML='<div class="ranking-empty"><strong>Nenhuma atividade registrada hoje.</strong><p>Comece uma atividade para aparecer no ranking da sua cidade!</p></div>';return}
 pod.innerHTML=[1,0,2].map(i=>{const u=list[i];return `<div data-me="${u&&u.eu?'true':'false'}" class="podium-place ${i===0?'first':i===1?'second':'third'}"><div class="podium-avatar">${u?photoAvatarHtml(u.eu?(profilePhotoPreviewUrl||data.profilePhoto||u.foto):u.foto):'<i data-lucide="user-round"></i>'}</div><strong>${i+1}º</strong><small>${u?escapeHtml(u.usuario):'—'}</small><div class="podium-step">${u?fmt(u.km)+' km':'—'}</div>${u&&Number(u.km)===0?`<small>${formatTime(u.segundos||0)}</small>`:''}</div>`}).join('');
 node.innerHTML=`<p class="ranking-city">TOP 10 • ${escapeHtml(data.localityCity||'Sua cidade')} • ${escapeHtml(rankingMode)} • Hoje</p>`+list.slice(0,10).map((u,i)=>`<div class="ranking-row community-row" data-me="${u.eu?'true':'false'}"><span class="rank-number">${i+1}</span><div class="ranking-user-avatar">${photoAvatarHtml(u.eu?(profilePhotoPreviewUrl||data.profilePhoto||u.foto):u.foto)}</div><div style="flex:1;min-width:0"><strong>${escapeHtml(u.usuario)}${u.eu?' (você)':''}</strong><div class="small">${u.atividades} ${u.atividades===1?'atividade':'atividades'} • ${formatTime(u.segundos||0)} de atividade</div></div><strong>${fmt(u.km)} km</strong></div>`).join('');
 refreshIcons();
};

// Inicialização segura: evita acesso a variáveis let antes da declaração.
try { render(); updateLocality(); refreshCityContent(); refreshIcons(); } catch (e) { console.error("Falha ao inicializar URUMOVE", e);document.body.insertAdjacentHTML("afterbegin", "<div style=\"position:fixed;top:0;left:0;right:0;z-index:99999;background:#3b1919;color:white;padding:12px;font:14px Arial\">Falha ao iniciar o aplicativo. Atualize a página. Detalhes: "+String(e.message).replace(/[<>]/g,"")+"</div>"); }

// Foto de perfil: upload para o Drive via conta autenticada; imagem persistente na planilha.
function chooseProfilePhoto(){const el=document.getElementById('profilePhotoInput');if(el)el.click()}

function photoAvatarHtml(url,alt='Foto do perfil'){return url&&(/^(https:\/\/|blob:)/.test(url))?'<img src="'+escapeHtml(url)+'" alt="'+escapeHtml(alt)+'" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;border-radius:50%">':'<i data-lucide="person-standing"></i>'}
function renderProfilePhoto(){const photo=profilePhotoPreviewUrl||String(data.profilePhoto||'');const avatar=document.getElementById('profilePhotoAvatar');if(avatar)avatar.innerHTML=photoAvatarHtml(photo,'Sua foto de perfil');const home=document.querySelector('#home .top .avatar');if(home)home.innerHTML=photoAvatarHtml(photo,'Foto do perfil');document.querySelectorAll('.community-row[data-me="true"] .ranking-user-avatar, .podium-place[data-me="true"] .podium-avatar').forEach(el=>el.innerHTML=photoAvatarHtml(photo));if(window.lucide)lucide.createIcons()}
// Reduz fotos grandes de celulares antes de enviá-las ao Apps Script.
// Safari/iPhone pode entregar HEIC, JPEG de muitos MB ou PNG com metadados.
async function prepareMobileProfilePhoto(file){
 const source=URL.createObjectURL(file);
 try{
  let image,dispose=()=>{};
  if(typeof createImageBitmap==='function'){
   try{image=await createImageBitmap(file,{imageOrientation:'from-image'});dispose=()=>image.close?.()}catch(e){}
  }
  if(!image){image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Este formato não pôde ser aberto pelo navegador. No iPhone, escolha uma foto JPG ou PNG, ou exporte a imagem como JPEG.'));img.src=source})}
  try{
   const iw=image.width||image.naturalWidth,ih=image.height||image.naturalHeight;
   if(!iw||!ih)throw Error('A foto não possui dimensões válidas.');
   const maxSide=900,scale=Math.min(1,maxSide/Math.max(iw,ih));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(iw*scale));canvas.height=Math.max(1,Math.round(ih*scale));
   const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Não foi possível preparar a foto neste navegador.');
   ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
   let blob=null;
   for(const quality of [.82,.7,.56,.42]){
    blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
    if(blob&&blob.size<=850000)break;
   }
   if(!blob||!blob.size)throw Error('Não foi possível converter a foto em JPG.');
   if(blob.size>2*1024*1024)throw Error('Foto ainda muito grande após a compressão.');
   return blob;
  }finally{dispose()}
 }finally{URL.revokeObjectURL(source)}
}
function profilePhotoStatus(message){
 let el=document.getElementById('profilePhotoUploadStatus');
 if(!el){const anchor=document.querySelector('#profile .profile-photo-hint');if(!anchor)return;el=document.createElement('p');el.id='profilePhotoUploadStatus';el.setAttribute('role','status');el.style.cssText='font-size:12px;line-height:1.4;margin:8px auto;max-width:290px;color:#b6f43c';anchor.insertAdjacentElement('afterend',el)}
 el.textContent=message;
}
async function uploadProfilePhoto(input){
 const file=input.files&&input.files[0];if(!file)return;
 const oldPhoto=data.profilePhoto||'';
 let preview='';
 try{
  if(!sessionToken)throw Error('Entre na sua conta para salvar a foto.');
  if(file.size>35*1024*1024)throw Error('A imagem é muito grande. Escolha uma foto de até 35 MB.');
  preview=URL.createObjectURL(file);profilePhotoPreviewUrl=preview;renderProfilePhoto();
  profilePhotoStatus('Preparando foto para envio...');
  const jpeg=await prepareMobileProfilePhoto(file);
  const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Não foi possível ler a foto preparada.'));reader.readAsDataURL(jpeg)});
  profilePhotoStatus('Salvando sua foto na conta...');
  const result=await api({action:'uploadProfilePhoto',token:sessionToken,mimeType:'image/jpeg',base64});
  if(!result.foto)throw Error('Não foi possível confirmar a foto. Tente novamente.');
  data.profilePhoto=result.foto;save();
  let cached={};try{cached=JSON.parse(localStorage.getItem(ACCOUNT_CACHE_KEY)||'{}')}catch(e){}
  cached.foto=result.foto;try{localStorage.setItem(ACCOUNT_CACHE_KEY,JSON.stringify(cached))}catch(e){console.warn('Cache de foto:',e)}
  profilePhotoPreviewUrl='';renderProfilePhoto();
  if(Array.isArray(communityRanking)){communityRanking.forEach(u=>{if(u.eu)u.foto=result.foto});renderRanking()}
  profilePhotoStatus('Foto salva com sucesso!');
 }catch(e){
  profilePhotoPreviewUrl='';data.profilePhoto=oldPhoto;renderProfilePhoto();
  profilePhotoStatus('Falha ao salvar: '+e.message);
  alert('Não foi possível salvar sua foto agora. Tente novamente.');
 }finally{input.value='';if(preview)setTimeout(()=>URL.revokeObjectURL(preview),1500)}
}

// Atualiza a evolução semanal sempre que os dados são redesenhados.
const renderBeforeWeekly=render;render=function(){renderBeforeWeekly();renderWeeklyChallenges()};

// FLASHES — comunidade (24h) e anúncios com validade administrativa.
let flashCommunity=[],flashSponsored=[],flashMy=[],flashCurrent=[],flashIndex=0,flashFeed='',flashTouchStart=0,flashTouchY=0;
const flashShuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const FLASH_COVER_COMMUNITY='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRur3h3OyQJvHy7UShYLSx8vf4Ax5F9NWRoZzPLr2WK1WmKXutBzYlIses&s=10';
const FLASH_COVER_SPONSORED='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGtZJBZokKYM9pBwowg1g8DIeUkKw-ReU0O7qLfTbkCFnONBxO2SEJUKXc&s=10';
const FLASH_DEFAULT_PHOTO='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRur3h3OyQJvHy7UShYLSx8vf4Ax5F9NWRoZzPLr2WK1WmKXutBzYlIses&s=10';
function flashSetCards(){for(const [id,arr] of [['flashCommunity',flashCommunity],['flashSponsored',flashSponsored]]){const el=document.getElementById(id);if(!el)continue;el.classList.toggle('has-flashes',!!arr.length);const thumb=el.querySelector('.flash-thumb');const cover=arr.length?arr[0].imagem:id==='flashCommunity'?FLASH_DEFAULT_PHOTO:FLASH_COVER_SPONSORED;if(!thumb.querySelector('img')){thumb.innerHTML='<img alt="Capa dos Flashes" src="'+(id==='flashCommunity'?FLASH_COVER_COMMUNITY:FLASH_COVER_SPONSORED)+'">'}const img=thumb.querySelector('img');if(cover&&img.dataset.target!==cover){img.dataset.target=cover;const preload=new Image();preload.onload=()=>{if(img.dataset.target===cover)img.src=cover};preload.onerror=()=>{if(img.dataset.target===cover)img.src=id==='flashCommunity'?FLASH_COVER_COMMUNITY:FLASH_COVER_SPONSORED};preload.src=cover}}}

function flashNotice(message,error=false){let box=document.getElementById('flashActionNotice');if(!box){box=document.createElement('div');box.id='flashActionNotice';box.className='flash-action-notice';box.setAttribute('role','status');document.body.appendChild(box)}box.textContent=message;box.classList.toggle('is-error',error);box.hidden=false;clearTimeout(flashNotice.timer);flashNotice.timer=setTimeout(()=>box.hidden=true,3800)}
function flashBusy(message){let box=document.getElementById('flashActionBusy');if(!box){box=document.createElement('div');box.id='flashActionBusy';box.className='flash-action-busy';box.innerHTML='<div class="flash-action-busy-card"><span class="flash-spinner"></span><strong id="flashBusyText"></strong><small>Aguarde um instante...</small></div>';document.body.appendChild(box)}document.getElementById('flashBusyText').textContent=message;box.hidden=false}
function flashBusyEnd(){const box=document.getElementById('flashActionBusy');if(box)box.hidden=true}
let flashLoadError='';
let flashRefreshPending=null;
async function flashRefresh(){
 if(flashRefreshPending)return flashRefreshPending;
 flashRefreshPending=(async()=>{try{
  const r=await publicFlashContent();
  if(!r||!Array.isArray(r.patrocinados))throw Error('O servidor não retornou a lista de anúncios. Atualize a implantação do Apps Script.');
  flashCommunity=flashShuffle(r.comunidade||[]);
  flashSponsored=flashShuffle(r.patrocinados||[]);
  flashLoadError='';
  flashSetCards();
 }catch(e){flashLoadError=e.message||'Falha de comunicação';console.warn('Erro ao consultar Flashes:',e);flashSetCards();}})();
 try{return await flashRefreshPending}finally{flashRefreshPending=null}
}
function publicFlashContent(){return new Promise((resolve,reject)=>{
 const cb='flashcb'+Date.now()+Math.floor(Math.random()*10000),sc=document.createElement('script');
 const timer=setTimeout(()=>{done();reject(Error('Tempo esgotado ao consultar anúncios.'))},18000);
 function done(){clearTimeout(timer);delete window[cb];sc.remove()}
 window[cb]=r=>{done();r&&r.ok?resolve(r):reject(Error(r?.error||'Resposta inválida do Apps Script'))};
 sc.onerror=()=>{done();reject(Error('Não foi possível acessar o Apps Script. Confira a implantação pública.'))};
 // Anúncios são globais: a região não pode ocultar publicações feitas pelo administrador.
 sc.src=APPS_SCRIPT_URL+'?'+new URLSearchParams({action:'flashContent',cidade:data.localityCity||data.user?.cidade||'',uf:data.localityState||data.user?.uf||'',callback:cb,_:Date.now()});
 document.head.appendChild(sc)
})}
function chooseFlashPhoto(){if(!sessionToken){alert('Entre na sua conta para publicar.');return}document.getElementById('flashPhotoInput').click()}
async function publishFlashPhoto(el){const f=el.files?.[0];if(!f)return;try{if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>3*1024*1024)throw Error('Use JPG, PNG ou WEBP com até 3 MB.');if(!confirm('Publicar esta foto para a comunidade por 24 horas?'))return;flashBusy('Publicando seu Flash...');const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('Não foi possível ler a foto'));r.readAsDataURL(f)});await api({action:'flashPublish',token:sessionToken,mimeType:f.type,base64});await Promise.allSettled([flashRefresh(),loadMyFlashes()]);flashNotice('Flash publicado com sucesso! Disponível por 24 horas.')}catch(e){flashNotice('Não foi possível publicar: '+e.message,true)}finally{flashBusyEnd();el.value=''}}
async function loadMyFlashes(){if(!sessionToken)return;try{const r=await api({action:'flashMine',token:sessionToken});flashMy=r.flashes||[]}catch(e){console.warn(e)}}
async function openFlashFeed(kind){flashFeed=kind;const overlay=document.getElementById('flashOverlay');overlay.hidden=false;document.getElementById('flashHeader').textContent=kind==='mine'?'Meus Flashes':kind==='sponsored'?'Pra você':'Flashes da comunidade';document.getElementById('flashCounter').textContent='Carregando';document.getElementById('flashStage').innerHTML='<div class="flash-loading" role="status"><span class="flash-spinner"></span><strong>Abrindo Flashes...</strong><small>Preparando suas imagens</small></div>';try{if(kind==='mine')await loadMyFlashes();else await flashRefresh();flashCurrent=kind==='mine'?[...flashMy]:kind==='sponsored'?flashShuffle(flashSponsored):flashShuffle(flashCommunity);flashIndex=0;if(overlay.hidden)return;flashDraw()}catch(e){document.getElementById('flashCounter').textContent='';document.getElementById('flashStage').innerHTML='<div class="flash-empty"><h3>Não foi possível carregar</h3><p>Verifique sua conexão e tente novamente.</p><button onclick="openFlashFeed(\''+kind+'\')">Tentar novamente</button></div>'}}
function closeFlashFeed(){document.getElementById('flashOverlay').hidden=true;flashCurrent=[]}
function flashMove(delta){if(!flashCurrent.length)return;flashIndex=(flashIndex+delta+flashCurrent.length)%flashCurrent.length;flashDraw()}
function flashDraw(){const stage=document.getElementById('flashStage'),count=document.getElementById('flashCounter');if(!flashCurrent.length){count.textContent='';if(flashLoadError&&flashFeed!=='mine'){stage.innerHTML='<div class="flash-empty"><h3>Não foi possível consultar os Flashes</h3><p>'+escapeHtml(flashLoadError)+'</p><button onclick="openFlashFeed(\''+flashFeed+'\')">Tentar novamente</button></div>';return}stage.innerHTML='<div class="flash-empty"><i data-lucide="image-off"></i><h3>Ops, sem flashes disponíveis</h3><p>'+ (flashFeed==='sponsored'?'Nenhuma novidade por aqui no momento.':'Seja o primeiro a compartilhar uma foto!') +'</p>'+ (flashFeed==='sponsored'?'':'<button onclick="closeFlashFeed();chooseFlashPhoto()">Publicar meu Flash</button>') +'</div>';refreshIcons();return}const f=flashCurrent[flashIndex],mine=flashFeed==='mine',paid=flashFeed==='sponsored';count.textContent=(flashIndex+1)+' de '+flashCurrent.length;const action=paid&&f.link?'<a href="'+escapeHtml(f.link)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(f.botao||'Fale conosco')+' ↗</a>':mine?'<button onclick="flashDelete(flashCurrent[flashIndex].id)">Excluir</button>':'';stage.innerHTML='<div class="flash-image-loading" role="status"><span class="flash-spinner"></span><small>Carregando imagem...</small></div><img alt="Foto de Flash" onload="this.previousElementSibling.remove()" onerror="this.previousElementSibling.innerHTML=\'Imagem indisponível\'" src="'+escapeHtml(f.imagem)+'"><div class="flash-info"><div><strong>'+escapeHtml(f.nome||'Atleta')+'</strong><small>'+(mine?Number(f.visualizacoes||0)+' visualizações':paid?'Publicidade':'Foto da comunidade')+'</small></div>'+action+'</div>';refreshIcons();if(!mine&&!paid&&sessionToken)api({action:'flashView',token:sessionToken,id:f.id}).catch(()=>{})}
async function flashDelete(id){if(!confirm('Excluir este Flash?'))return;flashBusy('Excluindo seu Flash...');try{await api({action:'flashDelete',token:sessionToken,id});await loadMyFlashes();flashCurrent=[...flashMy];flashIndex=Math.min(flashIndex,Math.max(0,flashCurrent.length-1));flashDraw();await flashRefresh();flashNotice('Flash excluído com sucesso!')}catch(e){flashNotice('Não foi possível excluir: '+e.message,true)}finally{flashBusyEnd()}}
const oldFlashScreen=showScreen;showScreen=function(id){oldFlashScreen(id);if(id==='home')flashRefresh();const oldProfileFlash=document.getElementById('myFlashesProfile');if(oldProfileFlash)oldProfileFlash.remove()};
document.getElementById('flashStage').addEventListener('touchstart',e=>{flashTouchStart=e.touches[0].clientX;flashTouchY=e.touches[0].clientY},{passive:true});document.getElementById('flashStage').addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-flashTouchStart;if(Math.abs(d)>45)flashMove(d<0?1:-1);else if(flashFeed==='sponsored'&&flashTouchY-e.changedTouches[0].clientY>65){const url=flashCurrent[flashIndex]?.link;if(url&&/^https:\/\//.test(url))window.open(url,'_blank','noopener,noreferrer')}},{passive:true});
setTimeout(flashRefresh,1200);

// Navegação por toque/clique: metade esquerda volta, metade direita avança.
(function(){
 const stage=document.getElementById('flashStage');
 if(!stage)return;
 let startX=0,startY=0,suppressUntil=0;
 stage.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY},{passive:true});
 stage.addEventListener('pointerup',e=>{if(Math.abs(e.clientX-startX)>30||Math.abs(e.clientY-startY)>30)suppressUntil=Date.now()+500},{passive:true});
 stage.addEventListener('click',e=>{
  if(Date.now()<suppressUntil||!flashCurrent.length)return;
  if(e.target.closest('a,button,.flash-info,.flash-empty,.flash-loading,.flash-image-loading'))return;
  const rect=stage.getBoundingClientRect();
  flashMove(e.clientX-rect.left<rect.width/2?-1:1);
 });
})();

// Incentivos ocasionais: no máximo uma mensagem a cada três dias por dispositivo.
(function(){
 const messages=[
  ['Cada passo conta!','Seu ritmo de hoje constrói a conquista de amanhã.'],
  ['Você já começou bem!','Um pouquinho de movimento faz diferença.'],
  ['O importante é continuar.','Caminhe, corra ou pedale no seu próprio ritmo.'],
  ['Seu próximo desafio espera por você!','Transforme alguns minutos em uma nova conquista.'],
  ['Movimente seu dia!','A melhor meta é aquela que faz você seguir em frente.']
 ];
 function maybeShow(){
  if(!sessionToken||document.hidden||document.getElementById('authOverlay')?.hidden===false||running||starting||document.getElementById('flashOverlay')?.hidden===false||document.getElementById('modal')?.classList.contains('show'))return;
  const key='corresul_last_motivation',last=Number(localStorage.getItem(key)||0);
  if(Date.now()-last<3*86400000||Math.random()>.45)return;
  localStorage.setItem(key,String(Date.now()));
  const [heading,body]=messages[Math.floor(Math.random()*messages.length)];
  openModal('<div class="motivation-modal"><button class="motivation-close" aria-label="Fechar mensagem" onclick="closeModal()"><i data-lucide="x"></i></button><div class="motivation-mark"><i data-lucide="zap"></i></div><small>UMA DOSE DE MOTIVAÇÃO</small><h2>'+heading+'</h2><p>'+body+'</p><button class="bigbtn" onclick="closeModal()">Vamos nessa!</button></div>');
  refreshIcons();
 }
 setTimeout(maybeShow,5000);
})();
