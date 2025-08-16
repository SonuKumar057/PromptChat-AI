import "dotenv/config";

const getGeminiAPIResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: message
                        }
                    ]
                }
            ]
        })
    };

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", 
            options
        );

        const data = await response.json();

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return reply || "⚠️ Gemini did not return a valid response.";
    } catch (err) {
        console.log("Error in Gemini API:", err);
        return "❌ Failed to connect to Gemini API.";
    }
};

export default getGeminiAPIResponse;