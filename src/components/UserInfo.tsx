"use client"

import { useEffect, useState } from "react";

// Define proper TypeScript interfaces for Telegram Web App
interface TelegramUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    initDataUnsafe: {
        user?: TelegramUser;
        auth_date?: number;
        hash?: string;
        query_id?: string;
    };
    colorScheme?: string;
    themeParams?: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
    };
}

// Extend Window interface to include Telegram
declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}

const UserInfo = () => {
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [webAppChecks, setWebAppChecks] = useState<string[]>([]);

    useEffect(() => {
        // Function to check Telegram Web App availability
        const checkTelegramWebApp = () => {
            const checks: string[] = [];

            // Check if window object exists
            if (typeof window === 'undefined') {
                checks.push("Window object is undefined (server-side rendering)");
                return checks;
            }

            // Check if Telegram object exists
            if (!window.Telegram) {
                checks.push("window.Telegram is undefined");
                return checks;
            }

            // Check if WebApp object exists
            if (!window.Telegram.WebApp) {
                checks.push("window.Telegram.WebApp is undefined");
                return checks;
            }

            // Check if initDataUnsafe exists
            if (!window.Telegram.WebApp.initDataUnsafe) {
                checks.push("window.Telegram.WebApp.initDataUnsafe is undefined");
            } else {
                checks.push("initDataUnsafe is available");

                // Check if user data exists
                if (!window.Telegram.WebApp.initDataUnsafe.user) {
                    checks.push("No user data in initDataUnsafe");
                } else {
                    checks.push("User data found in initDataUnsafe");
                }
            }

            return checks;
        };


        // Function to initialize Telegram Web App
        const initTelegramWebApp = () => {
            try {
                // Run checks and log results
                const checks = checkTelegramWebApp();
                setWebAppChecks(checks);
                console.log("Telegram WebApp checks:", checks);

                // If Telegram WebApp is available
                if (window.Telegram && window.Telegram.WebApp) {
                    const tg = window.Telegram.WebApp;

                    // Initialize the Web App
                    tg.ready();
                    tg.expand();

                    console.log("Telegram Web App initialized");

                    // Check if user data exists
                    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                        console.log("User data:", tg.initDataUnsafe.user);
                        setUser(tg.initDataUnsafe.user);
                    } else {
                        console.error("No user data in initDataUnsafe");
                        setError("Foydalanuvchi ma'lumotlari topilmadi.");
                    }
                } else {
                    console.error("Telegram WebApp not available");
                    setError("Telegram Web App yuklanmadi.");
                }
            } catch (err) {
                console.error("Error initializing Telegram Web App:", err);
                setError(`Xatolik yuz berdi: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        };

        // Try multiple times with increasing delays
        let attempts = 0;
        const maxAttempts = 5;

        const tryInitWebApp = () => {
            if (attempts < maxAttempts) {
                attempts++;
                setTimeout(() => {
                    initTelegramWebApp();
                    if (!window.Telegram?.WebApp?.initDataUnsafe?.user && attempts < maxAttempts) {
                        tryInitWebApp();
                    }
                }, attempts * 200); // Increasing delay: 200ms, 400ms, 600ms, 800ms, 1000ms
            }
        };

        tryInitWebApp();
    }, []);


    // Function to authenticate with your backend
    const authenticateWithBackend = async () => {
        if (!user) return;

        try {
            // Replace with your API URL
            const response = await fetch(`http://localhost:8089/api/webapp/auth?userId=2&telegramId=${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Authentication successful:", data);
                // Store tokens in sessionStorage
                sessionStorage.setItem("accessToken", data.accessToken);
                sessionStorage.setItem("refreshToken", data.refreshToken);
                sessionStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    telegramId: data.telegramId,
                    role: data.role,
                    permissions: data.permissions
                }));

                // Redirect or update UI as needed
                // window.location.href = '/dashboard';
            } else {
                console.error("Authentication failed");
                setError("Autentifikatsiya amalga oshmadi. Iltimos qayta urinib ko'ring.");
            }
        } catch (err) {
            console.error("Error authenticating with backend:", err);
            setError(`Serverga ulanishda xatolik: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    // alert(JSON.stringify(user))
    return (
        <div style={{
            backgroundColor: "var(--tg-theme-bg-color, #f5f5f5)",
            color: "var(--tg-theme-text-color, #000)",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            borderRadius: "10px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            maxWidth: "400px",
            margin: "20px auto",
            textAlign: "center"
        }}>
            <h2>Foydalanuvchi ma'lumotlari</h2>
            {loading ? (
                <p>Yuklanmoqda...</p>
            ) : error ? (
                <div>
                    <p style={{ color: "red" }}>{error}</p>
                    <details style={{ marginTop: "10px", textAlign: "left" }}>
                        <summary style={{ cursor: "pointer", color: "blue" }}>Texnik ma'lumotlar</summary>
                        <div style={{ fontSize: "12px", marginTop: "5px" }}>
                            <p>WebApp tekshiruvi:</p>
                            <ul style={{ paddingLeft: "20px" }}>
                                {webAppChecks.map((check, index) => (
                                    <li key={index}>{check}</li>
                                ))}
                            </ul>
                        </div>
                    </details>
                </div>
            ) : user ? (
                <div>
                    <p><strong>ID:</strong> <span style={{ color: "var(--tg-theme-button-color, #1e88e5)" }}>{user.id}</span></p>
                    <p><strong>Ism:</strong> {user.first_name || "-"}</p>
                    {user.last_name && <p><strong>Familiya:</strong> {user.last_name}</p>}
                    {user.username && <p><strong>Username:</strong> @{user.username}</p>}
                    {user.language_code && <p><strong>Til:</strong> {user.language_code}</p>}

                    <button
                        onClick={authenticateWithBackend}
                        style={{
                            backgroundColor: "var(--tg-theme-button-color, #1e88e5)",
                            color: "var(--tg-theme-button-text-color, #ffffff)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            marginTop: "15px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Tizimga kirish
                    </button>
                </div>
            ) : (
                <div>
                    <p>Foydalanuvchi ma'lumotlari topilmadi.</p>
                    <details style={{ marginTop: "10px", textAlign: "left" }}>
                        <summary style={{ cursor: "pointer", color: "blue" }}>Texnik ma'lumotlar</summary>
                        <div style={{ fontSize: "12px", marginTop: "5px" }}>
                            <p>WebApp tekshiruvi:</p>
                            <ul style={{ paddingLeft: "20px" }}>
                                {webAppChecks.map((check, index) => (
                                    <li key={index}>{check}</li>
                                ))}
                            </ul>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
};

export default UserInfo;