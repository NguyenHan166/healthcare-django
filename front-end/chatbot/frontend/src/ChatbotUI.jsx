// Updated ChatbotUI.jsx to display full prediction info
import { useState } from 'react';

export default function ChatbotUI() {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Chào bạn! Hãy nhập triệu chứng bạn đang gặp phải.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages([...messages, userMessage]);
        setInput('');

        try {
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptom: input })
            });
            const data = await response.json();

            let botText = `Dựa trên triệu chứng bạn cung cấp, tôi dự đoán bạn có thể đang mắc: ${data.disease}\n`;
            if (data.description) botText += `\n🩺 Mô tả: ${data.description}\n`;
            if (data.precautions) botText += `\n🛡 Biện pháp: ${data.precautions.join(', ')}\n`;
            if (data.severity_alert) botText += `\n⚠️ Cảnh báo: ${data.severity_alert}`;

            const botResponse = { sender: 'bot', text: botText };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            const botResponse = {
                sender: 'bot',
                text: 'Đã xảy ra lỗi khi kết nối tới hệ thống. Vui lòng thử lại sau.'
            };
            setMessages((prev) => [...prev, botResponse]);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'Segoe UI' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Chatbot Dự đoán Bệnh</h1>
            <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', backgroundColor: '#fff', borderRadius: '8px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ color: msg.sender === 'bot' ? '#1d72b8' : '#333', marginBottom: '10px', whiteSpace: 'pre-line' }}>
                        <strong>{msg.sender === 'bot' ? 'Bot' : 'Bạn'}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', marginTop: '16px', gap: '8px' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập triệu chứng của bạn..."
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
                <button onClick={handleSend} style={{ padding: '8px 16px', backgroundColor: '#1d72b8', color: 'white', borderRadius: '6px', border: 'none' }}>
                    Gửi
                </button>
            </div>
        </div>
    );
}
