import React, { useEffect, useState } from 'react';
import { 
    Download, ChevronDown, Filter, Plus, MoreHorizontal,
    DollarSign, AlertTriangle, ShoppingCart, TrendingUp, TrendingDown,
    Edit, Trash2 
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import financeService from '../../services/financeService';


const Finance = () => {
    const [financialStats, setFinancialStats] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [costStructure, setCostStructure] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [newTransaction, setNewTransaction] = useState({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const { month, year } = selectedDate;
            
            const [statsRes, chartRes, costRes, trxRes] = await Promise.all([
                financeService.getFinanceStats(month, year),
                financeService.getFinanceChart(month, year),
                financeService.getCostStructure(month, year),
                financeService.getTransactions(month, year)
            ]);

            // Transform Stats Data to match UI
            if (statsRes.success) {
                const rawStats = statsRes.data;
                const mappedStats = rawStats.map((item, idx) => {
                    let icon = DollarSign;
                    let color = '#EFF6FF';
                    let textColor = '#2563EB';
                    
                    if (idx === 1) { // Expense
                        icon = ShoppingCart;
                        color = '#FEF2F2';
                        textColor = '#DC2626';
                    } else if (idx === 2) { // Profit
                        icon = TrendingUp;
                        color = '#F0FDF4';
                        textColor = '#16A34A';
                    }

                    return {
                        ...item,
                        value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value),
                        icon,
                        color,
                        textColor
                    };
                });
                setFinancialStats(mappedStats);
            }

            if (chartRes.success) {
                setChartData(chartRes.data);
            }

            if (costRes.success) {
                    const formattedCost = costRes.data.map(item => ({
                    ...item,
                    value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value)
                    }));
                setCostStructure(formattedCost);
            }

            if (trxRes.success) {
                const formattedTrx = trxRes.data.map(trx => ({
                    ...trx,
                    amount: (trx.type === 'income' ? '+' : '-') + new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(trx.amount),
                    date: new Date(trx.date).toLocaleDateString('vi-VN')
                }));
                setTransactions(formattedTrx);
            }

        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [selectedDate]);

    const handleMonthChange = (e) => {
        const [month, year] = e.target.value.split('-');
        setSelectedDate({ month: Number(month), year: Number(year) });
    };

    const handleExport = () => {
        const { month, year } = selectedDate;
        financeService.exportFinanceReport(month, year);
    };

    // Generate last 12 months for dropdown
    const monthOptions = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        monthOptions.push({ value: `${m}-${y}`, label: `Tháng ${m}/${y}` });
    }

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newTransaction,
                source: newTransaction.type === 'income' ? newTransaction.category : undefined,
                category: newTransaction.type === 'expense' ? newTransaction.category : undefined
            };
            
            if (editingId) {
                 await financeService.updateTransaction(editingId, payload);
                 alert("Cập nhật giao dịch thành công");
            } else {
                 await financeService.createTransaction(payload);
                 alert("Thêm giao dịch thành công");
            }
            
            setShowModal(false);
            setEditingId(null);
            setNewTransaction({
                type: 'income',
                amount: '',
                description: '',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchAllData(); 
        } catch (error) {
            console.error("Error saving transaction:", error);
            alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (trx) => {
        if (trx.id.startsWith('ENR')) {
            alert('Không thể sửa giao dịch học phí tại đây.');
            return;
        }
        
        // Parse amount string to number for input
        const rawAmount = trx.amount.replace(/[^0-9]/g, '');
        
        setNewTransaction({
            type: trx.type,
            amount: rawAmount,
            description: trx.sub || '',
            category: trx.content || '',
            // Handle date parsing safely dd/mm/yyyy -> yyyy-mm-dd
            date: trx.date.split('/').reverse().join('-')
        });
        setEditingId(trx.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (id.startsWith('ENR')) {
            alert('Không thể xóa giao dịch học phí tại đây.');
            return;
        }
        // Confirmation handled by UI popup
        try {
            await financeService.deleteTransaction(id);
            setDeleteConfirm(null);
            fetchAllData();
            alert('Xóa giao dịch thành công');
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Lỗi khi xóa giao dịch");
        }
    };

    const openNewModal = () => {
        setEditingId(null);
        // Default date to the 1st of the selected month
        const defaultDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-01`;
        
        setNewTransaction({
            type: 'income',
            amount: '',
            description: '',
            category: '',
            date: defaultDate
        });
        setShowModal(true);
    };

    return (
        <div className="finance-page">
            <div className="page-header">
                <div>
                    <h1>Tổng Quan Tài Chính</h1>
                    <p className="page-subtitle">Theo dõi dòng tiền, doanh thu và chi phí hoạt động của trung tâm.</p>
                </div>
                <div className="header-actions">
                    <div className="month-select-wrapper">
                        <select 
                            className="btn-outline" 
                            style={{appearance: 'none', paddingRight: '24px', cursor: 'pointer'}}
                            value={`${selectedDate.month}-${selectedDate.year}`}
                            onChange={handleMonthChange}
                        >
                            {monthOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{position: 'absolute', right: '12px', pointerEvents: 'none'}} />
                    </div>
                    
                    <button className="btn-primary-blue" onClick={handleExport}>
                        <Download size={16} /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="finance-stats-grid">
                {financialStats.map((stat, idx) => (
                    <div className="f-stat-card" key={idx}>
                         <div className="f-stat-top">
                             <div className="f-stat-label">{stat.label}</div>
                             <div className="f-stat-icon" style={{background: stat.color, color: stat.textColor}}>
                                 <stat.icon size={18} />
                             </div>
                         </div>
                         <div className="f-stat-value">{stat.value}</div>
                         <div className="f-stat-meta">
                             {stat.change && (
                                 <span className={`f-change ${(idx !== 1 && stat.trend === 'up') || (idx === 1 && stat.trend === 'down') ? 'positive' : 'negative'}`}>
                                     {stat.trend === 'up' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                     {stat.change}
                                 </span>
                             )}
                             {stat.sub && (
                                 <span className={`f-sub ${stat.trend === 'warning' ? 'warning-text' : ''}`}>
                                    {stat.trend === 'warning' && <AlertTriangle size={12} style={{marginRight:4}}/>}
                                    {stat.sub}
                                 </span>
                             )}
                         </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="finance-charts-row">
                <div className="chart-container large">
                    <div className="chart-header-row">
                        <h3>Biểu đồ thu chi (đến T{selectedDate.month}/{selectedDate.year})</h3>
                        <div className="chart-legend-custom">
                            <span className="legend-dot blue"></span> Doanh thu
                            <span className="legend-dot" style={{background: '#EF4444'}}></span> Chi phí
                        </div>
                    </div>
                    <div style={{height: '250px', width: '100%'}}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} barGap={8}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                                <YAxis hide />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="income" fill="#2563EB" radius={[4,4,0,0]} barSize={20} />
                                <Bar dataKey="expense" fill="#EF4444" radius={[4,4,0,0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container small">
                    <div className="chart-header-row">
                        <h3>Cơ cấu chi phí</h3>
                    </div>
                    <div className="cost-list">
                        {costStructure.map((item, idx) => (
                            <div className="cost-item" key={idx}>
                                <div className="cost-row-top">
                                    <span className="cost-label">{item.label}</span>
                                    <span className="cost-val-bold">{item.value} <span className="cost-percent">({item.percent}%)</span></span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-bar" style={{width: `${item.percent}%`, background: item.color}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-section">
                <div className="section-header-row">
                    <h3>Giao dịch gần đây</h3>
                    <div className="table-actions-row">
                        <button className="btn-outline-sm">
                            <Filter size={14} /> Lọc
                        </button>
                        <button className="btn-primary-blue-sm" onClick={openNewModal}>
                            <Plus size={14} /> Thêm giao dịch
                        </button>
                    </div>
                </div>
                <table className="trans-table">
                    <thead>
                        <tr>
                            <th>MÃ GD</th>
                            <th>NỘI DUNG</th>
                            <th>LOẠI</th>
                            <th>NGÀY</th>
                            <th>SỐ TIỀN</th>
                            <th>TRẠNG THÁI</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(trx => (
                            <tr key={trx.id}>
                                <td className="trx-id">{trx.id}</td>
                                <td>
                                    <div className="trx-main">{trx.content}</div>
                                    <div className="trx-sub">{trx.sub}</div>
                                </td>
                                <td>
                                    <span className={`trx-type-badge ${trx.type}`}>
                                        {trx.type === 'income' ? 'Thu nhập' : 'Chi phí'}
                                    </span>
                                </td>
                                <td className="trx-date">{trx.date}</td>
                                <td className={`trx-amount ${trx.type}`}>
                                    {trx.amount}
                                </td>
                                <td>
                                    <span className={`status-badge-sm ${trx.status}`}>
                                        {trx.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '8px', position: 'relative'}}>
                                        <button 
                                            onClick={() => handleEdit(trx)}
                                            className="btn-icon-outline" 
                                            style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                            title="Sửa"
                                        >
                                            <Edit size={16} color="#4B5563"/>
                                        </button>
                                        <button 
                                            onClick={() => setDeleteConfirm(trx.id)}
                                            className="btn-icon-outline" 
                                            style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} color="#EF4444"/>
                                        </button>
                                        {deleteConfirm === trx.id && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '40px',
                                                right: '0',
                                                background: 'white',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '6px',
                                                padding: '8px',
                                                whiteSpace: 'nowrap',
                                                zIndex: 10,
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <div style={{fontSize: '12px', color: '#374151', marginBottom: '6px'}}>Xác nhận xóa?</div>
                                                <div style={{display: 'flex', gap: '4px'}}>
                                                    <button 
                                                        onClick={() => handleDelete(trx.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: '#EF4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteConfirm(null)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: '#F3F4F6',
                                                            color: '#374151',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingId ? 'Cập nhật giao dịch' : 'Thêm giao dịch mới'}</h3>
                        <form onSubmit={handleTransactionSubmit}>
                            <div className="form-group">
                                <label>Loại giao dịch</label>
                                <select 
                                    value={newTransaction.type} 
                                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                                    disabled={!!editingId}
                                >
                                    <option value="income">Thu nhập</option>
                                    <option value="expense">Chi phí</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Số tiền (VNĐ)</label>
                                <input 
                                    type="number" 
                                    value={newTransaction.amount} 
                                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả</label>
                                <input 
                                    type="text" 
                                    value={newTransaction.description} 
                                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>{newTransaction.type === 'income' ? 'Nguồn thu' : 'Danh mục chi'}</label>
                                <input 
                                    type="text" 
                                    value={newTransaction.category} 
                                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})} 
                                    placeholder={newTransaction.type === 'income' ? 'Ví dụ: Bán sách, Tài trợ...' : 'Ví dụ: Điện nước, Lương...'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày</label>
                                <input 
                                    type="date" 
                                    value={newTransaction.date} 
                                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})} 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="btn-primary-blue">{editingId ? 'Cập nhật' : 'Lưu'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
