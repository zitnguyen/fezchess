import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Phone, Mail, MapPin } from "lucide-react";
import parentService from "../../services/parentService";

const ParentList = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const data = await parentService.getAll();
      setParents(data);
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Bạn có chắc chắn muốn xóa phụ huynh này?")) {
          try {
              await parentService.remove(id);
              fetchParents();
          } catch (error) {
              console.error("Error deleting parent:", error);
              alert("Lỗi khi xóa phụ huynh");
          }
      }
  }

  const filteredParents = parents.filter(
    (p) =>
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Danh sách Phụ huynh</h1>
          <p className="page-subtitle">Quản lý thông tin phụ huynh và liên lạc</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/parents/new")}>
          <Plus size={20} />
          Thêm phụ huynh
        </button>
      </div>

      <div className="table-container">
        <div style={{ padding: "16px", borderBottom: "1px solid #E5E7EB" }}>
           <div style={{ position: "relative", maxWidth: "400px" }}>
            <Search size={20} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 10px 10px 40px",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>Đang tải dữ liệu...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Liên lạc</th>
                <th>Địa chỉ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <tr key={parent._id}>
                    <td>
                        <div style={{fontWeight: 500}}>{parent.fullName}</div>
                    </td>
                    <td>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <Phone size={14} color="#6B7280"/> {parent.phone}
                            </div>
                            {parent.email && (
                                <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                    <Mail size={14} color="#6B7280"/> {parent.email}
                                </div>
                            )}
                        </div>
                    </td>
                    <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563'}}>
                             <MapPin size={16} /> {parent.address || "---"}
                        </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/parents/${parent._id}`)}
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(parent._id)}
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px" }}>
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ParentList;
