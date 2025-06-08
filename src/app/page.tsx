"use client";
import React, { useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./components/ui/table";
import { Button } from "./components/ui/button";
import { Trash2, Plus, Save } from "lucide-react";

type WhitelistEntry = {
  type: string;
  value: string;
};

export default function Home() {
  const [activePage, setActivePage] = useState<string>("whitelist");
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([
    { type: "ID аккаунта ТГ", value: "123456789" },
    { type: "Имя пользователя ТГ", value: "username" },
  ]);

  const addRow = () => {
    setWhitelist([...whitelist, { type: "ID аккаунта ТГ", value: "" }]);
  };

  const updateRow = (index: number, field: keyof WhitelistEntry, value: string) => {
    const newList = [...whitelist];
    newList[index][field] = value;
    setWhitelist(newList);
  };

  const deleteRow = (index: number) => {
    setWhitelist(whitelist.filter((_, i) => i !== index));
  };

  const saveWhitelist = async () => {
    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whitelist }),
      });

      if (!response.ok) throw new Error('Ошибка при сохранении');

      const result = await response.text();
      console.log("Ответ сервера:", result);
      alert('Файл сохранён на сервере');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при сохранении');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans select-none">
      {/* Шапка с навигацией */}
      <header className="fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm shadow-md z-30 transition-colors duration-500">
        <div className="max-w-5xl mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-extrabold tracking-wide">Telegram Whitelist Admin</h1>
          <nav className="flex gap-10">
            {["whitelist", "upload"].map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`relative text-lg font-semibold transition-colors duration-300 ${
                  activePage === page
                    ? "text-white border-b-2 border-white pb-1"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {page === "whitelist" ? "Белый список" : "Загрузка файла"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="pt-28 max-w-5xl mx-auto px-6">
        {activePage === "whitelist" && (
          <Card className="shadow-xl rounded-lg border border-gray-700 bg-gray-800/90 backdrop-blur-sm animate-fadeIn">
            <CardContent className="p-8">
              <h2 className="text-3xl font-extrabold mb-6 text-center text-white tracking-tight">
                Управление белым списком
              </h2>
              <Table className="border-collapse border border-gray-700 rounded-md overflow-hidden">
                <TableHeader>
                  <TableRow className="bg-gray-700/50">
                    <TableHead className="py-3 px-4 text-left text-gray-300 uppercase tracking-wide text-sm select-none">Тип идентификатора</TableHead>
                    <TableHead className="py-3 px-4 text-left text-gray-300 uppercase tracking-wide text-sm select-none">Значение</TableHead>
                    <TableHead className="py-3 px-4 text-center text-gray-300 uppercase tracking-wide text-sm select-none">Действие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whitelist.map((item, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-gray-700/70 transition-colors duration-300 cursor-pointer"
                    >
                      <TableCell className="p-3">
                        <select
                          value={item.type}
                          onChange={(e) => updateRow(index, "type", e.target.value)}
                          className="border border-gray-600 rounded-md p-2 w-full bg-gray-900 text-gray-200 shadow-sm focus:ring-2 focus:ring-gray-500 focus:outline-none transition"
                        >
                          <option>ID аккаунта ТГ</option>
                          <option>Имя пользователя ТГ</option>
                        </select>
                      </TableCell>
                      <TableCell className="p-3">
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => updateRow(index, "value", e.target.value)}
                          placeholder="Введите значение"
                          className="border border-gray-600 rounded-md p-2 w-full bg-gray-900 text-gray-200 shadow-sm focus:ring-2 focus:ring-gray-500 focus:outline-none transition"
                        />
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <Button
                          onClick={() => deleteRow(index)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-transform transform hover:scale-110"
                          aria-label="Удалить запись"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-between items-center">
                <Button
                  onClick={addRow}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-5 py-3 rounded-md font-semibold shadow-md transition-transform transform hover:scale-105"
                >
                  <Plus size={18} /> Добавить запись
                </Button>
                <Button
                  onClick={saveWhitelist}
                  className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-md font-semibold shadow-lg transition-transform transform hover:scale-105"
                >
                  <Save size={18} /> Сохранить
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activePage === "upload" && (
          <Card className="shadow-xl rounded-lg border border-gray-700 bg-gray-800/90 backdrop-blur-sm animate-fadeIn">
            <CardContent className="p-8 flex flex-col items-center">
              <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">
                Загрузка свежей выгрузки сделок
              </h2>
              <input
                type="file"
                className="border border-gray-600 p-3 rounded-lg w-full max-w-md cursor-pointer bg-gray-900 text-gray-200 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              <button
                className="mt-6 flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-md font-semibold shadow-md transition-transform transform hover:scale-105"
              >
                Загрузить файл
              </button>
            </CardContent>
          </Card>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}
