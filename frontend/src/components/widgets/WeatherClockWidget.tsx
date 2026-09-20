import react, { useState, useEffect } from 'react';
import '../../assets/styles/ClockWeather.css';
import type { WeatherData } from '../../types/dashboard.ts';

export const WeatherClockWidget = () => {
    const [time, setTeime] = useState(new Date());
    const [weather, setWeather] = useState<WeatherData | null>(null);


    useEffect(() => {
        const timer = setInterval(() => setTeime(new Date()), 1000);
        return () => clearInterval(timer); // 위젯 삭제 시 메모리 누수 방지
    }, []);

    useEffect(() => {
        const fetchWeatherData = async (lat : number, lon : number) => {
            const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
            // const CITY = 'Seoul';
            // const URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=kr`;
            //openweathermap 연동
            const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;


            try{
                // setLoading(true);
                const response = await fetch(URL);
                if(!response.ok){
                    throw new Error('날씨 정보를 가져오는데 실패했습니다.');
                }

                const data = await response.json();

                const iconCode = data.weather[0].icon;
                let emojiIcon = '☀️';
                if(iconCode === '02' || iconCode === '03' || iconCode === '04') emojiIcon  = '☁️';
                else if(iconCode.startsWith('09') || iconCode.startsWith('10')) emojiIcon = '🌧️' ;
                else if(iconCode.startsWith('11')) emojiIcon = '⛈️';
                else if(iconCode.startsWith('13')) emojiIcon = '❄️';
                else if(iconCode.startsWith('50')) emojiIcon = '🌫️' ;

                setWeather({
                    temp : Math.round(data.main.temp),
                    condition : data.weather[0].description,
                    icon : emojiIcon,
                    city : data.name,
                    humidity : data.main.humidity + '%'
                });
            }
            catch(error){
                console.error(error);
            }finally{
                // setLoading(false);
            }
        }
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                (position)=>{
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(latitude, longitude);
                }
            )
        }else{
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    const timeString = time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const dateString = time.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });

    return(
        <div className = 'clock-weather-widget-container'>
            <div className='weather-widget-container'>
                {weather ? (
                    <>
            <div className = 'weather-widget-icon'>{weather?.icon}</div>
            <div className = 'weather-widget-info'>
                <div className = 'weather-widget-temp'>{weather?.temp}°C</div>      
                <div className = 'weather-widget-condition'>{weather?.condition}</div>      
                <div className = 'weather-widget-city'>{weather?.city}</div>
            </div></>
        ) : (
            <div>날씨 정보를 불러오는 중...</div>
        )   }
            </div>
            <div className = 'clock-widget-container'>
                <div className='clock-widget-date'>{dateString}</div>
                <div className='clock-widget-time'>{timeString}</div>
            </div>
        </div>

    )

}