import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import config from '../../config';
import './Chatbot.css';

const Chatbot = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const API_KEY = config.GEMINI_API_KEY;

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ 
                text: t('chatbot.welcomeMessage'),
                sender: 'bot'
            }]);
        }
    }, [isOpen, t]);
    
    // Configuration explicite de l'API avec la version v1
    const genAI = new GoogleGenerativeAI(API_KEY, {
        apiVersion: 'v1'  // Utiliser la version v1 stable au lieu de v1beta
    });

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setIsLoading(true);

        try {
            // Vérifier si la clé API est valide
            if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
                throw new Error('API key is not configured. Please set a valid Gemini API key.');
            }            // Afficher la clé API utilisée (première partie seulement pour la sécurité)
            console.log('Using API key:', API_KEY.substring(0, 10) + '...');
            
            // Utilisation du bon modèle pour l'API v1beta
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `You are a helpful assistant for a leave management application called LeaveFlow. 
            Your role is to assist users with their leave management questions, explain how to use the application, 
            and provide information about leave policies. ${userMessage}`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const botMessage = response.text();

            setMessages(prev => [...prev, { text: botMessage, sender: 'bot' }]);        } catch (error) {
            console.error('Error generating response:', error);
            
            if (error.message.includes('API_KEY_INVALID')) {
                console.error('The Gemini API key is invalid. Please check your API key in the .env file.');
                setMessages(prev => [...prev, { 
                    text: t('chatbot.errorMessages.apiError'),
                    sender: 'bot' 
                }]);
            } else if (error.message.includes('not found for API version') || error.message.includes('not supported for generateContent')) {
                console.error('Model not available. Check the model name in the Chatbot component.');
                setMessages(prev => [...prev, { 
                    text: t('chatbot.errorMessages.apiError'),
                    sender: 'bot' 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    text: t('chatbot.errorMessages.networkError'),
                    sender: 'bot' 
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };    return (
        <div className="chatbot-container">
            {!isOpen ? (
                <button className="chat-toggle-button" onClick={toggleChat}>
                    <FaRobot /> {t('chatbot.toggleButton')}
                </button>
            ) : (
                <div className="chat-window">
                    <div className="chat-header">
                        <span><FaRobot /> {t('chatbot.title')}</span>
                        <button onClick={toggleChat} className="close-button">
                            <MdClose />
                        </button>
                    </div>
                    <div className="chat-messages" ref={chatContainerRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}-message`}>
                                {message.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot-message">
                                <div className="loading-dots">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <span className="sr-only">{t('chatbot.loadingMessage')}</span>
                            </div>
                        )}
                    </div>
                    <div className="chat-input-container">
                        <form onSubmit={handleSubmit} className="chat-input-form">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t('chatbot.inputPlaceholder')}
                                disabled={isLoading}
                                className="chat-input"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="send-button"
                                aria-label={t('chatbot.sendButton')}
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
