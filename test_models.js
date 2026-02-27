import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI("AIzaSyDIixTwTOc8f83mwqaAGGRuMgIkqiNZayk");

async function run() {
    try {
        console.log("Fetching models...");
        const models = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Wait, to list models:
        // Actually, in the current SDK it might be `ai.getModels()`? Wait, let's use global fetch.
    } catch (e) {
        console.error(e);
    }
}
run();
