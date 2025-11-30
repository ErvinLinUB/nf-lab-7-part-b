const btn = document.querySelector('.runCodeBtn');
const locSection = document.querySelector('.s2');
const weatherSection = document.querySelector('.s3');
const ispSection = document.querySelector('.s4');

btn.addEventListener('click', startSequence);

async function startSequence() {
    btn.style.pointerEvents = 'none';
    btn.textContent = 'Processing...';
    locSection.innerHTML = '<h2>You are from:</h2><p>Locating...</p>';
    weatherSection.innerHTML = '<h2>The weather there is:</h2><p>Checking forecast...</p>';
    ispSection.innerHTML = '<h2>Your Internet Service Provider is:</h2><p>Identifying ISP...</p>';

    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (!ipRes.ok) throw new Error('IP Fetch Failed');
        const { ip } = await ipRes.json();

        const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!locRes.ok) throw new Error('Location Fetch Failed');
        const locData = await locRes.json();

        locSection.innerHTML = `<h2>You are from:</h2><p>${locData.city || 'Unknown'}, ${locData.country_name || 'Unknown'}</p>`;
        ispSection.innerHTML = `<h2>Your Internet Service Provider is:</h2><p>${locData.org || 'Unknown'}</p>`;

        try {
            const wttrRes = await fetch(`https://wttr.in/${ip}?format=j1`);
            if (wttrRes.ok) {
                const wttrData = await wttrRes.json();
                const cc = wttrData.current_condition && wttrData.current_condition[0];
                if (cc) {
                    weatherSection.innerHTML = `<h2>The weather there is:</h2><p>${cc.weatherDesc?.[0]?.value || 'Unknown'} • ${cc.temp_C}°C</p>`;
                }
            }
        } catch(e) {}

        const lat = locData.latitude || locData.lat;
        const lon = locData.longitude || locData.lon;
        if (!lat || !lon) throw new Error('Missing coordinates');

        const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (!meteoRes.ok) throw new Error('Weather Fetch Failed');
        const meteoData = await meteoRes.json();
        const cw = meteoData.current_weather;
        const code = cw.weathercode;
        const desc = getWeatherDescription(code);
        const temp = cw.temperature;
        weatherSection.innerHTML = `<h2>The weather there is:</h2><p>${desc} • ${temp}°C</p>`;

        btn.textContent = 'Code Ran Successfully';
        btn.style.backgroundColor = '#94e2d5';
        btn.style.pointerEvents = 'none';
        btn.setAttribute('aria-disabled', 'true');
    } catch (err) {
        console.error(err);
        btn.textContent = 'Retry';
        btn.style.pointerEvents = '';
        btn.removeAttribute('aria-disabled');
    }
}

function getWeatherDescription(code) {
    const c = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return c[code] || 'Unknown conditions';
}