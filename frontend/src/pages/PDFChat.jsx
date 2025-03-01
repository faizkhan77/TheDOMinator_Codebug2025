import React, { useState } from "react";
import axios from "axios";

const PDFChat = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await axios.post("http://127.0.0.1:8000/api/chat/", { question });
        setAnswer(response.data.answer);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." />
                <button type="submit">Ask</button>
            </form>
            {answer && <p><strong>Answer:</strong> {answer}</p>}
        </div>
    );
};

export default PDFChat;
