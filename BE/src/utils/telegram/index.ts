import axios from "axios";
import { devConfig } from "../../config/dev.env";

export const sendTelegramMessage = async (text: string) => {
    const url = `https://api.telegram.org/bot${devConfig.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await axios.post(url, {
        chat_id: devConfig.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
    });
};