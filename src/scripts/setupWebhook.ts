import setWebhook from "./setWebhook";

(async () => {
  try {
    await setWebhook();
  } catch (err: any) {
    console.error("❌ Ошибка при установке вебхука:", err.message);
  }
})();
