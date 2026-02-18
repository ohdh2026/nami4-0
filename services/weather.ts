
import { WeatherInfo } from "../types";

export const fetchRealtimeWeather = async (): Promise<WeatherInfo | null> => {
  try {
    const res = await fetch('/api/weather');
    if (!res.ok) throw new Error("Failed to fetch weather from server");
    
    const data = await res.json();
    
    return {
      ...data,
      sourceUrl: "https://www.naver.com",
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("기상 정보 갱신 실패:", error);
    return { 
      temp: "15°C",
      condition: "정보 업데이트 중",
      windSpeed: "2m/s",
      humidity: "45%",
      sourceUrl: "https://www.naver.com",
      lastUpdated: "데이터 갱신 오류" 
    };
  }
};
