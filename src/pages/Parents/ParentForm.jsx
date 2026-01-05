import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, User, Phone, Mail, MapPin } from "lucide-react";
import parentService from "../../services/parentService";

const ParentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    if (isEditMode) {
      fetchParent();
    }
  }, [id]);

  const fetchParent = async () => {
    try {
      setLoading(true);
      const data = await parentService.getById(id);
      setFormData({
        fullName: data.fullName || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || ""
      });
    } catch (err) {
      setError("Lỗi khi tải thông tin phụ huynh");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
        setError("Vui lòng nhập Họ tên và Số điện thoại");
        return;
    }

    try {
      setSubmitting(true);
      setError(null);
      if (isEditMode) {
        await parentService.update(id, formData);
        alert("Cập nhật thành công!");
      } else {
        await parentService.create(formData);
        alert("Thêm phụ huynh thành công!");
      }
      navigate("/parents");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{padding: '24px', textAlign: 'center'}}>Đang tải...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/parents")} className="btn-icon">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>{isEditMode ? "Sửa thông tin Phụ huynh" : "Thêm Phụ huynh mới"}</h1>
            <p className="page-subtitle">Nhập thông tin cá nhân và liên lạc</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {error && <div className="error-alert">{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ background: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  
                  <div style={{ gridColumn: "span 2" }}>
                      <label className="form-label">Họ và Tên <span style={{color: 'red'}}>*</span></label>
                      <div className="input-with-icon">
                          <User size={18} color="#9CA3AF" />
                          <input 
                              type="text" 
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A" 
                              required
                          />
                      </div>
                  </div>

                  <div>
                      <label className="form-label">Số điện thoại <span style={{color: 'red'}}>*</span></label>
                      <div className="input-with-icon">
                          <Phone size={18} color="#9CA3AF" />
                          <input 
                              type="text" 
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="0912..." 
                              required
                          />
                      </div>
                  </div>

                  <div>
                      <label className="form-label">Email</label>
                      <div className="input-with-icon">
                          <Mail size={18} color="#9CA3AF" />
                          <input 
                              type="email" 
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="email@example.com" 
                          />
                      </div>
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                      <label className="form-label">Địa chỉ</label>
                      <div className="input-with-icon">
                          <MapPin size={18} color="#9CA3AF" />
                          <textarea 
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Số nhà, Tên đường..."
                              rows={3}
                              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #D1D5DB", borderRadius: "6px" }}
                          />
                      </div>
                  </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button type="button" onClick={() => navigate("/parents")} className="btn-secondary">Hủy</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                      <Save size={18} />
                      {submitting ? "Đang lưu..." : "Lưu thông tin"}
                  </button>
              </div>
          </form>
      </div>
    </div>
  );
};

export default ParentForm;
