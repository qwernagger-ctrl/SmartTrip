async function init() {
  const pos = await new Promise(r=>navigator.geolocation.getCurrentPosition(r,()=>r(null)));
  const data = await fetch('places.json').then(r=>r.json());
  const userLat = pos?.coords.latitude, userLon = pos?.coords.longitude;
  const favs = JSON.parse(localStorage.getItem('fav')||'[]');
  const container = document.getElementById('places'); container.innerHTML='';
  data.forEach(p=>{
    const d = userLat? Math.hypot(p.lat-userLat,p.lon-userLon).toFixed(2)+' km':'-';
    const star = favs.includes(p.id)?'★':'☆';
    const card = `<div class="card">
      <img src="${p.image}" alt="${p.name}">
      <h3>${star} ${p.name}</h3>
      <p>${p.description}</p>
      <p>Расстояние: ${d}</p>
      <button onclick="fav('${p.id}',this)">В избранное</button>
      <button onclick="showMap(${p.lat},${p.lon})">Открыть детали</button>
      <button onclick="location.reload()">Обновить</button>
    </div>`;
    container.insertAdjacentHTML('beforeend',card);
  });
  if(userLat) fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userLat}&longitude=${userLon}&current_weather=true`)
    .then(r=>r.json()).then(w=>document.getElementById('weather').textContent=w.current_weather.temperature+'°C');
}

function fav(id,btn){
  let f = JSON.parse(localStorage.getItem('fav')||'[]');
  if(!f.includes(id)){
    f.push(id);
    localStorage.setItem('fav',JSON.stringify(f));
    btn.parentElement.querySelector('h3').innerHTML='★ '+btn.parentElement.querySelector('h3').textContent.replace(/^☆\s*/,'');
    showPopup('Добавлено В Избранное');
  }
}

function showPopup(text){
  const popup = document.createElement('div');
  popup.id='popup'; popup.style=`position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
    background:#fff;border:2px solid #4CAF50;padding:20px;z-index:1000;text-align:center;`;
  popup.innerHTML=`<p>${text}</p><button onclick="this.parentElement.remove()">ОК</button>`;
  document.body.appendChild(popup);
}

function showMap(lat,lon){
  const mapContainer = document.getElementById('map');
  mapContainer.innerHTML = `<iframe width="100%" height="300" frameborder="0"
    src="https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed"></iframe>`;
}

function detail(id){history.pushState({id},'',`#${id}`);}
window.addEventListener('popstate',e=>{if(!e.state)init();});
init();
