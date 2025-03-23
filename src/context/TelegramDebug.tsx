"use client"

import { useEffect, useState } from "react"

export default function TelegramDebug() {
    const [telegramData, setTelegramData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        try {
            // @ts-ignore
            const telegram = window.Telegram
            if (telegram && telegram.WebApp) {
                // Вызываем ready() для инициализации WebApp
                telegram.WebApp.ready()

                // Получаем все данные из WebApp
                const webAppData = {
                    initData: telegram.WebApp.initData,
                    initDataUnsafe: telegram.WebApp.initDataUnsafe,
                    version: telegram.WebApp.version,
                    platform: telegram.WebApp.platform,
                    colorScheme: telegram.WebApp.colorScheme,
                    themeParams: telegram.WebApp.themeParams,
                    isExpanded: telegram.WebApp.isExpanded,
                    viewportHeight: telegram.WebApp.viewportHeight,
                    viewportStableHeight: telegram.WebApp.viewportStableHeight,
                }

                setTelegramData(webAppData)
            } else {
                setError("Telegram WebApp не обнаружен")
            }
        } catch (err) {
            setError(`Ошибка при получении данных Telegram: ${err instanceof Error ? err.message : String(err)}`)
        }
    }, [])

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Telegram WebApp Debug</h2>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            {telegramData ? (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium">WebApp Version:</h3>
                        <p className="text-sm bg-gray-100 p-2 rounded">{telegramData.version}</p>
                    </div>

                    <div>
                        <h3 className="font-medium">Platform:</h3>
                        <p className="text-sm bg-gray-100 p-2 rounded">{telegramData.platform}</p>
                    </div>

                    <div>
                        <h3 className="font-medium">initDataUnsafe:</h3>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(telegramData.initDataUnsafe, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-medium">initData:</h3>
                        <p className="text-xs bg-gray-100 p-2 rounded break-all">{telegramData.initData || "Пусто"}</p>
                    </div>
                </div>
            ) : !error ? (
                <div className="text-center py-4">Загрузка данных...</div>
            ) : null}
        </div>
    )
}

