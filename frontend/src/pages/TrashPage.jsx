import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = "http://localhost:5000";

export default function TrashPage() {
  const [data, setData] = useState([]);
  const token = localStorage.getItem('token');

  const fetch_ = async () => {
    const r = await axios.get(`${API}/trash`, { headers: { authorization: token } });
    setData(r.data);
  };

  const restore = async (id) => {
    await axios.put(`${API}/restore/${id}`, {}, { headers: { authorization: token } });
    toast.success('Restored ✓');
    fetch_();
  };

  const permanentDelete = async (id) => {
    if (!window.confirm('Permanently delete? This cannot be undone.')) return;
    await axios.delete(`${API}/trash/${id}`, { headers: { authorization: token } });
    toast('Permanently deleted');
    fetch_();
  };

  useEffect(() => { fetch_(); }, []);

  return (
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Recycle</p>
          <h1 className="text-2xl font-bold tracking-wide">Trash</h1>
          {data.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">{data.length} item{data.length !== 1 ? 's' : ''} in trash</p>
          )}
        </div>

        {data.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">
            <div className="text-5xl mb-4">◻</div>
            <p className="text-sm tracking-widest">TRASH IS EMPTY</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(item => (
              <div key={item._id}
                className="bg-[#08090f]/80 border border-red-500/10 rounded-2xl p-5 hover:border-red-500/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold uppercase">
                    {item.site[0]}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold capitalize">{item.site}</h2>
                    <p className="text-[10px] text-gray-500">{item.username}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => restore(item._id)}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-all">
                    ↩ Restore
                  </button>
                  <button onClick={() => permanentDelete(item._id)}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all">
                    ⊗ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
