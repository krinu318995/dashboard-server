import { useRef, useState, useEffect } from "react";
import  '../../assets/styles/ClockWeather.css';
export const ClockWidgets = () =>{
    const [time, setTime] = useState(new Date());

    useEffect(()=>{
        const timer = setInterval(()=> setTime(new Date()), 1000);
        return ()=> clearInterval(timer); //위젯 삭제 시 메모리 누수 방지
    },[])

    const timeString = time.toLocaleTimeString('ko-KR', {
        hour : '2-digit',
        minute : '2-digit',
        second : '2-digit'
    });

    const dateString = time.toLocaleDateString('ko-KR', {
        year : 'numeric',
        month:'long',
        day : 'numeric',
        weekday : 'short'
    });
    
    return (
        <div className = 'clock-widget-container'>
        <div className = 'clock-widget-date'>{dateString}</div>
        <div className = 'clock-widget-time'>{timeString}   </div>
        </div>
    )
}