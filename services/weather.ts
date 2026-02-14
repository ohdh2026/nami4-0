
import { GoogleGenAI } from "@google/genai";
import { WeatherInfo } from "../types";

export const fetchRealtimeWeather = async (): Promise<WeatherInfo | null> => {
  const fallbackData: WeatherInfo = {
    temp: "15°C",
    condition: "맑음 (기본값)",
    windSpeed: "2m/s",
    humidity: "45%",
    sourceUrl: "https://www.naver.com",
    lastUpdated: "데이터 확인 불가"
  };

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key가 설정되지 않았습니다. 기본 데이터를 표시합니다.");
      return { ...fallbackData, lastUpdated: "API_KEY 미설정" };
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "현재 경기도 가평군 남이섬의 실시간 날씨 정보를 알려줘. 반드시 temp(기온), condition(날씨상태), windSpeed(풍속 m/s), humidity(습도 %) 키를 가진 JSON 형식으로만 응답해. 예: {\"temp\": \"18°C\", \"condition\": \"맑음\", \"windSpeed\": \"3m/s\", \"humidity\": \"55%\"}",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("AI 응답이 비어있습니다.");
    
    // Markdown 제거 및 정제
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonText);
    
    return {
      temp: data.temp || "15°C",
      condition: data.condition || "맑음",
      windSpeed: data.windSpeed || "0m/s",
      humidity: data.humidity || "50%",
      sourceUrl: "https://www.naver.com",
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    // 에러 발생 시 로딩 중 상태로 두지 않고 기본 데이터를 반환하여 화면을 채움
    return { 
      ...fallbackData, 
      lastUpdated: "연결 오류 (재시도 중)" 
    };
  }
};
