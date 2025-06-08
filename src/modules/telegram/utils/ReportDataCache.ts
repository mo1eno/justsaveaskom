/**
 * ReportDataCache:
 * Временное хранилище данных для генерации отчетов
 */

interface ReportData {
  price: number;
  count: number;
  criteria: any;
  timestamp: number;
}

class ReportDataCache {
  private cache = new Map<string, ReportData>();
  private readonly TTL = 10 * 60 * 1000; // 10 минут

  // Сохраняет данные и возвращает уникальный ID
  store(data: { price: number; count: number; criteria: any }): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    this.cache.set(id, {
      ...data,
      timestamp: Date.now()
    });

    // Очищаем старые записи
    this.cleanup();
    
    return id;
  }

  // Получает данные по ID
  get(id: string): ReportData | null {
    const data = this.cache.get(id);
    
    if (!data) return null;
    
    // Проверяем TTL
    if (Date.now() - data.timestamp > this.TTL) {
      this.cache.delete(id);
      return null;
    }
    
    return data;
  }

  // Очистка устаревших записей
  private cleanup(): void {
    const now = Date.now();
    for (const [id, data] of this.cache.entries()) {
      if (now - data.timestamp > this.TTL) {
        this.cache.delete(id);
      }
    }
  }
}

export const reportDataCache = new ReportDataCache();