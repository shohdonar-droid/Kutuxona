import {useEffect, useState} from 'react';
import {getLibrarySettings, updateLibrarySettings, LibrarySettings} from '../../services/settingsService';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<LibrarySettings | null>(null);

  useEffect(() => {
    getLibrarySettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (settings) {
        await updateLibrarySettings(settings);
        alert('Sozlamalar saqlandi');
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kutubxona Sozlamalari</h1>
      <div className="grid gap-4">
        <label>Maksimal faol kitoblar: <input type="number" value={settings.maxActiveLoans} onChange={e => setSettings({...settings, maxActiveLoans: Number(e.target.value)})} className="border p-2" /></label>
        <label>Standart berish muddati (kun): <input type="number" value={settings.defaultLoanDays} onChange={e => setSettings({...settings, defaultLoanDays: Number(e.target.value)})} className="border p-2" /></label>
        <button onClick={handleSave} className="bg-blue-600 text-white p-2">Saqlash</button>
      </div>
    </div>
  );
}
