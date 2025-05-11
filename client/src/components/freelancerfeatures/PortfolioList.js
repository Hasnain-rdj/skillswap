import React from 'react';

const PortfolioList = ({ portfolio = [], onChange, readOnly }) => {
    const [item, setItem] = React.useState({ title: '', description: '', link: '', image: '' });

    const addPortfolio = () => {
        if (item.title.trim()) {
            onChange([...portfolio, item]);
            setItem({ title: '', description: '', link: '', image: '' });
        }
    };

    const removePortfolio = (idx) => {
        onChange(portfolio.filter((_, i) => i !== idx));
    };

    return (
        <div className="mb-6 w-full">
            <label className="block font-semibold mb-2 text-blue-700 text-lg">Portfolio:</label>
            {!readOnly && (
                <div className="flex flex-col gap-2 mb-4 md:flex-row md:flex-wrap md:gap-2">
                    <input className="border-2 border-blue-200 p-2 rounded-lg flex-1 min-w-[180px] focus:ring-2 focus:ring-blue-400 transition" placeholder="Title" value={item.title} onChange={e => setItem({ ...item, title: e.target.value })} />
                    <input className="border-2 border-blue-200 p-2 rounded-lg flex-1 min-w-[180px] focus:ring-2 focus:ring-blue-400 transition" placeholder="Description" value={item.description} onChange={e => setItem({ ...item, description: e.target.value })} />
                    <input className="border-2 border-blue-200 p-2 rounded-lg flex-1 min-w-[180px] focus:ring-2 focus:ring-blue-400 transition" placeholder="Link" value={item.link} onChange={e => setItem({ ...item, link: e.target.value })} />
                    <input className="border-2 border-blue-200 p-2 rounded-lg flex-1 min-w-[180px] focus:ring-2 focus:ring-blue-400 transition" placeholder="Image URL" value={item.image} onChange={e => setItem({ ...item, image: e.target.value })} />
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition flex items-center gap-1 min-w-[100px]" onClick={addPortfolio} type="button">
                        + Add
                    </button>
                </div>
            )}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolio.length === 0 && <li className="text-blue-400 italic">No portfolio items yet.</li>}
                {portfolio.map((p, idx) => (
                    <li key={idx} className="bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition flex flex-col gap-2 relative">
                        <div className="font-semibold text-blue-800 text-lg">{p.title}</div>
                        <div className="text-gray-700">{p.description}</div>
                        {p.link && <a href={p.link} className="text-blue-600 underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">{p.link}</a>}
                        {p.image && <img src={p.image} alt="Portfolio" className="w-full h-32 object-cover rounded-lg border border-blue-200" />}
                        {!readOnly && (
                            <button className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700 transition text-sm" onClick={() => removePortfolio(idx)} type="button">Remove</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PortfolioList;
