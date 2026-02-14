
import { GoogleGenAI } from "@google/genai";
import { WeatherInfo } from "../types";

export const fetchRealtimeWeather = async (): Promise<WeatherInfo | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "네이버 날씨 정보를 참고해서 현재 경기도 가평군 남이섬의 기온(예: 15°C), 날씨 상태(맑음, 흐림 등), 풍속(m/s), 습도를 JSON 형식으로만 알려줘. 다른 설명은 하지 말고 JSON 데이터만 반환해줘. JSON 키는 temp, condition, windSpeed, humidity로 해줘.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    let jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI 응답 데이터가 없습니다.");
    }
    
    // Markdown 코드 블록 제거 (혹시 포함될 경우를 대비)
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(jsonText);
    
    // 사용자의 요청에 따라 출처를 무조건 네이버로 설정
    const sourceUrl = "https://www.naver.com";

    return {
      temp: data.temp || "정보 없음",
      condition: data.condition || "정보 없음",
      windSpeed: data.windSpeed || "정보 없음",
      humidity: data.humidity || "정보 없음",
      sourceUrl: sourceUrl,
      lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
};
