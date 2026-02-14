
import { GoogleGenAI } from "@google/genai";
import { WeatherInfo } from "../types";

export const fetchRealtimeWeather = async (): Promise<WeatherInfo | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "네이버 날씨 정보를 참고해서 현재 경기도 가평군 남이섬의 기온, 날씨 상태(맑음, 흐림 등), 풍속(m/s), 습도를 JSON 형식으로 알려줘. JSON 키는 temp, condition, windSpeed, humidity로 해줘.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI 응답 데이터가 없습니다.");
    }
    
    const data = JSON.parse(jsonText);
    
    // 출처 URL 추출
    const sourceUrl = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri || "https://search.naver.com/search.naver?query=가평날씨";

    return {
      temp: data.temp || "20°C",
      condition: data.condition || "정보 없음",
      windSpeed: data.windSpeed || "0m/s",
      humidity: data.humidity || "50%",
      sourceUrl: sourceUrl,
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
};
