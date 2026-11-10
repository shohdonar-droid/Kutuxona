import {useEffect, useState} from 'react';
import {getLibrarySettings, updateLibrarySettings, LibrarySettings} from '../../services/settingsService';
import PageHeader from '../../components/PageHeader';
import {Card, Button} from '../../components/UIComponents';
import {Settings, Save, ShieldCheck, BellRing, Database} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLibrarySettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (settings) {
        setSaving(true);
        try {
            await updateLibrarySettings(settings);
            alert('Tizim sozlamalari muvaffaqiyatli saqlandi!');
        } catch (err) {
            alert('Xatolik yuz berdi');
        } finally {
            setSaving(false);
        }
    }
  };

  if (!settings) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <PageHeader 
        title="Tizim Sozlamalari" 
        subtitle="Kutubxona qoidalari, cheklovlar va texnik parametrlarni boshqarish."
      />

      <div className="grid gap-8">
        <Card>
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Kutubxona qoidalari
            </h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Maksimal faol kitoblar</label>
                        <p className="text-[10px] text-gray-400 font-medium">Bitta talaba bir vaqtning o'zida olishi mumkin bo'lgan jami kitoblar soni.</p>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            value={settings.maxActiveLoans} 
                            onChange={e => setSettings({...settings, maxActiveLoans: Number(e.target.value)})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Berish muddati (kun)</label>
                        <p className="text-[10px] text-gray-400 font-medium">Kitobni qaytarish uchun beriladigan standart vaqt davomiyligi.</p>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                            value={settings.defaultLoanDays} 
                            onChange={e => setSettings({...settings, defaultLoanDays: Number(e.target.value)})} 
                        />
                    </div>
                </div>
            </div>
        </Card>

        <Card>
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <BellRing className="text-blue-600" /> Bildirishnomalar
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-900">Email bildirishnomalar</p>
                        <p className="text-xs text-gray-500">Muddati o'tgan kitoblar haqida avtomatik xabar yuborish.</p>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-900">Telegram Bot integratsiyasi</p>
                        <p className="text-xs text-gray-500">Talabalarga Telegram orqali eslatmalar yuborish.</p>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
            </div>
        </Card>

        <Card>
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Database className="text-blue-600" /> Ma'lumotlar bazasi
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
                <Button variant="secondary" className="flex-1 justify-center py-4 border border-gray-200">Baza nusxasini olish (Backup)</Button>
                <Button variant="secondary" className="flex-1 justify-center py-4 border border-gray-200 text-red-600 hover:bg-red-50">Keshni tozalash</Button>
            </div>
        </Card>

        <div className="pt-4">
            <Button onClick={handleSave} className="w-full justify-center py-5 text-lg font-black shadow-2xl shadow-blue-900/20" disabled={saving}>
                <Save size={20} /> {saving ? 'SAQLANMOQDA...' : 'BARCHA O\'ZGARTIRISHLARNI SAQLASH'}
            </Button>
        </div>
      </div>
    </div>
  );
}
